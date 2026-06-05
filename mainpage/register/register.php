<?php
header('Content-Type: application/json');

$host = 'localhost';
$dbname = 'lost_and_found_db';
$dbuser = 'root';
$dbpass = '';

$conn = mysqli_connect($host, $dbuser, $dbpass, $dbname);

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$username = trim($data['username'] ?? '');
$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$password = $data['password'] ?? '';

// Validate
if (empty($username) || empty($name) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'All required fields must be filled']);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
    exit;
}

// Check username exists
$stmt = mysqli_prepare($conn, "SELECT user_id FROM users WHERE username = ?");
mysqli_stmt_bind_param($stmt, "s", $username);
mysqli_stmt_execute($stmt);
mysqli_stmt_store_result($stmt);
if (mysqli_stmt_num_rows($stmt) > 0) {
    echo json_encode(['success' => false, 'message' => 'Username already taken']);
    exit;
}
mysqli_stmt_close($stmt);

// Check email exists
$stmt = mysqli_prepare($conn, "SELECT user_id FROM users WHERE email = ?");
mysqli_stmt_bind_param($stmt, "s", $email);
mysqli_stmt_execute($stmt);
mysqli_stmt_store_result($stmt);
if (mysqli_stmt_num_rows($stmt) > 0) {
    echo json_encode(['success' => false, 'message' => 'Email already registered']);
    exit;
}
mysqli_stmt_close($stmt);

// ✅ Using MD5 - matches login.php
$role = 'user';

$stmt = mysqli_prepare($conn, "INSERT INTO users (username, name, email, password, role, phone) VALUES (?, ?, ?, MD5(?), ?, ?)");
mysqli_stmt_bind_param($stmt, "ssssss", $username, $name, $email, $password, $role, $phone);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode(['success' => true, 'message' => 'Registration successful! Please login.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Registration failed. Please try again.']);
}

mysqli_stmt_close($stmt);
mysqli_close($conn);
?>