<?php
// 1. Set required role FIRST
$required_role = 'admin';

// 2. Include auth and database files
require_once("../../../includes/auth_check.php");
require_once("../../../includes/role_check.php");
require_once("../../../config/db_connect.php");

// 3. Fetch users data
$sql = "SELECT user_id, username, name, email, role, phone, created_at FROM users ORDER BY user_id ASC";
$result = mysqli_query($conn, $sql);

$users = [];
if (mysqli_num_rows($result) > 0) {
    while($row = mysqli_fetch_assoc($result)) {
        $users[] = $row;
    }
}

mysqli_close($conn);

// 4. Get user info from session
$user_name = $_SESSION['USER'] ?? 'Admin';
$user_avatar = strtoupper(substr($user_name, 0, 1));
$current_year = date('Y');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Users - Lost & Found System</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="manage.css">
</head>
<body>
    <div class="dashboard-container">
        <!-- ASIDE: Sidebar Navigation -->
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
                    <a href="manage.php" class="nav-item active">
                        <span class="icon"><i class="fas fa-users"></i></span>
                        <span>Manage Users</span>
                    </a>
                    <a href="add.php" class="nav-item">
                        <span class="icon"><i class="fas fa-user-plus"></i></span>
                        <span>Add User</span>
                    </a>
                </div>

                <div class="nav-group">
                    <div class="nav-group-title">Found Items</div>
                    <a href="../found_item/admin_found_items.php" class="nav-item">
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
                    <div class="page-title-header">Manage Users</div>
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
            
            <article>
                <div class="page-title">
                    <h1>Manage Users</h1>
                    <p id="welcomeMessage">View, edit, and manage all registered users</p>
                </div>
                
                <!-- Search and Actions Bar -->
                <div class="actions-bar">
                    <div class="search-wrapper">
                        <i class="fas fa-search"></i>
                        <input type="text" id="searchInput" placeholder="Search by username, name, email, or role...">
                        <button class="clear-btn" onclick="clearSearch()">
                            <i class="fas fa-times"></i> Clear
                        </button>
                    </div>
                    <a class="btn-add" href="add.php">
                        <i class="fas fa-user-plus"></i> Add New User
                    </a>
                </div>
                
                <!-- Users Table -->
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Phone</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="userTableBody">
                            <?php if (count($users) > 0): ?>
                                <?php foreach ($users as $user): ?>
                                <tr>
                                    <td><?php echo htmlspecialchars($user['user_id']); ?></td>
                                    <td><?php echo htmlspecialchars($user['username']); ?></td>
                                    <td><?php echo htmlspecialchars($user['name']); ?></td>
                                    <td><?php echo htmlspecialchars($user['email']); ?></td>
                                    <td>
                                        <span class="role-badge role-<?php echo strtolower($user['role']); ?>">
                                            <?php echo htmlspecialchars($user['role']); ?>
                                        </span>
                                    </td>
                                    <td><?php echo htmlspecialchars($user['phone'] ?? 'N/A'); ?></td>
                                    <td><?php echo date('M d, Y', strtotime($user['created_at'])); ?></td>
                                    <td class="actions">
                                        <a href="edit.php?id=<?php echo $user['user_id']; ?>" class="btn-edit">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        <button onclick="deleteUser(<?php echo $user['user_id']; ?>)" class="btn-delete">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <tr>
                                    <td colspan="8" class="text-center">No users found</td>
                                </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
                
                <!-- Pagination -->
                <div class="pagination" id="pagination"></div>
            </article>
            
            <footer>
                <p id="copyright">© <?php echo $current_year; ?> Lost & Found System - Universiti Teknologi Malaysia. All rights reserved.</p>
            </footer>
        </div>
    </div>

    <!-- Pass user data to JavaScript -->
    <script>
        // Users data for JavaScript
        const usersData = <?php echo json_encode($users); ?>;
        
        // Session data
        const sessionData = {
            userName: '<?php echo addslashes($user_name); ?>',
            userAvatar: '<?php echo $user_avatar; ?>'
        };
    </script>
    <script src="manage.js"></script>
</body>
</html>