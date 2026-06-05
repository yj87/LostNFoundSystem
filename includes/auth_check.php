<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: ../../../mainpage/login/login.php");
    exit();
}
if ($_SESSION['role'] !== 'admin') {
    header("Location: ../../../mainpage/login/login.php");
    exit();
}
?>