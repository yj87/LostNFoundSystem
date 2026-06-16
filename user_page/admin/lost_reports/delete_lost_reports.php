<?php
require_once '../../../config/db_connect.php';
require_once '../../../includes/auth_check.php';
$required_role = 'admin';
require_once '../../../includes/role_check.php';

session_start();

header('Content-Type: application/json');

// Check login
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit();
}

// Check role
if ($_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Not authorized']);
    exit();
}

// Check POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit();
}

// Get report ID
$report_id = isset($_POST['report_id']) ? intval($_POST['report_id']) : 0;

if ($report_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid report ID']);
    exit();
}

// Check if there are claims linked to this report
$check_claims = "SELECT COUNT(*) as count FROM claims WHERE lost_report_id = $report_id";
$claims_result = mysqli_query($conn, $check_claims);
$claims_count = mysqli_fetch_assoc($claims_result)['count'];

if ($claims_count > 0) {
    echo json_encode(['success' => false, 'message' => 'This report has ' . $claims_count . ' claim(s) linked to it. Delete the claims first.']);
    exit();
}

// Delete the report
$query = "DELETE FROM lost_reports WHERE report_id = $report_id";
$result = mysqli_query($conn, $query);

if ($result) {
    echo json_encode(['success' => true, 'message' => 'Report deleted successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Delete failed: ' . mysqli_error($conn)]);
}

mysqli_close($conn);
?>