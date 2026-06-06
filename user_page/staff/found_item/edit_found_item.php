<?php
session_start();
require_once '../../../config/db_connect.php';
header('Content-Type: application/json');

$id = intval($_GET['id']);
$user_id = $_SESSION['user_id'];

$query = "SELECT * FROM found_items WHERE item_id = $id AND user_id = $user_id";
$result = mysqli_query($conn, $query);

if ($row = mysqli_fetch_assoc($result)) {
    echo json_encode(['success' => true, 'data' => $row]);
} else {
    echo json_encode(['success' => false, 'message' => 'Item not found']);
}
?>