<?php
require_once '../../../config/db_connect.php';
require_once '../../../includes/auth_check.php';
$required_role = 'admin';
require_once '../../../includes/role_check.php';

header('Content-Type: application/json');

$admin_id = $_SESSION['user_id'];
$admin_name = $_SESSION['user_name'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $claim_id = intval($_POST['claim_id']);
    $decision = $_POST['decision'];
    $review_note = mysqli_real_escape_string($conn, $_POST['review_note']);
    
    if (!in_array($decision, ['approved', 'rejected'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid decision']);
        exit();
    }
    
    $check_query = "SELECT c.*, f.user_id as owner_id, f.item_id, c.lost_report_id
                    FROM claims c
                    JOIN found_items f ON c.item_id = f.item_id
                    WHERE c.claim_id = $claim_id";
    $check_result = mysqli_query($conn, $check_query);
    
    if (mysqli_num_rows($check_result) == 0) {
        echo json_encode(['success' => false, 'message' => 'Claim not found']);
        exit();
    }
    
    $claim = mysqli_fetch_assoc($check_result);
    
    if ($claim['claim_status'] !== 'pending') {
        echo json_encode(['success' => false, 'message' => 'This claim has already been reviewed']);
        exit();
    }
    
    $new_status = $decision;
    $query = "UPDATE claims SET 
              claim_status = '$new_status',
              reviewed_by = $admin_id,
              reviewed_at = NOW(),
              review_note = '$review_note'
              WHERE claim_id = $claim_id";
    
    if (mysqli_query($conn, $query)) {
        if ($decision === 'approved') {
            $item_id = $claim['item_id'];
            $update_item = "UPDATE found_items SET found_status = 'claimed' WHERE item_id = $item_id";
            mysqli_query($conn, $update_item);
            
            if (!empty($claim['lost_report_id'])) {
                $update_lost = "UPDATE lost_reports SET lost_status = 'found' WHERE report_id = " . $claim['lost_report_id'];
                mysqli_query($conn, $update_lost);
            }
        }
        
        echo json_encode(['success' => true, 'message' => 'Claim ' . $decision . ' successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . mysqli_error($conn)]);
    }
    exit();
}

echo json_encode(['success' => false, 'message' => 'Invalid request']);
mysqli_close($conn);
?>