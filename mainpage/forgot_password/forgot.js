// ============================================
// FORGOT PASSWORD PAGE (Verification)
// ============================================
if (document.getElementById('verifyForm')) {
    // DOM Elements
    const verifyForm = document.getElementById('verifyForm');
    const verifyBtn = document.getElementById('verifyBtn');
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');

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

    // Form submission
    verifyForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';
        
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        
        if (!username || !email) {
            showError('Please enter both username and email');
            return;
        }
        
        // Show loading state
        const btnSpan = verifyBtn.querySelector('span:first-child');
        const spinner = verifyBtn.querySelector('.spinner');
        if (btnSpan) btnSpan.style.display = 'none';
        if (spinner) spinner.style.display = 'inline-block';
        verifyBtn.disabled = true;
        
        try {
            const response = await fetch('reset.php?action=verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username, email: email })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Store data in sessionStorage
                sessionStorage.setItem('reset_username', result.username);
                sessionStorage.setItem('reset_email', result.email);
                
                showSuccess(result.message);
                setTimeout(() => {
                    window.location.href = 'reset.html';
                }, 1500);
            } else {
                showError(result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Network error. Please try again.');
        } finally {
            if (btnSpan) btnSpan.style.display = 'inline-flex';
            if (spinner) spinner.style.display = 'none';
            verifyBtn.disabled = false;
        }
    });

    // Back to Home button functionality (if exists)
    const backHomeBtn = document.getElementById('backHomeBtn');
    if (backHomeBtn) {
        backHomeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '../../index.php';
        });
    }

    // Navigation buttons
    const loginBtnNav = document.getElementById('loginBtnNav');
    const registerBtnNav = document.getElementById('registerBtnNav');
    
    if (loginBtnNav) {
        loginBtnNav.addEventListener('click', () => {
            window.location.href = '../login/loginpage.html';
        });
    }
    
    if (registerBtnNav) {
        registerBtnNav.addEventListener('click', () => {
            window.location.href = '../register/register.html';
        });
    }

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

    // Set copyright
    const copyrightElement = document.getElementById('copyright');
    if (copyrightElement) {
        copyrightElement.innerHTML = `&copy; ${new Date().getFullYear()} Lost & Found System - Universiti Teknologi Malaysia. All rights reserved. <i class="fas fa-heart" style="color: #F5A65B;"></i>`;
    }
}

