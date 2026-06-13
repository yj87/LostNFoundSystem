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
    if (status === 'claimed') return 'status-claimed';
    if (status === 'pending') return 'status-pending';
    return 'status-unclaimed';
}

function getModuleConfig(from) {
    switch (from) {
        case 'admin':
            return {
                dashboardCss: '../admin/admin_dashboard.css',
                panelTitle: 'Lost & Found',
                panelSubtitle: 'Admin Panel',
                avatar: 'A',
                profileUrl: '../profile/profile.html',
                logoutUrl: '../../mainpage/logout/logout.php',
                backUrl: '../admin/found_item/admin_found_items.html',
                navHtml: `
                    <div class="nav-group">
                        <div class="nav-group-title">Main</div>
                        <a href="../admin/dashboard.html" class="nav-item">
                            <span class="icon"><i class="fas fa-tachometer-alt"></i></span>
                            <span>Dashboard</span>
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
                panelTitle: 'Lost & Found',
                panelSubtitle: 'Staff Panel',
                avatar: 'S',
                profileUrl: '../profile/profile.html',
                logoutUrl: '../../mainpage/logout/logout.php',
                backUrl: '../staff/found_item/staff_found_items.html',
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
                        <a href="../staff/found_item/staff_found_items.html" class="nav-item active">
                            <span class="icon"><i class="fas fa-box"></i></span>
                            <span>My Found Items</span>
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
                panelTitle: 'Lost & Found',
                panelSubtitle: 'User Panel',
                avatar: 'U',
                profileUrl: '../profile/profile.html',
                logoutUrl: '../../mainpage/logout/logout.php',
                backUrl: '../user/found_item/browse_found_items.html',
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
                panelTitle: 'LostFind',
                panelSubtitle: 'Public View',
                avatar: '',
                profileUrl: '',
                logoutUrl: '',
                backUrl: '../../index/public_found_items.html',
                navHtml: ''
    };
    }
}

function loadDashboardCss(cssPath) {
    if (!cssPath) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.insertBefore(link, document.querySelector('link[href="view_item_details.css"]'));
}

function applyModuleLayout(config) {
    loadDashboardCss(config.dashboardCss);

    document.getElementById('panelTitle').textContent = config.panelTitle;
    document.getElementById('panelSubtitle').textContent = config.panelSubtitle;
    document.getElementById('sideNav').innerHTML = config.navHtml;

    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar && config.avatar) {
        userAvatar.textContent = config.avatar;
    }

    const profileLink = document.querySelector('#userDropdownMenu a[href="../profile/profile.html"]');
    if (profileLink) {
        profileLink.href = config.profileUrl;
    }

    const logoutLink = document.querySelector('#userDropdownMenu a[href="../../mainpage/logout/logout.php"]');
    if (logoutLink) {
        logoutLink.href = config.logoutUrl;
    }
    const params = new URLSearchParams(window.location.search);
    const from = params.get('from') || 'public';

    if (from === 'public') {
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

    if (!config.avatar) {
        document.getElementById('dashboardUserDropdown')?.remove();
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const body = document.body;
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

document.addEventListener('click', function (e) {
    const dropdown = document.getElementById('userDropdownMenu');
    const wrapper = document.querySelector('.user-info-wrapper');

    if (dropdown && wrapper && dropdown.classList.contains('show')) {
        if (!wrapper.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    }
});

document.addEventListener('DOMContentLoaded', async function () {
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('id');
    const from = params.get('from') || 'public';

    const config = getModuleConfig(from);
    applyModuleLayout(config);

    const container = document.getElementById('itemDetails');
    const pageTitle = document.getElementById('pageTitle');
    const pageHeaderTitle = document.getElementById('pageHeaderTitle');

    if (!itemId) {
        container.innerHTML = `<div class="error-box">Invalid item ID.</div>`;
        return;
    }

    try {
        const response = await fetch(`view_item_details.php?id=${encodeURIComponent(itemId)}`, {
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

        if (pageTitle) {
            pageTitle.textContent = `View Item Details`;
        }

        if (pageHeaderTitle) {
            pageHeaderTitle.textContent = `View Item: ${item.item_name}`;
        }

        const imageHtml = item.photo
            ? `<img src="../../${escapeHtml(item.photo)}" class="item-detail-image" alt="Found item image">`
            : `
                <div class="no-image-large">
                    <i class="fas fa-image"></i>
                </div>
            `;

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
                        <span class="status-pill ${getStatusClass(item.found_status)}">
                            ${escapeHtml(formatStatus(item.found_status))}
                        </span>
                    </div>
                </div>

                <div class="detail-group">
                    <label>Date Found</label>
                    <div class="detail-box">${escapeHtml(item.date_found)}</div>
                </div>

                <div class="detail-group full">
                    <label>Location Found</label>
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