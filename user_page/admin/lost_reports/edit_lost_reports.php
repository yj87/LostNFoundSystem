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

$query = "UPDATE lost_reports SET 
          item_name = '$item_name',
          description = '$description',
          location_lost = '$location_lost',
          date_lost = '$date_lost',
          lost_status = '$lost_status',
          $category_sql
          WHERE report_id = $report_id";

if (mysqli_query($conn, $query)) {
    echo json_encode(['success' => true, 'message' => 'Report edited successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . mysqli_error($conn)]);
}

mysqli_close($conn);
?>