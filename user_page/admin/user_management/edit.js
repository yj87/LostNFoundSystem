// ============================================
// SIDEBAR & DROPDOWN FUNCTIONS
// ============================================

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const body = document.body;
    
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

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdownMenu');
    if (dropdown) {
        document.querySelectorAll('.user-dropdown-menu.show').forEach(menu => {
            if (menu !== dropdown) menu.classList.remove('show');
        });
        dropdown.classList.toggle('show');
    }
}

function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '../../../mainpage/logout/logout.php';
        return true;
    }
    return false;
}

// ============================================
// LOAD ADMIN INFO
// ============================================

async function loadAdminInfo() {
    try {
        const response = await fetch('admin_info.php');
        const data = await response.json();
        
        if (data.success) {
            const userAvatar = document.getElementById('userAvatar');
            const copyrightEl = document.getElementById('copyright');
            
            if (userAvatar) userAvatar.textContent = data.user_avatar || 'A';
            if (copyrightEl) copyrightEl.innerHTML = `© ${data.current_year || new Date().getFullYear()} Lost & Found System - Universiti Teknologi Malaysia. All rights reserved.`;
        } else {
            const copyrightEl = document.getElementById('copyright');
            if (copyrightEl) {
                copyrightEl.innerHTML = `© ${new Date().getFullYear()} Lost & Found System - Universiti Teknologi Malaysia. All rights reserved.`;
            }
        }
    } catch (error) {
        console.error('Error loading admin info:', error);
        const copyrightEl = document.getElementById('copyright');
        if (copyrightEl) {
            copyrightEl.innerHTML = `© ${new Date().getFullYear()} Lost & Found System - Universiti Teknologi Malaysia. All rights reserved.`;
        }
    }
}

// ============================================
// LOAD USER DATA
// ============================================

// Get user ID from URL
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('id');

if (!userId) {
    window.location.href = 'manage.php';
}

// Load user data
fetch(`get_user.php?id=${userId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('userId').value = data.user.user_id;
            document.getElementById('username').value = data.user.username;
            document.getElementById('name').value = data.user.name;
            document.getElementById('email').value = data.user.email;
            document.getElementById('phone').value = data.user.phone || '';
            document.getElementById('role').value = data.user.role;
        } else {
            showAlert(data.message, 'danger');
            setTimeout(() => {
                window.location.href = 'manage.php';
            }, 2000);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('Error loading user data', 'danger');
        setTimeout(() => {
            window.location.href = 'manage.php';
        }, 2000);
    });

// ============================================
// FORM SUBMISSION (POST Method)
// ============================================

function showAlert(message, type) {
    const alertDiv = document.getElementById('alertMessage');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        alertDiv.style.display = 'none';
    }, 5000);
}

document.getElementById('editUserForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Hide previous alert
    document.getElementById('alertMessage').style.display = 'none';
    
    // Validate form
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (!name || !email) {
        showAlert('Name and email are required fields', 'danger');
        return;
    }
    
    if (password && password.length < 6) {
        showAlert('Password must be at least 6 characters', 'danger');
        return;
    }
    
    // Show loading state
    const submitBtn = document.getElementById('submitBtn');
    const btnSpan = submitBtn.querySelector('span:first-child');
    const spinner = submitBtn.querySelector('.spinner');
    btnSpan.style.display = 'none';
    spinner.style.display = 'inline-block';
    submitBtn.disabled = true;
    
    try {
        // Create FormData object for POST submission
        const formData = new FormData(this);
        
        // Send data via POST to update.php
        const response = await fetch('update.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert(result.message, 'success');
            setTimeout(() => {
                window.location.href = 'manage.php';
            }, 1500);
        } else {
            showAlert(result.message, 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Network error. Please try again.', 'danger');
    } finally {
        btnSpan.style.display = 'inline-flex';
        spinner.style.display = 'none';
        submitBtn.disabled = false;
    }
});

// ============================================
// EVENT LISTENERS
// ============================================

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

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadAdminInfo();
});