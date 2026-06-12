<?php
$required_role = 'admin'; 
require_once("../../../config/db_connect.php");
require_once("../../../includes/auth_check.php");
require_once("../../../includes/role_check.php");

header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get POST data from add.html form
    $username = trim($_POST['username'] ?? '');
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    $role = trim($_POST['role'] ?? 'user');
    
    // Validation
    $errors = [];
    
    if (empty($username)) $errors[] = "Username is required";
    if (empty($name)) $errors[] = "Full name is required";
    if (empty($email)) $errors[] = "Email is required";
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "Invalid email format";
    if (empty($password)) $errors[] = "Password is required";
    if (strlen($password) < 6) $errors[] = "Password must be at least 6 characters";
    if ($password !== $confirm_password) $errors[] = "Passwords do not match";
    if (empty($role)) $errors[] = "Role is required";
    
    // Check if username already exists
    $stmt = mysqli_prepare($conn, "SELECT user_id FROM users WHERE username = ?");
    mysqli_stmt_bind_param($stmt, "s", $username);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_store_result($stmt);
    if (mysqli_stmt_num_rows($stmt) > 0) {
        $errors[] = "Username already exists";
    }
    mysqli_stmt_close($stmt);
    
    // Check if email already exists
    $stmt = mysqli_prepare($conn, "SELECT user_id FROM users WHERE email = ?");
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_store_result($stmt);
    if (mysqli_stmt_num_rows($stmt) > 0) {
        $errors[] = "Email already exists";
    }
    mysqli_stmt_close($stmt);
    
    // If there are errors, return them
    if (count($errors) > 0) {
        $response['message'] = implode(", ", $errors);
        echo json_encode($response);
        exit;
    }
    
    // Insert user using MD5 (matching your login system)
    $stmt = mysqli_prepare($conn, "INSERT INTO users (username, name, email, phone, password, role, created_at) VALUES (?, ?, ?, ?, MD5(?), ?, NOW())");
    mysqli_stmt_bind_param($stmt, "ssssss", $username, $name, $email, $phone, $password, $role);
    
    if (mysqli_stmt_execute($stmt)) {
        $response['success'] = true;
        $response['message'] = "User added successfully";
    } else {
        $response['message'] = "Database error: " . mysqli_error($conn);
    }
    mysqli_stmt_close($stmt);
} else {
    $response['message'] = "Invalid request method";
}

mysqli_close($conn);
echo json_encode($response);
?>