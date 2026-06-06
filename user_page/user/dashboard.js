// API endpoint
const API_URL = 'user_dashboard.php';

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
        window.location.href = '../../../mainpage/logout/logout.php';
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

// Get status badge class
function getStatusBadgeClass(status) {
    switch(status) {
        case 'searching': return 'status-searching';
        case 'found': return 'status-found';
        case 'closed': return 'status-closed';
        case 'pending': return 'status-pending';
        case 'approved': return 'status-approved';
        case 'rejected': return 'status-rejected';
        default: return 'status-default';
    }
}

// Get status text
function getStatusText(status) {
    switch(status) {
        case 'searching': return 'Searching';
        case 'found': return 'Found';
        case 'closed': return 'Closed';
        case 'pending': return 'Pending';
        case 'approved': return 'Approved';
        case 'rejected': return 'Rejected';
        default: return status;
    }
}

// Load dashboard data from PHP API
async function loadDashboardData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (!data.success) {
            console.error('Failed to load data');
            return;
        }
        
        // Update user info
        const userAvatar = document.getElementById('userAvatar');
        const welcomeMsg = document.getElementById('welcomeMessage');
        
        if (userAvatar) userAvatar.textContent = data.user_avatar;
        if (welcomeMsg) welcomeMsg.textContent = `Welcome back, ${data.user_name}! Track your lost items and claims here.`;
        
        // Update stats with animation
        const lostReportsEl = document.getElementById('lostReports');
        const totalClaimsEl = document.getElementById('totalClaims');
        const pendingClaimsEl = document.getElementById('pendingClaims');
        const approvedClaimsEl = document.getElementById('approvedClaims');
        const availableItemsEl = document.getElementById('availableItems');
        
        if (lostReportsEl) animateNumber(lostReportsEl, 0, data.my_lost_reports, 500);
        if (totalClaimsEl) animateNumber(totalClaimsEl, 0, data.my_claims, 500);
        if (pendingClaimsEl) animateNumber(pendingClaimsEl, 0, data.pending_claims, 500);
        if (approvedClaimsEl) animateNumber(approvedClaimsEl, 0, data.approved_claims, 500);
        if (availableItemsEl) animateNumber(availableItemsEl, 0, data.available_items, 500);
        
        // Update copyright year
        const copyrightEl = document.getElementById('copyright');
        if (copyrightEl) copyrightEl.innerHTML = `© ${data.current_year} Lost & Found System - Universiti Teknologi Malaysia. All rights reserved.`;
        
        // Load recent lost reports table
        loadRecentLostTable(data.recent_lost);
        
        // Load recent claims table
        loadRecentClaimsTable(data.recent_claims);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        const lostTable = document.getElementById('recentLostTable');
        const claimsTable = document.getElementById('recentClaimsTable');
        if (lostTable) lostTable.innerHTML = '<tr><td colspan="5" class="text-center" style="color: red;">Error loading data</td></tr>';
        if (claimsTable) claimsTable.innerHTML = '<tr><td colspan="4" class="text-center" style="color: red;">Error loading data</td></tr>';
    }
}

// Load recent lost reports table
function loadRecentLostTable(lostReports) {
    const tbody = document.getElementById('recentLostTable');
    if (!tbody) return;
    
    if (lostReports && lostReports.length > 0) {
        let html = '';
        lostReports.forEach(report => {
            const statusClass = getStatusBadgeClass(report.lost_status);
            const statusText = getStatusText(report.lost_status);
            
            html += `
                <tr>
                    <td>${escapeHtml(report.item_name)}</td>
                    <td>${escapeHtml(report.location_lost)}</td>
                    <td>${formatDate(report.date_lost)}</td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            ${statusText}
                        </span>
                    </td>
                    <td>
                        <a href="item_details.php?id=${report.report_id}&type=lost" class="btn btn-primary">View Details</a>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    } else {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No lost reports found</td></tr>';
    }
}

// Load recent claims table
function loadRecentClaimsTable(claims) {
    const tbody = document.getElementById('recentClaimsTable');
    if (!tbody) return;
    
    if (claims && claims.length > 0) {
        let html = '';
        claims.forEach(claim => {
            const statusClass = getStatusBadgeClass(claim.claim_status);
            const statusText = getStatusText(claim.claim_status);
            
            html += `
                <tr>
                    <td>${escapeHtml(claim.item_name)}</td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            ${statusText}
                        </span>
                    </td>
                    <td>${formatDate(claim.submitted_at)}</td>
                    <td>
                        <a href="claim_details.php?id=${claim.claim_id}" class="btn btn-primary">View Details</a>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    } else {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No claims found</td></tr>';
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('userDropdownMenu');
    const avatar = document.getElementById('userAvatar');
    
    if (dropdown && avatar && dropdown.classList.contains('show')) {
        if (!avatar.contains(event.target) && !dropdown.contains(event.target)) {
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
    // Load all data
    loadDashboardData();
    
    // Stat cards navigation
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page) navigateTo(page);
        });
    });
    
    // Action cards navigation
    const actionCards = document.querySelectorAll('.action-card');
    actionCards.forEach(card => {
        card.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page) navigateTo(page);
        });
    });
});