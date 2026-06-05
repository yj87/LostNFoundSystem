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

// Toggle user dropdown menu
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdownMenu');
    dropdown.classList.toggle('show');
}

// Add click event listeners
document.addEventListener('DOMContentLoaded', function() {
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