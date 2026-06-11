<?php
// get_admin_items.php
require_once '../../../config/db_connect.php';
require_once '../../../includes/auth_check.php';
$required_role = 'admin';
require_once '../../../includes/role_check.php';

header('Content-Type: application/json');

// Optional search filter
$search = isset($_GET['search']) ? mysqli_real_escape_string($conn, trim($_GET['search'])) : '';
// Optional status filter
$status = isset($_GET['status']) ? mysqli_real_escape_string($conn, trim($_GET['status'])) : '';
// Optional category filter
$category = isset($_GET['category']) ? mysqli_real_escape_string($conn, trim($_GET['category'])) : '';

$where_clauses = [];
if (!empty($search)) {
    $where_clauses[] = "(f.item_name LIKE '%$search%' OR f.location_found LIKE '%$search%' OR f.description LIKE '%$search%' OR c.category_name LIKE '%$search%' OR u.name LIKE '%$search%')";
}
if (!empty($status)) {
    $where_clauses[] = "f.found_status = '$status'";
}
if (!empty($category)) {
    $where_clauses[] = "f.category_id = '$category'";
}

$where_sql = count($where_clauses) > 0 ? 'WHERE ' . implode(' AND ', $where_clauses) : '';

$query = "SELECT f.*, c.category_name, u.name AS reported_by
          FROM found_items f
          LEFT JOIN categories c ON f.category_id = c.category_id
          LEFT JOIN users u ON f.user_id = u.user_id
          $where_sql
          ORDER BY f.date_found DESC";

$result = mysqli_query($conn, $query);

$items = [];
while ($row = mysqli_fetch_assoc($result)) {
    $items[] = $row;
}

echo json_encode(['success' => true, 'data' => $items]);

mysqli_close($conn);
?>
