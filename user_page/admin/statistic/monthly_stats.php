<?php
// 1. Set required role
$required_role = 'admin';

// 2. Include auth and database
require_once '../../../config/db_connect.php';
require_once '../../../includes/auth_check.php';
require_once '../../../includes/role_check.php';

// 3. Get user info from session
$admin_id = $_SESSION['user_id'] ?? 0;
$admin_name = $_SESSION['USER'] ?? 'Admin';
$user_avatar = strtoupper(substr($admin_name, 0, 1));

// 4. Check if this is an AJAX request
$is_ajax = isset($_SERVER['HTTP_X_REQUESTED_WITH']) && 
           strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

// Handle AJAX requests (GET - Fetch data)
if ($is_ajax) {
    header('Content-Type: application/json');
    
    try {
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

        echo json_encode([
            'success' => true,
            'user_name' => $admin_name,
            'user_avatar' => $user_avatar,
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
        exit();
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
        mysqli_close($conn);
        exit();
    }
}

// 5. If not AJAX, display HTML
$current_year = date('Y');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monthly Statistics - Lost & Found System</title>
    <link rel="stylesheet" href="../admin_dashboard.css">
    <link rel="stylesheet" href="monthly_stats.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="dashboard-container">
        <!-- Sidebar -->
        <aside id="sidebar">
            <div class="sidebar-header">
                <div class="logo-nav">
                    <div class="brand-logo">
                        <img src="../../../logo/lostfind.webp" alt="LostFind Logo">
                    </div>
                    <div class="brand-text">
                        <div class="brand-name">Lost<span>Find</span></div>
                        <div class="admin-tag">Admin Panel</div>
                    </div>
                </div>
            </div>
            
            <nav>
                <div class="nav-group">
                    <div class="nav-group-title">Main</div>
                    <a href="../dashboard_page.php" class="nav-item">
                        <span class="icon"><i class="fas fa-tachometer-alt"></i></span>
                        <span>Dashboard</span>
                    </a>
                </div>

                <div class="nav-group">
                    <div class="nav-group-title">User Management</div>
                    <a href="../user_management/manage.html" class="nav-item">
                        <span class="icon"><i class="fas fa-users"></i></span>
                        <span>Manage Users</span>
                    </a>
                    <a href="../user_management/add.html" class="nav-item">
                        <span class="icon"><i class="fas fa-user-plus"></i></span>
                        <span>Add User</span>
                    </a>
                </div>

                <div class="nav-group">
                    <div class="nav-group-title">Found Items</div>
                    <a href="../found_item/admin_found_items.php" class="nav-item">
                        <span class="icon"><i class="fas fa-box"></i></span>
                        <span>View All Items</span>
                    </a>
                </div>

                <div class="nav-group">
                    <div class="nav-group-title">Lost Reports</div>
                    <a href="../lost_reports/view_lost_reports.php" class="nav-item">
                        <span class="icon"><i class="fas fa-search"></i></span>
                        <span>View All Reports</span>
                    </a>
                </div>

                <div class="nav-group">
                    <div class="nav-group-title">Claims</div>
                    <a href="../claims/view_claims.php" class="nav-item">
                        <span class="icon"><i class="fas fa-clipboard-list"></i></span>
                        <span>View All Claims</span>
                    </a>
                </div>

                <div class="nav-group">
                    <div class="nav-group-title">Reports & Statistics</div>
                    <a href="monthly_stats.php" class="nav-item active">
                        <span class="icon"><i class="fas fa-chart-line"></i></span>
                        <span>Statistics</span>
                    </a>
                </div>

                <div class="nav-group">
                    <div class="nav-group-title">Account</div>
                    <a href="../../profile/profile.html" class="nav-item">
                        <span class="icon"><i class="fas fa-user-circle"></i></span>
                        <span>My Profile</span>
                    </a>
                    <a href="../../../mainpage/logout/logout.php" class="nav-item" onclick="return logoutUser();">
                        <span class="icon"><i class="fas fa-sign-out-alt"></i></span>
                        <span>Logout</span>
                    </a>
                </div>
            </nav>
        </aside>
        
        <div class="main-content">
            <header class="top-header">
                <div class="header-left">
                    <button class="menu-toggle" onclick="toggleSidebar()">
                        <i class="fas fa-bars"></i>
                    </button>
                    <div class="page-title-header">Monthly Statistics</div>
                </div>
                
                <div class="user-dropdown">
                    <div class="user-info-wrapper" onclick="toggleUserDropdown()">
                        <div class="user-avatar" id="userAvatar"><?php echo $user_avatar; ?></div>
                    </div>
                    <div class="user-dropdown-menu" id="userDropdownMenu">
                        <a href="../../profile/profile.html">
                            <i class="fas fa-user-circle"></i> My Profile
                        </a>
                        <div class="dropdown-divider"></div>
                        <a href="../../../mainpage/logout/logout.php" onclick="return logoutUser();">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </a>
                    </div>
                </div>
            </header>
            
            <article>
                <div class="page-title">
                    <h1>Monthly Statistics</h1>
                    <p id="welcomeMessage">Loading monthly data...</p>
                </div>
                
                <!-- Monthly Stats Cards -->
                <div class="stats-monthly">
                    <h2 class="month-title" id="monthTitle">Loading...</h2>
                    <div class="stats-grid" id="statsGrid">
                        <div class="stat-card">
                            <div class="stat-info">
                                <h3>Lost Reports</h3>
                                <div class="stat-number" id="lostReports">-</div>
                            </div>
                            <div class="stat-icon"><i class="fas fa-search"></i></div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-info">
                                <h3>Found Items</h3>
                                <div class="stat-number" id="foundItems">-</div>
                            </div>
                            <div class="stat-icon"><i class="fas fa-box"></i></div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-info">
                                <h3>Claims</h3>
                                <div class="stat-number" id="claimsCount">-</div>
                            </div>
                            <div class="stat-icon"><i class="fas fa-clipboard-list"></i></div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-info">
                                <h3>New Users</h3>
                                <div class="stat-number" id="newUsers">-</div>
                            </div>
                            <div class="stat-icon"><i class="fas fa-users"></i></div>
                        </div>
                    </div>
                </div>
                
                <!-- Daily Breakdown Chart -->
                <div class="daily-chart">
                    <div class="chart-title">
                        <i class="fas fa-chart-bar"></i> Daily Breakdown for <span id="chartMonth"></span>
                    </div>
                    <div class="chart-container">
                        <div class="bar-chart" id="barChart">
                            <div class="loading-spinner">Loading chart data...</div>
                        </div>
                    </div>
                    <div class="legend">
                        <div class="legend-item">
                            <div class="legend-color legend-lost"></div>
                            <span>Lost Reports</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color legend-found"></div>
                            <span>Found Items</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color legend-claims"></div>
                            <span>Claims</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color legend-users"></div>
                            <span>New Users</span>
                        </div>
                    </div>
                </div>
            </article>
            
            <footer>
                <p id="copyright">© <?php echo $current_year; ?> Lost & Found System - Universiti Teknologi Malaysia. All rights reserved.</p>
            </footer>
        </div>
    </div>

    <script>
        // Pass session data to JavaScript
        const adminId = <?php echo $admin_id; ?>;
        const adminName = '<?php echo addslashes($admin_name); ?>';
        const userAvatar = '<?php echo $user_avatar; ?>';
        
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            let overlay = document.querySelector('.sidebar-overlay');
            
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'sidebar-overlay';
                overlay.onclick = function() {
                    sidebar.classList.remove('active');
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                };
                document.body.appendChild(overlay);
            }
            
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
            
            if (window.innerWidth <= 768) {
                document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
            }
        }

        function toggleUserDropdown() {
            const dropdown = document.getElementById('userDropdownMenu');
            if (dropdown) {
                document.querySelectorAll('.user-dropdown-menu.show').forEach(menu => {
                    if (menu !== dropdown) menu.classList.remove('show');
                });
                dropdown.classList.toggle('show');
            }
        }

        function logoutUser() {
            if (confirm('Are you sure you want to logout?')) {
                window.location.href = '../../../mainpage/logout/logout.php';
                return true;
            }
            return false;
        }

        document.addEventListener('click', function(event) {
            const dropdown = document.getElementById('userDropdownMenu');
            const userInfoWrapper = document.querySelector('.user-info-wrapper');
            
            if (dropdown && userInfoWrapper && dropdown.classList.contains('show')) {
                if (!userInfoWrapper.contains(event.target) && !dropdown.contains(event.target)) {
                    dropdown.classList.remove('show');
                }
            }
            
            const sidebar = document.getElementById('sidebar');
            const menuToggle = document.querySelector('.menu-toggle');
            const overlay = document.querySelector('.sidebar-overlay');
            
            if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
                if (menuToggle && !menuToggle.contains(event.target) && !sidebar.contains(event.target)) {
                    sidebar.classList.remove('active');
                    if (overlay) overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });

        window.addEventListener('resize', function() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.querySelector('.sidebar-overlay');
            
            if (window.innerWidth > 768 && sidebar) {
                sidebar.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    </script>
    <script src="monthly_stats.js"></script>
</body>
</html>