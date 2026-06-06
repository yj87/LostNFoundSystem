// profile.js - Complete Version

let currentUserData = null;

document.addEventListener('DOMContentLoaded', function() {
    loadProfile();
    setupEventListeners();
});

function loadProfile() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const profileForm = document.getElementById('profileForm');
    
    // Show loading spinner
    if (loadingSpinner) loadingSpinner.classList.remove('d-none');
    
    fetch('get_profile_data.php')
        .then(response => response.json())
        .then(data => {
            if (loadingSpinner) loadingSpinner.classList.add('d-none');
            
            if (data.success) {
                currentUserData = data.data;
                displayProfile(data);
                if (profileForm) profileForm.classList.remove('d-none');
            } else {
                showNotification('danger', 'Failed to load profile: ' + data.message);
                // Show form anyway with error state
                if (profileForm) profileForm.classList.remove('d-none');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            if (loadingSpinner) loadingSpinner.classList.add('d-none');
            showNotification('danger', 'Failed to load profile: ' + error.message);
            // Show form anyway with error state
            if (profileForm) profileForm.classList.remove('d-none');
        });
}

function displayProfile(data) {
    const user = data.data;
    const role = data.role;
    const stats = data.stats || {};
    
    // Update sidebar
    const userFullName = document.getElementById('userFullName');
    const usernameSpan = document.getElementById('username');
    const userRoleSpan = document.getElementById('userRole');
    const memberSinceSpan = document.getElementById('memberSince');
    
    if (userFullName) userFullName.textContent = user.name;
    if (usernameSpan) usernameSpan.textContent = user.username;
    if (userRoleSpan) userRoleSpan.innerHTML = getRoleBadge(role);
    if (memberSinceSpan) memberSinceSpan.textContent = formatDate(user.created_at);
    
    // Update form fields
    const userIdInput = document.getElementById('userId');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const usernameDisplay = document.getElementById('username_display');
    
    if (userIdInput) userIdInput.value = user.user_id;
    if (nameInput) nameInput.value = user.name;
    if (emailInput) emailInput.value = user.email;
    if (phoneInput) phoneInput.value = user.phone || '';
    if (usernameDisplay) usernameDisplay.value = user.username;
    
    // Display role-specific stats
    displayStats(role, stats);
}

function getRoleBadge(role) {
    const badges = {
        'admin': '<span class="badge bg-danger">Admin</span>',
        'staff': '<span class="badge bg-warning text-dark">Office Staff</span>',
        'user': '<span class="badge bg-success">Student</span>'
    };
    return badges[role] || '<span class="badge bg-secondary">User</span>';
}

function displayStats(role, stats) {
    const statsContainer = document.getElementById('statsContainer');
    if (!statsContainer) return;
    
    let html = '<h6><i class="fas fa-chart-simple"></i> Quick Stats</h6><ul class="list-unstyled">';
    
    if (role === 'admin' || role === 'staff') {
        html += `
            <li><i class="fas fa-box"></i> My Found Items: <strong>${stats.my_found_items || 0}</strong></li>
            <li><i class="fas fa-clipboard-list"></i> Reviewed Claims: <strong>${stats.reviewed_claims || 0}</strong></li>
        `;
    } else {
        html += `
            <li><i class="fas fa-search"></i> My Lost Reports: <strong>${stats.my_lost_reports || 0}</strong></li>
            <li><i class="fas fa-hand-paper"></i> My Claims: <strong>${stats.my_claims || 0}</strong></li>
        `;
    }
    
    html += '</ul>';
    statsContainer.innerHTML = html;
}

function setupEventListeners() {
    // Show/hide password section
    const changePasswordCheck = document.getElementById('changePasswordCheck');
    if (changePasswordCheck) {
        changePasswordCheck.addEventListener('change', function() {
            const passwordSection = document.getElementById('passwordSection');
            if (this.checked) {
                if (passwordSection) passwordSection.classList.remove('d-none');
            } else {
                if (passwordSection) passwordSection.classList.add('d-none');
                clearPasswordFields();
                clearPasswordErrors();
            }
        });
    }
    
    // Form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateProfile();
        });
    }
    
    // Cancel/Reset button
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            resetForm();
        });
    }
}

