<?php
header('Content-Type: application/json');

$required_role = 'admin';

require_once("../../../includes/auth_check.php");
require_once("../../../includes/role_check.php");
require_once("../../../config/db_connect.php");

$search = $_GET['search'] ?? '';

if (!empty($search)) {
    $search = "%{$search}%";
    $stmt = mysqli_prepare($conn, "SELECT user_id, username, name, email, role, phone, created_at 
                                    FROM users 
                                    WHERE username LIKE ? 
                                    OR name LIKE ? 
                                    OR email LIKE ? 
                                    OR role LIKE ?
                                    ORDER BY user_id DESC");
    mysqli_stmt_bind_param($stmt, "ssss", $search, $search, $search, $search);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
} else {
    // If no search term, get all users
    $sql = "SELECT user_id, username, name, email, role, phone, created_at FROM users ORDER BY user_id DESC";
    $result = mysqli_query($conn, $sql);
}

$users = [];
if (mysqli_num_rows($result) > 0) {
    while($row = mysqli_fetch_assoc($result)) {
        $users[] = $row;
    }
}

echo json_encode($users);
mysqli_close($conn);
?>