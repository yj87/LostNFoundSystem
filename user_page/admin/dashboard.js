// Toggle sidebar on mobile with overlay
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const body = document.body;
    
    // Create overlay if it doesn't exist
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.onclick = function() {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            body.style.overflow = '';
        };
        document.body.appendChild(overlay);
    }
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    
    if (window.innerWidth <= 768) {
        if (sidebar.classList.contains('active')) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
        }
    }
}

// Toggle user dropdown menu
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdownMenu');
    if (dropdown) {
        // Close any other open dropdowns first
        document.querySelectorAll('.user-dropdown-menu.show').forEach(menu => {
            if (menu !== dropdown) menu.classList.remove('show');
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
    return str.replace(/[&<>]/g, function(m) {
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Animate number counting
function animateNumber(element, start, end, duration) {
    if (!element) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.innerText = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Load admin dashboard data
async function loadAdminData() {
    try {
        const response = await fetch('admin_dashboard_data.php');
        const data = await response.json();
        
        if (data.success) {
            const userAvatar = document.getElementById('userAvatar');
            const welcomeMsg = document.getElementById('welcomeMessage');
            const copyrightEl = document.getElementById('copyright');
            
            if (userAvatar) userAvatar.textContent = data.user_avatar;
            if (welcomeMsg) welcomeMsg.textContent = `Welcome back, ${data.user_name}! Here's what's happening today.`;
            if (copyrightEl) copyrightEl.innerHTML = `© ${data.current_year} Lost & Found System - Universiti Teknologi Malaysia. All rights reserved.`;
            
            // Update stats with animation
            const totalUsersEl = document.getElementById('totalUsers');
            const totalItemsEl = document.getElementById('totalItems');
            const totalLostReportsEl = document.getElementById('totalLostReports');
            const totalClaimsEl = document.getElementById('totalClaims');
            const pendingClaimsEl = document.getElementById('pendingClaims');
            const approvedClaimsEl = document.getElementById('approvedClaims');
            
            if (totalUsersEl) animateNumber(totalUsersEl, 0, data.total_users, 500);
            if (totalItemsEl) animateNumber(totalItemsEl, 0, data.total_items, 500);
            if (totalLostReportsEl) animateNumber(totalLostReportsEl, 0, data.total_lost_reports, 500);
            if (totalClaimsEl) animateNumber(totalClaimsEl, 0, data.total_claims, 500);
            if (pendingClaimsEl) animateNumber(pendingClaimsEl, 0, data.pending_claims, 500);
            if (approvedClaimsEl) animateNumber(approvedClaimsEl, 0, data.approved_claims, 500);
            
            // Load recent items table
            loadRecentItemsTable(data.recent_items);
        }
    } catch (error) {
        console.error('Error loading admin data:', error);
        const itemsTable = document.getElementById('recentItemsTable');
        if (itemsTable) itemsTable.innerHTML = '<tr><td colspan="5" class="text-center" style="color: red;">Error loading data</td></tr>';
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
            const statusText = item.found_status ? item.found_status.charAt(0).toUpperCase() + item.found_status.slice(1) : 'Unknown';
            
            html += `
                <tr>
                    <td>${escapeHtml(item.item_name)}</td>
                    <td>${escapeHtml(item.category_name)}</td>
                    <td>${escapeHtml(item.location_found)}</td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            ${statusText}
                        </span>
                    </td>
                    <td>
                        <a href="admin_view_item.php?id=${item.item_id}" class="btn btn-primary">View</a>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    } else {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No items found</td></tr>';
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('userDropdownMenu');
    const userInfoWrapper = document.querySelector('.user-info-wrapper');
    
    if (dropdown && userInfoWrapper && dropdown.classList.contains('show')) {
        if (!userInfoWrapper.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    }
    
    // Close sidebar when clicking outside on mobile
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
        if (menuToggle && !menuToggle.contains(event.target) && !sidebar.contains(event.target)) {
            sidebar.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (window.innerWidth > 768 && sidebar) {
        sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadAdminData();
    
    // Stat cards navigation
    /*const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page) navigateTo(page);
        });
    });*/
    
    // Action cards navigation
    const actionCards = document.querySelectorAll('.action-card');
    actionCards.forEach(card => {
        card.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page) navigateTo(page);
        });
    });
});