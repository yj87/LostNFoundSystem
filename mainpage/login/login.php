<?php
header('Content-Type: application/json');

session_start();

// If user is already logged in
if (isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => true, 
        'message' => 'Already logged in!',
        'redirect' => getDashboardUrl($_SESSION['role'])
    ]);
    exit();
}

// Database connection
$host = 'localhost';
$dbname = 'lost_and_found_db';
$username = 'root';
$password = '';

$conn = mysqli_connect($host, $username, $password, $dbname);

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed!']);
    exit();
}

// Check if request is POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit();
}

// Get and sanitize input
$email = mysqli_real_escape_string($conn, $_POST['email'] ?? '');
$password = mysqli_real_escape_string($conn, $_POST['password'] ?? '');

// Validate input
if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all fields']);
    exit();
}

// Query database
$sql = "SELECT user_id, name, email, role FROM users WHERE email = '$email' AND password = MD5('$password')";
$result = mysqli_query($conn, $sql);

if (!$result) {
    echo json_encode(['success' => false, 'message' => 'Database error']);
    exit();
}

if (mysqli_num_rows($result) == 1) {
    $user = mysqli_fetch_assoc($result);
    
    // Set session variables
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['role'] = $user['role'];
    
    // Determine redirect URL
    $redirect = getDashboardUrl($user['role']);
    
    echo json_encode([
        'success' => true,
        'message' => 'Login successful! Redirecting...',
        'redirect' => $redirect
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid email or password!']);
}

mysqli_close($conn);

// Helper function to get dashboard URL based on role
function getDashboardUrl($role) {
    switch($role) {
        case 'admin':
            return '../user_page/admin/dashboard.html';
        case 'staff':
            return '../user_page/staff/dashboard.html';
        case 'student':
            return '../user_page/student/dashboard.html';
        default:
            return 'user/dashboard.html';
    }
}
?>