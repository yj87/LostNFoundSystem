<?php
// user_page/staff/found_item/edit_found_item_page.php

require_once '../../../includes/auth_check.php';

$required_role = 'staff';
require_once '../../../includes/role_check.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Found Item - Staff Panel</title>

    <link rel="stylesheet" href="../staff_dashboard.css">
    <link rel="stylesheet" href="edit_found_item.css">
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
                        <span class="icon"><i class="fas fa-tachometer-alt"></i></span>
                        <span>Dashboard</span>
                    </a>
                </div>

                <div class="nav-group">
                    <div class="nav-group-title">Found Items</div>

                    <a href="add_found_item_page.php" class="nav-item">
                        <span class="icon"><i class="fas fa-plus-circle"></i></span>
                        <span>Add Found Item</span>
                    </a>

                    <a href="staff_found_items_page.php" class="nav-item active">
                        <span class="icon"><i class="fas fa-box"></i></span>
                        <span>My Found Items</span>
                    </a>
                </div>

                <div class="nav-group">
                    <div class="nav-group-title">Claims</div>

                    <a href="../claims/view_claims_page.php" class="nav-item">
                        <span class="icon"><i class="fas fa-clipboard-list"></i></span>
                        <span>View Claims</span>
                    </a>
                </div>

                <div class="nav-group">
                    <div class="nav-group-title">Lost Reports</div>

                    <a href="../lost_reports/view_lost_items_page.php" class="nav-item">
                        <span class="icon"><i class="fas fa-search"></i></span>
                        <span>View Lost Items</span>
                    </a>
                </div>

                <div class="nav-group">
                    <div class="nav-group-title">Account</div>

                    <a href="../../profile/profile_page.php" class="nav-item">
                        <span class="icon"><i class="fas fa-user-circle"></i></span>
                        <span>My Profile</span>
                    </a>

                    <a href="../../../mainpage/logout/logout.php" class="nav-item" id="logoutLink">
                        <span class="icon"><i class="fas fa-sign-out-alt"></i></span>
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

                    <div class="page-title-header" id="pageTitleHeader">Edit Found Item</div>
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
                        <a href="../../profile/profile_page.php">
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
                <div class="edit-wrapper">

                    <div class="page-title">
                        <h1 id="editTitle">Edit Found Item</h1>
                        <p>Update the selected found item record.</p>
                    </div>

                    <div id="alertBox"></div>

                    <div class="form-card">
                        <form id="editFoundItemForm" enctype="multipart/form-data">

                            <input type="hidden" id="itemId" name="item_id">

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="itemName">Item Name <span>*</span></label>
                                    <input
                                        type="text"
                                        id="itemName"
                                        name="item_name"
                                        required
                                    >
                                </div>

                                <div class="form-group">
                                    <label for="categorySelect">Category <span>*</span></label>
                                    <select id="categorySelect" name="category_id" required>
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
                                    <label for="statusSelect">Status <span>*</span></label>
                                    <select id="statusSelect" name="found_status" required>
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
                                        accept="image/jpeg, image/png, image/jpg"
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
                                        rows="5"
                                    ></textarea>
                                </div>
                            </div>

                            <div class="form-actions">
                                <a href="staff_found_items_page.php" class="btn-cancel">
                                    Cancel
                                </a>

                                <button type="submit" id="submitBtn" class="btn-submit">
                                    <i class="fas fa-save"></i>
                                    Update Record
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

    <script src="edit_found_item.js"></script>
</body>
</html>