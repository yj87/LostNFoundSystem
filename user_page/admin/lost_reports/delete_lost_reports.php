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

$report_id = isset($_POST['report_id']) ? intval($_POST['report_id']) : 0;

if ($report_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid report ID']);
    exit();
}

$check_query = "SELECT report_id FROM lost_reports WHERE report_id = $report_id";
$check_result = mysqli_query($conn, $check_query);

if (mysqli_num_rows($check_result) == 0) {
    echo json_encode(['success' => false, 'message' => 'Report not found']);
    exit();
}

$delete_query = "DELETE FROM lost_reports WHERE report_id = $report_id";

if (mysqli_query($conn, $delete_query)) {
    echo json_encode(['success' => true, 'message' => 'Report deleted successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . mysqli_error($conn)]);
}

mysqli_close($conn);
?>