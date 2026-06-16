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

// 4. Check if this is an AJAX request
$is_ajax = isset($_SERVER['HTTP_X_REQUESTED_WITH']) && 
           strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

// Handle AJAX requests (POST - Update)
if ($is_ajax && $_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    
    try {
        $report_id = intval($_POST['report_id'] ?? 0);
        
        if ($report_id === 0) {
            echo json_encode(['success' => false, 'message' => 'Invalid report ID']);
            mysqli_close($conn);
            exit();
        }
        
        $item_name = mysqli_real_escape_string($conn, $_POST['item_name'] ?? '');
        $description = mysqli_real_escape_string($conn, $_POST['description'] ?? '');
        $location_lost = mysqli_real_escape_string($conn, $_POST['location_lost'] ?? '');
        $date_lost = mysqli_real_escape_string($conn, $_POST['date_lost'] ?? '');
        $category_id = intval($_POST['category_id'] ?? 0);
        $lost_status = mysqli_real_escape_string($conn, $_POST['lost_status'] ?? 'searching');
        
        if (empty($item_name) || empty($location_lost) || empty($date_lost)) {
            echo json_encode(['success' => false, 'message' => 'Please fill all required fields']);
            mysqli_close($conn);
            exit();
        }
        
        $valid_statuses = ['searching', 'found', 'closed'];
        if (!in_array($lost_status, $valid_statuses)) {
            $lost_status = 'searching';
        }
        
        $category_sql = $category_id > 0 ? "category_id = $category_id" : "category_id = NULL";
        
        // Handle photo upload
        $photo_sql = "";
        $upload_dir = "../../../uploads/lost_items/";
        
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        
        if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES['photo'];
            $file_size = $file['size'];
            $file_tmp = $file['tmp_name'];
            
            if ($file_size > 5 * 1024 * 1024) {
                echo json_encode(['success' => false, 'message' => 'File size too large. Max 5MB']);
                mysqli_close($conn);
                exit();
            }
            
            $file_ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $allowed_ext = ['jpg', 'jpeg', 'png'];
            
            if (!in_array($file_ext, $allowed_ext)) {
                echo json_encode(['success' => false, 'message' => 'Only JPG, JPEG, PNG files are allowed']);
                mysqli_close($conn);
                exit();
            }
            
            $new_filename = time() . '_' . uniqid() . '.' . $file_ext;
            $destination = $upload_dir . $new_filename;
            
            if (move_uploaded_file($file_tmp, $destination)) {
                $photo_path = "uploads/lost_items/" . $new_filename;
                $photo_sql = ", photo = '$photo_path'";
                
                // Delete old photo if exists
                $old_photo_query = "SELECT photo FROM lost_reports WHERE report_id = $report_id";
                $old_photo_result = mysqli_query($conn, $old_photo_query);
                if ($old_photo_result && mysqli_num_rows($old_photo_result) > 0) {
                    $old_photo = mysqli_fetch_assoc($old_photo_result)['photo'];
                    if ($old_photo && file_exists("../../../" . $old_photo)) {
                        unlink("../../../" . $old_photo);
                    }
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to upload photo']);
                mysqli_close($conn);
                exit();
            }
        }
        
        $query = "UPDATE lost_reports SET 
                  item_name = '$item_name',
                  description = '$description',
                  location_lost = '$location_lost',
                  date_lost = '$date_lost',
                  lost_status = '$lost_status',
                  $category_sql
                  $photo_sql
                  WHERE report_id = $report_id";
        
        if (mysqli_query($conn, $query)) {
            echo json_encode(['success' => true, 'message' => 'Report edited successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Database error: ' . mysqli_error($conn)]);
        }
        mysqli_close($conn);
        exit();
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
        mysqli_close($conn);
        exit();
    }
}

