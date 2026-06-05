<?php
header('Content-Type: application/json');

$host = 'localhost';
$dbname = 'lost_and_found_db';
$dbuser = 'root';
$dbpass = '';

$conn = mysqli_connect($host, $dbuser, $dbpass, $dbname);

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// Action 1: Verify username and email
if ($action === 'verify') {
    $data = json_decode(file_get_contents('php://input'), true);
    $username = trim($data['username'] ?? '');
    $email = trim($data['email'] ?? '');
    
    if (empty($username) || empty($email)) {
        echo json_encode(['success' => false, 'message' => 'Please fill in all fields']);
        exit;
    }
    
    // Check if username and email match
    $stmt = mysqli_prepare($conn, "SELECT user_id, username, name FROM users WHERE username = ? AND email = ?");
    mysqli_stmt_bind_param($stmt, "ss", $username, $email);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (mysqli_num_rows($result) == 1) {
        $user = mysqli_fetch_assoc($result);
        echo json_encode([
            'success' => true,
            'message' => 'Verification successful! Please enter your new password.',
            'username' => $user['username'],
            'email' => $email
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Username and email do not match our records']);
    }
    
    mysqli_stmt_close($stmt);
    mysqli_close($conn);
    exit;
}

// Action 2: Reset password
if ($action === 'reset') {
    $data = json_decode(file_get_contents('php://input'), true);
    $username = trim($data['username'] ?? '');
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $confirm_password = $data['confirm_password'] ?? '';
    
    if (empty($username) || empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Please fill in all fields']);
        exit;
    }
    
    if ($password !== $confirm_password) {
        echo json_encode(['success' => false, 'message' => 'Passwords do not match']);
        exit;
    }
    
    if (strlen($password) < 6) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
        exit;
    }
    
    // Update password using MD5 (matches your login system)
    $stmt = mysqli_prepare($conn, "UPDATE users SET password = MD5(?) WHERE username = ? AND email = ?");
    mysqli_stmt_bind_param($stmt, "sss", $password, $username, $email);
    
    if (mysqli_stmt_execute($stmt)) {
        if (mysqli_stmt_affected_rows($stmt) > 0) {
            echo json_encode(['success' => true, 'message' => 'Password reset successful! Please login with your new password.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'User not found. Please try again.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to reset password. Please try again.']);
    }
    
    mysqli_stmt_close($stmt);
    mysqli_close($conn);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid action']);
?>