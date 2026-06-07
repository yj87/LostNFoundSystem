<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once '../../../config/db_connect.php';
require_once '../../../includes/auth_check.php';
$required_role = 'staff';
require_once '../../../includes/role_check.php';

header('Content-Type: application/json');

$item_id = intval($_POST['item_id'] ?? 0);
$user_id = $_SESSION['user_id'];
$item_name = mysqli_real_escape_string($conn, $_POST['item_name']);
$category_id = intval($_POST['category_id'] ?? 0);
$location_found = mysqli_real_escape_string($conn, trim($_POST['location_found'] ?? ''));
$date_found = mysqli_real_escape_string($conn, trim($_POST['date_found'] ?? ''));
$found_status = mysqli_real_escape_string($conn, $_POST['found_status']);
$description = mysqli_real_escape_string($conn, trim($_POST['description'] ?? ''));

//Basic Validation
if ($item_id === 0 || empty($item_name) || $category_id === 0) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit;
}

//Query db
$query = "UPDATE found_items SET 
            item_name='$item_name', 
            category_id= $category_id,
            location_found = '$location_found',
            date_found = '$date_found',
            found_status='$found_status' ,
            description = '$description'
          WHERE item_id=$item_id AND user_id=$user_id";

if(mysqli_query($conn, $query)) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Database Error']);
}

mysqli_close($conn);
?>