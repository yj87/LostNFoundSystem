<?php
ob_start();

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once '../../../config/db_connect.php';
require_once '../../../includes/auth_check.php';
$required_role = 'staff';
require_once '../../../includes/role_check.php';
ob_clean();
$user_id = $_SESSION['user_id'];

// QUERY 1: Count ONLY the items this specific staff member registered
$my_items_query = "SELECT COUNT(*) as total FROM found_items WHERE user_id = $user_id";
$my_items_result = mysqli_query($conn, $my_items_query);
$my_total = mysqli_fetch_assoc($my_items_result)['total'];

//QUERY 2: Count the total items had been registered in the database by all staff member
$all_items_query = "SELECT COUNT(*) as total FROM found_items";
$all_items_result = mysqli_query($conn, $all_items_query);
$database_total = mysqli_fetch_assoc($all_items_result)['total'];
?>