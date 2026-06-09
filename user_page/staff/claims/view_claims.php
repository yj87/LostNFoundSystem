<?php
require_once '../../../config/db_connect.php';
require_once '../../../includes/auth_check.php';
$required_role = 'staff';
require_once '../../../includes/role_check.php';

header('Content-Type: application/json');

$user_id = $_SESSION['user_id'];
$staff_name = $_SESSION['user_name'];

// Get staff info
if (isset($_GET['action']) && $_GET['action'] === 'user') {
    $user_avatar = strtoupper(substr($staff_name, 0, 1));
    echo json_encode(['success' => true, 'user_name' => $staff_name, 'user_avatar' => $user_avatar]);
    exit();
}

// Get single claim details
if (isset($_GET['id'])) {
    $claim_id = intval($_GET['id']);
    
    $query = "SELECT c.*, 
                     f.item_id, f.item_name, f.description as item_description, 
                     f.location_found, f.date_found, f.found_status,
                     u.name as claimant_name, u.email as claimant_email, u.phone as claimant_phone
              FROM claims c
              JOIN found_items f ON c.item_id = f.item_id
              JOIN users u ON c.user_id = u.user_id
              WHERE c.claim_id = $claim_id AND f.user_id = $user_id";
    
    $result = mysqli_query($conn, $query);
    
    if (mysqli_num_rows($result) == 0) {
        echo json_encode(['success' => false, 'message' => 'Claim not found or you do not have permission']);
        exit();
    }
    
    $row = mysqli_fetch_assoc($result);
    $claim = [
        'claim_id' => $row['claim_id'],
        'item_name' => htmlspecialchars($row['item_name']),
        'item_description' => nl2br(htmlspecialchars($row['item_description'] ?? '')),
        'location_found' => htmlspecialchars($row['location_found']),
        'date_found' => date('d M Y', strtotime($row['date_found'])),
        'found_status' => $row['found_status'],
        'claim_status' => $row['claim_status'],
        'ownership_proof' => nl2br(htmlspecialchars($row['ownership_proof'])),
        'identifying_details' => nl2br(htmlspecialchars($row['identifying_details'])),
        'review_note' => nl2br(htmlspecialchars($row['review_note'] ?? '')),
        'submitted_at' => date('d M Y, h:i A', strtotime($row['submitted_at'])),
        'reviewed_at' => $row['reviewed_at'] ? date('d M Y, h:i A', strtotime($row['reviewed_at'])) : '',
        'claimant_name' => htmlspecialchars($row['claimant_name']),
        'claimant_email' => htmlspecialchars($row['claimant_email']),
        'claimant_phone' => htmlspecialchars($row['claimant_phone'] ?? '-')
    ];
    
    echo json_encode(['success' => true, 'claim' => $claim]);
    exit();
}

// Get all claims on staff's items
$search = isset($_GET['search']) ? mysqli_real_escape_string($conn, $_GET['search']) : '';
$status = isset($_GET['status']) ? mysqli_real_escape_string($conn, $_GET['status']) : '';
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 15;
$offset = ($page - 1) * $limit;

$where = "f.user_id = $user_id";

if ($search) {
    $where .= " AND (f.item_name LIKE '%$search%' OR u.name LIKE '%$search%')";
}
if ($status) {
    $where .= " AND c.claim_status = '$status'";
}

// Get total count
$count_query = "SELECT COUNT(*) as total 
                FROM claims c 
                JOIN found_items f ON c.item_id = f.item_id 
                JOIN users u ON c.user_id = u.user_id 
                WHERE $where";
$count_result = mysqli_query($conn, $count_query);
$total_count = mysqli_fetch_assoc($count_result)['total'];

// Get claims
$query = "SELECT c.claim_id, c.claim_status, c.submitted_at,
          f.item_name, f.location_found,
          u.name as claimant_name
          FROM claims c 
          JOIN found_items f ON c.item_id = f.item_id 
          JOIN users u ON c.user_id = u.user_id 
          WHERE $where
          ORDER BY CASE WHEN c.claim_status = 'pending' THEN 0 ELSE 1 END, c.submitted_at DESC
          LIMIT $offset, $limit";

$result = mysqli_query($conn, $query);
$claims = [];

while ($row = mysqli_fetch_assoc($result)) {
    $claims[] = [
        'claim_id' => $row['claim_id'],
        'item_name' => htmlspecialchars($row['item_name']),
        'location_found' => htmlspecialchars($row['location_found']),
        'claim_status' => $row['claim_status'],
        'claimant_name' => htmlspecialchars($row['claimant_name']),
        'submitted_at' => date('d M Y, h:i A', strtotime($row['submitted_at']))
    ];
}

// Get stats
$stats_query = "SELECT c.claim_status, COUNT(*) as count
                FROM claims c
                JOIN found_items f ON c.item_id = f.item_id
                WHERE f.user_id = $user_id
                GROUP BY c.claim_status";
$stats_result = mysqli_query($conn, $stats_query);
$stats = ['pending' => 0, 'approved' => 0, 'rejected' => 0, 'total' => $total_count];
while ($row = mysqli_fetch_assoc($stats_result)) {
    $stats[$row['claim_status']] = $row['count'];
}

echo json_encode([
    'success' => true,
    'claims' => $claims,
    'stats' => $stats,
    'total' => $total_count,
    'page' => $page,
    'limit' => $limit,
    'total_pages' => ceil($total_count / $limit)
]);

mysqli_close($conn);
?>