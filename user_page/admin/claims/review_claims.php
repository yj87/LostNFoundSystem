<?php
require_once '../../../config/db_connect.php';
require_once '../../../includes/auth_check.php';
$required_role = 'admin';
require_once '../../../includes/role_check.php';

header('Content-Type: application/json');

$admin_id = $_SESSION['user_id'];
$admin_name = $_SESSION['user_name'];

// Get admin info
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'user') {
    $user_avatar = strtoupper(substr($admin_name, 0, 1));
    echo json_encode(['success' => true, 'user_name' => $admin_name, 'user_avatar' => $user_avatar]);
    exit();
}

// Get claim details
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $claim_id = intval($_GET['id']);
    
    $query = "SELECT c.*, 
                     f.item_name, f.description as item_description, f.location_found, f.date_found, f.photo as item_photo,
                     u.name as claimant_name, u.email as claimant_email, u.phone as claimant_phone,
                     s.name as staff_name,
                     lr.item_name as lost_item_name, lr.location_lost, lr.date_lost, lr.description as lost_description, lr.lost_status, lr.photo as lost_photo
              FROM claims c
              JOIN found_items f ON c.item_id = f.item_id
              JOIN users u ON c.user_id = u.user_id
              LEFT JOIN users s ON f.user_id = s.user_id
              LEFT JOIN lost_reports lr ON c.lost_report_id = lr.report_id
              WHERE c.claim_id = $claim_id";
    
    $result = mysqli_query($conn, $query);
    
    if (mysqli_num_rows($result) == 0) {
        echo json_encode(['success' => false, 'message' => 'Claim not found']);
        exit();
    }
    
    $row = mysqli_fetch_assoc($result);
    $claim = [
        'claim_id' => $row['claim_id'],
        'item_name' => htmlspecialchars($row['item_name']),
        'item_description' => nl2br(htmlspecialchars($row['item_description'])),
        'item_photo' => $row['item_photo'],
        'location_found' => htmlspecialchars($row['location_found']),
        'date_found' => date('d M Y', strtotime($row['date_found'])),
        'claim_status' => $row['claim_status'],
        'ownership_proof' => nl2br(htmlspecialchars($row['ownership_proof'])),
        'identifying_details' => nl2br(htmlspecialchars($row['identifying_details'])),
        'evidence_photo' => $row['evidence_photo'],
        'submitted_at' => date('d M Y, h:i A', strtotime($row['submitted_at'])),
        'claimant_name' => htmlspecialchars($row['claimant_name']),
        'claimant_email' => htmlspecialchars($row['claimant_email']),
        'claimant_phone' => htmlspecialchars($row['claimant_phone'] ?? '-'),
        'staff_name' => htmlspecialchars($row['staff_name'] ?? 'Unknown'),
        'lost_report_id' => $row['lost_report_id'],
        'lost_item_name' => htmlspecialchars($row['lost_item_name'] ?? ''),
        'lost_location' => htmlspecialchars($row['location_lost'] ?? ''),
        'lost_date' => $row['date_lost'] ? date('d M Y', strtotime($row['date_lost'])) : '',
        'lost_description' => nl2br(htmlspecialchars($row['lost_description'] ?? '')),
        'lost_status' => $row['lost_status'] ?? '',
        'lost_photo' => $row['lost_photo']
    ];
    
    echo json_encode(['success' => true, 'claim' => $claim]);
    exit();
}

// Process decision
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