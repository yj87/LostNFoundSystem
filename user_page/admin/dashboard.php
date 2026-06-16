<?php
// 1. Set required role FIRST
$required_role = 'admin';

// 2. Include database and auth files
require_once '../../config/db_connect.php';
require_once '../../includes/auth_check.php';
require_once '../../includes/role_check.php';

// 3. Now fetch data
$user_name = $_SESSION['user_id']; // Using your session pattern

// Get statistics
$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM users");
$total_users = mysqli_fetch_assoc($result)['count'];

$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM found_items");
$total_items = mysqli_fetch_assoc($result)['count'];

$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM lost_reports");
$total_lost_reports = mysqli_fetch_assoc($result)['count'];

$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM claims");
$total_claims = mysqli_fetch_assoc($result)['count'];

$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM claims WHERE claim_status = 'pending'");
$pending_claims = mysqli_fetch_assoc($result)['count'];

$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM claims WHERE claim_status = 'approved'");
$approved_claims = mysqli_fetch_assoc($result)['count'];

// Get recent items with category name
$recent_items_query = mysqli_query($conn, "
    SELECT f.item_id, f.item_name, f.location_found, f.found_status, c.category_name 
    FROM found_items f
    LEFT JOIN categories c ON f.category_id = c.category_id
    ORDER BY f.created_at DESC 
    LIMIT 5
");
$recent_items = [];
while($item = mysqli_fetch_assoc($recent_items_query)) {
    $recent_items[] = $item;
}

mysqli_close($conn);

// 4. Store data in variables for use in HTML (NO JSON output)
$user_avatar = strtoupper(substr($user_name, 0, 1));
$current_year = date('Y');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Lost & Found System</title>
    <link rel="stylesheet" href="admin_dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="dashboard-container">
        <!-- ASIDE: Sidebar Navigation -->
        <aside id="sidebar">
            <div class="sidebar-header">
                <div class="logo-nav">
                    <div class="brand-logo">
                        <img src="../../logo/lostfind.webp" alt="LostFind Logo">
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
                    <a href="dashboard.html" class="nav-item active">
                        <span class="icon"><i class="fas fa-tachometer-alt"></i></span>
                        <span>Dashboard</span>
                    </a>
                </div>

                <div class="nav-group">
                    <div class="nav-group-title">User Management</div>
                    <a href="user_management/manage.php" class="nav-item">
                        <span class="icon"><i class="fas fa-users"></i></span>
                        <span>Manage Users</span>
                    </a>
                    <a href="user_management/add.html" class="nav-item">
                        <span class="icon"><i class="fas fa-user-plus"></i></span>
                        <span>Add User</span>
                    </a>
                </div>

                <div class="nav-group">
                    <div class="nav-group-title">Found Items</div>
                    <a href="found_item/admin_found_items.html" class="nav-item">
                        <span class="icon"><i class="fas fa-box"></i></span>
                        <span>View All Items</span>
                    </a>
                </div>

                <div class="nav-group">
                    <div class="nav-group-title">Lost Reports</div>
                    <a href="lost_reports/view_lost_reports.html" class="nav-item">
                        <span class="icon"><i class="fas fa-search"></i></span>
                        <span>View All Reports</span>
                    </a>
                </div>

                <div class="nav-group">
                    <div class="nav-group-title">Claims</div>
                    <a href="claims/view_claims.html" class="nav-item">
                        <span class="icon"><i class="fas fa-clipboard-list"></i></span>
                        <span>View All Claims</span>
                    </a>
                </div>

                <div class="nav-group">
                    <div class="nav-group-title">Reports & Statistics</div>
                    <a href="statistic/monthly_stats.html" class="nav-item">
                        <span class="icon"><i class="fas fa-chart-line"></i></span>
                        <span>Statistics</span>
                    </a>
                </div>

                <div class="nav-group">
                    <div class="nav-group-title">Account</div>
                    <a href="../profile/profile.html" class="nav-item">
                        <span class="icon"><i class="fas fa-user-circle"></i></span>
                        <span>My Profile</span>
                    </a>
                    <a href="../../mainpage/logout/logout.php" class="nav-item" onclick="return logoutUser();">
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
                    <div class="page-title-header">Admin Dashboard</div>
                </div>
                
                <!-- User Dropdown Menu -->
                <div class="user-dropdown">
                    <div class="user-info-wrapper" onclick="toggleUserDropdown()">
                        <div class="user-avatar" id="userAvatar"><?php echo $user_avatar; ?></div>
                    </div>
                    <div class="user-dropdown-menu" id="userDropdownMenu">
                        <a href="../profile/profile.html">
                            <i class="fas fa-user-circle"></i> My Profile
                        </a>
                        <div class="dropdown-divider"></div>
                        <a href="../../mainpage/logout/logout.php" onclick="return logoutUser();">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </a>
                    </div>
                </div>
            </header>
            
            <article>
                <div class="page-title">
                    <h1>Admin Dashboard</h1>
                    <p id="welcomeMessage">Welcome, <?php echo htmlspecialchars($user_name); ?>!</p>
                </div>
                
                <!-- Statistics Cards -->
                <div class="stats-grid">
                    <div class="stat-card" data-page="user_management/manage.html">
                        <div class="stat-info">
                            <h3>Total Users</h3>
                            <div class="stat-number"><?php echo $total_users; ?></div>
                        </div>
                        <div class="stat-icon"><i class="fas fa-users"></i></div>
                    </div>
                    
                    <div class="stat-card" data-page="../found_item/admin_found_items.html">
                        <div class="stat-info">
                            <h3>Found Items</h3>
                            <div class="stat-number"><?php echo $total_items; ?></div>
                        </div>
                        <div class="stat-icon"><i class="fas fa-box"></i></div>
                    </div>
                    
                    <div class="stat-card" data-page="../lost_reports/view_lost_reports.html">
                        <div class="stat-info">
                            <h3>Lost Reports</h3>
                            <div class="stat-number"><?php echo $total_lost_reports; ?></div>
                        </div>
                        <div class="stat-icon"><i class="fas fa-search"></i></div>
                    </div>
                    
                    <div class="stat-card" data-page="../claims/view_claims.html">
                        <div class="stat-info">
                            <h3>Total Claims</h3>
                            <div class="stat-number"><?php echo $total_claims; ?></div>
                        </div>
                        <div class="stat-icon"><i class="fas fa-clipboard-list"></i></div>
                    </div>
                    
                    <div class="stat-card" data-page="../claims/view_claims.html?status=pending">
                        <div class="stat-info">
                            <h3>Pending Claims</h3>
                            <div class="stat-number"><?php echo $pending_claims; ?></div>
                        </div>
                        <div class="stat-icon"><i class="fas fa-clock"></i></div>
                    </div>
                    
                    <div class="stat-card" data-page="../claims/view_claims.html?status=approved">
                        <div class="stat-info">
                            <h3>Approved Claims</h3>
                            <div class="stat-number"><?php echo $approved_claims; ?></div>
                        </div>
                        <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="quick-actions-grid">
                    <div class="action-card" data-page="user_management/add.html">
                        <i class="fas fa-user-plus"></i>
                        <h3>Add New User</h3>
                        <p>Create a new staff or admin account</p>
                    </div>
                    <div class="action-card" data-page="found_item/admin_found_items.html">
                        <i class="fas fa-box"></i>
                        <h3>Manage Found Items</h3>
                        <p>View, edit, or delete found items</p>
                    </div>
                    <div class="action-card" data-page="lost_reports/view_lost_reports.html">
                        <i class="fas fa-search"></i>
                        <h3>Manage Lost Reports</h3>
                        <p>View and manage lost item reports</p>
                    </div>
                    <div class="action-card" data-page="claims/view_claims.html">
                        <i class="fas fa-clipboard-list"></i>
                        <h3>View Claims</h3>
                        <p>Approve or reject pending claims</p>
                    </div>
                </div>
                
                <!-- Recent Items Section -->
                <div class="recent-section">
                    <div class="section-header">
                        <h3>Recent Found Items</h3>
                        <a href="found_item/admin_found_items.html" class="view-all">View All →</a>
                    </div>
                    <div class="data-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Item Name</th>
                                    <th>Category</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (count($recent_items) > 0): ?>
                                    <?php foreach ($recent_items as $item): ?>
                                    <tr>
                                        <td><?php echo htmlspecialchars($item['item_name']); ?></td>
                                        <td><?php echo htmlspecialchars($item['category_name'] ?? 'Uncategorized'); ?></td>
                                        <td><?php echo htmlspecialchars($item['location_found']); ?></td>
                                        <td>
                                            <span class="status-badge status-<?php echo strtolower($item['found_status']); ?>">
                                                <?php echo htmlspecialchars($item['found_status']); ?>
                                            </span>
                                        </td>
                                        <td>
                                            <a href="found_item/view_item.html?id=<?php echo $item['item_id']; ?>" class="btn-view">View</a>
                                        </td>
                                    </tr>
                                    <?php endforeach; ?>
                                <?php else: ?>
                                    <tr><td colspan="5" class="text-center">No recent items found</td></tr>
                                <?php endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </article>
            
            <footer>
                <p id="copyright">© <?php echo $current_year; ?> Lost & Found System - Universiti Teknologi Malaysia. All rights reserved.</p>
            </footer>
        </div>
    </div>

    <!-- Pass PHP data to JavaScript -->
    <script>
        // Session data passed to JavaScript
        const userData = {
            name: '<?php echo addslashes($user_name); ?>',
            role: '<?php echo $user_level; ?>',
            avatar: '<?php echo $user_avatar; ?>'
        };
        
        // Dashboard data
        const dashboardData = {
            totalUsers: <?php echo $total_users; ?>,
            totalItems: <?php echo $total_items; ?>,
            totalLostReports: <?php echo $total_lost_reports; ?>,
            totalClaims: <?php echo $total_claims; ?>,
            pendingClaims: <?php echo $pending_claims; ?>,
            approvedClaims: <?php echo $approved_claims; ?>
        };
    </script>

    <script src="dashboard.js"></script>
</body>
</html>