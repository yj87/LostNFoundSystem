<?php
require_once '../config/db_connect.php';
require_once '../includes/auth_check.php';
$required_role = 'user';
require_once '../includes/role_check.php';

// Return data as JSON for JavaScript
header('Content-Type: application/json');

$user_id = $_SESSION['user_id'];
$user_name = $_SESSION['user_name'];
$user_role = $_SESSION['role'];

// Get statistics
$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM lost_reports WHERE user_id = $user_id");
$my_lost_reports = mysqli_fetch_assoc($result)['count'];

$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM claims WHERE user_id = $user_id");
$my_claims = mysqli_fetch_assoc($result)['count'];

$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM claims WHERE user_id = $user_id AND claim_status = 'pending'");
$pending_claims = mysqli_fetch_assoc($result)['count'];

$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM claims WHERE user_id = $user_id AND claim_status = 'approved'");
$approved_claims = mysqli_fetch_assoc($result)['count'];

$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM found_items WHERE found_status != 'claimed'");
$available_items = mysqli_fetch_assoc($result)['count'];

// Get recent lost reports
$recent_lost_query = mysqli_query($conn, "
    SELECT report_id, item_name, location_lost, date_lost, lost_status 
    FROM lost_reports 
    WHERE user_id = $user_id
    ORDER BY created_at DESC 
    LIMIT 5
");
$recent_lost = [];
while($item = mysqli_fetch_assoc($recent_lost_query)) {
    $recent_lost[] = $item;
}

// Get recent claims
$recent_claims_query = mysqli_query($conn, "
    SELECT c.claim_id, c.claim_status, c.submitted_at, f.item_name
    FROM claims c 
    JOIN found_items f ON c.item_id = f.item_id 
    WHERE c.user_id = $user_id
    ORDER BY c.submitted_at DESC 
    LIMIT 5
");
$recent_claims = [];
while($claim = mysqli_fetch_assoc($recent_claims_query)) {
    $recent_claims[] = $claim;
}

// Return JSON response
echo json_encode([
    'success' => true,
    'user_name' => $user_name,
    'user_avatar' => strtoupper(substr($user_name, 0, 1)),
    'user_role' => $user_role,
    'my_lost_reports' => $my_lost_reports,
    'my_claims' => $my_claims,
    'pending_claims' => $pending_claims,
    'approved_claims' => $approved_claims,
    'available_items' => $available_items,
    'recent_lost' => $recent_lost,
    'recent_claims' => $recent_claims,
    'current_year' => date('Y')
]);

mysqli_close($conn);
?>