// 5. If not AJAX, display HTML
$current_year = date('Y');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Edit Lost Report</title>
    <link rel="stylesheet" href="../admin_dashboard.css">
    <link rel="stylesheet" href="edit_lost_reports.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="dashboard-container">
        <aside class="sidebar" id="sidebar">
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
                    <a href="../../dashboard_page.php" class="nav-item">
                        <span class="icon"><i class="fas fa-tachometer-alt"></i></span>
                        <span>Dashboard</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">User Management</div>
                    <a href="../../user_management/manage_users.php" class="nav-item">
                        <span class="icon"><i class="fas fa-users"></i></span>
                        <span>View Users</span>
                    </a>
                    <a href="../../user_management/add_user.php" class="nav-item">
                        <span class="icon"><i class="fas fa-user-plus"></i></span>
                        <span>Add User</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Found Items</div>
                    <a href="../../admin_found_items.php" class="nav-item">
                        <span class="icon"><i class="fas fa-box"></i></span>
                        <span>View All Items</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Lost Reports</div>
                    <a href="view_lost_reports.html" class="nav-item">
                        <span class="icon"><i class="fas fa-search"></i></span>
                        <span>View Lost Reports</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Claims</div>
                    <a href="../../admin_claims.php" class="nav-item">
                        <span class="icon"><i class="fas fa-clipboard-list"></i></span>
                        <span>View All Claims</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Reports & Statistics</div>
                    <a href="../../statistic/monthly_stats.html" class="nav-item">
                        <span class="icon"><i class="fas fa-chart-line"></i></span>
                        <span>Statistics</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Account</div>
                    <a href="../../../profile/profile.html" class="nav-item">
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
                    <div class="page-title-header">Edit Lost Report</div>
                </div>
                <div class="user-dropdown">
                    <div class="user-info-wrapper" onclick="toggleUserDropdown()">
                        <div class="user-avatar" id="userAvatar"><?php echo $user_avatar; ?></div>
                    </div>
                    <div class="user-dropdown-menu" id="userDropdownMenu">
                        <a href="../../../profile/profile.html">
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
                    <h1>Edit Lost Report</h1>
                    <p>Edit the lost item report details</p>
                </div>

                <div id="alertMessage" class="alert"></div>
                <div id="loadingDiv" class="loading" style="display: none;">
                    <i class="fas fa-spinner fa-spin"></i> Loading...
                </div>

                <div class="form-container" id="formContainer" style="display: none;">
                    <form id="editForm" enctype="multipart/form-data">
                        <input type="hidden" id="report_id" name="report_id">
                        
                        <!-- PHOTO SECTION -->
                        <div class="form-group">
                            <label>Item Photo</label>
                            <div class="current-photo-wrapper" style="text-align: center; margin-bottom: 15px;">
                                <div id="currentPhotoContainer"></div>
                            </div>
                            <div class="photo-upload">
                                <label for="photo" class="btn-upload-photo">
                                    <i class="fas fa-upload"></i> Change Photo
                                </label>
                                <input type="file" id="photo" name="photo" accept="image/jpeg, image/png, image/jpg" style="display: none;">
                                <small>Upload new photo (JPG, PNG, max 5MB). Leave empty to keep current.</small>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="item_name">Item Name <span style="color: red;">*</span></label>
                            <input type="text" id="item_name" name="item_name" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="category_id">Category</label>
                            <select id="category_id" name="category_id">
                                <option value="0">Uncategorized</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="description">Description</label>
                            <textarea id="description" name="description" rows="4"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="location_lost">Location Lost <span style="color: red;">*</span></label>
                            <input type="text" id="location_lost" name="location_lost" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="date_lost">Date Lost <span style="color: red;">*</span></label>
                            <input type="date" id="date_lost" name="date_lost" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="lost_status">Status</label>
                            <select id="lost_status" name="lost_status">
                                <option value="searching">🔍 Searching</option>
                                <option value="found">✅ Found</option>
                                <option value="closed">❌ Closed</option>
                            </select>
                        </div>
                        
                        <div class="form-buttons">
                            <button type="submit" class="btn-save">
                                <i class="fas fa-save"></i> Save Changes
                            </button>
                            <button type="button" class="btn-cancel" onclick="goBack()">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </article>

            <footer>
                <p>&copy; <?php echo $current_year; ?> Lost & Found System - Universiti Teknologi Malaysia</p>
            </footer>
        </div>
    </div>

    <script>
        // Pass session data to JavaScript
        const adminId = <?php echo $admin_id; ?>;
        const adminName = '<?php echo addslashes($admin_name); ?>';
        const userAvatar = '<?php echo $user_avatar; ?>';
        
        // Get report ID from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const reportId = urlParams.get('id');
        
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

        function goBack() {
            window.location.href = 'view_lost_reports.html';
        }

        // Photo upload button trigger
        const uploadBtn = document.querySelector('.btn-upload-photo');
        const photoInput = document.getElementById('photo');
        
        if (uploadBtn && photoInput) {
            uploadBtn.addEventListener('click', function() {
                photoInput.click();
            });
            
            photoInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const container = document.getElementById('currentPhotoContainer');
                        if (container) {
                            container.innerHTML = '<img src="' + event.target.result + '" style="max-width: 300px; max-height: 200px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;">';
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        document.addEventListener('click', function(event) {
            const dropdown = document.getElementById('userDropdownMenu');
            const userInfoWrapper = document.querySelector('.user-info-wrapper');
            if (dropdown && userInfoWrapper && dropdown.classList.contains('show')) {
                if (!userInfoWrapper.contains(event.target) && !dropdown.contains(event.target)) {
                    dropdown.classList.remove('show');
                }
            }
        });
    </script>
    <script src="edit_lost_reports.js"></script>
</body>
</html>