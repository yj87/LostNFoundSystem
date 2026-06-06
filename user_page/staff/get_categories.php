<?php

// get_categories.php
require_once '../../config/db_connect.php';

header('Content-Type: application/json');

$query = "SELECT category_id, category_name FROM categories ORDER BY category_name ASC";
$result = mysqli_query($conn, $query);

$categories = [];

if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $categories[] = $row;
    }
    echo json_encode(['success' => true, 'data' => $categories]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to fetch categories']);
}

mysqli_close($conn);
?>