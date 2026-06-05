<?php
require_once '../config/db_connect.php';
require_once '../includes/auth_check.php';
$required_role = 'admin';
require_once '../includes/role_check.php';

// Get statistics
$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM users");
$total_users = mysqli_fetch_assoc($result)['count'];

$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM found_items");
$total_items = mysqli_fetch_assoc($result)['count'];

$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM lost_reports");
$total_lost_reports = mysqli_fetch_assoc($result)['count'];

$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM claims");
$total_claims = mysqli_fetch_assoc($result)['count'];

$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM claims WHERE claim_status = 'pending'");
$pending_claims = mysqli_fetch_assoc($result)['count'];

$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM claims WHERE claim_status = 'approved'");
$approved_claims = mysqli_fetch_assoc($result)['count'];

$user_name = $_SESSION['user_name'];

// Get recent items
$recent_items_query = mysqli_query($conn, "
    SELECT item_id, item_name, category_id, location_found, found_status 
    FROM found_items 
    ORDER BY created_at DESC 
    LIMIT 5
");
$recent_items = [];
while($item = mysqli_fetch_assoc($recent_items_query)) {
    $recent_items[] = $item;
}

// Pass data to HTML
include 'dashboard.html';
?>