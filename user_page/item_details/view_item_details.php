<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once '../../config/db_connect.php';

header('Content-Type: application/json');

$id = intval($_GET['id'] ?? 0);
$type = $_GET['type'] ?? 'found';

if ($id === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid item ID.'
    ]);
    exit;
}

// Handle LOST REPORTS
if ($type === 'lost') {
    $query = "SELECT 
                lr.report_id as item_id,
                lr.item_name,
                lr.category_id,
                lr.location_lost,
                lr.date_lost,
                lr.description,
                lr.lost_status,
                lr.photo,
                lr.user_id,
                c.category_name,
                u.name AS reported_by
              FROM lost_reports lr
              LEFT JOIN categories c ON lr.category_id = c.category_id
              LEFT JOIN users u ON lr.user_id = u.user_id
              WHERE lr.report_id = ?";
    
    $stmt = mysqli_prepare($conn, $query);
    
    if (!$stmt) {
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . mysqli_error($conn)
        ]);
        exit;
    }
    
    mysqli_stmt_bind_param($stmt, "i", $id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($row = mysqli_fetch_assoc($result)) {
        echo json_encode([
            'success' => true,
            'data' => [
                'item_id' => $row['item_id'],
                'item_name' => $row['item_name'],
                'category_name' => $row['category_name'] ?? 'Uncategorized',
                'location_lost' => $row['location_lost'],  
                'date_lost' => date('d M Y', strtotime($row['date_lost'])), 
                'description' => $row['description'] ?? 'No description provided',
                'lost_status' => $row['lost_status'], 
                'photo' => $row['photo'],
                'reported_by' => $row['reported_by'] ?? 'Unknown'
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Lost report not found.'
        ]);
    }
    
    mysqli_stmt_close($stmt);
    mysqli_close($conn);
    exit;
}

// Handle FOUND ITEMS (default)
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
        'message' => 'Database error: ' . mysqli_error($conn)
    ]);
    exit;
}

mysqli_stmt_bind_param($stmt, "i", $id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if ($row = mysqli_fetch_assoc($result)) {
    echo json_encode([
        'success' => true,
        'data' => [
            'item_id' => $row['item_id'],
            'item_name' => $row['item_name'],
            'category_name' => $row['category_name'] ?? 'Uncategorized',
            'location_found' => $row['location_found'],
            'date_found' => date('d M Y', strtotime($row['date_found'])),
            'description' => $row['description'] ?? 'No description provided',
            'found_status' => $row['found_status'],
            'photo' => $row['photo'],
            'reported_by' => $row['reported_by'] ?? 'Unknown'
        ]
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Found item not found.'
    ]);
}

mysqli_stmt_close($stmt);
mysqli_close($conn);
?>