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
// FORM VALIDATION FUNCTIONS
// ============================================

let isUsernameValid = false;
let isNameValid = false;
let isEmailValid = false;
let isPhoneValid = true;
let isPasswordValid = false;
let isConfirmValid = false;

function validateUsername() {
    const username = document.getElementById('username').value.trim();
    const usernameHint = document.getElementById('usernameHint');
    
    if (username === '') {
        usernameHint.textContent = 'Username is required';
        usernameHint.classList.add('visible', 'invalid-hint');
        usernameHint.classList.remove('valid-hint');
        document.getElementById('username').classList.add('invalid');
        document.getElementById('username').classList.remove('valid');
        isUsernameValid = false;
        return false;
    }
    
    if (username.length < 3) {
        usernameHint.textContent = 'Username must be at least 3 characters';
        usernameHint.classList.add('visible', 'invalid-hint');
        usernameHint.classList.remove('valid-hint');
        document.getElementById('username').classList.add('invalid');
        document.getElementById('username').classList.remove('valid');
        isUsernameValid = false;
        return false;
    }
    
    usernameHint.textContent = '✓ Username looks good';
    usernameHint.classList.add('visible', 'valid-hint');
    usernameHint.classList.remove('invalid-hint');
    document.getElementById('username').classList.add('valid');
    document.getElementById('username').classList.remove('invalid');
    isUsernameValid = true;
    return true;
}

function validateName() {
    const name = document.getElementById('name').value.trim();
    const nameHint = document.getElementById('nameHint');
    
    if (name === '') {
        nameHint.textContent = 'Full name is required';
        nameHint.classList.add('visible', 'invalid-hint');
        nameHint.classList.remove('valid-hint');
        document.getElementById('name').classList.add('invalid');
        document.getElementById('name').classList.remove('valid');
        isNameValid = false;
        return false;
    }
    
    if (name.length < 2) {
        nameHint.textContent = 'Name must be at least 2 characters';
        nameHint.classList.add('visible', 'invalid-hint');
        nameHint.classList.remove('valid-hint');
        document.getElementById('name').classList.add('invalid');
        document.getElementById('name').classList.remove('valid');
        isNameValid = false;
        return false;
    }
    
    nameHint.textContent = '✓ Valid name';
    nameHint.classList.add('visible', 'valid-hint');
    nameHint.classList.remove('invalid-hint');
    document.getElementById('name').classList.add('valid');
    document.getElementById('name').classList.remove('invalid');
    isNameValid = true;
    return true;
}

function validateEmail() {
    const email = document.getElementById('email').value.trim();
    const emailHint = document.getElementById('emailHint');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email === '') {
        emailHint.textContent = 'Email is required';
        emailHint.classList.add('visible', 'invalid-hint');
        emailHint.classList.remove('valid-hint');
        document.getElementById('email').classList.add('invalid');
        document.getElementById('email').classList.remove('valid');
        isEmailValid = false;
        return false;
    }
    
    if (!emailRegex.test(email)) {
        emailHint.textContent = 'Please enter a valid email address';
        emailHint.classList.add('visible', 'invalid-hint');
        emailHint.classList.remove('valid-hint');
        document.getElementById('email').classList.add('invalid');
        document.getElementById('email').classList.remove('valid');
        isEmailValid = false;
        return false;
    }
    
    emailHint.textContent = '✓ Valid email';
    emailHint.classList.add('visible', 'valid-hint');
    emailHint.classList.remove('invalid-hint');
    document.getElementById('email').classList.add('valid');
    document.getElementById('email').classList.remove('invalid');
    isEmailValid = true;
    return true;
}

function validatePhone() {
    const phone = document.getElementById('phone').value.trim();
    const phoneHint = document.getElementById('phoneHint');
    const phoneRegex = /^[0-9\-+\s]{0,15}$/;
    
    if (phone === '') {
        phoneHint.classList.remove('visible');
        document.getElementById('phone').classList.remove('valid', 'invalid');
        isPhoneValid = true;
        return true;
    }
    
    if (!phoneRegex.test(phone)) {
        phoneHint.textContent = 'Enter a valid phone number';
        phoneHint.classList.add('visible', 'invalid-hint');
        phoneHint.classList.remove('valid-hint');
        document.getElementById('phone').classList.add('invalid');
        document.getElementById('phone').classList.remove('valid');
        isPhoneValid = false;
        return false;
    }
    
    phoneHint.textContent = '✓ Valid phone number';
    phoneHint.classList.add('visible', 'valid-hint');
    phoneHint.classList.remove('invalid-hint');
    document.getElementById('phone').classList.add('valid');
    document.getElementById('phone').classList.remove('invalid');
    isPhoneValid = true;
    return true;
}

