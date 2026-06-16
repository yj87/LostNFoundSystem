<?php
require_once '../../config/db_connect.php';
require_once '../../includes/auth_check.php';
$required_role = 'admin';
require_once '../../includes/role_check.php';

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
                    <a href="dashboard_page.php" class="nav-item active">
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
                    <a href="user_management/add.php" class="nav-item">
                        <span class="icon"><i class="fas fa-user-plus"></i></span>
                        <span>Add User</span>
                    </a>
                </div>

                <div class="nav-group">
                    <div class="nav-group-title">Found Items</div>
                    <a href="found_item/admin_found_items.php" class="nav-item">
                        <span class="icon"><i class="fas fa-box"></i></span>
                        <span>View All Items</span>
                    </a>
                </div>

                <div class="nav-group">
                    <div class="nav-group-title">Lost Reports</div>
                    <a href="lost_reports/view_lost_reports.php" class="nav-item">
                        <span class="icon"><i class="fas fa-search"></i></span>
                        <span>View All Reports</span>
                    </a>
                </div>

                <div class="nav-group">
                    <div class="nav-group-title">Claims</div>
                    <a href="claims/view_claims.php" class="nav-item">
                        <span class="icon"><i class="fas fa-clipboard-list"></i></span>
                        <span>View All Claims</span>
                    </a>
                </div>

                <div class="nav-group">
                    <div class="nav-group-title">Reports & Statistics</div>
                    <a href="statistic/monthly_stats.php" class="nav-item">
                        <span class="icon"><i class="fas fa-chart-line"></i></span>
                        <span>Statistics</span>
                    </a>
                </div>

                <div class="nav-group">
                    <div class="nav-group-title">Account</div>
                    <a href="../profile/profile.php" class="nav-item">
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
                        <div class="user-avatar" id="userAvatar">A</div>
                    </div>
                    <div class="user-dropdown-menu" id="userDropdownMenu">
                        <a href="../profile/profile.php">
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
                    <p id="welcomeMessage">Loading dashboard data...</p>
                </div>
                
                <!-- Statistics Cards -->
                <div class="stats-grid">
                    <div class="stat-card" data-page="user_management/manage.php">
                        <div class="stat-info">
                            <h3>Total Users</h3>
                            <div class="stat-number" id="totalUsers">-</div>
                        </div>
                        <div class="stat-icon"><i class="fas fa-users"></i></div>
                    </div>
                    
                    <div class="stat-card" data-page="../found_item/admin_found_items.php">
                        <div class="stat-info">
                            <h3>Found Items</h3>
                            <div class="stat-number" id="totalItems">-</div>
                        </div>
                        <div class="stat-icon"><i class="fas fa-box"></i></div>
                    </div>
                    
                    <div class="stat-card" data-page="../lost_reports/view_lost_reports.php">
                        <div class="stat-info">
                            <h3>Lost Reports</h3>
                            <div class="stat-number" id="totalLostReports">-</div>
                        </div>
                        <div class="stat-icon"><i class="fas fa-search"></i></div>
                    </div>
                    
                    <div class="stat-card" data-page="../claims/view_claims.php">
                        <div class="stat-info">
                            <h3>Total Claims</h3>
                            <div class="stat-number" id="totalClaims">-</div>
                        </div>
                        <div class="stat-icon"><i class="fas fa-clipboard-list"></i></div>
                    </div>
                    
                    <div class="stat-card" data-page="../claims/view_claims.php?status=pending">
                        <div class="stat-info">
                            <h3>Pending Claims</h3>
                            <div class="stat-number" id="pendingClaims">-</div>
                        </div>
                        <div class="stat-icon"><i class="fas fa-clock"></i></div>
                    </div>
                    
                    <div class="stat-card" data-page="../claims/view_claims.php?status=approved">
                        <div class="stat-info">
                            <h3>Approved Claims</h3>
                            <div class="stat-number" id="approvedClaims">-</div>
                        </div>
                        <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="quick-actions-grid">
                    <div class="action-card" data-page="user_management/add.php">
                        <i class="fas fa-user-plus"></i>
                        <h3>Add New User</h3>
                        <p>Create a new staff or admin account</p>
                    </div>
                    <div class="action-card" data-page="found_item/admin_found_items.php">
                        <i class="fas fa-box"></i>
                        <h3>Manage Found Items</h3>
                        <p>View, edit, or delete found items</p>
                    </div>
                    <div class="action-card" data-page="lost_reports/view_lost_reports.php">
                        <i class="fas fa-search"></i>
                        <h3>Manage Lost Reports</h3>
                        <p>View and manage lost item reports</p>
                    </div>
                    <div class="action-card" data-page="claims/view_claims.php">
                        <i class="fas fa-clipboard-list"></i>
                        <h3>View Claims</h3>
                        <p>Approve or reject pending claims</p>
                    </div>
                </div>
                
                <!-- Recent Items Section -->
                <div class="recent-section">
                    <div class="section-header">
                        <h3>Recent Found Items</h3>
                        <a href="found_item/admin_found_items.php" class="view-all">View All →</a>
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
                            <tbody id="recentItemsTable">
                                <tr><td colspan="5" class="text-center">Loading items...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </article>
            
            <footer>
                <p id="copyright">© 2024 Lost & Found System - Universiti Teknologi Malaysia. All rights reserved.</p>
            </footer>
        </div>
    </div>

    <script src="dashboard.js"></script>
</body>
</html>