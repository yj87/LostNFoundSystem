// user_page/staff/dashboard.js

// API endpoint
const API_URL = 'dashboard.php';

// Toggle sidebar on mobile with overlay
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const body = document.body;

    let overlay = document.querySelector('.sidebar-overlay');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';

        overlay.onclick = function () {
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

// Toggle user dropdown menu
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdownMenu');

    if (dropdown) {
        document.querySelectorAll('.user-dropdown-menu.show').forEach(menu => {
            if (menu !== dropdown) {
                menu.classList.remove('show');
            }
        });

        dropdown.classList.toggle('show');
    }
}

// Logout function
function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '../../mainpage/logout/logout.php';
        return true;
    }

    return false;
}

// Navigate to page
function navigateTo(page) {
    if (page) {
        window.location.href = page;
    }
}

// Escape HTML to prevent XSS
function escapeHtml(str) {
    if (!str) return '';

    return String(str).replace(/[&<>]/g, function (m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '-';

    const date = new Date(dateString);

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Animate number counting
function animateNumber(element, start, end, duration) {
    if (!element) return;

    let startTimestamp = null;

    const step = (timestamp) => {
        if (!startTimestamp) {
            startTimestamp = timestamp;
        }

        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.innerText = Math.floor(progress * (end - start) + start);

        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };

    window.requestAnimationFrame(step);
}

// Load dashboard data from PHP API
async function loadDashboardData() {
    try {
        const response = await fetch(API_URL, {
            credentials: 'same-origin'
        });

        const data = await response.json();

        if (!data.success) {
            console.error('Failed to load dashboard data:', data.message || 'Unknown error');
            return;
        }

        // Update user info
        const userAvatar = document.getElementById('userAvatar');
        const welcomeMsg = document.getElementById('welcomeMessage');

        if (userAvatar) {
            userAvatar.textContent = data.user_avatar;
        }

        if (welcomeMsg) {
            welcomeMsg.textContent = `Welcome back, ${data.user_name}! Manage found items and review claims.`;
        }

        // Update stats with animation
        const myItemsEl = document.getElementById('myItems');
        const totalItemsEl = document.getElementById('totalItems');
        const totalClaimsEl = document.getElementById('totalClaims');
        const pendingClaimsEl = document.getElementById('pendingClaims');

        if (myItemsEl) animateNumber(myItemsEl, 0, Number(data.my_items || 0), 500);
        if (totalItemsEl) animateNumber(totalItemsEl, 0, Number(data.total_items || 0), 500);
        if (totalClaimsEl) animateNumber(totalClaimsEl, 0, Number(data.my_claims || 0), 500);
        if (pendingClaimsEl) animateNumber(pendingClaimsEl, 0, Number(data.pending_claims || 0), 500);

        // Update copyright year
        const copyrightEl = document.getElementById('copyright');

        if (copyrightEl) {
            copyrightEl.innerHTML = `© ${data.current_year} Lost & Found System - Universiti Teknologi Malaysia. All rights reserved.`;
        }

        // Load tables
        loadRecentClaimsTable(data.recent_claims);
        loadRecentItemsTable(data.recent_items);

    } catch (error) {
        console.error('Error loading dashboard:', error);

        const claimsTable = document.getElementById('recentClaimsTable');
        const itemsTable = document.getElementById('recentItemsTable');

        if (claimsTable) {
            claimsTable.innerHTML = '<tr><td colspan="5" class="text-center" style="color: red;">Error loading data</td></tr>';
        }

        if (itemsTable) {
            itemsTable.innerHTML = '<tr><td colspan="5" class="text-center" style="color: red;">Error loading data</td></tr>';
        }
    }
}

// Load recent claims table
function loadRecentClaimsTable(claims) {
    const tbody = document.getElementById('recentClaimsTable');

    if (!tbody) return;

    if (claims && claims.length > 0) {
        let html = '';

        claims.forEach(claim => {
            const statusClass = `status-${claim.claim_status}`;
            const statusText = claim.claim_status
                ? claim.claim_status.charAt(0).toUpperCase() + claim.claim_status.slice(1)
                : 'Unknown';

            html += `
                <tr>
                    <td>${escapeHtml(claim.item_name)}</td>

                    <td>${escapeHtml(claim.claimant_name)}</td>

                    <td>
                        <span class="status-badge ${statusClass}">
                            ${escapeHtml(statusText)}
                        </span>
                    </td>

                    <td>${formatDate(claim.submitted_at)}</td>

                    <td>
                        <a href="claims/review_claims_page.php?id=${encodeURIComponent(claim.claim_id)}&return=${encodeURIComponent('../staff/dashboard_page.php')}"
                           class="btn btn-primary">
                            View
                        </a>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    } else {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No claims found</td></tr>';
    }
}

// Load recent items table
function loadRecentItemsTable(items) {
    const tbody = document.getElementById('recentItemsTable');

    if (!tbody) return;

    if (items && items.length > 0) {
        let html = '';

        items.forEach(item => {
            const statusClass = `status-${item.found_status}`;
            const statusText = item.found_status
                ? item.found_status.charAt(0).toUpperCase() + item.found_status.slice(1)
                : 'Unknown';

            html += `
                <tr>
                    <td>${escapeHtml(item.item_name)}</td>

                    <td>${escapeHtml(item.location_found)}</td>

                    <td>${formatDate(item.date_found)}</td>

                    <td>
                        <span class="status-badge ${statusClass}">
                            ${escapeHtml(statusText)}
                        </span>
                    </td>

                    <td>
                        <a href="../item_details/view_item_details.html?id=${encodeURIComponent(item.item_id)}&from=staff&type=found&return=${encodeURIComponent('../staff/dashboard_page.php')}"
                           class="btn btn-primary">
                            View
                        </a>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    } else {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No found items yet</td></tr>';
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('userDropdownMenu');
    const userInfoWrapper = document.querySelector('.user-info-wrapper');

    if (dropdown && userInfoWrapper && dropdown.classList.contains('show')) {
        if (!userInfoWrapper.contains(event.target) && !dropdown.contains(event.target)) {
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

// Handle window resize
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

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function () {
    loadDashboardData();

    // Action cards navigation
    const actionCards = document.querySelectorAll('.action-card');

    actionCards.forEach(card => {
        card.addEventListener('click', function () {
            const page = this.getAttribute('data-page');

            if (page) {
                navigateTo(page);
            }
        });
    });
});