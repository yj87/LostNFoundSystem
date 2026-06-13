<?php
require_once '../../../config/db_connect.php';
require_once '../../../includes/auth_check.php';
$required_role = 'user';
require_once '../../../includes/role_check.php';

header('Content-Type: application/json');

if (isset($_GET['action']) && $_GET['action'] === 'user') {
    $user_name = $_SESSION['user_name'];
    $user_avatar = strtoupper(substr($user_name, 0, 1));
    echo json_encode(['success' => true, 'user_name' => $user_name, 'user_avatar' => $user_avatar]);
    exit();
}

if (isset($_GET['id'])) {
    $claim_id = intval($_GET['id']);
    $user_id = $_SESSION['user_id'];
    
    $query = "SELECT c.*, f.item_name, f.location_found, f.date_found, u.name as reviewed_by_name
              FROM claims c
              JOIN found_items f ON c.item_id = f.item_id
              LEFT JOIN users u ON c.reviewed_by = u.user_id
              WHERE c.claim_id = $claim_id AND c.user_id = $user_id";
    
    $result = mysqli_query($conn, $query);
    
    if (mysqli_num_rows($result) == 0) {
        echo json_encode(['success' => false, 'message' => 'Claim not found']);
        exit();
    }
    
    $row = mysqli_fetch_assoc($result);
    $claim = [
        'claim_id' => $row['claim_id'],
        'item_name' => htmlspecialchars($row['item_name']),
        'location_found' => htmlspecialchars($row['location_found']),
        'date_found' => date('d M Y', strtotime($row['date_found'])),
        'claim_status' => $row['claim_status'],
        'ownership_proof' => nl2br(htmlspecialchars($row['ownership_proof'])),
        'identifying_details' => nl2br(htmlspecialchars($row['identifying_details'])),
        'review_note' => nl2br(htmlspecialchars($row['review_note'] ?? '')),
        'submitted_at' => date('d M Y, h:i A', strtotime($row['submitted_at'])),
        'reviewed_at' => $row['reviewed_at'] ? date('d M Y, h:i A', strtotime($row['reviewed_at'])) : '',
        'reviewed_by_name' => htmlspecialchars($row['reviewed_by_name'] ?? '')
    ];
    
    echo json_encode(['success' => true, 'claim' => $claim]);
    exit();
}

$user_id = $_SESSION['user_id'];
$search = isset($_GET['search']) ? mysqli_real_escape_string($conn, $_GET['search']) : '';
$status = isset($_GET['status']) ? mysqli_real_escape_string($conn, $_GET['status']) : '';
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
$offset = ($page - 1) * $limit;

$where = "c.user_id = $user_id";

if ($search) {
    $where .= " AND f.item_name LIKE '%$search%'";
}
if ($status) {
    $where .= " AND c.claim_status = '$status'";
}

$count_query = "SELECT COUNT(*) as total FROM claims c JOIN found_items f ON c.item_id = f.item_id WHERE $where";
$count_result = mysqli_query($conn, $count_query);
$total_count = mysqli_fetch_assoc($count_result)['total'];

$query = "SELECT c.claim_id, c.claim_status, c.submitted_at, c.review_note,
          f.item_name, f.location_found, f.date_found
          FROM claims c
          JOIN found_items f ON c.item_id = f.item_id
          WHERE $where
          ORDER BY c.submitted_at DESC
          LIMIT $offset, $limit";

$result = mysqli_query($conn, $query);
$claims = [];

while ($row = mysqli_fetch_assoc($result)) {
    $claims[] = [
        'claim_id' => $row['claim_id'],
        'item_name' => htmlspecialchars($row['item_name']),
        'location_found' => htmlspecialchars($row['location_found']),
        'date_found' => date('d M Y', strtotime($row['date_found'])),
        'claim_status' => $row['claim_status'],
        'review_note' => htmlspecialchars($row['review_note'] ?? ''),
        'submitted_at' => date('d M Y, h:i A', strtotime($row['submitted_at']))
    ];
}

echo json_encode([
    'success' => true,
    'claims' => $claims,
    'total' => $total_count,
    'page' => $page,
    'limit' => $limit,
    'total_pages' => ceil($total_count / $limit)
]);

mysqli_close($conn);
?>