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

// ✅ No manual escaping needed with prepared statements
$username    = trim($_POST['username'] ?? '');
$password = trim($_POST['password'] ?? '');

if (empty($username) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all fields']);
    exit();
}

// ✅ Use prepared statement — safe from SQL injection
$stmt = mysqli_prepare($conn, "SELECT user_id, username, name, email, role FROM users WHERE username = ? AND password = MD5(?)");

if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Query preparation failed']);
    exit();
}

mysqli_stmt_bind_param($stmt, "ss", $username, $password);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) == 1) {
    $user = mysqli_fetch_assoc($result);

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
    echo json_encode(['success' => false, 'message' => 'Invalid email or password!']);
}

mysqli_stmt_close($stmt);
mysqli_close($conn);

function getDashboardUrl($role) {
    switch ($role) {
        case 'admin': return '../../user_page/admin/dashboard.html';
        case 'staff': return '../../user_page/staff/dashboard.html';
        case 'user':  return '../../user_page/user/dashboard.html'; // ✅ Fixed from 'student'
        default:      return 'dashboard.html';
    }
}
?>