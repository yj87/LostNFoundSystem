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

// Also check for action, id, or parameters that indicate AJAX
$has_params = isset($_GET['action']) || isset($_GET['id']) || isset($_GET['page']) || isset($_GET['search']) || isset($_GET['status']);

if ($is_ajax || $has_params) {
    // This is an AJAX request - return JSON
    header('Content-Type: application/json');
    
    try {
        // Get user info
        if (isset($_GET['action']) && $_GET['action'] === 'user') {
            echo json_encode([
                'success' => true, 
                'user_name' => $admin_name, 
                'user_avatar' => $user_avatar
            ]);
            mysqli_close($conn);
            exit();
        }

        // Get single claim details by ID
        if (isset($_GET['id']) && !isset($_GET['action'])) {
            $claim_id = intval($_GET['id']);
            
            $query = "SELECT c.*, 
                         f.item_id, f.item_name, f.description as item_description, 
                         f.location_found, f.date_found, f.found_status,
                         u.name as claimant_name, u.email as claimant_email, u.phone as claimant_phone,
                         s.name as staff_name,
                         lr.report_id as lost_report_id, lr.item_name as lost_item_name, 
                         lr.location_lost, lr.date_lost as lost_date, lr.lost_status as lost_status,
                         lr.description as lost_description
                  FROM claims c
                  JOIN found_items f ON c.item_id = f.item_id
                  JOIN users u ON c.user_id = u.user_id
                  JOIN users s ON f.user_id = s.user_id
                  LEFT JOIN lost_reports lr ON c.lost_report_id = lr.report_id
                  WHERE c.claim_id = $claim_id";
            
            $result = mysqli_query($conn, $query);
            
            if (mysqli_num_rows($result) == 0) {
                echo json_encode(['success' => false, 'message' => 'Claim not found']);
                mysqli_close($conn);
                exit();
            }
            
            $row = mysqli_fetch_assoc($result);
            $claim = [
                'claim_id' => $row['claim_id'],
                'item_name' => htmlspecialchars($row['item_name']),
                'item_description' => nl2br(htmlspecialchars($row['item_description'] ?? '')),
                'location_found' => htmlspecialchars($row['location_found']),
                'date_found' => date('d M Y', strtotime($row['date_found'])),
                'found_status' => $row['found_status'],
                'claim_status' => $row['claim_status'],
                'ownership_proof' => nl2br(htmlspecialchars($row['ownership_proof'])),
                'identifying_details' => nl2br(htmlspecialchars($row['identifying_details'])),
                'review_note' => nl2br(htmlspecialchars($row['review_note'] ?? '')),
                'submitted_at' => date('d M Y, h:i A', strtotime($row['submitted_at'])),
                'reviewed_at' => $row['reviewed_at'] ? date('d M Y, h:i A', strtotime($row['reviewed_at'])) : '',
                'claimant_name' => htmlspecialchars($row['claimant_name']),
                'claimant_email' => htmlspecialchars($row['claimant_email']),
                'claimant_phone' => htmlspecialchars($row['claimant_phone'] ?? '-'),
                'staff_name' => htmlspecialchars($row['staff_name']),
                'lost_report_id' => $row['lost_report_id'],
                'lost_item_name' => htmlspecialchars($row['lost_item_name'] ?? ''),
                'lost_location' => htmlspecialchars($row['location_lost'] ?? ''),
                'lost_date' => $row['lost_date'] ? date('d M Y', strtotime($row['lost_date'])) : '',
                'lost_status' => $row['lost_status'] ?? '',
                'lost_description' => nl2br(htmlspecialchars($row['lost_description'] ?? ''))
            ];
            
            echo json_encode(['success' => true, 'claim' => $claim]);
            mysqli_close($conn);
            exit();
        }

        // Get claims list with pagination
        $search = isset($_GET['search']) ? mysqli_real_escape_string($conn, $_GET['search']) : '';
        $status = isset($_GET['status']) ? mysqli_real_escape_string($conn, $_GET['status']) : '';
        $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
        $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 15;
        $offset = ($page - 1) * $limit;

        $where = "1=1";

        if ($search) {
            $where .= " AND (f.item_name LIKE '%$search%' OR u.name LIKE '%$search%')";
        }
        if ($status) {
            $where .= " AND c.claim_status = '$status'";
        }

        $count_query = "SELECT COUNT(*) as total 
                        FROM claims c 
                        JOIN found_items f ON c.item_id = f.item_id 
                        JOIN users u ON c.user_id = u.user_id 
                        WHERE $where";
        $count_result = mysqli_query($conn, $count_query);
        $total_count = mysqli_fetch_assoc($count_result)['total'];

        $query = "SELECT c.claim_id, c.claim_status, c.submitted_at, c.lost_report_id,
                  f.item_name, f.location_found,
                  u.name as claimant_name,
                  s.name as staff_name
                  FROM claims c 
                  JOIN found_items f ON c.item_id = f.item_id 
                  JOIN users u ON c.user_id = u.user_id 
                  JOIN users s ON f.user_id = s.user_id
                  WHERE $where
                  ORDER BY CASE WHEN c.claim_status = 'pending' THEN 0 ELSE 1 END, c.submitted_at DESC
                  LIMIT $offset, $limit";

        $result = mysqli_query($conn, $query);
        $claims = [];

        while ($row = mysqli_fetch_assoc($result)) {
            $claims[] = [
                'claim_id' => $row['claim_id'],
                'item_name' => htmlspecialchars($row['item_name']),
                'location_found' => htmlspecialchars($row['location_found']),
                'claim_status' => $row['claim_status'],
                'claimant_name' => htmlspecialchars($row['claimant_name']),
                'staff_name' => htmlspecialchars($row['staff_name']),
                'submitted_at' => date('d M Y, h:i A', strtotime($row['submitted_at'])),
                'has_lost_report' => !empty($row['lost_report_id'])
            ];
        }

        $stats_query = "SELECT claim_status, COUNT(*) as count FROM claims GROUP BY claim_status";
        $stats_result = mysqli_query($conn, $stats_query);
        $stats = ['pending' => 0, 'approved' => 0, 'rejected' => 0, 'total' => $total_count];
        while ($row = mysqli_fetch_assoc($stats_result)) {
            $stats[$row['claim_status']] = $row['count'];
        }

        echo json_encode([
            'success' => true,
            'claims' => $claims,
            'stats' => $stats,
            'total' => $total_count,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total_count / $limit)
        ]);
        mysqli_close($conn);
        exit();
        
    } catch (Exception $e) {
        // Catch any PHP errors and return them as JSON
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
    <title>Admin - View Claims</title>
    <link rel="stylesheet" href="../admin_dashboard.css">
    <link rel="stylesheet" href="view_claims.css">
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
                        <div class="admin-tag">Admin Panel</div>
                    </div>
                </div>
            </div>
            <nav>
                <div class="nav-group">
                    <div class="nav-group-title">Main</div>
                    <a href="../dashboard.html" class="nav-item">
                        <span class="icon"><i class="fas fa-tachometer-alt"></i></span>
                        <span>Dashboard</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">User Management</div>
                    <a href="../user_management/manage.html" class="nav-item">
                        <span class="icon"><i class="fas fa-users"></i></span>
                        <span>View Users</span>
                    </a>
                    <a href="../user_management/add.html" class="nav-item">
                        <span class="icon"><i class="fas fa-user-plus"></i></span>
                        <span>Add User</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Found Items</div>
                    <a href="../found_item/admin_found_items.html" class="nav-item">
                        <span class="icon"><i class="fas fa-box"></i></span>
                        <span>View All Items</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Lost Reports</div>
                    <a href="../lost_reports/view_lost_reports.html" class="nav-item">
                        <span class="icon"><i class="fas fa-search"></i></span>
                        <span>View Lost Reports</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Claims</div>
                    <a href="view_claims.html" class="nav-item active">
                        <span class="icon"><i class="fas fa-clipboard-list"></i></span>
                        <span>View All Claims</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Reports & Statistics</div>
                    <a href="../statistic/monthly_stats.html" class="nav-item">
                        <span class="icon"><i class="fas fa-chart-line"></i></span>
                        <span>Statistics</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Account</div>
                    <a href="../../profile/profile.html" class="nav-item">
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
                    <div class="page-title-header">Claims Management</div>
                </div>
                <div class="user-dropdown">
                    <div class="user-info-wrapper" onclick="toggleUserDropdown()">
                        <div class="user-avatar" id="userAvatar"><?php echo $user_avatar; ?></div>
                    </div>
                    <div class="user-dropdown-menu" id="userDropdownMenu">
                        <a href="../../profile/profile.html">
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
                    <h1>All Claims</h1>
                    <p>View and manage all claims submitted by users</p>
                </div>

                <!-- Stats Row -->
                <div class="stats-row">
                    <div class="stat-box">
                        <h3>Pending</h3>
                        <div class="number" id="statPending">0</div>
                    </div>
                    <div class="stat-box">
                        <h3>Approved</h3>
                        <div class="number" id="statApproved">0</div>
                    </div>
                    <div class="stat-box">
                        <h3>Rejected</h3>
                        <div class="number" id="statRejected">0</div>
                    </div>
                    <div class="stat-box">
                        <h3>Total</h3>
                        <div class="number" id="statTotal">0</div>
                    </div>
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
                        <input type="text" id="searchInput" placeholder="Item name, claimant...">
                    </div>
                    <div class="filter-actions">
                        <button class="btn btn-primary" id="searchBtn">Search</button>
                        <button class="btn btn-outline" id="resetBtn">Reset</button>
                    </div>
                </div>

                <!-- Claims Table -->
                <div id="loadingDiv" class="loading" style="display: none;">
                    <i class="fas fa-spinner fa-spin"></i> Loading claims...
                </div>

                <div class="claims-table-container" id="claimsContainer">
                    <table class="claims-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Item Name</th>
                                <th>Claimant</th>
                                <th>Staff Owner</th>
                                <th>Location</th>
                                <th>Submitted</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="claimsTableBody">
                            <tr>
                                <td colspan="8" class="text-center">Loading claims...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div id="pagination" class="pagination-container"></div>
            </article>

            <footer>
                <p>&copy; <?php echo $current_year; ?> Lost & Found System - Universiti Teknologi Malaysia</p>
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
                <a href="review_claims.php" id="reviewClaimBtn" class="btn-review">Review Claim</a>
                <button class="btn" onclick="closeModal()">Close</button>
            </div>
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
            const avatar = document.getElementById('userAvatar');
            if (dropdown && avatar && dropdown.classList.contains('show')) {
                if (!avatar.contains(event.target) && !dropdown.contains(event.target)) {
                    dropdown.classList.remove('show');
                }
            }
        });
    </script>
    <script src="view_claims.js"></script>
</body>
</html>