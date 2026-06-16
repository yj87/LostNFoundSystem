<?php
require_once '../../../config/db_connect.php';
require_once '../../../includes/auth_check.php';
$required_role = 'user';
require_once '../../../includes/role_check.php';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Report Lost Item - User Dashboard</title>
    <link rel="stylesheet" href="report_lost_items.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="dashboard-container">
        <aside id="sidebar">
            <div class="sidebar-header">
                <div class="logo-nav">
                    <div class="brand-logo">
                        <img src="../../../logo/lostfind.webp" alt="LostFind Logo">
                    </div>
                    <div class="brand-text">
                        <div class="brand-name">Lost<span>Find</span></div>
                        <div class="admin-tag">User Panel</div>
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
                    <div class="nav-group-title">Lost Items</div>
                    <a href="report_lost_items_page.php" class="nav-item active">
                        <span class="icon"><i class="fas fa-plus-circle"></i></span>
                        <span>Report Lost Item</span>
                    </a>
                    <a href="my_lost_reports_page.php" class="nav-item">
                        <span class="icon"><i class="fas fa-history"></i></span>
                        <span>My Lost Reports</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Found Items</div>
                    <a href="../found_item/browse_found_items_page.php" class="nav-item">
                        <span class="icon"><i class="fas fa-search"></i></span>
                        <span>Browse Found Items</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Claims</div>
                    <a href="../claims/my_claims_page.php" class="nav-item">
                        <span class="icon"><i class="fas fa-clipboard-list"></i></span>
                        <span>My Claims</span>
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
                    <div class="page-title-header">Report Lost Item</div>
                </div>
                <div class="user-dropdown">
                    <div class="user-avatar" id="userAvatar" onclick="toggleUserDropdown()">U</div>
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
                    <h1>Report Lost Item</h1>
                        <p>Fill in the details below to report a lost item</p>
                </div>

                <div id="alertMessage" class="alert"></div>

                <div id="loadingDiv" class="loading" style="display: none;">
                    <i class="fas fa-spinner fa-spin"></i> Submitting...
                </div>

                <div class="form-container">
                    <form id="reportForm">
                        <div class="form-group">
                            <label>Item Name <span style="color: #dc3545;">*</span></label>
                            <input type="text" id="item_name" name="item_name" required placeholder="e.g., iPhone 13, Laptop, Wallet">
                        </div>

                        <div class="form-group">
                            <label>Category <span style="color: #dc3545;">*</span></label>
                            <select id="category_id" name="category_id" required>
                                <option value="">Loading categories...</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="description" name="description" placeholder="Describe the item (color, brand, distinctive features, etc.)"></textarea>
                        </div>

                        <div class="form-group">
                            <label>Location Lost <span style="color: #dc3545;">*</span></label>
                            <input type="text" id="location_lost" name="location_lost" required placeholder="e.g., Library, Cafeteria, Classroom DK1">
                        </div>

                        <div class="form-group">
                            <label>Date Lost <span style="color: #dc3545;">*</span></label>
                            <input type="date" id="date_lost" name="date_lost" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Upload Photo (Optional)</label>
                            <input type="file" id="photo" name="photo" accept="image/jpeg, image/png, image/jpg">
                            <small style="color: #666; display: block; margin-top: 5px;">Max size: 5MB (JPG, PNG only)</small>
                        </div>

                        <button type="submit" class="btn-submit" id="submitBtn">
                            <i class="fas fa-paper-plane"></i> Submit Lost Report
                        </button>

                    </form>
                </div>
            </article>

            <footer>
                <p id="copyright">© 2026 Lost & Found System - Universiti Teknologi Malaysia. All rights reserved.</p>
            </footer>
        </div>
    </div>

    <script src="report_lost_items.js"></script>
    <script>
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('active');
        }
        function toggleUserDropdown() {
            const dropdown = document.getElementById('userDropdownMenu');
            dropdown.classList.toggle('show');
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
            const avatar = document.getElementById('userAvatar');
            if (dropdown && avatar && dropdown.classList.contains('show')) {
                if (!avatar.contains(event.target) && !dropdown.contains(event.target)) {
                    dropdown.classList.remove('show');
                }
            }
        });
    </script>
</body>
</html>