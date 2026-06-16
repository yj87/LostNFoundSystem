// Store current search term
let currentSearch = '';
let searchTimeout; // For debouncing

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
            const welcomeMsg = document.getElementById('welcomeMessage');
            const copyrightEl = document.getElementById('copyright');
            
            if (userAvatar) userAvatar.textContent = data.user_avatar || 'A';
            if (welcomeMsg) welcomeMsg.textContent = `Welcome back, ${data.user_name}! Manage all registered users here.`;
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
// USER MANAGEMENT FUNCTIONS
// ============================================

function loadUsers() {
    let url = 'get.php';
    if (currentSearch) {
        url = `search.php?search=${encodeURIComponent(currentSearch)}`;
    }
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('userTableBody').innerHTML = `<tr><td colspan="8" class="text-center text-danger">${data.error}</td></tr>`;
                return;
            }
            displayUsers(data);
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('userTableBody').innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error loading users</td></tr>';
        });
}

// NEW: Real-time search while typing with debouncing
function searchUsersRealTime() {
    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // Set new timeout (300ms delay after user stops typing)
    searchTimeout = setTimeout(() => {
        currentSearch = document.getElementById('searchInput').value.trim();
        loadUsers(); // Reload with search term
    }, 300); // 300ms delay before searching
}

// Manual search function (if needed)
function searchUsers() {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    currentSearch = document.getElementById('searchInput').value.trim();
    loadUsers();
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    currentSearch = '';
    loadUsers();
}

function displayUsers(users) {
    const tbody = document.getElementById('userTableBody');
    
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">No users found</td></tr>';
        return;
    }
    
    let html = '';
    users.forEach(user => {
        const roleClass = getRoleBadgeClass(user.role);
        const roleDisplay = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User';
        
        html += `
            <tr>
                <td>${escapeHtml(String(user.user_id))}</td>
                <td>${escapeHtml(user.username)}</td>
                <td>${escapeHtml(user.name)}</td>
                <td>${escapeHtml(user.email)}</td>
                <td><span class="role-badge ${roleClass}">${roleDisplay}</span></td>
                <td>${user.phone ? escapeHtml(user.phone) : '-'}</td>
                <td>${user.created_at || '-'}</td>
                <td class="action-buttons" style="text-align: center;">
                    <a href="edit.php?id=${user.user_id}" class="btn-edit"><i class="fas fa-edit"></i> Edit</a>
                    <button onclick="deleteUser(${user.user_id}, '${escapeHtml(user.username)}')" class="btn-delete"><i class="fas fa-trash"></i>Delete</button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function deleteUser(id, username) {
    if (confirm(`Are you sure you want to delete user "${username}"?`)) {
        fetch('delete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `id=${id}`
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert(result.message);
                loadUsers();
            } else {
                alert('Error: ' + result.message);
            }
        })
        .catch(error => {
            alert('Network error. Please try again.');
        });
    }
}

function getRoleBadgeClass(role) {
    if (!role) return 'role-user';
    switch(role.toLowerCase()) {
        case 'admin': return 'role-admin';
        case 'staff': return 'role-staff';
        case 'user': return 'role-user';
        default: return 'role-user';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('click', function(event) {
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
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});

window.addEventListener('resize', function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (window.innerWidth > 768 && sidebar) {
        sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// IMPORTANT: Change from 'keyup' to 'input' for real-time search
document.getElementById('searchInput').addEventListener('input', function(e) {
    searchUsersRealTime(); // This triggers search while typing
});

// Optional: Keep Enter key support as well
document.getElementById('searchInput').addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
        // Clear timeout and search immediately on Enter
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        searchUsers();
    }
});

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadAdminInfo();
    loadUsers();
});