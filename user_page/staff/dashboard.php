<?php
require_once '../config/db_connect.php';
require_once '../includes/auth_check.php';
$required_role = 'staff';
require_once '../includes/role_check.php';

// Return data as JSON for JavaScript
header('Content-Type: application/json');

$user_id = $_SESSION['user_id'];
$user_name = $_SESSION['user_name'];

// Get statistics
$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM found_items WHERE user_id = $user_id");
$my_items = mysqli_fetch_assoc($result)['count'];

$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM found_items");
$total_items = mysqli_fetch_assoc($result)['count'];

$result = mysqli_query($conn, "
    SELECT COUNT(*) as count 
    FROM claims c 
    JOIN found_items f ON c.item_id = f.item_id 
    WHERE f.user_id = $user_id
");
$my_claims = mysqli_fetch_assoc($result)['count'];

$result = mysqli_query($conn, "
    SELECT COUNT(*) as count 
    FROM claims c 
    JOIN found_items f ON c.item_id = f.item_id 
    WHERE f.user_id = $user_id AND c.claim_status = 'pending'
");
$pending_claims = mysqli_fetch_assoc($result)['count'];

// Get recent found items
$recent_items_query = mysqli_query($conn, "
    SELECT item_id, item_name, location_found, date_found, found_status 
    FROM found_items 
    WHERE user_id = $user_id
    ORDER BY created_at DESC 
    LIMIT 5
");
$recent_items = [];
while($item = mysqli_fetch_assoc($recent_items_query)) {
    $recent_items[] = $item;
}

// Get recent claims on staff's items
$recent_claims_query = mysqli_query($conn, "
    SELECT c.claim_id, c.claim_status, c.submitted_at, f.item_name, u.name as claimant_name
    FROM claims c 
    JOIN found_items f ON c.item_id = f.item_id 
    JOIN users u ON c.user_id = u.user_id 
    WHERE f.user_id = $user_id
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
    'my_items' => $my_items,
    'total_items' => $total_items,
    'my_claims' => $my_claims,
    'pending_claims' => $pending_claims,
    'recent_claims' => $recent_claims,
    'recent_items' => $recent_items,
    'current_year' => date('Y')
]);

mysqli_close($conn);
?>