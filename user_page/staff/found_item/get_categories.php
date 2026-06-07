<?php
error_reporting(0);
ob_start();

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once '../../../config/db_connect.php';
require_once '../../../includes/auth_check.php';
$required_role = 'staff';
require_once '../../../includes/role_check.php';

ob_clean();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Session expired']);
    exit;
}

$query = "SELECT category_id, category_name FROM categories ORDER BY category_name ASC";
$result = mysqli_query($conn, $query);

$categories = [];

if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $categories[] = $row;
    }
    echo json_encode(['success' => true, 'data' => $categories]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to fetch categories']);
}

mysqli_close($conn);
?>