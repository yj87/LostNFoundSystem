function escapeHtml(str) {
    if (str === null || str === undefined || str === '') return '-';

    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatStatus(status) {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusClass(status) {
    if (status === 'claimed' || status === 'found' || status === 'approved') return 'status-claimed';
    if (status === 'pending' || status === 'searching') return 'status-pending';
    return 'status-unclaimed';
}

function getModuleConfig(from) {
    switch (from) {
        case 'admin':
            return {
                dashboardCss: '../admin/admin_dashboard.css',
                avatar: 'A',
                profileUrl: '../profile/profile.html',
                logoutUrl: '../../mainpage/logout/logout.php',
                backUrl: '../admin/found_item/admin_found_items.html',
                logoType: 'admin',
                navHtml: `
                    <div class="nav-group">
                        <div class="nav-group-title">Main</div>
                        <a href="../admin/dashboard.html" class="nav-item">
                            <span class="icon"><i class="fas fa-tachometer-alt"></i></span>
                            <span>Dashboard</span>
                        </a>
                    </div>

                    <div class="nav-group">
                        <div class="nav-group-title">User Management</div>
                        <a href="../admin/user_management/manage.html" class="nav-item">
                            <span class="icon"><i class="fas fa-users"></i></span>
                            <span>Manage Users</span>
                        </a>
                        <a href="../admin/user_management/add.html" class="nav-item">
                            <span class="icon"><i class="fas fa-user-plus"></i></span>
                            <span>Add User</span>
                        </a>
                    </div>

                    <div class="nav-group">
                        <div class="nav-group-title">Found Items</div>
                        <a href="../admin/found_item/admin_found_items.html" class="nav-item active">
                            <span class="icon"><i class="fas fa-box"></i></span>
                            <span>View All Items</span>
                        </a>
                    </div>

                    <div class="nav-group">
                        <div class="nav-group-title">Lost Reports</div>
                        <a href="../admin/lost_reports/view_lost_reports.html" class="nav-item">
                            <span class="icon"><i class="fas fa-search"></i></span>
                            <span>View All Reports</span>
                        </a>
                    </div>

                    <div class="nav-group">
                        <div class="nav-group-title">Claims</div>
                        <a href="../admin/claims/view_claims.html" class="nav-item">
                            <span class="icon"><i class="fas fa-clipboard-list"></i></span>
                            <span>View All Claims</span>
                        </a>
                    </div>

                    <div class="nav-group">
                        <div class="nav-group-title">Reports & Statistics</div>
                        <a href="../admin/statistic/monthly_stats.html" class="nav-item">
                            <span class="icon"><i class="fas fa-chart-line"></i></span>
                            <span>Statistics</span>
                        </a>
                    </div>

                    <div class="nav-group">
                        <div class="nav-group-title">Account</div>
                        <a href="../profile/profile.html" class="nav-item">
                            <span class="icon"><i class="fas fa-user-circle"></i></span>
                            <span>My Profile</span>
                        </a>
                        <a href="../../mainpage/logout/logout.php" class="nav-item" onclick="return logoutUser();">
                            <span class="icon"><i class="fas fa-sign-out-alt"></i></span>
                            <span>Logout</span>
                        </a>
                    </div>
                `
            };

        case 'staff':
            return {
                dashboardCss: '../staff/staff_dashboard.css',
                avatar: 'S',
                profileUrl: '../profile/profile.html',
                logoutUrl: '../../mainpage/logout/logout.php',
                backUrl: '../staff/found_item/staff_found_items.html',
                logoType: 'staff',
                navHtml: `
                    <div class="nav-group">
                        <div class="nav-group-title">Main</div>
                        <a href="../staff/dashboard.html" class="nav-item">
                            <span class="icon"><i class="fas fa-tachometer-alt"></i></span>
                            <span>Dashboard</span>
                        </a>
                    </div>

                    <div class="nav-group">
                        <div class="nav-group-title">Found Items</div>
                        <a href="../staff/found_item/add_found_item.html" class="nav-item">
                            <span class="icon"><i class="fas fa-plus-circle"></i></span>
                            <span>Add Found Item</span>
                        </a>
                        <a href="../staff/found_item/staff_found_items.html" class="nav-item active">
                            <span class="icon"><i class="fas fa-box"></i></span>
                            <span>My Found Items</span>
                        </a>
                    </div>

                    <div class="nav-group">
                        <div class="nav-group-title">Claims</div>
                        <a href="../staff/claims/view_claims.html" class="nav-item">
                            <span class="icon"><i class="fas fa-clipboard-list"></i></span>
                            <span>View Claims</span>
                        </a>
                    </div>

                    <div class="nav-group">
                        <div class="nav-group-title">Lost Reports</div>
                        <a href="../staff/lost_reports/view_lost_items.html" class="nav-item">
                            <span class="icon"><i class="fas fa-search"></i></span>
                            <span>View Lost Items</span>
                        </a>
                    </div>

                    <div class="nav-group">
                        <div class="nav-group-title">Account</div>
                        <a href="../profile/profile.html" class="nav-item">
                            <span class="icon"><i class="fas fa-user-circle"></i></span>
                            <span>My Profile</span>
                        </a>
                        <a href="../../mainpage/logout/logout.php" class="nav-item" onclick="return logoutUser();">
                            <span class="icon"><i class="fas fa-sign-out-alt"></i></span>
                            <span>Logout</span>
                        </a>
                    </div>
                `
            };

        case 'user':
            return {
                dashboardCss: '../user/dashboard.css',
                avatar: 'U',
                profileUrl: '../profile/profile.html',
                logoutUrl: '../../mainpage/logout/logout.php',
                backUrl: '../user/found_item/browse_found_items.html',
                logoType: 'user',
                navHtml: `
                    <div class="nav-group">
                        <div class="nav-group-title">Main</div>
                        <a href="../user/dashboard.html" class="nav-item">
                            <span class="icon"><i class="fas fa-tachometer-alt"></i></span>
                            <span>Dashboard</span>
                        </a>
                    </div>

                    <div class="nav-group">
                        <div class="nav-group-title">Lost Items</div>
                        <a href="../user/lost_reports/report_lost_items.html" class="nav-item">
                            <span class="icon"><i class="fas fa-plus-circle"></i></span>
                            <span>Report Lost Item</span>
                        </a>
                        <a href="../user/lost_reports/my_lost_reports.html" class="nav-item">
                            <span class="icon"><i class="fas fa-history"></i></span>
                            <span>My Lost Reports</span>
                        </a>
                    </div>

                    <div class="nav-group">
                        <div class="nav-group-title">Found Items</div>
                        <a href="../user/found_item/browse_found_items.html" class="nav-item active">
                            <span class="icon"><i class="fas fa-search"></i></span>
                            <span>Browse Found Items</span>
                        </a>
                    </div>

                    <div class="nav-group">
                        <div class="nav-group-title">Claims</div>
                        <a href="../user/claims/my_claims.html" class="nav-item">
                            <span class="icon"><i class="fas fa-clipboard-list"></i></span>
                            <span>My Claims</span>
                        </a>
                    </div>

                    <div class="nav-group">
                        <div class="nav-group-title">Account</div>
                        <a href="../profile/profile.html" class="nav-item">
                            <span class="icon"><i class="fas fa-user-circle"></i></span>
                            <span>My Profile</span>
                        </a>
                        <a href="../../mainpage/logout/logout.php" class="nav-item" onclick="return logoutUser();">
                            <span class="icon"><i class="fas fa-sign-out-alt"></i></span>
                            <span>Logout</span>
                        </a>
                    </div>
                `
            };

        case 'public':
        default:
            return {
                dashboardCss: '../../index/first.css',
                avatar: '',
                profileUrl: '',
                logoutUrl: '',
                backUrl: '../../index/public_found_items.html',
                logoType: '',
                navHtml: ''
            };
    }
}

function loadDashboardCss(cssPath) {
    if (!cssPath) return;

    const existing = document.querySelector(`link[href="${cssPath}"]`);
    if (existing) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;

    const detailCss = document.querySelector('link[href="view_item_details.css"]');
    document.head.insertBefore(link, detailCss);
}

function applyLogoSidebar(panelText) {
    const sidebarHeader = document.getElementById('sidebarHeader');

    if (!sidebarHeader) return;

    sidebarHeader.innerHTML = `
        <div class="logo-nav">
            <div class="brand-logo">
                <img src="../../logo/lostfind.webp" alt="LostFind Logo">
            </div>

            <div class="brand-text">
                <div class="brand-name">Lost<span>Find</span></div>
                <div class="admin-tag">${escapeHtml(panelText)}</div>
            </div>
        </div>
    `;
}

function applyPublicLayout() {
    document.body.classList.add('public-detail-page');

    const dashboardContainer = document.querySelector('.dashboard-container');
    const sidebar = document.getElementById('sidebar');
    const topHeader = document.querySelector('.top-header');

    if (sidebar) sidebar.remove();
    if (topHeader) topHeader.remove();

    if (dashboardContainer) {
        dashboardContainer.className = 'public-detail-wrapper';
    }
}

function applyModuleLayout(config, from) {
    loadDashboardCss(config.dashboardCss);

    if (from === 'public') {
        applyPublicLayout();
        return;
    }

    if (config.logoType === 'admin') {
        applyLogoSidebar('Admin Panel');
    } else if (config.logoType === 'staff') {
        applyLogoSidebar('Staff Panel');
    } else if (config.logoType === 'user') {
        applyLogoSidebar('User Panel');
    }

    const sideNav = document.getElementById('sideNav');
    if (sideNav) {
        sideNav.innerHTML = config.navHtml;
    }

    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar && config.avatar) {
        userAvatar.textContent = config.avatar;
    }

    const profileLink = document.getElementById('profileDropdownLink');
    if (profileLink && config.profileUrl) {
        profileLink.href = config.profileUrl;
    }

    const logoutLink = document.getElementById('logoutDropdownLink');
    if (logoutLink && config.logoutUrl) {
        logoutLink.href = config.logoutUrl;
    }

    if (!config.avatar) {
        document.getElementById('dashboardUserDropdown')?.remove();
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const body = document.body;

    if (!sidebar) return;

    let overlay = document.querySelector('.sidebar-overlay');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';

        overlay.onclick = () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            body.style.overflow = '';
        };

        document.body.appendChild(overlay);
    }

    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');

    if (window.innerWidth <= 768) {
        body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    }
}

