<?php
// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if user is logged in
if (isset($_SESSION['user_id']) && $_SESSION['Login'] === 'YES') {
    // User is logged in, allow access
} else {
    // User is not logged in - redirect to login page
    // Using absolute path from root
    header("Location: /LostNFoundSystem/mainpage/login/loginpage.html");
    exit();
}
?>