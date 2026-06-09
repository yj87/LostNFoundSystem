// profile.js
let currentUserData = null;
let currentRole = null;

document.addEventListener('DOMContentLoaded', function() {
    loadProfile();
    setupEventListeners();
});

function loadProfile() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const profileForm = document.getElementById('profileForm');
    
    if (loadingSpinner) loadingSpinner.classList.remove('d-none');
    
    fetch('get_profile_data.php')
        .then(response => response.json())
        .then(data => {
            if (loadingSpinner) loadingSpinner.classList.add('d-none');
            
            if (data.success) {
                currentUserData = data.data;
                currentRole = data.role;
                
                // Apply role to body for CSS theme switching
                document.body.setAttribute('data-role', currentRole);
                
                displayProfile(data);
                if (profileForm) profileForm.classList.remove('d-none');
            } else {
                showAlert('danger', 'Failed to load profile: ' + data.message);
                if (profileForm) profileForm.classList.remove('d-none');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            if (loadingSpinner) loadingSpinner.classList.add('d-none');
            showAlert('danger', 'Failed to load profile: ' + error.message);
            if (profileForm) profileForm.classList.remove('d-none');
        });
}

function displayProfile(data) {
    const user = data.data;
    const role = data.role;
    const stats = data.stats || {};
    
    document.getElementById('userFullName').textContent = user.name;
    document.getElementById('username').textContent = user.username;
    document.getElementById('memberSince').textContent = formatDate(user.created_at);
    document.getElementById('userId').value = user.user_id;
    document.getElementById('name').value = user.name;
    document.getElementById('email').value = user.email;
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('usernameDisplay').value = user.username;
    
    let roleBadge = '';
    if (role === 'admin') {
        roleBadge = '<span class="badge bg-danger">Administrator</span>';
    } else if (role === 'staff') {
        roleBadge = '<span class="badge bg-warning text-dark">Office Staff</span>';
    } else {
        roleBadge = '<span class="badge bg-success">Student</span>';
    }
    document.getElementById('userRoleBadge').innerHTML = roleBadge;
    
    displayStats(role, stats);
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
    document.getElementById('changePasswordCheck').addEventListener('change', function() {
        const passwordSection = document.getElementById('passwordSection');
        passwordSection.classList.toggle('d-none', !this.checked);
        
        if (!this.checked) {
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            clearPasswordErrors();
        }
    });
    
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateProfile();
    });
    
    document.getElementById('cancelBtn').addEventListener('click', function() {
        resetForm();
    });
}

function updateProfile() {
    clearErrors();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const changePassword = document.getElementById('changePasswordCheck').checked;
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    let isValid = true;
    
    if (name === '') {
        document.getElementById('nameError').textContent = 'Full name is required';
        isValid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === '') {
        document.getElementById('emailError').textContent = 'Email is required';
        isValid = false;
    } else if (!emailRegex.test(email)) {
        document.getElementById('emailError').textContent = 'Invalid email format';
        isValid = false;
    }
    
    if (phone !== '') {
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(phone)) {
            document.getElementById('phoneError').textContent = 'Phone number must be 10-11 digits';
            isValid = false;
        }
    }
    
    if (changePassword) {
        if (currentPassword === '') {
            document.getElementById('currentPasswordError').textContent = 'Current password is required';
            isValid = false;
        }
        if (newPassword !== '') {
            if (newPassword.length < 8) {
                document.getElementById('newPasswordError').textContent = 'Password must be at least 8 characters';
                isValid = false;
            }
            if (newPassword !== confirmPassword) {
                document.getElementById('confirmPasswordError').textContent = 'Passwords do not match';
                isValid = false;
            }
        }
    }
    
    if (!isValid) return;
    
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
        if (newPassword) formData.append('new_password', newPassword);
        formData.append('confirm_password', confirmPassword);
    }
    
    fetch('update_profile.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
        
        if (data.success) {
            showAlert('success', data.message);
            setTimeout(() => loadProfile(), 1500);
            
            document.getElementById('changePasswordCheck').checked = false;
            document.getElementById('passwordSection').classList.add('d-none');
            clearPasswordFields();
        } else {
            showAlert('danger', data.message);
        }
    })
    .catch(error => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
        showAlert('danger', 'An error occurred: ' + error.message);
    });
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
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => {
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

function showAlert(type, message) {
    const alertContainer = document.getElementById('alertContainer');
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> 
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv && alertDiv.remove) {
            alertDiv.remove();
        }
    }, 4000);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function goBack() {
  if (window.history.length > 1) {
            window.history.back();
    } else {
     // If no history, redirect to dashboard based on role
        const role = document.body.getAttribute('data-role');
        if (role === 'admin') {
            window.location.href = '../admin_dashboard.html';
        } else if (role === 'staff') {
            window.location.href = 'staff_dashboard.html';
        } else {
            window.location.href = '../user_dashboard.html';
        }
    }
}