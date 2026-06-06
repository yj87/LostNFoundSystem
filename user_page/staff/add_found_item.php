<?php
session_start();
require_once '../../config/db_connect.php';
require_once '../../includes/auth_check.php';
$required_role = 'staff';
require_once '../../includes/role_check.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid transaction method.']);
    exit;
}

// Extract and sanitize inputs
$staff_user_id = intval($_SESSION['user_id']);
$item_name = mysqli_real_escape_string($conn, trim($_POST['item_name'] ?? ''));
$category_id = intval($_POST['category_id'] ?? 0);
$location_found = mysqli_real_escape_string($conn, trim($_POST['location_found'] ?? ''));
$date_found = mysqli_real_escape_string($conn, trim($_POST['date_found'] ?? ''));
$description = mysqli_real_escape_string($conn, trim($_POST['description'] ?? ''));

// Validate data
if (empty($item_name) || $category_id <= 0 || empty($location_found) || empty($date_found) || empty($description)) {
    echo json_encode(['success' => false, 'message' => 'Please complete all required fields.']);
    exit;
}

// Insert into Database
$insert_query = "INSERT INTO found_items (item_name, category_id, location_found, date_found, description, found_status, user_id, created_at) 
                 VALUES ('$item_name', $category_id, '$location_found', '$date_found', '$description', 'unclaimed', $staff_user_id, NOW())";

if (mysqli_query($conn, $insert_query)) {
    echo json_encode(['success' => true, 'message' => 'Found property record registered successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . mysqli_error($conn)]);
}

mysqli_close($conn);
?>