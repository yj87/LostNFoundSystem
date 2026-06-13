const registerForm = document.getElementById('registerForm');
const registerBtn = document.getElementById('registerBtn');
const errorDiv = document.getElementById('errorMessage');
const successDiv = document.getElementById('successMessage');
const copyrightElement = document.getElementById('copyright');

// Form field elements
const usernameInput = document.getElementById('username');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirm_password');

// Hint elements
const usernameHint = document.getElementById('usernameHint');
const nameHint = document.getElementById('nameHint');
const emailHint = document.getElementById('emailHint');
const phoneHint = document.getElementById('phoneHint');
const passwordHint = document.getElementById('passwordHint');
const confirmHint = document.getElementById('confirmHint');

// Validation state tracking
let isUsernameValid = false;
let isNameValid = false;
let isEmailValid = false;
let isPhoneValid = true;
let isPasswordValid = false;
let isConfirmValid = false;

// ========== onBlur Validation Functions ==========

// Validate Username
function validateUsername() {
    const username = usernameInput.value.trim();
    
    if (username === '') {
        usernameHint.textContent = 'Username is required';
        usernameHint.classList.add('visible', 'invalid-hint');
        usernameHint.classList.remove('valid-hint');
        usernameInput.classList.add('invalid');
        usernameInput.classList.remove('valid');
        isUsernameValid = false;
        usernameInput.focus();
        return false;
    }
    
    if (username.length < 3) {
        usernameHint.textContent = 'Username must be at least 3 characters';
        usernameHint.classList.add('visible', 'invalid-hint');
        usernameHint.classList.remove('valid-hint');
        usernameInput.classList.add('invalid');
        usernameInput.classList.remove('valid');
        isUsernameValid = false;
        usernameInput.focus();
        return false;
    }
    
    usernameHint.textContent = '✓ Username looks good';
    usernameHint.classList.add('visible', 'valid-hint');
    usernameHint.classList.remove('invalid-hint');
    usernameInput.classList.add('valid');
    usernameInput.classList.remove('invalid');
    isUsernameValid = true;
    return true;
}

// Validate Full Name
function validateName() {
    const name = nameInput.value.trim();
    
    if (name === '') {
        nameHint.textContent = 'Full name is required';
        nameHint.classList.add('visible', 'invalid-hint');
        nameHint.classList.remove('valid-hint');
        nameInput.classList.add('invalid');
        nameInput.classList.remove('valid');
        isNameValid = false;
        nameInput.focus();
        return false;
    }
    
    if (name.length < 2) {
        nameHint.textContent = 'Name must be at least 2 characters';
        nameHint.classList.add('visible', 'invalid-hint');
        nameHint.classList.remove('valid-hint');
        nameInput.classList.add('invalid');
        nameInput.classList.remove('valid');
        isNameValid = false;
        nameInput.focus();
        return false;
    }
    
    nameHint.textContent = '✓ Valid name';
    nameHint.classList.add('visible', 'valid-hint');
    nameHint.classList.remove('invalid-hint');
    nameInput.classList.add('valid');
    nameInput.classList.remove('invalid');
    isNameValid = true;
    return true;
}

// Validate Email
// Validate Email - Accept any valid email
function validateEmail() {
    const email = emailInput.value.trim();
    // Standard email regex that accepts any valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email === '') {
        emailHint.textContent = 'Email is required';
        emailHint.classList.add('visible', 'invalid-hint');
        emailHint.classList.remove('valid-hint');
        emailInput.classList.add('invalid');
        emailInput.classList.remove('valid');
        isEmailValid = false;
        emailInput.focus();
        return false;
    }
    
    if (!emailRegex.test(email)) {
        emailHint.textContent = 'Please use a valid email address (example: name@domain.com)';
        emailHint.classList.add('visible', 'invalid-hint');
        emailHint.classList.remove('valid-hint');
        emailInput.classList.add('invalid');
        emailInput.classList.remove('valid');
        isEmailValid = false;
        emailInput.focus();
        return false;
    }
    
    emailHint.textContent = '✓ Valid email';
    emailHint.classList.add('visible', 'valid-hint');
    emailHint.classList.remove('invalid-hint');
    emailInput.classList.add('valid');
    emailInput.classList.remove('invalid');
    isEmailValid = true;
    return true;
}

// Validate Phone (optional)
function validatePhone() {
    const phone = phoneInput.value.trim();
    const phoneRegex = /^[0-9\-+\s]{0,15}$/;
    
    if (phone === '') {
        phoneHint.classList.remove('visible');
        phoneInput.classList.remove('valid', 'invalid');
        isPhoneValid = true;
        return true;
    }
    
    if (!phoneRegex.test(phone)) {
        phoneHint.textContent = 'Enter a valid phone number';
        phoneHint.classList.add('visible', 'invalid-hint');
        phoneHint.classList.remove('valid-hint');
        phoneInput.classList.add('invalid');
        phoneInput.classList.remove('valid');
        isPhoneValid = false;
        phoneInput.focus();
        return false;
    }
    
    phoneHint.textContent = '✓ Valid phone number';
    phoneHint.classList.add('visible', 'valid-hint');
    phoneHint.classList.remove('invalid-hint');
    phoneInput.classList.add('valid');
    phoneInput.classList.remove('invalid');
    isPhoneValid = true;
    return true;
}

