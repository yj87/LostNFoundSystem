<?php
require_once("../../config/db_connect.php");
require_once("../../includes/auth_check.php");

header('Content-Type: application/json');

$response = ['success' => false, 'message' => '', 'data' => null, 'role' => ''];

if (isset($_SESSION['user_id'])) {
    $userId = $_SESSION['user_id'];
    
    $sql = "SELECT user_id, username, name, email, role, phone, created_at 
            FROM users WHERE user_id = $userId";
    $result = mysqli_query($conn, $sql);
    
    if (mysqli_num_rows($result) > 0) {
        $userData = mysqli_fetch_assoc($result);
        $response['success'] = true;
        $response['data'] = $userData;
        $response['role'] = $userData['role'];
        
        if ($userData['role'] == 'staff' || $userData['role'] == 'admin') {
            $statsSql = "SELECT 
                        (SELECT COUNT(*) FROM found_items WHERE user_id = $userId) as my_found_items,
                        (SELECT COUNT(*) FROM claims WHERE reviewed_by = $userId) as reviewed_claims";
            $statsResult = mysqli_query($conn, $statsSql);
            $response['stats'] = mysqli_fetch_assoc($statsResult);
        } else {
            $statsSql = "SELECT 
                        (SELECT COUNT(*) FROM lost_reports WHERE user_id = $userId) as my_lost_reports,
                        (SELECT COUNT(*) FROM claims WHERE user_id = $userId) as my_claims";
            $statsResult = mysqli_query($conn, $statsSql);
            $response['stats'] = mysqli_fetch_assoc($statsResult);
        }
    } else {
        $response['message'] = "User not found";
    }
} else {
    $response['message'] = "Not logged in";
}

mysqli_close($conn);
echo json_encode($response);
?>