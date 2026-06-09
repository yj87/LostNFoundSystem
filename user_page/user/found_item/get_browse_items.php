<?php
// get_browse_items.php
require_once '../../../config/db_connect.php';
require_once '../../../includes/auth_check.php';
$required_role = 'user';
require_once '../../../includes/role_check.php';

header('Content-Type: application/json');

// Optional search filter
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
// Optional status filter
$status = isset($_GET['status']) ? trim($_GET['status']) : '';

$where_clauses = [];
$types = "";
$params = [];

if (!empty($search)) {
    $where_clauses[] = "(f.item_name LIKE ? OR f.location_found LIKE ? OR f.description LIKE ? OR c.category_name LIKE ?)";
    $searchTerm = '%' . $search . '%';
    $types .= "ssss";
    $params[] = $searchTerm;
    $params[] = $searchTerm;
    $params[] = $searchTerm;
    $params[] = $searchTerm;
}

if (!empty($status)) {
    $where_clauses[] = "f.found_status = ?";
    $types .= "s";
    $params[] = $status;
}

$where_sql = count($where_clauses) > 0 ? 'WHERE ' . implode(' AND ', $where_clauses) : '';

$query = "SELECT f.item_id, f.item_name, f.location_found, f.description, f.date_found, f.found_status, c.category_name 
          FROM found_items f 
          LEFT JOIN categories c ON f.category_id = c.category_id 
          $where_sql 
          ORDER BY f.date_found DESC";

$stmt = mysqli_prepare($conn, $query);

if (!empty($params)) {
    mysqli_stmt_bind_param($stmt, $types, ...$params);
}

mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$items = [];
while ($row = mysqli_fetch_assoc($result)) {
    $items[] = $row;
}

echo json_encode(['success' => true, 'data' => $items]);
?>
