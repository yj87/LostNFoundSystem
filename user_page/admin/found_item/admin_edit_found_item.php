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
$current_year = date('Y');
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Admin edit found item - Lost & Found System">
    <title>Edit Found Item - Admin Panel</title>
    <link rel="stylesheet" href="../admin_dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

    <link rel="stylesheet" href="admin_edit_found_item.css">
</head>

<body>
    <div class="dashboard-container">

       <!-- SIDEBAR -->
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

            <a href="../user_management/manage.php" class="nav-item">
                <span class="icon"><i class="fas fa-users"></i></span>
                <span>Manage Users</span>
            </a>

            <a href="../user_management/add.php" class="nav-item">
                <span class="icon"><i class="fas fa-user-plus"></i></span>
                <span>Add User</span>
            </a>
        </div>

        <div class="nav-group">
            <div class="nav-group-title">Found Items</div>

            <a href="admin_found_items.php" class="nav-item active">
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

        <!-- MAIN CONTENT -->
        <div class="main-content">
            <header class="top-header">
                <div class="header-left">
                    <button class="menu-toggle" onclick="toggleSidebar()">
                        <i class="fas fa-bars"></i>
                    </button>
                    <div class="page-title-header" id="pageHeaderTitle">Edit Found Item</div>
                </div>
                <div class="user-dropdown">
                    <div class="user-info-wrapper" onclick="toggleUserDropdown()">
                        <div class="user-avatar" id="userAvatar">A</div>
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
                    <h1 id="pageTitle">Edit Found Item</h1>
                    <p>Modify the details of this found item. All changes are saved immediately.</p>
                </div>

                <!-- Alert Banner -->
                <div class="alert-banner" id="alertBanner">
                    <i id="alertIcon"></i>
                    <span id="alertMessage"></span>
                </div>

                <!-- Meta strip (populated by JS) -->
                <div class="meta-strip" id="metaStrip" style="display:none;">
                    <span><i class="fas fa-hashtag"></i> Item ID: <strong id="metaId"></strong></span>
                    <span><i class="fas fa-user"></i> Reported by: <strong id="metaReporter"></strong></span>
                    <span><i class="fas fa-calendar-plus"></i> Date Found: <strong id="metaDateFound"></strong></span>
                </div>

                <div class="form-card">
                    <form id="editItemForm">
                        <input type="hidden" id="itemId" name="item_id">

                        <div class="form-group">
                            <label for="itemName"><i class="fas fa-tag"></i> Item Name</label>
                            <input type="text" id="itemName" name="item_name" placeholder="e.g. Black Wallet" required>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="categorySelect"><i class="fas fa-folder"></i> Category</label>
                                <select name="category_id" id="categorySelect" required>
                                    <option value="">— Select Category —</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="locationFound"><i class="fas fa-map-marker-alt"></i> Location Found</label>
                                <input type="text" id="locationFound" name="location_found"
                                    placeholder="e.g. Library Block A" required>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="foundStatus"><i class="fas fa-info-circle"></i> Status</label>
                                <select id="foundStatus" name="found_status">
                                    <option value="unclaimed">Unclaimed</option>
                                    <option value="pending">Pending</option>
                                    <option value="claimed">Claimed</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="dateFound"><i class="fas fa-calendar-alt"></i> Date Found</label>
                                <input type="date" id="dateFound" name="date_found" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="description"><i class="fas fa-align-left"></i> Description</label>
                            <textarea id="description" name="description"
                                placeholder="Describe the item in detail…"></textarea>
                        </div>

                        <div class="form-actions">
                            <a href="admin_found_items.php" class="btn-back">
                                <i class="fas fa-arrow-left"></i> Back to List
                            </a>
                            <button type="submit" class="btn-save" id="saveBtn">
                                <i class="fas fa-save"></i> Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </article>

            <footer>
                <p>© 2024 Lost &amp; Found System - Universiti Teknologi Malaysia. All rights reserved.</p>
            </footer>
        </div>
    </div>

    <script src="admin_edit_found_item.js"></script>
</body>

</html>