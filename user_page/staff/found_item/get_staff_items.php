<?php
require_once '../../../config/db_connect.php';
require_once '../../../includes/auth_check.php';

$required_role = 'staff';
require_once '../../../includes/role_check.php';

header('Content-Type: application/json');

$user_id = $_SESSION['user_id'];

// search filter
$search = isset($_GET['search']) ? trim($_GET['search']) : '';

// status filter
$status = isset($_GET['status']) ? trim($_GET['status']) : '';

// category filter
$category = isset($_GET['category']) ? trim($_GET['category']) : '';

$where_clauses = ["f.user_id = ?"];
$types = "i";
$params = [$user_id];

// Search by item ID, F-item ID, item name, location, description, or category
if (!empty($search)) {
    /*
        Allow staff to search by:
        - item ID: 14
        - displayed item ID: F14
        - item name
        - location
        - description
        - category name
    */

    $cleanSearch = strtoupper($search);
    $cleanSearch = str_replace('F', '', $cleanSearch);

    $where_clauses[] = "(
        f.item_name LIKE ?
        OR f.location_found LIKE ?
        OR f.description LIKE ?
        OR c.category_name LIKE ?
        OR CAST(f.item_id AS CHAR) LIKE ?
    )";

    $searchTerm = '%' . $search . '%';
    $idSearchTerm = '%' . $cleanSearch . '%';

    $types .= "sssss";
    $params[] = $searchTerm;
    $params[] = $searchTerm;
    $params[] = $searchTerm;
    $params[] = $searchTerm;
    $params[] = $idSearchTerm;
}

if (!empty($status)) {
    $where_clauses[] = "f.found_status = ?";
    $types .= "s";
    $params[] = $status;
}

if (!empty($category)) {
    $where_clauses[] = "f.category_id = ?";
    $types .= "i";
    $params[] = intval($category);
}

$where_sql = implode(' AND ', $where_clauses);

$query = "SELECT 
            f.item_id,
            f.item_name,
            f.category_id,
            f.location_found,
            f.date_found,
            f.description,
            f.found_status,
            f.photo,
            f.user_id,
            f.created_at,
            c.category_name
          FROM found_items f
          LEFT JOIN categories c ON f.category_id = c.category_id
          WHERE $where_sql
          ORDER BY f.date_found DESC";

$stmt = mysqli_prepare($conn, $query);

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'message' => 'Database prepare error: ' . mysqli_error($conn),
        'data' => []
    ]);
    exit;
}

if (!empty($params)) {
    mysqli_stmt_bind_param($stmt, $types, ...$params);
}

mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$items = [];

while ($row = mysqli_fetch_assoc($result)) {
    $items[] = $row;
}

echo json_encode([
    'success' => true,
    'data' => $items
]);

mysqli_close($conn);
?>