<?php
header('Content-Type: application/json');
$required_role = 'admin'; 
require_once("../../../config/db_connect.php");
require_once("../../../includes/auth_check.php");
require_once("../../../includes/role_check.php");

$id = $_POST['id'] ?? 0;
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$password = $_POST['password'] ?? '';
$role = $_POST['role'] ?? 'user';

if (empty($name) || empty($email)) {
    echo json_encode(['success' => false, 'message' => 'Name and email are required']);
    exit;
}

// Check if email exists for other users
$stmt = mysqli_prepare($conn, "SELECT user_id FROM users WHERE email = ? AND user_id != ?");
mysqli_stmt_bind_param($stmt, "si", $email, $id);
mysqli_stmt_execute($stmt);
mysqli_stmt_store_result($stmt);
if (mysqli_stmt_num_rows($stmt) > 0) {
    echo json_encode(['success' => false, 'message' => 'Email already exists for another user']);
    exit;
}
mysqli_stmt_close($stmt);

// Update with or without password
if (!empty($password)) {
    $stmt = mysqli_prepare($conn, "UPDATE users SET name = ?, email = ?, phone = ?, password = MD5(?), role = ? WHERE user_id = ?");
    mysqli_stmt_bind_param($stmt, "sssssi", $name, $email, $phone, $password, $role, $id);
} else {
    $stmt = mysqli_prepare($conn, "UPDATE users SET name = ?, email = ?, phone = ?, role = ? WHERE user_id = ?");
    mysqli_stmt_bind_param($stmt, "ssssi", $name, $email, $phone, $role, $id);
}

if (mysqli_stmt_execute($stmt)) {
    echo json_encode(['success' => true, 'message' => 'User updated successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update user: ' . mysqli_error($conn)]);
}

mysqli_stmt_close($stmt);
mysqli_close($conn);
?>