// ============================================
// RESET PASSWORD PAGE
// ============================================
if (document.getElementById('resetForm')) {
    // DOM Elements
    const resetForm = document.getElementById('resetForm');
    const resetBtn = document.getElementById('resetBtn');
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirm_password');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const displayUsername = document.getElementById('displayUsername');

    // Hint elements (for validation)
    const passwordHint = document.getElementById('passwordHint');
    const confirmHint = document.getElementById('confirmHint');

    // Check if user came from verification
    const username = sessionStorage.getItem('reset_username');
    const email = sessionStorage.getItem('reset_email');
    
    if (!username || !email) {
        window.location.href = 'forgot.html';
    }
    
    // Display username
    if (displayUsername) {
        displayUsername.textContent = username;
    }
    if (usernameInput) {
        usernameInput.value = username;
    }
    if (emailInput) {
        emailInput.value = email;
    }

    // Validation state tracking
    let isPasswordValid = false;
    let isConfirmValid = false;

    // ========== Validation Functions ==========

    // Validate Password
    function validatePassword() {
        const password = passwordInput.value;
        
        if (password === '') {
            if (passwordHint) {
                passwordHint.textContent = 'Password is required';
                passwordHint.classList.add('visible', 'invalid-hint');
                passwordHint.classList.remove('valid-hint');
                passwordInput.classList.add('invalid');
                passwordInput.classList.remove('valid');
            }
            isPasswordValid = false;
            return false;
        }
        
        if (password.length < 6) {
            if (passwordHint) {
                passwordHint.textContent = 'Password must be at least 6 characters';
                passwordHint.classList.add('visible', 'invalid-hint');
                passwordHint.classList.remove('valid-hint');
                passwordInput.classList.add('invalid');
                passwordInput.classList.remove('valid');
            }
            isPasswordValid = false;
            return false;
        }
        
        if (passwordHint) {
            passwordHint.textContent = '✓ Strong enough';
            passwordHint.classList.add('visible', 'valid-hint');
            passwordHint.classList.remove('invalid-hint');
            passwordInput.classList.add('valid');
            passwordInput.classList.remove('invalid');
        }
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
            if (confirmHint) {
                confirmHint.textContent = 'Please confirm your password';
                confirmHint.classList.add('visible', 'invalid-hint');
                confirmHint.classList.remove('valid-hint');
                confirmInput.classList.add('invalid');
                confirmInput.classList.remove('valid');
            }
            isConfirmValid = false;
            return false;
        }
        
        if (password !== confirm) {
            if (confirmHint) {
                confirmHint.textContent = 'Passwords do not match';
                confirmHint.classList.add('visible', 'invalid-hint');
                confirmHint.classList.remove('valid-hint');
                confirmInput.classList.add('invalid');
                confirmInput.classList.remove('valid');
            }
            isConfirmValid = false;
            return false;
        }
        
        if (confirmHint) {
            confirmHint.textContent = '✓ Passwords match';
            confirmHint.classList.add('visible', 'valid-hint');
            confirmHint.classList.remove('invalid-hint');
            confirmInput.classList.add('valid');
            confirmInput.classList.remove('invalid');
        }
        isConfirmValid = true;
        return true;
    }

    // Toggle password visibility
    window.togglePassword = function(fieldId) {
        const field = document.getElementById(fieldId);
        if (field.type === 'password') {
            field.type = 'text';
        } else {
            field.type = 'password';
        }
    };

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

    // Event Listeners for validation
    if (passwordInput) {
        passwordInput.addEventListener('blur', validatePassword);
        passwordInput.addEventListener('input', validatePassword);
    }
    if (confirmInput) {
        confirmInput.addEventListener('blur', validateConfirmPassword);
        confirmInput.addEventListener('input', validateConfirmPassword);
    }

    // Form submission
    resetForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';
        
        const password = passwordInput.value;
        const confirmPassword = confirmInput.value;
        const username = usernameInput.value;
        const email = emailInput.value;
        
        // Run validations
        validatePassword();
        validateConfirmPassword();
        
        if (!password || !confirmPassword) {
            showError('Please fill in all fields');
            return;
        }
        
        if (!isPasswordValid || !isConfirmValid) {
            showError('Please fix all validation errors before submitting');
            return;
        }
        
        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            showError('Password must be at least 6 characters');
            return;
        }
        
        // Show loading state
        const btnSpan = resetBtn.querySelector('span:first-child');
        const spinner = resetBtn.querySelector('.spinner');
        if (btnSpan) btnSpan.style.display = 'none';
        if (spinner) spinner.style.display = 'inline-block';
        resetBtn.disabled = true;
        
        try {
            const response = await fetch('reset.php?action=reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: username, 
                    email: email, 
                    password: password,
                    confirm_password: confirmPassword
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showSuccess(result.message);
                // Clear session storage
                sessionStorage.removeItem('reset_username');
                sessionStorage.removeItem('reset_email');
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
            if (btnSpan) btnSpan.style.display = 'inline-flex';
            if (spinner) spinner.style.display = 'none';
            resetBtn.disabled = false;
        }
    });

    // Back to Login button functionality
    const backToLoginBtn = document.getElementById('backToLoginBtn');
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('reset_username');
            sessionStorage.removeItem('reset_email');
            window.location.href = '../login/loginpage.html';
        });
    }

    // Back to Home button functionality
    const backHomeBtn = document.getElementById('backHomeBtn');
    if (backHomeBtn) {
        backHomeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '../../index.php';
        });
    }

    // Navigation buttons
    const loginBtnNav = document.getElementById('loginBtnNav');
    const registerBtnNav = document.getElementById('registerBtnNav');
    
    if (loginBtnNav) {
        loginBtnNav.addEventListener('click', () => {
            sessionStorage.removeItem('reset_username');
            sessionStorage.removeItem('reset_email');
            window.location.href = '../login/loginpage.html';
        });
    }
    
    if (registerBtnNav) {
        registerBtnNav.addEventListener('click', () => {
            window.location.href = '../register/register.html';
        });
    }

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

    // Set copyright
    const copyrightElement = document.getElementById('copyright');
    if (copyrightElement) {
        copyrightElement.innerHTML = `&copy; ${new Date().getFullYear()} Lost & Found System - Universiti Teknologi Malaysia. All rights reserved. <i class="fas fa-heart" style="color: #F5A65B;"></i>`;
    }
}