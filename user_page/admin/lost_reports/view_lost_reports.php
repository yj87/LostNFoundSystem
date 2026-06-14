<?php
require_once '../../../config/db_connect.php';

session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit();
}

if ($_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Not authorized']);
    exit();
}

if (isset($_GET['action']) && $_GET['action'] === 'categories') {
    $query = "SELECT category_id, category_name FROM categories ORDER BY category_name";
    $result = mysqli_query($conn, $query);
    $categories = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $categories[] = $row;
    }
    echo json_encode(['success' => true, 'categories' => $categories]);
    exit();
}

if (isset($_GET['id'])) {
    $report_id = intval($_GET['id']);
    
    $query = "SELECT lr.report_id, lr.item_name, lr.description, lr.location_lost, lr.date_lost, lr.lost_status, lr.photo, lr.created_at,
              u.name as user_name, u.email as user_email, u.phone as user_phone,
              c.category_name, c.category_id
              FROM lost_reports lr
              JOIN users u ON lr.user_id = u.user_id
              LEFT JOIN categories c ON lr.category_id = c.category_id
              WHERE lr.report_id = $report_id";
    
    $result = mysqli_query($conn, $query);
    
    if (mysqli_num_rows($result) == 0) {
        echo json_encode(['success' => false, 'message' => 'Report not found']);
        exit();
    }
    
    $row = mysqli_fetch_assoc($result);
    $report = [
        'report_id' => $row['report_id'],
        'item_name' => htmlspecialchars($row['item_name']),
        'description' => nl2br(htmlspecialchars($row['description'] ?? '')),
        'location_lost' => htmlspecialchars($row['location_lost']),
        'date_lost' => $row['date_lost'],
        'lost_status' => $row['lost_status'],
        'category_id' => $row['category_id'] ?? 0,
        'category_name' => $row['category_name'] ?? 'Uncategorized',
        'user_name' => htmlspecialchars($row['user_name']),
        'user_email' => htmlspecialchars($row['user_email']),
        'user_phone' => htmlspecialchars($row['user_phone'] ?? '-'),
        'created_at' => date('d F Y, h:i A', strtotime($row['created_at'])),
        'photo' => $row['photo'] ?? null
    ];
    
    echo json_encode(['success' => true, 'report' => $report]);
    exit();
}

$search = isset($_GET['search']) ? mysqli_real_escape_string($conn, $_GET['search']) : '';
$status = isset($_GET['status']) ? mysqli_real_escape_string($conn, $_GET['status']) : '';
$category = isset($_GET['category']) ? intval($_GET['category']) : 0;
$date_from = isset($_GET['date_from']) ? mysqli_real_escape_string($conn, $_GET['date_from']) : '';
$date_to = isset($_GET['date_to']) ? mysqli_real_escape_string($conn, $_GET['date_to']) : '';

$where = "WHERE 1=1";

if ($search) {
    $where .= " AND (lr.item_name LIKE '%$search%' OR lr.description LIKE '%$search%' OR lr.location_lost LIKE '%$search%')";
}
if ($status) {
    $where .= " AND lr.lost_status = '$status'";
}
if ($category > 0) {
    $where .= " AND lr.category_id = $category";
}
if ($date_from) {
    $where .= " AND lr.date_lost >= '$date_from'";
}
if ($date_to) {
    $where .= " AND lr.date_lost <= '$date_to'";
}

$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 20;
$offset = ($page - 1) * $limit;

$count_query = "SELECT COUNT(*) as total FROM lost_reports lr $where";
$count_result = mysqli_query($conn, $count_query);
$total_count = mysqli_fetch_assoc($count_result)['total'];

$query = "SELECT lr.report_id, lr.item_name, lr.description, lr.location_lost, lr.date_lost, lr.lost_status, lr.photo,
          u.name as user_name, u.email as user_email,
          c.category_name
          FROM lost_reports lr
          JOIN users u ON lr.user_id = u.user_id
          LEFT JOIN categories c ON lr.category_id = c.category_id
          $where
          ORDER BY lr.created_at DESC
          LIMIT $offset, $limit";

$result = mysqli_query($conn, $query);
$reports = [];

while ($row = mysqli_fetch_assoc($result)) {
    $status_label = '';
    if ($row['lost_status'] == 'searching') $status_label = 'Searching';
    if ($row['lost_status'] == 'found') $status_label = 'Found';
    if ($row['lost_status'] == 'closed') $status_label = 'Closed';
    
    $reports[] = [
        'report_id' => $row['report_id'],
        'item_name' => htmlspecialchars($row['item_name']),
        'description' => htmlspecialchars(substr($row['description'] ?? '', 0, 100)),
        'location_lost' => htmlspecialchars($row['location_lost']),
        'date_lost' => date('d M Y', strtotime($row['date_lost'])),
        'lost_status' => $row['lost_status'],
        'status_label' => $status_label,
        'category_name' => $row['category_name'] ?? 'Uncategorized',
        'user_name' => htmlspecialchars($row['user_name']),
        'user_email' => htmlspecialchars($row['user_email']),
        'photo' => $row['photo'] ?? null
    ];
}

$categories_query = "SELECT category_id, category_name FROM categories ORDER BY category_name";
$categories_result = mysqli_query($conn, $categories_query);
$categories = [];
while ($row = mysqli_fetch_assoc($categories_result)) {
    $categories[] = $row;
}

$status_query = "SELECT lost_status, COUNT(*) as count FROM lost_reports GROUP BY lost_status";
$status_result = mysqli_query($conn, $status_query);
$status_counts = ['searching' => 0, 'found' => 0, 'closed' => 0];
while ($row = mysqli_fetch_assoc($status_result)) {
    $status_counts[$row['lost_status']] = $row['count'];
}

echo json_encode([
    'success' => true,
    'reports' => $reports,
    'total' => $total_count,
    'page' => $page,
    'limit' => $limit,
    'total_pages' => ceil($total_count / $limit),
    'categories' => $categories,
    'status_counts' => $status_counts
]);

mysqli_close($conn);
?>