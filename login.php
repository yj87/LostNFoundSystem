<?php
session_start();

// If user is already logged in, redirect to appropriate dashboard
if (isset($_SESSION['user_id'])) {
    if ($_SESSION['role'] === 'admin') {
        header("Location: admin/dashboard.php");
    } elseif ($_SESSION['role'] === 'staff') {
        header("Location: staff/dashboard.php");
    } elseif ($_SESSION['role'] === 'user') {
        header("Location: user/dashboard.php");
    } else {
        // Fallback for any other role
        header("Location: user/dashboard.php");
    }
    exit();
}

// Include database connection
$host = 'localhost';
$dbname = 'db';
$username = 'root';
$password = '';

$conn = mysqli_connect($host, $username, $password, $dbname);

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

$error = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $password = mysqli_real_escape_string($conn, $_POST['password']);
    
    // Query to check user credentials (using MD5 as in your schema)
    $sql = "SELECT user_id, name, email, role, password FROM users WHERE email = '$email' AND password = MD5('$password')";
    $result = mysqli_query($conn, $sql);
    
    if (mysqli_num_rows($result) == 1) {
    $user = mysqli_fetch_assoc($result);
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['role'] = $user['role'];
    
    // Redirect based on role
    if ($user['role'] === 'admin') {
        header("Location: admin/dashboard.php");
    } elseif ($user['role'] === 'staff') {
        header("Location: staff/dashboard.php");
    } elseif ($user['role'] === 'student') {
        header("Location: student/dashboard.php");
    } else {
        header("Location: user/dashboard.php");
    }
    exit();
}else {
        $error = "Invalid email or password!";
    }
}
?>