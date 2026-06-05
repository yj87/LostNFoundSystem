<?php
$required_role = 'admin'; 
require_once("../../../config/db_connect.php");
require_once("../../../includes/auth_check.php");
require_once("../../../includes/role_check.php");

header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Sanitize inputs
    $firstname = mysqli_real_escape_string($conn, trim($_POST['firstname']));
    $lastname = mysqli_real_escape_string($conn, trim($_POST['lastname']));
    $email = mysqli_real_escape_string($conn, trim($_POST['email']));
    $password = $_POST['password'];
    $role = mysqli_real_escape_string($conn, $_POST['role']);
    
    // Validation
    $errors = [];
    
    if (empty($firstname)) $errors[] = "First name is required";
    if (empty($lastname)) $errors[] = "Last name is required";
    if (empty($email)) $errors[] = "Email is required";
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "Invalid email format";
    if (empty($password)) $errors[] = "Password is required";
    if (strlen($password) < 8) $errors[] = "Password must be at least 8 characters";
    if ($password !== $_POST['confirm_password']) $errors[] = "Passwords do not match";
    if (empty($role)) $errors[] = "Role is required";
    
    // Check if email already exists
    $checkSql = "SELECT id FROM users WHERE email = '$email'";
    $checkResult = mysqli_query($conn, $checkSql);
    if (mysqli_num_rows($checkResult) > 0) {
        $errors[] = "Email already exists";
    }
    
    if (count($errors) > 0) {
        $response['message'] = implode(", ", $errors);
        echo json_encode($response);
        exit;
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert user
    $sql = "INSERT INTO users (firstname, lastname, email, password, role, created_at) 
            VALUES ('$firstname', '$lastname', '$email', '$hashedPassword', '$role', NOW())";
    
    if (mysqli_query($conn, $sql)) {
        $response['success'] = true;
        $response['message'] = "User added successfully";
    } else {
        $response['message'] = "Database error: " . mysqli_error($conn);
    }
} else {
    $response['message'] = "Invalid request method";
}

mysqli_close($conn);
echo json_encode($response);
?>