function toggleUserDropdown() {
    document.getElementById('userDropdownMenu')?.classList.toggle('show');
}

function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '../../mainpage/logout/logout.php';
        return true;
    }

    return false;
}

document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('userDropdownMenu');
    const wrapper = document.querySelector('.user-info-wrapper');

    if (dropdown && wrapper && dropdown.classList.contains('show')) {
        if (!wrapper.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    }

    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    const overlay = document.querySelector('.sidebar-overlay');

    if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
        if (menuToggle && !menuToggle.contains(event.target) && !sidebar.contains(event.target)) {
            sidebar.classList.remove('active');

            if (overlay) {
                overlay.classList.remove('active');
            }

            document.body.style.overflow = '';
        }
    }
});

window.addEventListener('resize', function () {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (window.innerWidth > 768 && sidebar) {
        sidebar.classList.remove('active');

        if (overlay) {
            overlay.classList.remove('active');
        }

        document.body.style.overflow = '';
    }
});

document.addEventListener('DOMContentLoaded', async function () {
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('id');
    const from = params.get('from') || 'public';
    const type = params.get('type') || 'found';

    const config = getModuleConfig(from);
    applyModuleLayout(config, from);

    const container = document.getElementById('itemDetails');

    if (!itemId) {
        container.innerHTML = `<div class="error-box">Invalid item ID.</div>`;
        return;
    }

    try {
        const response = await fetch(`./view_item_details.php?id=${encodeURIComponent(itemId)}&type=${encodeURIComponent(type)}`, {
            credentials: 'same-origin'
        });

        const text = await response.text();

        let result;

        try {
            result = JSON.parse(text);
        } catch (jsonError) {
            console.error('PHP did not return JSON. Response was:', text);
            throw new Error('Invalid JSON response from PHP.');
        }

        if (!result.success) {
            container.innerHTML = `
                <div class="error-box">
                    ${escapeHtml(result.message || 'Item not found.')}
                </div>

                <div class="detail-actions">
                    <a href="${config.backUrl}" class="btn-back-detail">
                        <i class="fas fa-arrow-left"></i> Back
                    </a>
                </div>
            `;
            return;
        }

        const item = result.data;

        const titleText = type === 'lost' ? 'Lost Report Details' : 'Found Item Details';

        const pageTitle = document.getElementById('pageTitle');
        const pageHeaderTitle = document.getElementById('pageHeaderTitle');

        if (pageTitle) pageTitle.textContent = titleText;
        if (pageHeaderTitle) pageHeaderTitle.textContent = `${titleText}: ${item.item_name}`;

        let imageHtml = '<div class="no-image-large"><i class="fas fa-image"></i></div>';

        if (item.photo) {
            const imagePath = '/LostNFoundSystem/' + item.photo;
            imageHtml = `<img src="${imagePath}" class="item-detail-image" alt="Item image" onerror="this.style.display='none';">`;
        }

        const statusValue = item.found_status || item.lost_status || 'unknown';

        container.innerHTML = `
            ${imageHtml}

            <div class="detail-grid">
                <div class="detail-group">
                    <label>Item Name</label>
                    <div class="detail-box">${escapeHtml(item.item_name)}</div>
                </div>

                <div class="detail-group">
                    <label>Category</label>
                    <div class="detail-box">${escapeHtml(item.category_name)}</div>
                </div>

                <div class="detail-group">
                    <label>Status</label>
                    <div class="detail-box">
                        <span class="status-pill ${getStatusClass(statusValue)}">
                            ${escapeHtml(formatStatus(statusValue))}
                        </span>
                    </div>
                </div>

                <div class="detail-group">
                    <label>${type === 'lost' ? 'Date Lost' : 'Date Found'}</label>
                    <div class="detail-box">${escapeHtml(item.date_found)}</div>
                </div>

                <div class="detail-group full">
                    <label>${type === 'lost' ? 'Location Lost' : 'Location Found'}</label>
                    <div class="detail-box">${escapeHtml(item.location_found)}</div>
                </div>

                <div class="detail-group full">
                    <label>Description</label>
                    <div class="detail-box description-box">${escapeHtml(item.description)}</div>
                </div>

                <div class="detail-group">
                    <label>Reported By</label>
                    <div class="detail-box">${escapeHtml(item.reported_by)}</div>
                </div>

                <div class="detail-group">
                    <label>Item ID</label>
                    <div class="detail-box">${escapeHtml(item.item_id)}</div>
                </div>
            </div>

            <div class="detail-actions">
                <a href="${config.backUrl}" class="btn-back-detail">
                    <i class="fas fa-arrow-left"></i> Back
                </a>
            </div>
        `;
    } catch (error) {
        console.error('Error loading item details:', error);

        container.innerHTML = `
            <div class="error-box">
                Failed to load item details.
                <br>
                <small>Open Inspect → Console to see the actual PHP error.</small>
            </div>

            <div class="detail-actions">
                <a href="${config.backUrl}" class="btn-back-detail">
                    <i class="fas fa-arrow-left"></i> Back
                </a>
            </div>
        `;
    }
});