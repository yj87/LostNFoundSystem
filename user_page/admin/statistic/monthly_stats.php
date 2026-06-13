<?php
require_once '../../../config/db_connect.php';
require_once '../../../includes/auth_check.php';
$required_role = 'admin';
require_once '../../../includes/role_check.php';

header('Content-Type: application/json');

$user_name = $_SESSION['user_name'];

// Get current month and year
$current_month = date('m');
$current_year = date('Y');

// Get this month's statistics
// Lost reports this month
$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM lost_reports WHERE MONTH(created_at) = $current_month AND YEAR(created_at) = $current_year");
$this_month_lost = mysqli_fetch_assoc($result)['count'];

// Found items this month
$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM found_items WHERE MONTH(created_at) = $current_month AND YEAR(created_at) = $current_year");
$this_month_found = mysqli_fetch_assoc($result)['count'];

// Claims this month
$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM claims WHERE MONTH(created_at) = $current_month AND YEAR(created_at) = $current_year");
$this_month_claims = mysqli_fetch_assoc($result)['count'];

// New users this month
$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM users WHERE MONTH(created_at) = $current_month AND YEAR(created_at) = $current_year");
$this_month_users = mysqli_fetch_assoc($result)['count'];

// Get previous month statistics for comparison
$prev_month = $current_month == 1 ? 12 : $current_month - 1;
$prev_year = $current_month == 1 ? $current_year - 1 : $current_year;

$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM lost_reports WHERE MONTH(created_at) = $prev_month AND YEAR(created_at) = $prev_year");
$prev_month_lost = mysqli_fetch_assoc($result)['count'];

$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM found_items WHERE MONTH(created_at) = $prev_month AND YEAR(created_at) = $prev_year");
$prev_month_found = mysqli_fetch_assoc($result)['count'];

$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM claims WHERE MONTH(created_at) = $prev_month AND YEAR(created_at) = $prev_year");
$prev_month_claims = mysqli_fetch_assoc($result)['count'];

$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM users WHERE MONTH(created_at) = $prev_month AND YEAR(created_at) = $prev_year");
$prev_month_users = mysqli_fetch_assoc($result)['count'];

// Get daily breakdown for this month
$daily_stats = [];
for ($day = 1; $day <= date('t'); $day++) {
    $date_str = sprintf("%d-%02d-%02d", $current_year, $current_month, $day);
    $daily_stats[$day] = [
        'date' => $date_str,
        'lost' => 0,
        'found' => 0,
        'claims' => 0,
        'users' => 0
    ];
}

// Fill daily lost reports
$result = mysqli_query($conn, "SELECT DAY(created_at) as day, COUNT(*) as count FROM lost_reports WHERE MONTH(created_at) = $current_month AND YEAR(created_at) = $current_year GROUP BY DAY(created_at)");
while($row = mysqli_fetch_assoc($result)) {
    $daily_stats[$row['day']]['lost'] = $row['count'];
}

// Fill daily found items
$result = mysqli_query($conn, "SELECT DAY(created_at) as day, COUNT(*) as count FROM found_items WHERE MONTH(created_at) = $current_month AND YEAR(created_at) = $current_year GROUP BY DAY(created_at)");
while($row = mysqli_fetch_assoc($result)) {
    $daily_stats[$row['day']]['found'] = $row['count'];
}

// Fill daily claims
$result = mysqli_query($conn, "SELECT DAY(created_at) as day, COUNT(*) as count FROM claims WHERE MONTH(created_at) = $current_month AND YEAR(created_at) = $current_year GROUP BY DAY(created_at)");
while($row = mysqli_fetch_assoc($result)) {
    $daily_stats[$row['day']]['claims'] = $row['count'];
}

// Fill daily new users
$result = mysqli_query($conn, "SELECT DAY(created_at) as day, COUNT(*) as count FROM users WHERE MONTH(created_at) = $current_month AND YEAR(created_at) = $current_year GROUP BY DAY(created_at)");
while($row = mysqli_fetch_assoc($result)) {
    $daily_stats[$row['day']]['users'] = $row['count'];
}

// Calculate percentage changes
function getPercentageChange($current, $previous) {
    if ($previous == 0) return $current > 0 ? 100 : 0;
    return round((($current - $previous) / $previous) * 100);
}

$lost_change = getPercentageChange($this_month_lost, $prev_month_lost);
$found_change = getPercentageChange($this_month_found, $prev_month_found);
$claims_change = getPercentageChange($this_month_claims, $prev_month_claims);
$users_change = getPercentageChange($this_month_users, $prev_month_users);

// Get month name
$month_name = date('F Y');

echo json_encode([
    'success' => true,
    'user_name' => $user_name,
    'user_avatar' => strtoupper(substr($user_name, 0, 1)),
    'month_name' => $month_name,
    'current_year' => date('Y'),
    'stats' => [
        'lost_reports' => [
            'current' => $this_month_lost,
            'previous' => $prev_month_lost,
            'change' => $lost_change,
            'trend' => $lost_change >= 0 ? 'up' : 'down'
        ],
        'found_items' => [
            'current' => $this_month_found,
            'previous' => $prev_month_found,
            'change' => $found_change,
            'trend' => $found_change >= 0 ? 'up' : 'down'
        ],
        'claims' => [
            'current' => $this_month_claims,
            'previous' => $prev_month_claims,
            'change' => $claims_change,
            'trend' => $claims_change >= 0 ? 'up' : 'down'
        ],
        'new_users' => [
            'current' => $this_month_users,
            'previous' => $prev_month_users,
            'change' => $users_change,
            'trend' => $users_change >= 0 ? 'up' : 'down'
        ]
    ],
    'daily_stats' => $daily_stats,
    'total_days' => date('t')
]);

mysqli_close($conn);
?>