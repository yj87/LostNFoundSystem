<?php
require_once("../../config/db_connect.php");
require_once("../../includes/auth_check.php");

// Redirect if not logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: ../../login.php");
    exit();
}

// Once session is confirmed, forward to the HTML page
header("Location: profile.html");
exit();
?>