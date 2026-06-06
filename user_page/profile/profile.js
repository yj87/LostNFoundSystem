// profile.js

let currentUserData = null;

document.addEventListener('DOMContentLoaded', function() {
    loadProfile();
    setupEventListeners();
});

function loadProfile() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const profileForm = document.getElementById('profileForm');
    
    fetch('profile.php')
        .then(response => response.json())
        .then(data => {
            loadingSpinner.classList.add('d-none');
            
            if (data.success) {
                currentUserData = data.data;
                displayProfile(data);
                profileForm.classList.remove('d-none');
            } else {
                showError('Failed to load profile: ' + data.message);
            }
        })
        .catch(error => {
            loadingSpinner.classList.add('d-none');
            showError('Failed to load profile: ' + error.message);
        });
}

function displayProfile(data) {
    const user = data.data;
    const role = data.role;
    const stats = data.stats || {};
    
    // Update sidebar
    document.getElementById('userFullName').textContent = user.name;
    document.getElementById('username').textContent = user.username;
    document.getElementById('userRole').innerHTML = getRoleBadge(role);
    document.getElementById('memberSince').textContent = formatDate(user.created_at);
    
    // Update form fields
    document.getElementById('userId').value = user.user_id;
    document.getElementById('name').value = user.name;
    document.getElementById('email').value = user.email;
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('username_display').value = user.username;
    document.getElementById('displayRole').value = capitalizeFirst(role);
    
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
    changePasswordCheck.addEventListener('change', function() {
        const passwordSection = document.getElementById('passwordSection');
        if (this.checked) {
            passwordSection.classList.remove('d-none');
        } else {
            passwordSection.classList.add('d-none');
            clearPasswordFields();
            clearPasswordErrors();
        }
    });
    
    // Form submission
    const profileForm = document.getElementById('profileForm');
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        updateProfile();
    });
    
    // Cancel/Reset button
    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn.addEventListener('click', function() {
        resetForm();
    });
}

function updateProfile() {
    clearErrors();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const changePassword = document.getElementById('changePasswordCheck').checked;
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
    
    if (isValid) {
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        
        const formData = new FormData();
        formData.append('user_id', document.getElementById('userId').value);
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
        
        fetch('update_profile_process.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
            
            if (data.success) {
                showNotification('success', data.message);
                // Reload profile data
                setTimeout(() => loadProfile(), 1500);
                // Reset password section
                document.getElementById('changePasswordCheck').checked = false;
                document.getElementById('passwordSection').classList.add('d-none');
                clearPasswordFields();
            } else {
                showNotification('danger', data.message);
            }
        })
        .catch(error => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
            showNotification('danger', 'An error occurred');
        });
    }
}

function resetForm() {
    if (currentUserData) {
        document.getElementById('name').value = currentUserData.name;
        document.getElementById('email').value = currentUserData.email;
        document.getElementById('phone').value = currentUserData.phone || '';
        document.getElementById('changePasswordCheck').checked = false;
        document.getElementById('passwordSection').classList.add('d-none');
        clearPasswordFields();
        clearErrors();
        clearPasswordErrors();
    }
}

function clearPasswordFields() {
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
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
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    notification.style.zIndex = '9999';
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}