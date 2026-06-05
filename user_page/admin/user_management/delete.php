<?php
header('Content-Type: application/json');
$required_role = 'admin'; 
require_once("../../../config/db_connect.php");
require_once("../../../includes/auth_check.php");
require_once("../../../includes/role_check.php");

$id = $_POST['id'] ?? 0;

// Check if user exists
$stmt = mysqli_prepare($conn, "SELECT username FROM users WHERE user_id = ?");
mysqli_stmt_bind_param($stmt, "i", $id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) == 0) {
    echo json_encode(['success' => false, 'message' => 'User not found']);
    exit;
}

// Delete user
$stmt = mysqli_prepare($conn, "DELETE FROM users WHERE user_id = ?");
mysqli_stmt_bind_param($stmt, "i", $id);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to delete user: ' . mysqli_error($conn)]);
}

mysqli_stmt_close($stmt);
mysqli_close($conn);
?>