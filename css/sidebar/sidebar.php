<aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
        <div class="logo">🔍</div>
        <h3>Lost & Found</h3>
        <p>Admin Panel</p>
    </div>
    
    <nav class="sidebar-menu">
        <!-- Dashboard -->
        <div class="menu-group">
            <div class="menu-group-title">Dashboard</div>
            <div class="menu-item active" onclick="location.href='dashboard.php'">
                <span class="icon"><i class="fas fa-tachometer-alt"></i></span>
                <span>Dashboard</span>
            </div>
        </div>

        <!-- User Management -->
        <div class="menu-group">
            <div class="menu-group-title">User Management</div>
            <div class="menu-item" onclick="location.href='user_management/manage_users.php'">
                <span class="icon"><i class="fas fa-users"></i></span>
                <span>View Users</span>
            </div>
            <div class="menu-item" onclick="location.href='user_management/add_user.php'">
                <span class="icon"><i class="fas fa-user-plus"></i></span>
                <span>Add User</span>
            </div>
        </div>

        <!-- Found Items Management -->
        <div class="menu-group">
            <div class="menu-group-title">Found Items</div>
            <div class="menu-item" onclick="location.href='admin_found_items.php'">
                <span class="icon"><i class="fas fa-box"></i></span>
                <span>View All Items</span>
            </div>
        </div>

        <!-- Lost Reports Management -->
        <div class="menu-group">
            <div class="menu-group-title">Lost Reports</div>
            <div class="menu-item" onclick="location.href='admin_lost_reports.php'">
                <span class="icon"><i class="fas fa-search"></i></span>
                <span>View All Reports</span>
            </div>
        </div>

        <!-- Claim Management -->
        <div class="menu-group">
            <div class="menu-group-title">Claims</div>
            <div class="menu-item" onclick="location.href='admin_claims.php'">
                <span class="icon"><i class="fas fa-clipboard-list"></i></span>
                <span>View All Claims</span>
            </div>
        </div>

        <!-- Reports & Statistics -->
        <div class="menu-group">
            <div class="menu-group-title">Reports & Statistics</div>
            <div class="menu-item" onclick="location.href='reports.php'">
                <span class="icon"><i class="fas fa-chart-line"></i></span>
                <span>Statistics</span>
            </div>
        </div>

        <!-- Account -->
        <div class="menu-group">
            <div class="menu-group-title">Account</div>
            <div class="menu-item" onclick="location.href='profile.php'">
                <span class="icon"><i class="fas fa-user-circle"></i></span>
                <span>My Profile</span>
            </div>
            <div class="menu-item" onclick="logoutUser()">
                <span class="icon"><i class="fas fa-sign-out-alt"></i></span>
                <span>Logout</span>
            </div>
        </div>
    </nav>
</aside>