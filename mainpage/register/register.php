<?php
session_start();

// Redirect if already logged in
if (isset($_SESSION['user_id'])) {
    if ($_SESSION['role'] === 'admin') {
        header("Location: admin/dashboard.html");
    } elseif ($_SESSION['role'] === 'staff') {
        header("Location: staff/dashboard.html");
    } elseif ($_SESSION['role'] === 'user') {
        header("Location: user/dashboard.html");
    } else {
        header("Location: ori_page.html");
    }
    exit();
}

$host = 'localhost';
$dbname = 'db';
$username = 'root';
$password = '';

$conn = mysqli_connect($host, $username, $password, $dbname);

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

$error = '';
$success = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = mysqli_real_escape_string($conn, $_POST['name']);
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $password = mysqli_real_escape_string($conn, $_POST['password']);
    $confirm_password = mysqli_real_escape_string($conn, $_POST['confirm_password']);
    $phone = mysqli_real_escape_string($conn, $_POST['phone']);
    $role = mysqli_real_escape_string($conn, $_POST['role']);
    
    // Validation
    if ($password !== $confirm_password) {
        $error = "Passwords do not match!";
    } else {
        // Check if email already exists
        $check_sql = "SELECT user_id FROM users WHERE email = '$email'";
        $check_result = mysqli_query($conn, $check_sql);
        
        if (mysqli_num_rows($check_result) > 0) {
            $error = "Email already registered!";
        } else {
            // Insert new user (using MD5 as per your schema)
            $insert_sql = "INSERT INTO users (name, email, password, role, phone) 
                           VALUES ('$name', '$email', MD5('$password'), '$role', '$phone')";
            
            if (mysqli_query($conn, $insert_sql)) {
                $success = "Registration successful! You can now login.";
                // Clear form data
                $name = $email = $phone = $role = '';
            } else {
                $error = "Registration failed: " . mysqli_error($conn);
            }
        }
    }
}
?>