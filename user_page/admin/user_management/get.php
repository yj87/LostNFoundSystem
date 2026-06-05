<?php
header('Content-Type: application/json');

$required_role = 'admin';

require_once("../../../includes/auth_check.php");
require_once("../../../includes/role_check.php");
require_once("../../../config/db_connect.php");

// NO POST method check here!

$sql = "SELECT user_id, username, name, email, role, phone, created_at FROM users ORDER BY user_id ASC";
$result = mysqli_query($conn, $sql);

$users = [];
if (mysqli_num_rows($result) > 0) {
    while($row = mysqli_fetch_assoc($result)) {
        $users[] = $row;
    }
}

echo json_encode($users);
mysqli_close($conn);
?>