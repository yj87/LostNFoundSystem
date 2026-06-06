<?php
ob_start();
require_once '../../config/db_connect.php';
require_once '../../includes/auth_check.php';
$required_role = 'staff';
require_once '../../includes/role_check.php';
ob_clean();

// Redirect to the HTML page after auth passes
include 'staff_found_items.html';
?>