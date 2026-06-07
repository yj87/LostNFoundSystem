<?php
// get_staff_items.php
require_once '../../../config/db_connect.php';
require_once '../../../includes/auth_check.php';
$required_role = 'staff';
require_once '../../../includes/role_check.php';

header('Content-Type: application/json');

$user_id = $_SESSION['user_id'];

// Join with categories table to get the name instead of just the ID
$query = "SELECT f.*, c.category_name 
          FROM found_items f 
          LEFT JOIN categories c ON f.category_id = c.category_id 
          WHERE f.user_id = ? 
          ORDER BY f.date_found DESC";

$stmt = mysqli_prepare($conn, $query);
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$items = [];
while ($row = mysqli_fetch_assoc($result)) {
    $items[] = $row;
}

echo json_encode(['success' => true, 'data' => $items]);