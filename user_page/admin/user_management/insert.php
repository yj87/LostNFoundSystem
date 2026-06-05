<?php
header('Content-Type: application/json');
$required_role = 'admin'; 
require_once("../../../config/db_connect.php");
require_once("../../../includes/auth_check.php");
require_once("../../../includes/role_check.php");

$username = trim($_POST['username'] ?? '');
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$password = $_POST['password'] ?? '';
$role = $_POST['role'] ?? 'user';

// Validation
if (empty($username) || empty($name) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'All required fields must be filled']);
    exit;
}

// Check username exists
$stmt = mysqli_prepare($conn, "SELECT user_id FROM users WHERE username = ?");
mysqli_stmt_bind_param($stmt, "s", $username);
mysqli_stmt_execute($stmt);
mysqli_stmt_store_result($stmt);
if (mysqli_stmt_num_rows($stmt) > 0) {
    echo json_encode(['success' => false, 'message' => 'Username already exists']);
    exit;
}
mysqli_stmt_close($stmt);

// Check email exists
$stmt = mysqli_prepare($conn, "SELECT user_id FROM users WHERE email = ?");
mysqli_stmt_bind_param($stmt, "s", $email);
mysqli_stmt_execute($stmt);
mysqli_stmt_store_result($stmt);
if (mysqli_stmt_num_rows($stmt) > 0) {
    echo json_encode(['success' => false, 'message' => 'Email already exists']);
    exit;
}
mysqli_stmt_close($stmt);

// Insert user using MD5
$stmt = mysqli_prepare($conn, "INSERT INTO users (username, name, email, phone, password, role) VALUES (?, ?, ?, ?, MD5(?), ?)");
mysqli_stmt_bind_param($stmt, "ssssss", $username, $name, $email, $phone, $password, $role);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode(['success' => true, 'message' => 'User added successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to add user: ' . mysqli_error($conn)]);
}

mysqli_stmt_close($stmt);
mysqli_close($conn);
?>