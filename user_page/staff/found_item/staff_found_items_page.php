<?php
// user_page/staff/found_item/staff_found_items_page.php

// Add at the very first line
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

// Your existing PHP code
session_start();

require_once '../../../includes/auth_check.php';

$required_role = 'staff';
require_once '../../../includes/role_check.php';

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Found Items - Staff Panel</title>

    <link rel="stylesheet" href="../staff_dashboard.css">
    <link rel="stylesheet" href="staff_found_items.css">
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
                        <div class="admin-tag">Staff Panel</div>
                    </div>
                </div>
            </div>

            <nav>
                <div class="nav-group">
                    <div class="nav-group-title">Main</div>

                    <a href="../dashboard_page.php" class="nav-item">
                        <span class="icon">
                            <i class="fas fa-tachometer-alt"></i>
                        </span>
                        <span>Dashboard</span>
                    </a>
                </div>

                <div class="nav-group">
                    <div class="nav-group-title">Found Items</div>

                    <a href="add_found_item_page.php" class="nav-item">
                        <span class="icon">
                            <i class="fas fa-plus-circle"></i>
                        </span>
                        <span>Add Found Item</span>
                    </a>

                    <a href="staff_found_items_page.php" class="nav-item active">
                        <span class="icon">
                            <i class="fas fa-box"></i>
                        </span>
                        <span>My Found Items</span>
                    </a>
                </div>

                <div class="nav-group">
                    <div class="nav-group-title">Claims</div>

                    <a href="../claims/view_claims_page.php" class="nav-item">
                        <span class="icon">
                            <i class="fas fa-clipboard-list"></i>
                        </span>
                        <span>View Claims</span>
                    </a>
                </div>

                <div class="nav-group">
                    <div class="nav-group-title">Lost Reports</div>

                    <a href="../lost_reports/view_lost_items_page.php" class="nav-item">
                        <span class="icon">
                            <i class="fas fa-search"></i>
                        </span>
                        <span>View Lost Items</span>
                    </a>
                </div>

                <div class="nav-group">
                    <div class="nav-group-title">Account</div>

                    <a href="../../profile/profile.php" class="nav-item">
                        <span class="icon">
                            <i class="fas fa-user-circle"></i>
                        </span>
                        <span>My Profile</span>
                    </a>

                    <a href="../../../mainpage/logout/logout.php" class="nav-item" id="logoutLink">
                        <span class="icon">
                            <i class="fas fa-sign-out-alt"></i>
                        </span>
                        <span>Logout</span>
                    </a>
                </div>
            </nav>
        </aside>

        <!-- Main Content -->
        <div class="main-content">

            <!-- Top Header -->
            <header class="top-header">
                <div class="header-left">
                    <button class="menu-toggle" id="menuToggle" type="button">
                        <i class="fas fa-bars"></i>
                    </button>

                    <div class="page-title-header">My Found Items</div>
                </div>

                <div class="user-dropdown">
                    <div class="user-info-wrapper" id="userInfoWrapper">
                        <div class="user-avatar" id="userAvatar">
                            <?php
                                echo isset($_SESSION['user_name'])
                                    ? strtoupper(substr($_SESSION['user_name'], 0, 1))
                                    : 'S';
                            ?>
                        </div>
                    </div>

                    <div class="user-dropdown-menu" id="userDropdownMenu">
                        <a href="../../profile/profile.php">
                            <i class="fas fa-user-circle"></i>
                            My Profile
                        </a>

                        <div class="dropdown-divider"></div>

                        <a href="../../../mainpage/logout/logout.php" id="dropdownLogoutLink">
                            <i class="fas fa-sign-out-alt"></i>
                            Logout
                        </a>
                    </div>
                </div>
            </header>

            <!-- Page Content -->
            <article>
                <div class="page-title">
                    <h1>My Found Items</h1>
                    <p>View and manage the found items you have registered</p>
                </div>

                <!-- Search and Filter Bar -->
                <div class="filter-bar">
                    <div class="filter-search">
                        <i class="fas fa-search"></i>
                        <input
                            type="text"
                            id="searchInput"
                            placeholder="Search by ID, item name, location, description..."
                        >
                    </div>

                    <select id="categoryFilter" class="filter-select">
                        <option value="">All Categories</option>
                    </select>

                    <select id="statusFilter" class="filter-select">
                        <option value="">All Status</option>
                        <option value="unclaimed">Unclaimed</option>
                        <option value="pending">Pending</option>
                        <option value="claimed">Claimed</option>
                    </select>
                </div>

                <!-- Found Items Table -->
                <div class="recent-section">
                    <div class="section-header">
                        <h2>Registered Found Items</h2>

                        <a href="add_found_item_page.php" class="btn btn-primary">
                            <i class="fas fa-plus"></i>
                            Add Found Item
                        </a>
                    </div>

                    <div class="data-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Photo</th>
                                    <th>Item Name</th>
                                    <th>Category</th>
                                    <th>Date Found</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody id="itemsTableBody">
                                <tr>
                                    <td colspan="7" class="text-center">
                                        <i class="fas fa-spinner fa-spin"></i>
                                        Loading found items...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div id="pagination" class="pagination-container"></div>
                </div>
            </article>

            <footer>
                <p>&copy; 2026 Lost & Found System - Universiti Teknologi Malaysia. All rights reserved.</p>
            </footer>
        </div>
    </div>

    <script src="staff_items.js"></script>
</body>
</html>