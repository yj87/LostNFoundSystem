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

// Handle AJAX requests
if ($is_ajax) {
    header('Content-Type: application/json');
    
    try {
        // Get categories
        if (isset($_GET['action']) && $_GET['action'] === 'categories') {
            $query = "SELECT category_id, category_name FROM categories ORDER BY category_name";
            $result = mysqli_query($conn, $query);
            $categories = [];
            while ($row = mysqli_fetch_assoc($result)) {
                $categories[] = $row;
            }
            echo json_encode(['success' => true, 'categories' => $categories]);
            mysqli_close($conn);
            exit();
        }

        // Get single report
        if (isset($_GET['id']) && !isset($_GET['action'])) {
            $report_id = intval($_GET['id']);
            
            $query = "SELECT lr.report_id, lr.item_name, lr.description, lr.location_lost, lr.date_lost, lr.lost_status, lr.photo, lr.created_at,
                      u.name as user_name, u.email as user_email, u.phone as user_phone,
                      c.category_name, c.category_id
                      FROM lost_reports lr
                      JOIN users u ON lr.user_id = u.user_id
                      LEFT JOIN categories c ON lr.category_id = c.category_id
                      WHERE lr.report_id = $report_id";
            
            $result = mysqli_query($conn, $query);
            
            if (mysqli_num_rows($result) == 0) {
                echo json_encode(['success' => false, 'message' => 'Report not found']);
                mysqli_close($conn);
                exit();
            }
            
            $row = mysqli_fetch_assoc($result);
            $report = [
                'report_id' => $row['report_id'],
                'item_name' => htmlspecialchars($row['item_name']),
                'description' => nl2br(htmlspecialchars($row['description'] ?? '')),
                'location_lost' => htmlspecialchars($row['location_lost']),
                'date_lost' => $row['date_lost'],
                'lost_status' => $row['lost_status'],
                'category_id' => $row['category_id'] ?? 0,
                'category_name' => $row['category_name'] ?? 'Uncategorized',
                'user_name' => htmlspecialchars($row['user_name']),
                'user_email' => htmlspecialchars($row['user_email']),
                'user_phone' => htmlspecialchars($row['user_phone'] ?? '-'),
                'created_at' => date('d F Y, h:i A', strtotime($row['created_at'])),
                'photo' => $row['photo'] ?? null
            ];
            
            echo json_encode(['success' => true, 'report' => $report]);
            mysqli_close($conn);
            exit();
        }

        // Get reports list with filters
        $search = isset($_GET['search']) ? mysqli_real_escape_string($conn, $_GET['search']) : '';
        $status = isset($_GET['status']) ? mysqli_real_escape_string($conn, $_GET['status']) : '';
        $category = isset($_GET['category']) ? intval($_GET['category']) : 0;
        $date_from = isset($_GET['date_from']) ? mysqli_real_escape_string($conn, $_GET['date_from']) : '';
        $date_to = isset($_GET['date_to']) ? mysqli_real_escape_string($conn, $_GET['date_to']) : '';

        $where = "WHERE 1=1";

        if ($search) {
            $where .= " AND (lr.item_name LIKE '%$search%' OR lr.description LIKE '%$search%' OR lr.location_lost LIKE '%$search%' OR u.name LIKE '%$search%')";
        }
        if ($status) {
            $where .= " AND lr.lost_status = '$status'";
        }
        if ($category > 0) {
            $where .= " AND lr.category_id = $category";
        }
        if ($date_from) {
            $where .= " AND lr.date_lost >= '$date_from'";
        }
        if ($date_to) {
            $where .= " AND lr.date_lost <= '$date_to'";
        }

        $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
        $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 20;
        $offset = ($page - 1) * $limit;

        $count_query = "SELECT COUNT(*) as total FROM lost_reports lr $where";
        $count_result = mysqli_query($conn, $count_query);
        $total_count = mysqli_fetch_assoc($count_result)['total'];

        $query = "SELECT lr.report_id, lr.item_name, lr.description, lr.location_lost, lr.date_lost, lr.lost_status, lr.photo,
                  u.name as user_name, u.email as user_email,
                  c.category_name
                  FROM lost_reports lr
                  JOIN users u ON lr.user_id = u.user_id
                  LEFT JOIN categories c ON lr.category_id = c.category_id
                  $where
                  ORDER BY lr.created_at DESC
                  LIMIT $offset, $limit";

        $result = mysqli_query($conn, $query);
        $reports = [];

        while ($row = mysqli_fetch_assoc($result)) {
            $status_label = '';
            if ($row['lost_status'] == 'searching') $status_label = 'Searching';
            if ($row['lost_status'] == 'found') $status_label = 'Found';
            if ($row['lost_status'] == 'closed') $status_label = 'Closed';
            
            $reports[] = [
                'report_id' => $row['report_id'],
                'item_name' => htmlspecialchars($row['item_name']),
                'description' => htmlspecialchars(substr($row['description'] ?? '', 0, 100)),
                'location_lost' => htmlspecialchars($row['location_lost']),
                'date_lost' => date('d M Y', strtotime($row['date_lost'])),
                'lost_status' => $row['lost_status'],
                'status_label' => $status_label,
                'category_name' => $row['category_name'] ?? 'Uncategorized',
                'user_name' => htmlspecialchars($row['user_name']),
                'user_email' => htmlspecialchars($row['user_email']),
                'photo' => $row['photo'] ?? null
            ];
        }

        $categories_query = "SELECT category_id, category_name FROM categories ORDER BY category_name";
        $categories_result = mysqli_query($conn, $categories_query);
        $categories = [];
        while ($row = mysqli_fetch_assoc($categories_result)) {
            $categories[] = $row;
        }

        $status_query = "SELECT lost_status, COUNT(*) as count FROM lost_reports GROUP BY lost_status";
        $status_result = mysqli_query($conn, $status_query);
        $status_counts = ['searching' => 0, 'found' => 0, 'closed' => 0];
        while ($row = mysqli_fetch_assoc($status_result)) {
            $status_counts[$row['lost_status']] = $row['count'];
        }

        echo json_encode([
            'success' => true,
            'reports' => $reports,
            'total' => $total_count,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total_count / $limit),
            'categories' => $categories,
            'status_counts' => $status_counts
        ]);
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
    <title>Admin - View Lost Reports</title>
    <link rel="stylesheet" href="view_lost_reports.css">
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
                    <a href="../dashboard_page.php" class="nav-item">
                        <span class="icon"><i class="fas fa-tachometer-alt"></i></span>
                        <span>Dashboard</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">User Management</div>
                    <a href="../user_management/manage.php" class="nav-item">
                        <span class="icon"><i class="fas fa-users"></i></span>
                        <span>View Users</span>
                    </a>
                    <a href="../user_management/add.php" class="nav-item">
                        <span class="icon"><i class="fas fa-user-plus"></i></span>
                        <span>Add User</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Found Items</div>
                    <a href="../../admin/found_item/admin_found_items.php" class="nav-item">
                        <span class="icon"><i class="fas fa-box"></i></span>
                        <span>View All Items</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Lost Reports</div>
                    <a href="view_lost_reports.php" class="nav-item active">
                        <span class="icon"><i class="fas fa-search"></i></span>
                        <span>View Lost Reports</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Claims</div>
                    <a href="../../../user_page/admin/claims/view_claims.php" class="nav-item">
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
                    <div class="page-title-header">Lost Reports Management</div>
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

            <article class="content-area">
                <div class="page-header">
                    <h1>Lost Reports</h1>
                    <p>View and manage all lost item reports from users</p>
                </div>

                <div class="stats-row">
                    <div class="stat-box">
                        <h3>Searching</h3>
                        <div class="number" id="statSearching">0</div>
                    </div>
                    <div class="stat-box">
                        <h3>Found</h3>
                        <div class="number" id="statFound">0</div>
                    </div>
                    <div class="stat-box">
                        <h3>Closed</h3>
                        <div class="number" id="statClosed">0</div>
                    </div>
                    <div class="stat-box">
                        <h3>Total</h3>
                        <div class="number" id="statTotal">0</div>
                    </div>
                </div>

                <div class="filter-bar">
                    <div class="filter-group">
                        <label for="searchInput">Search</label>
                        <input type="text" id="searchInput" placeholder="Item name, location...">
                    </div>
                    <div class="filter-group">
                        <label for="statusFilter">Status</label>
                        <select id="statusFilter">
                            <option value="">All</option>
                            <option value="searching">Searching</option>
                            <option value="found">Found</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="categoryFilter">Category</label>
                        <select id="categoryFilter">
                            <option value="0">All Categories</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="dateFrom">Date From</label>
                        <input type="date" id="dateFrom">
                    </div>
                    <div class="filter-group">
                        <label for="dateTo">Date To</label>
                        <input type="date" id="dateTo">
                    </div>
                    <div class="filter-actions">
                        <button class="btn btn-primary" id="searchBtn">Search</button>
                        <button class="btn" id="resetBtn">Reset</button>
                    </div>
                </div>

                <div class="reports-table-container">
                    <table class="reports-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Photo</th>
                                <th>Item Name</th>
                                <th>Reported By</th>
                                <th>Location</th>
                                <th>Date Lost</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="reportsTableBody">
                            <tr id="loadingRow">
                                <td colspan="8" style="text-align: center; padding: 40px;">
                                    <i class="fas fa-spinner fa-spin"></i> Loading reports...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div id="pagination" class="pagination-container"></div>
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
            const userInfoWrapper = document.querySelector('.user-info-wrapper');
            
            if (dropdown && userInfoWrapper && dropdown.classList.contains('show')) {
                if (!userInfoWrapper.contains(event.target) && !dropdown.contains(event.target)) {
                    dropdown.classList.remove('show');
                }
            }
        });
    </script>
    <script src="view_lost_reports.js"></script>
</body>
</html>