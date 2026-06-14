<?php
// get_browse_items.php

require_once '../../../config/db_connect.php';
require_once '../../../includes/auth_check.php';

$required_role = 'user';
require_once '../../../includes/role_check.php';

header('Content-Type: application/json');

$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$category = isset($_GET['category']) ? trim($_GET['category']) : '';

$where_clauses = [];
$types = "";
$params = [];

// Users can browse items that are not fully claimed.
// Keep pending visible but disable claim button in JS.
$where_clauses[] = "f.found_status IN ('unclaimed', 'pending')";

if (!empty($search)) {
    
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

if (!empty($category)) {
    $where_clauses[] = "f.category_id = ?";
    $types .= "i";
    $params[] = intval($category);
}

$where_sql = count($where_clauses) > 0 ? 'WHERE ' . implode(' AND ', $where_clauses) : '';

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