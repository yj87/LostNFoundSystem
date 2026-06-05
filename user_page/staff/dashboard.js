// API endpoint
const API_URL = 'staff_dashboard.php';

// Toggle sidebar on mobile
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

// Logout function - CORRECTED PATH
function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '../../../mainpage/logout/logout.php';
    }
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
        document.getElementById('userName').textContent = data.user_name;
        document.getElementById('userAvatar').textContent = data.user_avatar;
        document.getElementById('welcomeMessage').textContent = `Welcome back, ${data.user_name}! Manage found items and review claims.`;
        
        // Update stats with animation
        animateNumber(document.getElementById('myItems'), 0, data.my_items, 500);
        animateNumber(document.getElementById('totalItems'), 0, data.total_items, 500);
        animateNumber(document.getElementById('totalClaims'), 0, data.my_claims, 500);
        animateNumber(document.getElementById('pendingClaims'), 0, data.pending_claims, 500);
        
        // Update copyright year
        document.getElementById('copyright').innerHTML = `© ${data.current_year} Lost & Found System - Universiti Teknologi Malaysia. All rights reserved.`;
        
        // Load recent claims table
        loadRecentClaimsTable(data.recent_claims);
        
        // Load recent items table
        loadRecentItemsTable(data.recent_items);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        document.getElementById('recentClaimsTable').innerHTML = '<tr><td colspan="5" class="text-center" style="color: red;">Error loading data</td></tr>';
        document.getElementById('recentItemsTable').innerHTML = '<tr><td colspan="5" class="text-center" style="color: red;">Error loading data</td></tr>';
    }
}

// Load recent claims table
function loadRecentClaimsTable(claims) {
    const tbody = document.getElementById('recentClaimsTable');
    
    if (claims && claims.length > 0) {
        let html = '';
        claims.forEach(claim => {
            const statusClass = claim.claim_status;
            const statusText = claim.claim_status.charAt(0).toUpperCase() + claim.claim_status.slice(1);
            
            html += `
                <tr>
                    <td>${escapeHtml(claim.item_name)}</td>
                    <td>${escapeHtml(claim.claimant_name)}</td>
                    <td>
                        <span class="status-badge status-${statusClass}">
                            ${statusText}
                        </span>
                    </td>
                    <td>${formatDate(claim.submitted_at)}</td>
                    <td>
                        <a href="staff_review_claim.php?id=${claim.claim_id}" class="btn btn-primary">Review</a>
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
    
    if (items && items.length > 0) {
        let html = '';
        items.forEach(item => {
            const statusClass = item.found_status;
            const statusText = item.found_status.charAt(0).toUpperCase() + item.found_status.slice(1);
            
            html += `
                <tr>
                    <td>${escapeHtml(item.item_name)}</td>
                    <td>${escapeHtml(item.location_found)}</td>
                    <td>${formatDate(item.date_found)}</td>
                    <td>
                        <span class="status-badge status-${statusClass}">
                            ${statusText}
                        </span>
                    </td>
                    <td>
                        <a href="edit_found_item.php?id=${item.item_id}" class="btn btn-primary">Edit</a>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    } else {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No found items yet</td></tr>';
    }
}

// Toggle user dropdown menu
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdownMenu');
    dropdown.classList.toggle('show');
}

// Add click event listeners
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
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.querySelector('.menu-toggle');
        
        if (window.innerWidth <= 768) {
            if (sidebar && !sidebar.contains(event.target) && menuToggle && !menuToggle.contains(event.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
});

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('userDropdownMenu');
    const avatar = document.getElementById('userAvatar');
    
    if (dropdown && avatar) {
        if (!avatar.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    }
});