<?php
require_once '../../../config/db_connect.php';
require_once '../../../includes/auth_check.php';
$required_role = 'user';
require_once '../../../includes/role_check.php';

header('Content-Type: application/json');

$user_id = $_SESSION['user_id'];

// Get user's lost reports (searching status only)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'get_lost_reports') {
    $query = "SELECT report_id, item_name, location_lost, date_lost 
              FROM lost_reports 
              WHERE user_id = $user_id AND lost_status = 'searching'
              ORDER BY created_at DESC";
    
    $result = mysqli_query($conn, $query);
    $reports = [];
    
    while ($row = mysqli_fetch_assoc($result)) {
        $reports[] = [
            'report_id' => $row['report_id'],
            'item_name' => htmlspecialchars($row['item_name']),
            'location_lost' => htmlspecialchars($row['location_lost']),
            'date_lost' => date('d M Y', strtotime($row['date_lost']))
        ];
    }
    
    echo json_encode(['success' => true, 'reports' => $reports]);
    exit();
}

// Get item details for preview
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'get_item') {
    $item_id = intval($_GET['item_id']);
    
    $query = "SELECT f.*, c.category_name 
              FROM found_items f
              LEFT JOIN categories c ON f.category_id = c.category_id
              WHERE f.item_id = $item_id";
    
    $result = mysqli_query($conn, $query);
    
    if (mysqli_num_rows($result) == 0) {
        echo json_encode(['success' => false, 'message' => 'Item not found']);
        exit();
    }
    
    $item = mysqli_fetch_assoc($result);
    
    if ($item['found_status'] === 'claimed') {
        echo json_encode(['success' => false, 'message' => 'This item has already been claimed']);
        exit();
    }
    
    echo json_encode([
    'success' => true,
    'item' => [
        'item_id' => $item['item_id'],
        'item_name' => htmlspecialchars($item['item_name']),
        'description' => $item['description'], 
        'location_found' => htmlspecialchars($item['location_found']),
        'date_found' => date('d M Y', strtotime($item['date_found'])),
        'found_status' => $item['found_status'],
        'category_name' => $item['category_name'] ?? 'Uncategorized'
        ]
    ]);
    exit();
}

// Submit claim
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'submit') {
    $item_id = intval($_POST['item_id']);
    $ownership_proof = mysqli_real_escape_string($conn, $_POST['ownership_proof']);
    $identifying_details = mysqli_real_escape_string($conn, $_POST['identifying_details']);
    $lost_report_id = !empty($_POST['lost_report_id']) ? intval($_POST['lost_report_id']) : null;
    
    if (empty($ownership_proof) || empty($identifying_details)) {
        echo json_encode(['success' => false, 'message' => 'Please fill all required fields']);
        exit();
    }
    
    // Check if item exists and is unclaimed
    $check_query = "SELECT found_status FROM found_items WHERE item_id = $item_id";
    $check_result = mysqli_query($conn, $check_query);
    $item = mysqli_fetch_assoc($check_result);
    
    if (!$item) {
        echo json_encode(['success' => false, 'message' => 'Item not found']);
        exit();
    }
    
    if ($item['found_status'] === 'claimed') {
        echo json_encode(['success' => false, 'message' => 'This item has already been claimed']);
        exit();
    }
    
    // Check if user already submitted a claim for this item
    $check_claim = mysqli_query($conn, "SELECT claim_id FROM claims WHERE item_id = $item_id AND user_id = $user_id");
    if (mysqli_num_rows($check_claim) > 0) {
        echo json_encode(['success' => false, 'message' => 'You have already submitted a claim for this item']);
        exit();
    }
    
    // Verify lost report belongs to user if provided
    if ($lost_report_id) {
        $check_lost = mysqli_query($conn, "SELECT report_id FROM lost_reports WHERE report_id = $lost_report_id AND user_id = $user_id");
        if (mysqli_num_rows($check_lost) == 0) {
            echo json_encode(['success' => false, 'message' => 'Invalid lost report selected']);
            exit();
        }
    }
    
    if ($lost_report_id) {
        $query = "INSERT INTO claims (item_id, user_id, ownership_proof, identifying_details, claim_status, submitted_at, lost_report_id) 
                  VALUES ($item_id, $user_id, '$ownership_proof', '$identifying_details', 'pending', NOW(), $lost_report_id)";
    } else {
        $query = "INSERT INTO claims (item_id, user_id, ownership_proof, identifying_details, claim_status, submitted_at) 
                  VALUES ($item_id, $user_id, '$ownership_proof', '$identifying_details', 'pending', NOW())";
    }
    
    if (mysqli_query($conn, $query)) {
        echo json_encode(['success' => true, 'message' => 'Claim submitted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . mysqli_error($conn)]);
    }
    exit();
}

echo json_encode(['success' => false, 'message' => 'Invalid request']);
mysqli_close($conn);
?>