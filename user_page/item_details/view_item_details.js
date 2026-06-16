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
    // For found items
    if (status === 'claimed') return 'status-claimed';
    if (status === 'pending') return 'status-pending';
    if (status === 'unclaimed') return 'status-unclaimed';
    // For lost items
    if (status === 'searching') return 'status-searching';
    if (status === 'found') return 'status-found';
    if (status === 'closed') return 'status-closed';
    return 'status-default';
}

function getModuleConfig(from, type) {
    // Base configurations for each role
    const configs = {
        'admin': {
            dashboardCss: '../admin/admin_dashboard.css',
            panelTitle: 'LostFind',
            panelSubtitle: 'Admin Panel',
            avatar: 'A',
            profileUrl: '../profile/profile.html',
            logoutUrl: '../../mainpage/logout/logout.php',
            logoType: 'admin',
            
            getBackUrl: function(itemType) {
                if (itemType === 'lost') {
                    return '../admin/lost_reports/view_lost_reports.html';
                } else {
                    return '../admin/found_item/admin_found_items.html';
                }
            },
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
                    <a href="../admin/found_item/admin_found_items.html" class="nav-item">
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
        },
        'staff': {
            dashboardCss: '../staff/staff_dashboard.css',
            panelTitle: 'LostFind',
            panelSubtitle: 'Staff Panel',
            avatar: 'S',
            profileUrl: '../profile/profile.html',
            logoutUrl: '../../mainpage/logout/logout.php',
            logoType: 'staff',
            getBackUrl: function(itemType) {
                if (itemType === 'lost') {
                    return '../staff/lost_reports/view_lost_items.html';
                } else {
                    return '../staff/found_item/staff_found_items.html';
                }
            },
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
                    <a href="../staff/found_item/staff_found_items.html" class="nav-item">
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
        },
        'user': {
            dashboardCss: '../user/dashboard.css',
            panelTitle: 'LostFind',
            panelSubtitle: 'User Panel',
            avatar: 'U',
            profileUrl: '../profile/profile.html',
            logoutUrl: '../../mainpage/logout/logout.php',
            logoType: 'user',
            getBackUrl: function(itemType) {
                if (itemType === 'lost') {
                    return '../user/lost_reports/my_lost_reports.html';
                } else {
                    return '../user/found_item/browse_found_items.html';
                }
            },
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
                    <a href="../user/found_item/browse_found_items.html" class="nav-item">
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
        },
        'public': {
            dashboardCss: '../../index/first.css',
            panelTitle: 'LostFind',
            panelSubtitle: 'Public View',
            avatar: '',
            profileUrl: '',
            logoutUrl: '',
            logoType: '',
            getBackUrl: function(itemType) {
                return '../../index/public_found_items.html';
            },
            navHtml: ''
        }
    };
    
    return configs[from] || configs['public'];
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

function applyDefaultSidebarHeader(config) {
    const sidebarHeader = document.getElementById('sidebarHeader');
    if (!sidebarHeader) return;
    sidebarHeader.innerHTML = `
        <div class="logo">🔍</div>
        <h3 id="panelTitle">${escapeHtml(config.panelTitle)}</h3>
        <p id="panelSubtitle">${escapeHtml(config.panelSubtitle)}</p>
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
    } else {
        applyDefaultSidebarHeader(config);
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

// ========== MAIN ==========
document.addEventListener('DOMContentLoaded', async function () {
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('id');
    const from = params.get('from') || 'public';
    const type = params.get('type') || 'found';  // 'found' or 'lost'

    const config = getModuleConfig(from, type);
    applyModuleLayout(config, from);

    const container = document.getElementById('itemDetails');

    if (!itemId) {
        container.innerHTML = `<div class="error-box">Invalid item ID.</div>`;
        return;
    }

    try {
        const apiUrl = `view_item_details.php?id=${encodeURIComponent(itemId)}&type=${type}`;
        const response = await fetch(apiUrl, { credentials: 'same-origin' });
        const result = await response.json();

        if (!result.success) {
            container.innerHTML = `
                <div class="error-box">
                    ${escapeHtml(result.message || 'Item not found.')}
                </div>
                <div class="detail-actions">
                    <a href="${config.getBackUrl(type)}" class="btn-back-detail">
                        <i class="fas fa-arrow-left"></i> Back
                    </a>
                </div>
            `;
            return;
        }

        const item = result.data;
        console.log('Full item object:', item);
console.log('Type:', type);
console.log('lost_status:', item.lost_status);
console.log('found_status:', item.found_status);
console.log('Any status field:', item.status);
        
        // Set page titles based on item type
        const pageTitle = type === 'lost' ? 'Lost Report Details' : 'Found Item Details';
        document.getElementById('pageTitle').textContent = pageTitle;
        document.getElementById('pageHeaderTitle').textContent = `${pageTitle}: ${item.item_name}`;

        let imageHtml = '<div class="no-image-large"><i class="fas fa-image"></i></div>';
        
        if (item.photo) {
            const imagePath = '/LostNFoundSystem/' + item.photo;
            imageHtml = `<img src="${imagePath}" class="item-detail-image" alt="Item image" onerror="this.alt='Image not found';">`;
        }

        // Adjust labels based on item type
        const locationLabel = type === 'lost' ? 'Location Lost' : 'Location Found';
        const dateLabel = type === 'lost' ? 'Date Lost' : 'Date Found';
        let statusValue = '';
        if (type === 'lost') {
            statusValue = item.lost_status || item.found_status || 'searching';
        } else {
            statusValue = item.found_status || item.lost_status || 'unclaimed';
        }

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
                    <label>${dateLabel}</label>
                    <div class="detail-box">${escapeHtml(item.date_found || item.date_lost)}</div>
                </div>
                <div class="detail-group full">
                    <label>${locationLabel}</label>
                    <div class="detail-box">${escapeHtml(item.location_found || item.location_lost)}</div>
                </div>
                <div class="detail-group full">
                    <label>Description</label>
                    <div class="detail-box">${escapeHtml(item.description || 'No description provided')}</div>
                </div>
                <div class="detail-group">
                    <label>Reported By</label>
                    <div class="detail-box">${escapeHtml(item.reported_by)}</div>
                </div>
                <div class="detail-group">
                    <label>${type === 'lost' ? 'Report ID' : 'Item ID'}</label>
                    <div class="detail-box">${escapeHtml(item.item_id)}</div>
                </div>
            </div>
            <div class="detail-actions">
                <a href="${config.getBackUrl(type)}" class="btn-back-detail">
                    <i class="fas fa-arrow-left"></i> Back to ${type === 'lost' ? 'Lost Reports' : 'Found Items'}
                </a>
            </div>
        `;
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `
            <div class="error-box">Failed to load item details.</div>
            <div class="detail-actions">
                <a href="${config.getBackUrl(type)}" class="btn-back-detail">
                    <i class="fas fa-arrow-left"></i> Back
                </a>
            </div>
        `;
    }
});