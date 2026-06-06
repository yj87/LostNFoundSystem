<?php
require_once '../config/db_connect.php';
require_once '../includes/auth_check.php';
$required_role = 'admin';
require_once '../includes/role_check.php';

// Return data as JSON for JavaScript
header('Content-Type: application/json');

$user_name = $_SESSION['user_name'];

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

// Return JSON response
echo json_encode([
    'success' => true,
    'user_name' => $user_name,
    'user_avatar' => strtoupper(substr($user_name, 0, 1)),
    'total_users' => $total_users,
    'total_items' => $total_items,
    'total_lost_reports' => $total_lost_reports,
    'total_claims' => $total_claims,
    'pending_claims' => $pending_claims,
    'approved_claims' => $approved_claims,
    'recent_items' => $recent_items,
    'current_year' => date('Y')
]);

mysqli_close($conn);
?>