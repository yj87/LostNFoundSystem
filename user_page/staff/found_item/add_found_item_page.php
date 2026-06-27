<?php
// user_page/staff/found_item/add_found_item_page.php

require_once '../../../includes/auth_check.php';

$required_role = 'staff';
require_once '../../../includes/role_check.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Found Item - Staff Panel</title>

    <!-- Staff dashboard styling -->
    <link rel="stylesheet" href="../staff_dashboard.css">

    <!-- Add found item form styling -->
    <link rel="stylesheet" href="add_found_item.css">

    <!-- Font Awesome -->
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

                    <a href="add_found_item_page.php" class="nav-item active">
                        <span class="icon">
                            <i class="fas fa-plus-circle"></i>
                        </span>
                        <span>Add Found Item</span>
                    </a>

                    <a href="staff_found_items_page.php" class="nav-item">
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

                    <a href="../../../mainpage/logout/logout.php" class="nav-item" onclick="return logoutUser();">
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
                    <button class="menu-toggle" onclick="toggleSidebar()">
                        <i class="fas fa-bars"></i>
                    </button>

                    <div class="page-title-header">Add Found Item</div>
                </div>

                <div class="user-dropdown">
                    <div class="user-info-wrapper" onclick="toggleUserDropdown()">
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

                        <a href="../../../mainpage/logout/logout.php" onclick="return logoutUser();">
                            <i class="fas fa-sign-out-alt"></i>
                            Logout
                        </a>
                    </div>
                </div>
            </header>

            <!-- Page Content -->
            <article>
                <div class="add-wrapper">
                <div class="page-title">
                    <h1>Add Found Item</h1>
                    <p>Register a newly found item into the system</p>
                </div>

                <!-- JS uses this ID -->
                <div id="alertBox"></div>

                <div class="form-card">
                    <form id="addFoundItemForm" enctype="multipart/form-data">

                        <div class="form-row">
                            <div class="form-group">
                                <label for="itemName">Item Name <span style="color:red">*</span></label>
                                <input
                                    type="text"
                                    id="itemName"
                                    name="item_name"
                                    placeholder="e.g., Wallet, iPhone, Water Bottle"
                                    required
                                >
                            </div>

                            <div class="form-group">
                                <label for="categorySelect">Category <span style="color:red">*</span></label>
                                <select id="categorySelect" name="category_id" required>
                                    <option value="">-- Select Category --</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="locationFound">Location Found <span style="color:red">*</span></label>
                                <input
                                    type="text"
                                    id="locationFound"
                                    name="location_found"
                                    placeholder="e.g., Library, Cafeteria, DK1"
                                    required
                                >
                            </div>

                            <div class="form-group">
                                <label for="dateFound">Date Found <span style="color:red">*</span></label>
                                <input
                                    type="date"
                                    id="dateFound"
                                    name="date_found"
                                    required
                                >
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group full-width">
                                <label for="description">Description <span style="color:red">*</span></label>
                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="Describe the item, such as colour, brand, size, or unique details..."
                                    rows="5"
                                ></textarea>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group full-width">
                                <label for="photo">Item Photo</label>
                                <input
                                    type="file"
                                    id="photo"
                                    name="photo"
                                    accept="image/jpeg, image/png, image/jpg"
                                >
                                <small style="margin-top: 6px; color: #6c757d;">
                                    Optional. Upload JPG or PNG only. Maximum file size: 5MB.
                                </small>
                            </div>
                        </div>

                        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 25px;">
                            <a href="staff_found_items_page.php"
                               style="
                                    padding: 10px 20px;
                                    border-radius: 6px;
                                    text-decoration: none;
                                    background: #f1f1f1;
                                    color: #2b2d42;
                                    font-size: 14px;
                                    display: inline-flex;
                                    align-items: center;
                                    gap: 8px;
                               ">
                                <i class="fas fa-times"></i>
                                Cancel
                            </a>

                            <button
                                type="submit"
                                id="submitBtn"
                                style="
                                    padding: 10px 22px;
                                    border-radius: 6px;
                                    border: none;
                                    background: #A5CBD7;
                                    color: #2b2d42;
                                    font-size: 14px;
                                    font-weight: 600;
                                    cursor: pointer;
                                    display: inline-flex;
                                    align-items: center;
                                    gap: 8px;
                               ">
                                <i class="fas fa-save"></i>
                                Save Registry Record
                            </button>
                        </div>

                    </form>
                    </div>
                </div>
            </article>

            <footer>
                <p>&copy; 2026 Lost & Found System - Universiti Teknologi Malaysia. All rights reserved.</p>
            </footer>
        </div>
    </div>

    <script src="add_found_item.js"></script>
</body>
</html>