<?php
// user_page/staff/found_item/update_found_item.php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once '../../../config/db_connect.php';
require_once '../../../includes/auth_check.php';

$required_role = 'staff';
require_once '../../../includes/role_check.php';

header('Content-Type: application/json');

$user_id = $_SESSION['user_id'] ?? 0;

$item_id = intval($_POST['item_id'] ?? 0);
$item_name = trim($_POST['item_name'] ?? '');
$category_id = intval($_POST['category_id'] ?? 0);
$location_found = trim($_POST['location_found'] ?? '');
$date_found = trim($_POST['date_found'] ?? '');
$found_status = trim($_POST['found_status'] ?? '');
$description = trim($_POST['description'] ?? '');

if ($item_id <= 0 || empty($item_name) || $category_id <= 0 || empty($location_found) || empty($date_found) || empty($found_status)) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields.'
    ]);
    exit;
}

$allowed_status = ['unclaimed', 'pending', 'claimed'];

if (!in_array($found_status, $allowed_status)) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid item status.'
    ]);
    exit;
}

/* Check item belongs to logged-in staff */
$checkQuery = "SELECT photo FROM found_items WHERE item_id = ? AND user_id = ?";
$checkStmt = mysqli_prepare($conn, $checkQuery);

if (!$checkStmt) {
    echo json_encode([
        'success' => false,
        'message' => 'Database prepare error: ' . mysqli_error($conn)
    ]);
    exit;
}

mysqli_stmt_bind_param($checkStmt, "ii", $item_id, $user_id);
mysqli_stmt_execute($checkStmt);
$checkResult = mysqli_stmt_get_result($checkStmt);

if (mysqli_num_rows($checkResult) === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Item not found or you do not have permission to edit this item.'
    ]);
    exit;
}

$itemRow = mysqli_fetch_assoc($checkResult);
$old_photo = $itemRow['photo'] ?? null;
$new_photo_path = $old_photo;

/* Handle optional new photo upload */
if (isset($_FILES['photo']) && $_FILES['photo']['error'] !== UPLOAD_ERR_NO_FILE) {
    if ($_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode([
            'success' => false,
            'message' => 'Photo upload error. Please try again.'
        ]);
        exit;
    }

    $upload_dir = '../../../uploads/found_items/';

    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    $file_name = $_FILES['photo']['name'];
    $file_tmp = $_FILES['photo']['tmp_name'];
    $file_size = $_FILES['photo']['size'];
    $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

    $allowed_ext = ['jpg', 'jpeg', 'png'];

    if (!in_array($file_ext, $allowed_ext)) {
        echo json_encode([
            'success' => false,
            'message' => 'Only JPG, JPEG, and PNG files are allowed.'
        ]);
        exit;
    }

    if ($file_size > 5 * 1024 * 1024) {
        echo json_encode([
            'success' => false,
            'message' => 'Photo size must not exceed 5MB.'
        ]);
        exit;
    }

    $new_filename = time() . '_' . rand(1000, 9999) . '.' . $file_ext;
    $destination = $upload_dir . $new_filename;

    if (!move_uploaded_file($file_tmp, $destination)) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to save uploaded photo.'
        ]);
        exit;
    }

    // This is the path stored in database
    $new_photo_path = 'uploads/found_items/' . $new_filename;

    // Delete old photo file if it exists
    if (!empty($old_photo)) {
        $old_file_path = '../../../' . $old_photo;

        if (file_exists($old_file_path)) {
            unlink($old_file_path);
        }
    }
}

/* Update item */
$updateQuery = "UPDATE found_items 
                SET item_name = ?,
                    category_id = ?,
                    location_found = ?,
                    date_found = ?,
                    found_status = ?,
                    description = ?,
                    photo = ?
                WHERE item_id = ? AND user_id = ?";

$updateStmt = mysqli_prepare($conn, $updateQuery);

if (!$updateStmt) {
    echo json_encode([
        'success' => false,
        'message' => 'Database prepare error: ' . mysqli_error($conn)
    ]);
    exit;
}

mysqli_stmt_bind_param(
    $updateStmt,
    "sisssssii",
    $item_name,
    $category_id,
    $location_found,
    $date_found,
    $found_status,
    $description,
    $new_photo_path,
    $item_id,
    $user_id
);

if (mysqli_stmt_execute($updateStmt)) {
    echo json_encode([
        'success' => true,
        'message' => 'Found item updated successfully.',
        'photo' => $new_photo_path
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Database update error: ' . mysqli_stmt_error($updateStmt)
    ]);
}

mysqli_stmt_close($updateStmt);
mysqli_close($conn);
?>