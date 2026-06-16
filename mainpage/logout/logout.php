<?php
session_start();

if (isset($_SESSION['user_id'])) 
{ 
    unset($_SESSION['user_id']); 
    unset($_SESSION['user_name']); 
    unset($_SESSION['user_email']); 
    unset($_SESSION['role']); 
} 

session_destroy();

// Redirect back to login page (relative path from logout folder)
header("Location: ../login/loginpage.html");
exit();
?>