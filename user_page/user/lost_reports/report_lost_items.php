<?php
require_once '../../../config/db_connect.php';
require_once '../../../includes/auth_check.php';
$required_role = 'user';
require_once '../../../includes/role_check.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'user') {
    $user_name = $_SESSION['user_name'];
    $user_avatar = strtoupper(substr($user_name, 0, 1));
    echo json_encode(['success' => true, 'user_name' => $user_name, 'user_avatar' => $user_avatar]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'categories') {
    $query = "SELECT category_id, category_name FROM categories ORDER BY category_name";
    $result = mysqli_query($conn, $query);
    $categories = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $categories[] = $row;
    }
    echo json_encode(['success' => true, 'categories' => $categories]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'submit') {
    $user_id = $_SESSION['user_id'];
    $item_name = mysqli_real_escape_string($conn, $_POST['item_name']);
    $description = mysqli_real_escape_string($conn, $_POST['description']);
    $location_lost = mysqli_real_escape_string($conn, $_POST['location_lost']);
    $date_lost = mysqli_real_escape_string($conn, $_POST['date_lost']);
    $category_id = intval($_POST['category_id']);
    
    if (empty($item_name) || empty($location_lost) || empty($date_lost) || $category_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Please fill all required fields']);
        exit();
    }
    
    if ($date_lost > date('Y-m-d')) {
        echo json_encode(['success' => false, 'message' => 'Date cannot be in the future']);
        exit();
    }
    
    $query = "INSERT INTO lost_reports (user_id, item_name, description, location_lost, date_lost, category_id, lost_status) 
              VALUES ($user_id, '$item_name', '$description', '$location_lost', '$date_lost', $category_id, 'searching')";
    
    if (mysqli_query($conn, $query)) {
        echo json_encode(['success' => true, 'message' => 'Lost report submitted successfully!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . mysqli_error($conn)]);
    }
    exit();
}

echo json_encode(['success' => false, 'message' => 'Invalid request']);
mysqli_close($conn);
?>