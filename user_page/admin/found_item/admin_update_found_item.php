<?php
require_once '../../../config/db_connect.php';
require_once '../../../includes/auth_check.php';
$required_role = 'admin';
require_once '../../../includes/role_check.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$item_id      = intval($_POST['item_id'] ?? 0);
$item_name    = mysqli_real_escape_string($conn, trim($_POST['item_name'] ?? ''));
$category_id  = intval($_POST['category_id'] ?? 0);
$location_found = mysqli_real_escape_string($conn, trim($_POST['location_found'] ?? ''));
$date_found   = mysqli_real_escape_string($conn, trim($_POST['date_found'] ?? ''));
$found_status = mysqli_real_escape_string($conn, trim($_POST['found_status'] ?? ''));
$description  = mysqli_real_escape_string($conn, trim($_POST['description'] ?? ''));

// Basic validation
if ($item_id === 0 || empty($item_name) || $category_id === 0 || empty($location_found) || empty($date_found)) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit;
}

// Admin can update any item (no user_id restriction)
$query = "UPDATE found_items SET
            item_name    = '$item_name',
            category_id  = $category_id,
            location_found = '$location_found',
            date_found   = '$date_found',
            found_status = '$found_status',
            description  = '$description'
          WHERE item_id  = $item_id";

if (mysqli_query($conn, $query)) {
    echo json_encode(['success' => true, 'message' => 'Item updated successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . mysqli_error($conn)]);
}

mysqli_close($conn);
?>
