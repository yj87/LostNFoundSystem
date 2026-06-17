<?php
// user_page/admin/found_item/admin_edit_found_item.php

$required_role = 'admin';

require_once '../../../config/db_connect.php';
require_once '../../../includes/auth_check.php';
require_once '../../../includes/role_check.php';

$admin_name = $_SESSION['user_name'] ?? $_SESSION['USER'] ?? 'Admin';
$user_avatar = strtoupper(substr($admin_name, 0, 1));
$current_year = date('Y');
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Found Item - Admin Panel</title>

    <link rel="stylesheet" href="../admin_dashboard.css">
    <link rel="stylesheet" href="admin_edit_found_item.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
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

                    <a href="#" class="nav-item" id="logoutLink" onclick="return logoutUser(event);">
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
                    <button class="menu-toggle" type="button" onclick="toggleSidebar()">
                        <i class="fas fa-bars"></i>
                    </button>

                    <div class="page-title-header" id="pageHeaderTitle">Edit Found Item</div>
                </div>

                <div class="user-dropdown">
                    <div class="user-info-wrapper" onclick="toggleUserDropdown()">
                        <div class="user-avatar" id="userAvatar">
                            <?php echo htmlspecialchars($user_avatar); ?>
                        </div>
                    </div>

                    <div class="user-dropdown-menu" id="userDropdownMenu">
                        <a href="../../profile/profile_page.php">
                            <i class="fas fa-user-circle"></i>
                            My Profile
                        </a>

                        <div class="dropdown-divider"></div>

                        <a href="#" id="dropdownLogoutLink" onclick="return logoutUser(event);">
                            <i class="fas fa-sign-out-alt"></i>
                            Logout
                        </a>
                    </div>
                </div>
            </header>

            <article>
                <div class="edit-wrapper">

                    <div class="page-title">
                        <h1 id="pageTitle">Edit Found Item</h1>
                        <p>Modify the details of this found item. All changes are saved immediately.</p>
                    </div>

                    <div id="alertBox"></div>

                    <!-- Alert Banner -->
                    <div class="alert-banner" id="alertBanner">
                        <i id="alertIcon"></i>
                        <span id="alertMessage"></span>
                    </div>

                    <!-- Meta strip -->
                    <div class="meta-strip" id="metaStrip" style="display:none;">
                        <span>
                            <i class="fas fa-hashtag"></i>
                            Item ID: <strong id="metaId">-</strong>
                        </span>

                        <span>
                            <i class="fas fa-user"></i>
                            Reported by: <strong id="metaReporter">-</strong>
                        </span>

                        <span>
                            <i class="fas fa-calendar-alt"></i>
                            Date Found: <strong id="metaDateFound">-</strong>
                        </span>

                        <span>
                            <i class="fas fa-info-circle"></i>
                            Status: <strong id="metaStatus">-</strong>
                        </span>
                    </div>

                    <div class="form-card">
                        <form id="editItemForm" enctype="multipart/form-data">
                            <input type="hidden" id="itemId" name="item_id">

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="itemName">Item Name <span>*</span></label>
                                    <input
                                        type="text"
                                        id="itemName"
                                        name="item_name"
                                        placeholder="e.g. Black Wallet"
                                        required
                                    >
                                </div>

                                <div class="form-group">
                                    <label for="categorySelect">Category <span>*</span></label>
                                    <select name="category_id" id="categorySelect" required>
                                        <option value="">-- Select Category --</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="locationFound">Location Found <span>*</span></label>
                                    <input
                                        type="text"
                                        id="locationFound"
                                        name="location_found"
                                        placeholder="e.g. Library Block A"
                                        required
                                    >
                                </div>

                                <div class="form-group">
                                    <label for="dateFound">Date Found <span>*</span></label>
                                    <input
                                        type="date"
                                        id="dateFound"
                                        name="date_found"
                                        required
                                    >
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="foundStatus">Status <span>*</span></label>
                                    <select id="foundStatus" name="found_status" required>
                                        <option value="unclaimed">Unclaimed</option>
                                        <option value="pending">Pending</option>
                                        <option value="claimed">Claimed</option>
                                    </select>
                                </div>

                                <div class="form-group">
                                    <label for="photo">Replace Photo (Optional)</label>
                                    <input
                                        type="file"
                                        id="photo"
                                        name="photo"
                                        accept="image/jpeg,image/png,image/jpg"
                                    >
                                    <small>Leave empty if you do not want to change the current photo.</small>
                                </div>
                            </div>

                            <div class="current-photo-box" id="currentPhotoBox">
                                <label>Current Photo</label>

                                <div class="current-photo-frame">
                                    <img id="currentPhoto" src="" alt="Current item photo">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group full-width">
                                    <label for="description">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        placeholder="Describe the item in detail..."
                                        rows="5"
                                    ></textarea>
                                </div>
                            </div>

                            <div class="form-actions">
                                <a href="admin_found_items.php" class="btn-cancel">
                                    Cancel
                                </a>

                                <button type="submit" class="btn-submit" id="saveBtn">
                                    <i class="fas fa-save"></i>
                                    Update Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </article>

            <footer>
                <p>&copy; <?php echo $current_year; ?> Lost &amp; Found System - Universiti Teknologi Malaysia. All rights reserved.</p>
            </footer>
        </div>
    </div>

    <script src="admin_edit_found_item.js"></script>
</body>
</html>