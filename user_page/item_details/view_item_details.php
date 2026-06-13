<?php
// view_item_details.php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once '../../config/db_connect.php';

header('Content-Type: application/json');

$id = intval($_GET['id'] ?? 0);

if ($id === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid item ID.'
    ]);
    exit;
}

$query = "SELECT 
            f.item_id,
            f.item_name,
            f.category_id,
            f.location_found,
            f.date_found,
            f.description,
            f.found_status,
            f.photo,
            f.user_id,
            c.category_name,
            u.name AS reported_by
          FROM found_items f
          LEFT JOIN categories c ON f.category_id = c.category_id
          LEFT JOIN users u ON f.user_id = u.user_id
          WHERE f.item_id = ?";

$stmt = mysqli_prepare($conn, $query);

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'message' => 'Database prepare error: ' . mysqli_error($conn)
    ]);
    exit;
}

mysqli_stmt_bind_param($stmt, "i", $id);
mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);

if ($row = mysqli_fetch_assoc($result)) {
    echo json_encode([
        'success' => true,
        'data' => $row
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Item not found.'
    ]);
}

mysqli_close($conn);
?>