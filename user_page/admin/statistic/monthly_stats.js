// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    let overlay = document.querySelector('.sidebar-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.onclick = function() {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };
        document.body.appendChild(overlay);
    }
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    
    if (window.innerWidth <= 768) {
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    }
}

// Toggle user dropdown
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdownMenu');
    if (dropdown) {
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

// Format trend display
function formatTrend(change, trend) {
    const arrow = trend === 'up' ? '↑' : '↓';
    const colorClass = trend === 'up' ? 'trend-up' : 'trend-down';
    const changeAbs = Math.abs(change);
    return `<span class="${colorClass}">${arrow} ${changeAbs}%</span>`;
}

// Load monthly data
async function loadMonthlyData() {
    try {
        const response = await fetch('monthly_stats.php');
        const data = await response.json();
        
        if (data.success) {
            // Update user avatar and welcome message
            const userAvatar = document.getElementById('userAvatar');
            const welcomeMsg = document.getElementById('welcomeMessage');
            const copyrightEl = document.getElementById('copyright');
            const monthTitle = document.getElementById('monthTitle');
            const chartMonth = document.getElementById('chartMonth');
            
            if (userAvatar) userAvatar.textContent = data.user_avatar;
            if (welcomeMsg) welcomeMsg.textContent = `Welcome back, ${data.user_name}! Here are the statistics for ${data.month_name}.`;
            if (copyrightEl) copyrightEl.innerHTML = `© ${data.current_year} Lost & Found System - Universiti Teknologi Malaysia. All rights reserved.`;
            if (monthTitle) monthTitle.innerHTML = `<i class="fas fa-calendar-alt"></i> ${data.month_name}`;
            if (chartMonth) chartMonth.textContent = data.month_name;
            
            // Update stats cards with animations
            const stats = data.stats;
            
            const lostEl = document.getElementById('lostReports');
            const foundEl = document.getElementById('foundItems');
            const claimsEl = document.getElementById('claimsCount');
            const usersEl = document.getElementById('newUsers');
            
            if (lostEl) animateNumber(lostEl, 0, stats.lost_reports.current, 500);
            if (foundEl) animateNumber(foundEl, 0, stats.found_items.current, 500);
            if (claimsEl) animateNumber(claimsEl, 0, stats.claims.current, 500);
            if (usersEl) animateNumber(usersEl, 0, stats.new_users.current, 500);
            
            // Update comparison texts
            const lostComparison = document.getElementById('lostComparison');
            const foundComparison = document.getElementById('foundComparison');
            const claimsComparison = document.getElementById('claimsComparison');
            const usersComparison = document.getElementById('usersComparison');
            
            if (lostComparison) lostComparison.innerHTML = `vs last month ${formatTrend(stats.lost_reports.change, stats.lost_reports.trend)}`;
            if (foundComparison) foundComparison.innerHTML = `vs last month ${formatTrend(stats.found_items.change, stats.found_items.trend)}`;
            if (claimsComparison) claimsComparison.innerHTML = `vs last month ${formatTrend(stats.claims.change, stats.claims.trend)}`;
            if (usersComparison) usersComparison.innerHTML = `vs last month ${formatTrend(stats.new_users.change, stats.new_users.trend)}`;
            
            // Render bar chart
            renderBarChart(data.daily_stats, data.total_days);
        }
    } catch (error) {
        console.error('Error loading monthly data:', error);
        const chartContainer = document.getElementById('barChart');
        if (chartContainer) chartContainer.innerHTML = '<div class="loading-spinner" style="color: red;">Error loading data</div>';
    }
}

// Render bar chart
function renderBarChart(dailyStats, totalDays) {
    const chartContainer = document.getElementById('barChart');
    if (!chartContainer) return;
    
    // Find max value for scaling
    let maxValue = 0;
    for (let day = 1; day <= totalDays; day++) {
        const stats = dailyStats[day];
        maxValue = Math.max(maxValue, stats.lost, stats.found, stats.claims, stats.users);
    }
    maxValue = maxValue === 0 ? 1 : maxValue;
    
    let html = '';
    for (let day = 1; day <= totalDays; day++) {
        const stats = dailyStats[day];
        const lostHeight = (stats.lost / maxValue) * 80;
        const foundHeight = (stats.found / maxValue) * 80;
        const claimsHeight = (stats.claims / maxValue) * 80;
        const usersHeight = (stats.users / maxValue) * 80;
        
        html += `
            <div class="bar-group">
                <div class="bars">
                    ${stats.lost > 0 ? `<div class="bar-value">${stats.lost}</div>` : ''}
                    <div class="bar bar-lost" style="height: ${lostHeight}px; width: 100%;"></div>
                    ${stats.found > 0 ? `<div class="bar-value">${stats.found}</div>` : ''}
                    <div class="bar bar-found" style="height: ${foundHeight}px; width: 100%;"></div>
                    ${stats.claims > 0 ? `<div class="bar-value">${stats.claims}</div>` : ''}
                    <div class="bar bar-claims" style="height: ${claimsHeight}px; width: 100%;"></div>
                    ${stats.users > 0 ? `<div class="bar-value">${stats.users}</div>` : ''}
                    <div class="bar bar-users" style="height: ${usersHeight}px; width: 100%;"></div>
                </div>
                <div class="bar-label">Day ${day}</div>
            </div>
        `;
    }
    
    chartContainer.innerHTML = html;
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
    loadMonthlyData();
});