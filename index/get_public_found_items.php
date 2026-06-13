<?php
// get_public_found_items.php
require_once '../config/db_connect.php';

header('Content-Type: application/json');

$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$category = isset($_GET['category']) ? trim($_GET['category']) : '';

$where_clauses = [];
$types = "";
$params = [];

// Public users should only see viewable found items.
// Usually show unclaimed and pending, hide claimed.
$where_clauses[] = "f.found_status IN ('unclaimed', 'pending')";

if (!empty($search)) {
    $where_clauses[] = "(f.item_name LIKE ? OR f.location_found LIKE ? OR f.description LIKE ? OR c.category_name LIKE ?)";
    $searchTerm = '%' . $search . '%';
    $types .= "ssss";
    $params[] = $searchTerm;
    $params[] = $searchTerm;
    $params[] = $searchTerm;
    $params[] = $searchTerm;
}

if (!empty($category)) {
    $where_clauses[] = "f.category_id = ?";
    $types .= "i";
    $params[] = intval($category);
}

$where_sql = 'WHERE ' . implode(' AND ', $where_clauses);

$query = "SELECT 
            f.item_id,
            f.item_name,
            f.location_found,
            f.description,
            f.date_found,
            f.found_status,
            f.photo,
            c.category_name
          FROM found_items f
          LEFT JOIN categories c ON f.category_id = c.category_id
          $where_sql
          ORDER BY f.date_found DESC";

$stmt = mysqli_prepare($conn, $query);

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'message' => 'Database prepare error: ' . mysqli_error($conn)
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