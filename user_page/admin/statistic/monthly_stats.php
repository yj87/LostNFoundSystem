<?php
session_start();

// Include database connection
require_once '../../../config/db_connect.php';

// Set header to return JSON
header('Content-Type: application/json');

// Check if user is logged in using user_id or user_name from session
if (!isset($_SESSION['user_id']) && !isset($_SESSION['user_name'])) {
    echo json_encode(['success' => false, 'error' => 'User not logged in']);
    exit;
}

// Get username from session (it's stored as 'user_name', not 'username')
$username = isset($_SESSION['user_name']) ? $_SESSION['user_name'] : 'Admin';

// Get current month and year
$current_month = date('m');
$current_year = date('Y');
$current_month_start = "$current_year-$current_month-01";
$current_month_end = date('Y-m-t', strtotime($current_month_start));

// Query: Lost reports this month
$lost_query = "SELECT COUNT(*) as count FROM lost_reports WHERE DATE(created_at) BETWEEN '$current_month_start' AND '$current_month_end'";
$lost_result = mysqli_query($conn, $lost_query);
$this_month_lost = ($lost_result) ? mysqli_fetch_assoc($lost_result)['count'] : 0;

// Query: Found items this month
$found_query = "SELECT COUNT(*) as count FROM found_items WHERE DATE(created_at) BETWEEN '$current_month_start' AND '$current_month_end'";
$found_result = mysqli_query($conn, $found_query);
$this_month_found = ($found_result) ? mysqli_fetch_assoc($found_result)['count'] : 0;

// Query: Claims this month (using submitted_at)
$claims_query = "SELECT COUNT(*) as count FROM claims WHERE DATE(submitted_at) BETWEEN '$current_month_start' AND '$current_month_end'";
$claims_result = mysqli_query($conn, $claims_query);
$this_month_claims = ($claims_result) ? mysqli_fetch_assoc($claims_result)['count'] : 0;

// Query: New users this month
$users_query = "SELECT COUNT(*) as count FROM users WHERE DATE(created_at) BETWEEN '$current_month_start' AND '$current_month_end'";
$users_result = mysqli_query($conn, $users_query);
$this_month_users = ($users_result) ? mysqli_fetch_assoc($users_result)['count'] : 0;

// Get daily breakdown for this month
$daily_stats = [];
$total_days = date('t');

for ($day = 1; $day <= $total_days; $day++) {
    $date_str = sprintf("%d-%02d-%02d", $current_year, $current_month, $day);
    
    $daily_stats[$day] = [
        'date' => $date_str,
        'lost' => 0,
        'found' => 0,
        'claims' => 0,
        'users' => 0
    ];
    
    // Daily lost reports
    $lost_day_query = "SELECT COUNT(*) as c FROM lost_reports WHERE DATE(created_at) = '$date_str'";
    $lost_day_result = mysqli_query($conn, $lost_day_query);
    if ($lost_day_result) {
        $daily_stats[$day]['lost'] = (int)mysqli_fetch_assoc($lost_day_result)['c'];
    }
    
    // Daily found items
    $found_day_query = "SELECT COUNT(*) as c FROM found_items WHERE DATE(created_at) = '$date_str'";
    $found_day_result = mysqli_query($conn, $found_day_query);
    if ($found_day_result) {
        $daily_stats[$day]['found'] = (int)mysqli_fetch_assoc($found_day_result)['c'];
    }
    
    // Daily claims
    $claims_day_query = "SELECT COUNT(*) as c FROM claims WHERE DATE(submitted_at) = '$date_str'";
    $claims_day_result = mysqli_query($conn, $claims_day_query);
    if ($claims_day_result) {
        $daily_stats[$day]['claims'] = (int)mysqli_fetch_assoc($claims_day_result)['c'];
    }
    
    // Daily new users
    $users_day_query = "SELECT COUNT(*) as c FROM users WHERE DATE(created_at) = '$date_str'";
    $users_day_result = mysqli_query($conn, $users_day_query);
    if ($users_day_result) {
        $daily_stats[$day]['users'] = (int)mysqli_fetch_assoc($users_day_result)['c'];
    }
}

// Get month name
$month_name = date('F Y');

// Get user's first letter for avatar
$user_initial = strtoupper(substr($username, 0, 1));

// Return JSON response
echo json_encode([
    'success' => true,
    'user_name' => $username,
    'user_avatar' => $user_initial,
    'month_name' => $month_name,
    'current_year' => date('Y'),
    'stats' => [
        'lost_reports' => (int)$this_month_lost,
        'found_items' => (int)$this_month_found,
        'claims' => (int)$this_month_claims,
        'new_users' => (int)$this_month_users
    ],
    'daily_stats' => $daily_stats,
    'total_days' => $total_days
]);

mysqli_close($conn);
?>