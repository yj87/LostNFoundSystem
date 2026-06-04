<?php
require_once '../../config/db_connect.php';
require_once '../../includes/auth_check.php';
$required_role = 'admin';
require_once '../../includes/role_check.php';

header('Content-Type: application/json');

$response = [];

// Get statistics
$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM users");
$response['total_users'] = mysqli_fetch_assoc($result)['count'];

$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM found_items");
$response['total_items'] = mysqli_fetch_assoc($result)['count'];

$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM claims");
$response['total_claims'] = mysqli_fetch_assoc($result)['count'];

$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM claims WHERE claim_status = 'pending'");
$response['pending_claims'] = mysqli_fetch_assoc($result)['count'];

// Claims by status
$status_stats = mysqli_query($conn, "SELECT claim_status, COUNT(*) as count FROM claims GROUP BY claim_status");
$response['status_labels'] = [];
$response['status_data'] = [];
while($row = mysqli_fetch_assoc($status_stats)) {
    $response['status_labels'][] = ucfirst($row['claim_status']);
    $response['status_data'][] = (int)$row['count'];
}

// Items by category
$category_stats = mysqli_query($conn, "SELECT c.category_name, COUNT(f.item_id) as count FROM categories c LEFT JOIN found_items f ON c.category_id = f.category_id GROUP BY c.category_id LIMIT 5");
$response['category_labels'] = [];
$response['category_data'] = [];
while($row = mysqli_fetch_assoc($category_stats)) {
    $response['category_labels'][] = $row['category_name'];
    $response['category_data'][] = (int)$row['count'];
}

// Recent claims
$recent_claims = mysqli_query($conn, "SELECT c.*, f.item_name, u.name as claimant_name FROM claims c JOIN found_items f ON c.item_id = f.item_id JOIN users u ON c.user_id = u.user_id ORDER BY c.submitted_at DESC LIMIT 5");
$response['recent_claims'] = [];
while($claim = mysqli_fetch_assoc($recent_claims)) {
    $response['recent_claims'][] = [
        'claim_id' => $claim['claim_id'],
        'item_name' => $claim['item_name'],
        'claimant_name' => $claim['claimant_name'],
        'claim_status' => $claim['claim_status'],
        'submitted_at' => $claim['submitted_at']
    ];
}

$response['user_name'] = $_SESSION['user_name'];

echo json_encode($response);
?>