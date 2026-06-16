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
    <title>My Claims - Lost & Found</title>
    <link rel="stylesheet" href="../dashboard.css">
    <link rel="stylesheet" href="my_claims.css">
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
                    <a href="../lost_reports/report_lost_items_page.php" class="nav-item">
                        <span class="icon"><i class="fas fa-plus-circle"></i></span>
                        <span>Report Lost Item</span>
                    </a>
                    <a href="../lost_reports/my_lost_reports_page.php" class="nav-item">
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
                    <a href="my_claims_page.php" class="nav-item active">
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
                    <div class="page-title-header">My Claims</div>
                </div>
                <div class="user-dropdown">
                    <div class="user-info-wrapper" onclick="toggleUserDropdown()">
                        <div class="user-avatar" id="userAvatar">U</div>
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

            <article class="content-area">
                <div class="page-header">
                    <h1>My Claims</h1>
                    <p>View all your claim requests and their status</p>
                </div>

                <!-- Filter Bar -->
                <div class="filter-bar">
                    <div class="filter-group">
                        <label for="statusFilter">Filter by Status</label>
                        <select id="statusFilter">
                            <option value="">All</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="searchInput">Search</label>
                        <input type="text" id="searchInput" placeholder="Item name...">
                    </div>
                    <div class="filter-actions">
                        <button class="btn btn-primary" id="searchBtn">Search</button>
                        <button class="btn" id="resetBtn">Reset</button>
                    </div>
                </div>

                <!-- Claims Container -->
                <div id="loadingDiv" class="loading" style="display: none;">
                    <i class="fas fa-spinner fa-spin"></i> Loading claims...
                </div>

                <div id="claimsContainer" class="claims-container"></div>

                <!-- Pagination -->
                <div id="pagination" class="pagination-container"></div>
            </article>

            <footer>
                <p>&copy; 2026 Lost & Found System - Universiti Teknologi Malaysia</p>
            </footer>
        </div>
    </div>

    <!-- Claim Details Modal -->
    <div id="claimModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Claim Details</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body" id="modalBody"></div>
            <div class="modal-footer">
                <button class="btn" onclick="closeModal()">Close</button>
            </div>
        </div>
    </div>

    <script src="my_claims.js"></script>
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