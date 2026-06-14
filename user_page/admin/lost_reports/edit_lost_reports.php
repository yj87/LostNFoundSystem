<?php
require_once '../../../config/db_connect.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit();
}

if ($_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Not authorized']);
    exit();
}

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit();
}

$report_id = intval($_POST['report_id']);
$item_name = mysqli_real_escape_string($conn, $_POST['item_name']);
$description = mysqli_real_escape_string($conn, $_POST['description']);
$location_lost = mysqli_real_escape_string($conn, $_POST['location_lost']);
$date_lost = mysqli_real_escape_string($conn, $_POST['date_lost']);
$category_id = intval($_POST['category_id']);
$lost_status = mysqli_real_escape_string($conn, $_POST['lost_status']);

if (empty($item_name) || empty($location_lost) || empty($date_lost)) {
    echo json_encode(['success' => false, 'message' => 'Please fill all required fields']);
    exit();
}

$valid_statuses = ['searching', 'found', 'closed'];
if (!in_array($lost_status, $valid_statuses)) {
    $lost_status = 'searching';
}

$category_sql = $category_id > 0 ? "category_id = $category_id" : "category_id = NULL";

// Handle photo upload
$photo_sql = "";
$upload_dir = "../../../uploads/lost_items/";

// Create directory if not exists
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
    $file = $_FILES['photo'];
    $file_size = $file['size'];
    $file_tmp = $file['tmp_name'];
    
    // Validate file size (max 5MB)
    if ($file_size > 5 * 1024 * 1024) {
        echo json_encode(['success' => false, 'message' => 'File size too large. Max 5MB']);
        exit();
    }
    
    // Get file extension
    $file_ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed_ext = ['jpg', 'jpeg', 'png'];
    
    if (!in_array($file_ext, $allowed_ext)) {
        echo json_encode(['success' => false, 'message' => 'Only JPG, JPEG, PNG files are allowed']);
        exit();
    }
    
    // Generate unique filename
    $new_filename = time() . '_' . uniqid() . '.' . $file_ext;
    $destination = $upload_dir . $new_filename;
    
    // Move uploaded file
    if (move_uploaded_file($file_tmp, $destination)) {
        $photo_path = "uploads/lost_items/" . $new_filename;
        $photo_sql = ", photo = '$photo_path'";
        
        // Delete old photo if exists
        $old_photo_query = "SELECT photo FROM lost_reports WHERE report_id = $report_id";
        $old_photo_result = mysqli_query($conn, $old_photo_query);
        if ($old_photo_result && mysqli_num_rows($old_photo_result) > 0) {
            $old_photo = mysqli_fetch_assoc($old_photo_result)['photo'];
            if ($old_photo && file_exists("../../../" . $old_photo)) {
                unlink("../../../" . $old_photo);
            }
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to upload photo']);
        exit();
    }
}

$query = "UPDATE lost_reports SET 
          item_name = '$item_name',
          description = '$description',
          location_lost = '$location_lost',
          date_lost = '$date_lost',
          lost_status = '$lost_status',
          $category_sql
          $photo_sql
          WHERE report_id = $report_id";

if (mysqli_query($conn, $query)) {
    echo json_encode(['success' => true, 'message' => 'Report edited successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . mysqli_error($conn)]);
}

mysqli_close($conn);
?>