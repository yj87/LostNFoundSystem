<?php
header('Content-Type: application/json');
session_start();

if (isset($_SESSION['user_id'])) {
    echo json_encode([
        'success'  => true,
        'message'  => 'Already logged in!',
        'redirect' => getDashboardUrl($_SESSION['role'])
    ]);
    exit();
}

$host   = 'localhost';
$dbname = 'lost_and_found_db';
$dbuser = 'root';
$dbpass = '';

$conn = mysqli_connect($host, $dbuser, $dbpass, $dbname);

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed!']);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit();
}

$username = trim($_POST['username'] ?? '');
$password = trim($_POST['password'] ?? '');

if (empty($username) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all fields']);
    exit();
}

// ✅ FIRST get the user by username
$stmt = mysqli_prepare($conn, "SELECT user_id, username, name, email, role, password FROM users WHERE username = ?");
mysqli_stmt_bind_param($stmt, "s", $username);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) == 1) {
    $user = mysqli_fetch_assoc($result);
    
    // ✅ THEN verify password using MD5
    if ($user['password'] === md5($password)) {
        // Password is correct
        $_SESSION['user_id']    = $user['user_id'];
        $_SESSION['user_name']  = $user['name'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['role']       = $user['role'];

        echo json_encode([
            'success'  => true,
            'message'  => 'Login successful! Redirecting...',
            'redirect' => getDashboardUrl($user['role'])
        ]);
    } else {
        // Password is wrong
        echo json_encode(['success' => false, 'message' => 'Invalid username or password!']);
    }
} else {
    // Username not found
    echo json_encode(['success' => false, 'message' => 'Invalid username or password!']);
}

mysqli_stmt_close($stmt);
mysqli_close($conn);

function getDashboardUrl($role) {
    switch ($role) {
        case 'admin': return '../../user_page/admin/dashboard.html';
        case 'staff': return '../../user_page/staff/dashboard.html';
        case 'user':  return '../../user_page/user/dashboard.html';
        default:      return 'dashboard.html';
    }
}
?>