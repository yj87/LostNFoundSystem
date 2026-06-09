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
    $report_id = intval($_GET['id']);
    $user_id = $_SESSION['user_id'];
    
    $query = "SELECT lr.*, c.category_name
              FROM lost_reports lr
              LEFT JOIN categories c ON lr.category_id = c.category_id
              WHERE lr.report_id = $report_id AND lr.user_id = $user_id";
    
    $result = mysqli_query($conn, $query);
    
    if (mysqli_num_rows($result) == 0) {
        echo json_encode(['success' => false, 'message' => 'Report not found']);
        exit();
    }
    
    $row = mysqli_fetch_assoc($result);
    $report = [
        'report_id' => $row['report_id'],
        'item_name' => htmlspecialchars($row['item_name']),
        'description' => nl2br(htmlspecialchars($row['description'])),
        'location_lost' => htmlspecialchars($row['location_lost']),
        'date_lost' => date('d F Y', strtotime($row['date_lost'])),
        'lost_status' => $row['lost_status'],
        'category_name' => $row['category_name'] ?? 'Uncategorized',
        'created_at' => date('d F Y, h:i A', strtotime($row['created_at']))
    ];
    
    echo json_encode(['success' => true, 'report' => $report]);
    exit();
}

$user_id = $_SESSION['user_id'];
$search = isset($_GET['search']) ? mysqli_real_escape_string($conn, $_GET['search']) : '';
$status = isset($_GET['status']) ? mysqli_real_escape_string($conn, $_GET['status']) : '';
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
$offset = ($page - 1) * $limit;

$where = "user_id = $user_id";

if ($search) {
    $where .= " AND (item_name LIKE '%$search%' OR location_lost LIKE '%$search%' OR description LIKE '%$search%')";
}
if ($status) {
    $where .= " AND lost_status = '$status'";
}

$count_query = "SELECT COUNT(*) as total FROM lost_reports WHERE $where";
$count_result = mysqli_query($conn, $count_query);
$total_count = mysqli_fetch_assoc($count_result)['total'];

$query = "SELECT report_id, item_name, location_lost, date_lost, lost_status
          FROM lost_reports
          WHERE $where
          ORDER BY created_at DESC
          LIMIT $offset, $limit";

$result = mysqli_query($conn, $query);
$reports = [];

while ($row = mysqli_fetch_assoc($result)) {
    $reports[] = [
        'report_id' => $row['report_id'],
        'item_name' => htmlspecialchars($row['item_name']),
        'location_lost' => htmlspecialchars($row['location_lost']),
        'date_lost' => date('d M Y', strtotime($row['date_lost'])),
        'lost_status' => $row['lost_status']
    ];
}

echo json_encode([
    'success' => true,
    'reports' => $reports,
    'total' => $total_count,
    'page' => $page,
    'limit' => $limit,
    'total_pages' => ceil($total_count / $limit)
]);

mysqli_close($conn);
?>