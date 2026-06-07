<?php
require_once '../../../config/db_connect.php';
require_once '../../../includes/auth_check.php';
$required_role = 'admin';
require_once '../../../includes/role_check.php';

header('Content-Type: application/json');

$id = intval($_GET['id'] ?? 0);

if ($id === 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid item ID']);
    exit;
}

$query = "SELECT f.*, c.category_name, u.name AS reported_by
          FROM found_items f
          LEFT JOIN categories c ON f.category_id = c.category_id
          LEFT JOIN users u ON f.user_id = u.user_id
          WHERE f.item_id = $id";

$result = mysqli_query($conn, $query);

if ($row = mysqli_fetch_assoc($result)) {
    echo json_encode(['success' => true, 'data' => $row]);
} else {
    echo json_encode(['success' => false, 'message' => 'Item not found']);
}

mysqli_close($conn);
?>
