// Define API_URL if you have an actual endpoint
const API_URL = 'login.php';

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showError('Please enter both username and password');
        return;
    }
    
    const btn = document.getElementById('loginBtn');
    const btnText = btn.querySelector('span:first-child');
    const spinner = btn.querySelector('.spinner');
    btnText.style.display = 'none';
    spinner.style.display = 'inline-block';
    btn.disabled = true;
    
    try {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        
        const response = await fetch('login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess(result.message);
            setTimeout(() => {
                window.location.href = result.redirect;
            }, 1500);
        } else {
            showError(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Network error. Please try again.');
    } finally {
        btnText.style.display = 'inline';
        spinner.style.display = 'none';
        btn.disabled = false;
    }
});

const copyrightElement = document.getElementById('copyright');

// Get the register button element (from your login page)
const registerBtn = document.getElementById('registerBtnHero');
const registerNavBtn = document.getElementById('registerBtnNav'); // Add this if exists in nav
const REGISTER_URL = '../register/register.html';

function goToRegister() {
    window.location.href = REGISTER_URL;
}

function goToLogin() {
    // Already on login page, maybe scroll or do nothing
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToViewFoundItems() {
    window.location.href = '../mainpage/found_items/found_items.html';
}

function bindEvents() {
    // Only bind if the elements actually exist on the page
    const loginBtn = document.getElementById('loginBtnHero');
    const loginNavBtn = document.getElementById('loginBtnNav');
    const viewFoundItemsBtn = document.getElementById('viewFoundItemsBtn');
    const featureCard = document.getElementById('featureCard');
    
    if (loginBtn) loginBtn.addEventListener('click', goToLogin);
    if (registerBtn) registerBtn.addEventListener('click', goToRegister);
    if (loginNavBtn) loginNavBtn.addEventListener('click', goToLogin);
    if (registerNavBtn) registerNavBtn.addEventListener('click', goToRegister);
    if (viewFoundItemsBtn) viewFoundItemsBtn.addEventListener('click', goToViewFoundItems);
    if (featureCard) {
        featureCard.addEventListener('click', (e) => {
            if (e.target !== viewFoundItemsBtn && !viewFoundItemsBtn?.contains(e.target)) {
                goToViewFoundItems();
            }
        });
    }
}

async function loadData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (data.success) {
            if (copyrightElement) {
                copyrightElement.innerHTML = `&copy; ${data.current_year} ${data.copyright_text}`;
            }
        } else {
            console.error('Failed to load data');
            setDefaultCopyright();
        }
    } catch (error) {
        console.error('Error loading data:', error);
        setDefaultCopyright();
    }
}

function setDefaultCopyright() {
    if (copyrightElement) {
        copyrightElement.innerHTML = `&copy; ${new Date().getFullYear()} Lost & Found System - Universiti Teknologi Malaysia. All rights reserved.`;
    }
}

function togglePassword() {
    const passwordField = document.getElementById('password');
    const toggleIcon = document.querySelector('.toggle-password i');
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        if (toggleIcon) {
            toggleIcon.classList.remove('fa-eye');
            toggleIcon.classList.add('fa-eye-slash');
        }
    } else {
        passwordField.type = 'password';
        if (toggleIcon) {
            toggleIcon.classList.remove('fa-eye-slash');
            toggleIcon.classList.add('fa-eye');
        }
    }
}

function fillCredentials(username, password) {
    document.getElementById('username').value = username;
    document.getElementById('password').value = password;
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
}

// CALL loadData AND bindEvents when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    bindEvents(); // Add this to bind your button events
});