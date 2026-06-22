<?php
if (!isset($required_role)) {
    die("Role not specified");
}

// Convert single role to array for multiple role support
$allowed_roles = is_array($required_role) ? $required_role : [$required_role];

if (!in_array($_SESSION['role'], $allowed_roles)) {
    header("Location: /LostNFoundSystem/mainpage/login/loginpage.html");
    exit();
}
?>