function updateProfile() {
    clearErrors();
    
    const name = document.getElementById('name')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';
    const phone = document.getElementById('phone')?.value.trim() || '';
    const changePassword = document.getElementById('changePasswordCheck')?.checked || false;
    const currentPassword = document.getElementById('currentPassword')?.value || '';
    const newPassword = document.getElementById('newPassword')?.value || '';
    const confirmPassword = document.getElementById('confirmPassword')?.value || '';
    
    let isValid = true;
    
    // Validation
    if (name === '') {
        showError('nameError', 'Full name is required');
        isValid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === '') {
        showError('emailError', 'Email is required');
        isValid = false;
    } else if (!emailRegex.test(email)) {
        showError('emailError', 'Invalid email format');
        isValid = false;
    }
    
    // Phone validation (optional but if provided, must be valid)
    if (phone !== '') {
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(phone)) {
            showError('phoneError', 'Phone number must be 10-11 digits');
            isValid = false;
        }
    }
    
    if (changePassword) {
        if (currentPassword === '') {
            showError('currentPasswordError', 'Current password is required to change password');
            isValid = false;
        }
        if (newPassword !== '') {
            if (newPassword.length < 8) {
                showError('newPasswordError', 'Password must be at least 8 characters');
                isValid = false;
            }
            if (newPassword !== confirmPassword) {
                showError('confirmPasswordError', 'Passwords do not match');
                isValid = false;
            }
        }
    }
    
    if (!isValid) {
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    }
    
    const formData = new FormData();
    formData.append('user_id', document.getElementById('userId')?.value || '');
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('change_password', changePassword ? '1' : '0');
    
    if (changePassword) {
        formData.append('current_password', currentPassword);
        if (newPassword) {
            formData.append('new_password', newPassword);
        }
    }
    
    fetch('update_profile.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
        }
        
        if (data.success) {
            showNotification('success', data.message);
            // Reload profile data
            setTimeout(() => loadProfile(), 1500);
            // Reset password section
            const changePasswordCheck = document.getElementById('changePasswordCheck');
            const passwordSection = document.getElementById('passwordSection');
            if (changePasswordCheck) changePasswordCheck.checked = false;
            if (passwordSection) passwordSection.classList.add('d-none');
            clearPasswordFields();
        } else {
            showNotification('danger', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
        }
        showNotification('danger', 'An error occurred: ' + error.message);
    });
}

function resetForm() {
    if (currentUserData) {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const changePasswordCheck = document.getElementById('changePasswordCheck');
        const passwordSection = document.getElementById('passwordSection');
        
        if (nameInput) nameInput.value = currentUserData.name;
        if (emailInput) emailInput.value = currentUserData.email;
        if (phoneInput) phoneInput.value = currentUserData.phone || '';
        if (changePasswordCheck) changePasswordCheck.checked = false;
        if (passwordSection) passwordSection.classList.add('d-none');
        
        clearPasswordFields();
        clearErrors();
        clearPasswordErrors();
    }
}

function clearPasswordFields() {
    const currentPassword = document.getElementById('currentPassword');
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    
    if (currentPassword) currentPassword.value = '';
    if (newPassword) newPassword.value = '';
    if (confirmPassword) confirmPassword.value = '';
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
    });
}

function clearPasswordErrors() {
    const errorIds = ['currentPasswordError', 'newPasswordError', 'confirmPasswordError'];
    errorIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
    });
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) element.textContent = message;
}

function showNotification(type, message) {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.alert-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show alert-notification position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    notification.style.maxWidth = '400px';
    notification.style.zIndex = '9999';
    notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    
    const icon = type === 'success' ? 'fa-check-circle' : (type === 'danger' ? 'fa-exclamation-circle' : 'fa-info-circle');
    
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas ${icon} me-2 fs-4"></i>
            <div class="flex-grow-1">${message}</div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
        if (notification && notification.remove) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
    
    // Add click handler for close button
    const closeBtn = notification.querySelector('.btn-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}