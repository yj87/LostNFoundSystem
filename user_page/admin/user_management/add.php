<?php
$required_role = 'admin'; 
require_once("../../../config/db_connect.php");
require_once("../../../includes/auth_check.php");
require_once("../../../includes/role_check.php");

// Get user info from session
$admin_id = $_SESSION['user_id'] ?? 0;
$admin_name = $_SESSION['user_name'] ?? 'Admin';
$user_avatar = strtoupper(substr($admin_name, 0, 1));
$current_year = date('Y');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add User - Lost & Found System</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="add.css">
</head>
<body>
    <div class="dashboard-container">
        <!-- ASIDE: Sidebar Navigation -->
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
                    <a href="manage.php" class="nav-item">
                        <span class="icon"><i class="fas fa-users"></i></span>
                        <span>Manage Users</span>
                    </a>
                    <a href="add.php" class="nav-item active">
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
                    <a href="../statistic/monthly_stats.php" class="nav-item">
                        <span class="icon"><i class="fas fa-chart-line"></i></span>
                        <span>Statistics</span>
                    </a>
                </div>

                <div class="nav-group">
                    <div class="nav-group-title">Account</div>
                    <a href="../../profile/profile.php" class="nav-item">
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
                    <div class="page-title-header">Add User</div>
                </div>
                
                <div class="user-dropdown">
                    <div class="user-info-wrapper" onclick="toggleUserDropdown()">
                        <div class="user-avatar" id="userAvatar"><?php echo $user_avatar; ?></div>
                    </div>
                    <div class="user-dropdown-menu" id="userDropdownMenu">
                        <a href="../../profile/profile.php">
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
                    <h1>Add New User</h1>
                    <p>Create a new user account in the system</p>
                </div>
                
                <div class="form-wrapper">
                    <div class="form-container">
                        <div id="alertMessage" class="alert" style="display: none;"></div>
                        
                        <form id="addUserForm" method="POST" action="adduser.php">
                            <div class="form-group">
                                <label>Username <span class="required">*</span></label>
                                <input type="text" class="form-control" name="username" id="username" required>
                                <div id="usernameHint" class="validation-hint"></div>
                            </div>
                            
                            <div class="form-group">
                                <label>Full Name <span class="required">*</span></label>
                                <input type="text" class="form-control" name="name" id="name" required>
                                <div id="nameHint" class="validation-hint"></div>
                            </div>
                            
                            <div class="form-group">
                                <label>Email <span class="required">*</span></label>
                                <input type="email" class="form-control" name="email" id="email" required>
                                <div id="emailHint" class="validation-hint"></div>
                            </div>
                            
                            <div class="form-group">
                                <label>Phone</label>
                                <input type="text" class="form-control" name="phone" id="phone">
                                <div id="phoneHint" class="validation-hint"></div>
                                <div class="form-hint">Optional contact number</div>
                            </div>
                            
                            <div class="form-group">
                                <label>Password <span class="required">*</span></label>
                                <input type="password" class="form-control" name="password" id="password" required>
                                <div id="passwordHint" class="validation-hint"></div>
                                <div class="form-hint">Minimum 6 characters</div>
                            </div>
                            
                            <div class="form-group">
                                <label>Confirm Password <span class="required">*</span></label>
                                <input type="password" class="form-control" name="confirm_password" id="confirm_password" required>
                                <div id="confirmHint" class="validation-hint"></div>
                            </div>
                            
                            <div class="form-group">
                                <label>Role <span class="required">*</span></label>
                                <select class="form-control" name="role" id="role" required>
                                    <option value="user">User</option>
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary" id="submitBtn">
                                    <span><i class="fas fa-user-plus"></i> Add User</span>
                                    <span class="spinner" style="display: none;"></span>
                                </button>
                                <a href="manage.php" class="btn btn-secondary">
                                    <i class="fas fa-times"></i> Cancel
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
            </article>
            
            <footer>
                <p id="copyright">© <?php echo $current_year; ?> Lost & Found System - Universiti Teknologi Malaysia. All rights reserved.</p>
            </footer>
        </div>
    </div>
    
    <script src="add.js"></script>
</body>
</html>