// Validate Password
function validatePassword() {
    const password = passwordInput.value;
    
    if (password === '') {
        passwordHint.textContent = 'Password is required';
        passwordHint.classList.add('visible', 'invalid-hint');
        passwordHint.classList.remove('valid-hint');
        passwordInput.classList.add('invalid');
        passwordInput.classList.remove('valid');
        isPasswordValid = false;
        passwordInput.focus();
        return false;
    }
    
    if (password.length < 6) {
        passwordHint.textContent = 'Password must be at least 6 characters';
        passwordHint.classList.add('visible', 'invalid-hint');
        passwordHint.classList.remove('valid-hint');
        passwordInput.classList.add('invalid');
        passwordInput.classList.remove('valid');
        isPasswordValid = false;
        passwordInput.focus();
        return false;
    }
    
    passwordHint.textContent = '✓ Strong enough';
    passwordHint.classList.add('visible', 'valid-hint');
    passwordHint.classList.remove('invalid-hint');
    passwordInput.classList.add('valid');
    passwordInput.classList.remove('invalid');
    isPasswordValid = true;
    
    // Also re-validate confirm password
    validateConfirmPassword();
    return true;
}

// Validate Confirm Password
function validateConfirmPassword() {
    const password = passwordInput.value;
    const confirm = confirmInput.value;
    
    if (confirm === '') {
        confirmHint.textContent = 'Please confirm your password';
        confirmHint.classList.add('visible', 'invalid-hint');
        confirmHint.classList.remove('valid-hint');
        confirmInput.classList.add('invalid');
        confirmInput.classList.remove('valid');
        isConfirmValid = false;
        confirmInput.focus();
        return false;
    }
    
    if (password !== confirm) {
        confirmHint.textContent = 'Passwords do not match';
        confirmHint.classList.add('visible', 'invalid-hint');
        confirmHint.classList.remove('valid-hint');
        confirmInput.classList.add('invalid');
        confirmInput.classList.remove('valid');
        isConfirmValid = false;
        confirmInput.focus();
        return false;
    }
    
    confirmHint.textContent = '✓ Passwords match';
    confirmHint.classList.add('visible', 'valid-hint');
    confirmHint.classList.remove('invalid-hint');
    confirmInput.classList.add('valid');
    confirmInput.classList.remove('invalid');
    isConfirmValid = true;
    return true;
}

// ========== Event Listeners (onBlur) ==========
usernameInput.addEventListener('blur', validateUsername);
nameInput.addEventListener('blur', validateName);
emailInput.addEventListener('blur', validateEmail);
phoneInput.addEventListener('blur', validatePhone);
passwordInput.addEventListener('blur', validatePassword);
confirmInput.addEventListener('blur', validateConfirmPassword);

// Real-time validation for password match
confirmInput.addEventListener('input', validateConfirmPassword);
passwordInput.addEventListener('input', function() {
    if (passwordInput.value.length > 0) {
        validatePassword();
    }
});

// Show error message
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Show success message
function showSuccess(message) {
    successDiv.textContent = message;
    successDiv.style.display = 'block';
}

// Set default copyright
function setDefaultCopyright() {
    if (copyrightElement) {
        copyrightElement.innerHTML = `&copy; ${new Date().getFullYear()} Lost & Found System - Universiti Teknologi Malaysia. All rights reserved. <i class="fas fa-heart" style="color: #F5A65B;"></i>`;
    }
}

// ========== Form Submission with POST Method to register.php ==========
registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    // Run all validations
    validateUsername();
    validateName();
    validateEmail();
    validatePhone();
    validatePassword();
    validateConfirmPassword();
    
    // Final validation (removed terms check)
    if (!isUsernameValid || !isNameValid || !isEmailValid || !isPasswordValid || !isConfirmValid) {
        showError('Please fix all validation errors before submitting');
        return;
    }
    
    // Show loading state
    const btnSpan = registerBtn.querySelector('span:first-child');
    const spinner = registerBtn.querySelector('.spinner');
    btnSpan.style.display = 'none';
    spinner.style.display = 'inline-block';
    registerBtn.disabled = true;
    
    try {
        // Create FormData object for POST submission
        const formData = new FormData(registerForm);
        
        // Send data via POST to register.php
        const response = await fetch('register.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess(result.message);
            setTimeout(() => {
                window.location.href = '../login/loginpage.html';
            }, 2000);
        } else {
            showError(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Network error. Please try again.');
    } finally {
        btnSpan.style.display = 'inline-flex';
        spinner.style.display = 'none';
        registerBtn.disabled = false;
    }
});

// Set copyright on page load
setDefaultCopyright();

// Back to Home button functionality
document.getElementById('backHomeBtn').addEventListener('click', (e) => {
    e.preventDefault();
    // Navigate directly without showing loading overlay
    window.location.href = '../../index.php';
});

// Navigation buttons handlers
document.getElementById('loginBtnNav').addEventListener('click', (f) => {
    f.preventDefault();
    // Navigate directly without showing loading overlay
    window.location.href = '../login/loginpage.html';
});

document.getElementById('registerBtnNav').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenu');
const navLinks = document.getElementById('navLinks');
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        if (navLinks.style.display === 'flex') {
            navLinks.style.display = 'none';
        } else {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '80px';
            navLinks.style.left = '0';
            navLinks.style.right = '0';
            navLinks.style.background = '#FEF3E4';
            navLinks.style.padding = '20px';
            navLinks.style.gap = '20px';
            navLinks.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
        }
    });
}