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
    <title>Browse Found Items - Lost & Found</title>

    <link rel="stylesheet" href="../dashboard.css">
    <link rel="stylesheet" href="browse_found_items.css">
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

                    <a href="browse_found_items_page.php" class="nav-item active">
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

        <!-- MAIN CONTENT -->
        <div class="main-content">
            <header class="top-header">
                <div class="header-left">
                    <button class="menu-toggle" onclick="toggleSidebar()">
                        <i class="fas fa-bars"></i>
                    </button>

                    <div class="page-title-header">Browse Found Items</div>
                </div>

                <!-- User Dropdown Menu -->
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
                    <h1>Browse Found Items</h1>
                    <p>Search and browse items that have been found and reported. If you recognize an item as yours, click “Claim”.</p>
                </div>

                <!-- Toolbar -->
                <div class="toolbar">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="searchInput" placeholder="Search by name, location, description..."
                            oninput="handleSearch()">
                    </div>

                    <select id="categoryFilter" onchange="handleSearch()">
                        <option value="">All Categories</option>
                    </select>
                </div>

                <div class="results-summary" id="resultsSummary"></div>

                <div class="recent-section">
                    <div class="section-header">
                        <h3>Available Items</h3>
                    </div>

                    <div class="data-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Image</th>
                                    <th>Item Name</th>
                                    <th>Category</th>
                                    <th>Date Found</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody id="userItemsTable">
                                <tr>
                                    <td colspan="7" class="text-center" style="text-align:center; padding: 20px;">
                                        Loading items...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </article>

            <footer>
                <p id="copyright">© 2026 Lost &amp; Found System - Universiti Teknologi Malaysia. All rights reserved.</p>
            </footer>
        </div>
    </div>

    <div class="toast" id="toast">
        <i class="fas fa-check-circle" id="toastIcon"></i>
        <span id="toastMessage"></span>
    </div>

    <script src="browse_found_items.js"></script>
</body>

</html>