function validatePassword() {
    const password = document.getElementById('password').value;
    const passwordHint = document.getElementById('passwordHint');
    
    if (password === '') {
        passwordHint.textContent = 'Password is required';
        passwordHint.classList.add('visible', 'invalid-hint');
        passwordHint.classList.remove('valid-hint');
        document.getElementById('password').classList.add('invalid');
        document.getElementById('password').classList.remove('valid');
        isPasswordValid = false;
        return false;
    }
    
    if (password.length < 6) {
        passwordHint.textContent = 'Password must be at least 6 characters';
        passwordHint.classList.add('visible', 'invalid-hint');
        passwordHint.classList.remove('valid-hint');
        document.getElementById('password').classList.add('invalid');
        document.getElementById('password').classList.remove('valid');
        isPasswordValid = false;
        return false;
    }
    
    passwordHint.textContent = '✓ Password is strong enough';
    passwordHint.classList.add('visible', 'valid-hint');
    passwordHint.classList.remove('invalid-hint');
    document.getElementById('password').classList.add('valid');
    document.getElementById('password').classList.remove('invalid');
    isPasswordValid = true;
    
    validateConfirmPassword();
    return true;
}

function validateConfirmPassword() {
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm_password').value;
    const confirmHint = document.getElementById('confirmHint');
    
    if (confirm === '') {
        confirmHint.textContent = 'Please confirm your password';
        confirmHint.classList.add('visible', 'invalid-hint');
        confirmHint.classList.remove('valid-hint');
        document.getElementById('confirm_password').classList.add('invalid');
        document.getElementById('confirm_password').classList.remove('valid');
        isConfirmValid = false;
        return false;
    }
    
    if (password !== confirm) {
        confirmHint.textContent = 'Passwords do not match';
        confirmHint.classList.add('visible', 'invalid-hint');
        confirmHint.classList.remove('valid-hint');
        document.getElementById('confirm_password').classList.add('invalid');
        document.getElementById('confirm_password').classList.remove('valid');
        isConfirmValid = false;
        return false;
    }
    
    confirmHint.textContent = '✓ Passwords match';
    confirmHint.classList.add('visible', 'valid-hint');
    confirmHint.classList.remove('invalid-hint');
    document.getElementById('confirm_password').classList.add('valid');
    document.getElementById('confirm_password').classList.remove('invalid');
    isConfirmValid = true;
    return true;
}

// ============================================
// EVENT LISTENERS FOR VALIDATION
// ============================================

document.getElementById('username').addEventListener('blur', validateUsername);
document.getElementById('name').addEventListener('blur', validateName);
document.getElementById('email').addEventListener('blur', validateEmail);
document.getElementById('phone').addEventListener('blur', validatePhone);
document.getElementById('password').addEventListener('blur', validatePassword);
document.getElementById('confirm_password').addEventListener('blur', validateConfirmPassword);
document.getElementById('confirm_password').addEventListener('input', validateConfirmPassword);
document.getElementById('password').addEventListener('input', validatePassword);

// ============================================
// SHOW ALERT FUNCTION
// ============================================

function showAlert(message, type) {
    const alertDiv = document.getElementById('alertMessage');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.display = 'block';
    
    setTimeout(() => {
        alertDiv.style.display = 'none';
    }, 5000);
}

// ============================================
// FORM SUBMISSION
// ============================================

document.getElementById('addUserForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Run all validations
    validateUsername();
    validateName();
    validateEmail();
    validatePhone();
    validatePassword();
    validateConfirmPassword();
    
    // Final validation check
    if (!isUsernameValid || !isNameValid || !isEmailValid || !isPasswordValid || !isConfirmValid) {
        showAlert('Please fix all validation errors before submitting', 'danger');
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    const btnSpan = submitBtn.querySelector('span:first-child');
    const spinner = submitBtn.querySelector('.spinner');
    btnSpan.style.display = 'none';
    spinner.style.display = 'inline-block';
    submitBtn.disabled = true;
    
    try {
        const formData = new FormData(this);
        
        const response = await fetch('add.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert(result.message, 'success');
            setTimeout(() => {
                window.location.href = 'manage.html';
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
// CLOSE DROPDOWN WHEN CLICKING OUTSIDE
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

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadAdminInfo();
});