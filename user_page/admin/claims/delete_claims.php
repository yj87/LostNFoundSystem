<?php
require_once '../../../config/db_connect.php';
require_once '../../../includes/auth_check.php';
$required_role = 'admin';
require_once '../../../includes/role_check.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit();
}

$claim_id = isset($_POST['claim_id']) ? intval($_POST['claim_id']) : 0;

if ($claim_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid claim ID']);
    exit();
}

$check_query = "SELECT claim_id FROM claims WHERE claim_id = $claim_id";
$check_result = mysqli_query($conn, $check_query);

if (mysqli_num_rows($check_result) == 0) {
    echo json_encode(['success' => false, 'message' => 'Claim not found']);
    exit();
}

$delete_query = "DELETE FROM claims WHERE claim_id = $claim_id";

if (mysqli_query($conn, $delete_query)) {
    echo json_encode(['success' => true, 'message' => 'Claim deleted successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . mysqli_error($conn)]);
}

mysqli_close($conn);
?>