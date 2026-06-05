<?php
require_once("../../config/db_connect.php");
require_once("../../includes/auth_check.php");

session_start();
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userId = $_SESSION['user_id'];
    $name = mysqli_real_escape_string($conn, trim($_POST['name']));
    $email = mysqli_real_escape_string($conn, trim($_POST['email']));
    $phone = mysqli_real_escape_string($conn, trim($_POST['phone'] ?? ''));
    $changePassword = isset($_POST['change_password']) && $_POST['change_password'] == '1';
    
    // Validation
    $errors = [];
    
    if (empty($name)) $errors[] = "Full name is required";
    if (empty($email)) $errors[] = "Email is required";
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "Invalid email format";
    
    // Check if email already exists for another user
    $checkSql = "SELECT user_id FROM users WHERE email = '$email' AND user_id != $userId";
    $checkResult = mysqli_query($conn, $checkSql);
    if (mysqli_num_rows($checkResult) > 0) {
        $errors[] = "Email already exists for another user";
    }
    
    // Password change validation
    if ($changePassword) {
        $currentPassword = $_POST['current_password'];
        $newPassword = $_POST['new_password'] ?? '';
        
        // Verify current password (MD5 as per your schema)
        $passSql = "SELECT password FROM users WHERE user_id = $userId";
        $passResult = mysqli_query($conn, $passSql);
        $user = mysqli_fetch_assoc($passResult);
        
        // Your schema uses MD5, so compare with MD5
        if (md5($currentPassword) !== $user['password']) {
            $errors[] = "Current password is incorrect";
        }
        
        if (!empty($newPassword)) {
            if (strlen($newPassword) < 8) {
                $errors[] = "New password must be at least 8 characters";
            }
        }
    }
    
    if (count($errors) > 0) {
        $response['message'] = implode(", ", $errors);
        echo json_encode($response);
        exit;
    }
    
    // Build UPDATE query (matches your users table)
    if ($changePassword && !empty($newPassword)) {
        $hashedPassword = md5($newPassword); // Using MD5 as per your schema
        $sql = "UPDATE users SET 
                name = '$name', 
                email = '$email', 
                phone = '$phone',
                password = '$hashedPassword'
                WHERE user_id = $userId";
    } else {
        $sql = "UPDATE users SET 
                name = '$name', 
                email = '$email', 
                phone = '$phone'
                WHERE user_id = $userId";
    }
    
    if (mysqli_query($conn, $sql)) {
        $response['success'] = true;
        $response['message'] = "Profile updated successfully";
        
        // Update session name
        $_SESSION['user_name'] = $name;
    } else {
        $response['message'] = "Database error: " . mysqli_error($conn);
    }
}

mysqli_close($conn);
echo json_encode($response);
?>