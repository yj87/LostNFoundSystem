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

if (!empty($category)) {
    $where_clauses[] = "f.category_id = ?";
    $types .= "s";
    $params[] = $category;
}

$where_sql = implode(' AND ', $where_clauses);

// Join with categories table to get the name instead of just the ID
$query = "SELECT f.*, c.category_name 
          FROM found_items f 
          LEFT JOIN categories c ON f.category_id = c.category_id 
          WHERE $where_sql 
          ORDER BY f.date_found DESC";

$stmt = mysqli_prepare($conn, $query);

// Dynamically bind parameters
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