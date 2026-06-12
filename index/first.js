// Configuration
const API_URL = 'first.php';

// DOM Elements
const copyrightElement = document.getElementById('copyright');
const loadingOverlay = document.getElementById('loadingOverlay');

// Button Elements
const loginBtn = document.getElementById('loginBtnHero');
const registerBtn = document.getElementById('registerBtnHero');
const loginNavBtn = document.getElementById('loginBtnNav');
const registerNavBtn = document.getElementById('registerBtnNav');
const viewFoundItemsBtn = document.getElementById('viewFoundItemsBtn');
const featureCard = document.getElementById('featureCard');

// Page URLs (update these paths based on your file structure)
const LOGIN_URL = '../mainpage/login/loginpage.html';
const REGISTER_URL = '../mainpage/register/register.html';
const VIEW_FOUND_ITEMS_URL = 'public_found_items.html';

// Mobile menu elements
const mobileMenuBtn = document.getElementById('mobileMenu');
const navLinks = document.getElementById('navLinks');

// Track menu state
let isMobileMenuOpen = false;

// Function to reset nav-links (for larger screens)
function resetNavLinksStyles() {
    if (window.innerWidth > 768) {
        // Remove all inline styles
        navLinks.removeAttribute('style');
        isMobileMenuOpen = false;
    }
}

// Handle window resize
window.addEventListener('resize', function() {
    resetNavLinksStyles();
});

// Hamburger menu click handler
if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Only work on mobile screens
        if (window.innerWidth <= 768) {
            if (isMobileMenuOpen) {
                // Close the menu
                navLinks.style.display = 'none';
                isMobileMenuOpen = false;
            } else {
                // Open the menu
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '80px';
                navLinks.style.left = '0';
                navLinks.style.right = '0';
                navLinks.style.backgroundColor = '#FEF3E4';
                navLinks.style.padding = '20px';
                navLinks.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                navLinks.style.zIndex = '999';
                navLinks.style.gap = '15px';
                isMobileMenuOpen = true;
            }
        }
    });
}

// Close menu when clicking outside
document.addEventListener('click', function(event) {
    if (isMobileMenuOpen && window.innerWidth <= 768) {
        // Check if click is outside both menu and hamburger button
        if (navLinks && !navLinks.contains(event.target) && 
            mobileMenuBtn && !mobileMenuBtn.contains(event.target)) {
            navLinks.style.display = 'none';
            isMobileMenuOpen = false;
        }
    }
});

// Show/Hide Loading Overlay
function showLoading() {
    if (loadingOverlay) loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    if (loadingOverlay) loadingOverlay.style.display = 'none';
}

// Navigation Functions
function goToLogin() {
    window.location.href = LOGIN_URL;
}

function goToRegister() {
    window.location.href = REGISTER_URL;
}

function goToViewFoundItems() {
    window.location.href = VIEW_FOUND_ITEMS_URL;
}

// Load data from PHP
async function loadData() {
    try {
        showLoading();
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
    } finally {
        hideLoading();
    }
}

// Set default copyright if API fails
function setDefaultCopyright() {
    if (copyrightElement) {
        copyrightElement.innerHTML = `&copy; ${new Date().getFullYear()} Lost & Found System - Universiti Teknologi Malaysia. All rights reserved.`;
    }
}

// Button Event Listeners
function bindEvents() {
    if (loginBtn) loginBtn.addEventListener('click', goToLogin);
    if (registerBtn) registerBtn.addEventListener('click', goToRegister);
    if (loginNavBtn) loginNavBtn.addEventListener('click', goToLogin);
    if (registerNavBtn) registerNavBtn.addEventListener('click', goToRegister);
    if (viewFoundItemsBtn) viewFoundItemsBtn.addEventListener('click', goToViewFoundItems);
    if (featureCard) {
        featureCard.addEventListener('click', (e) => {
            if (e.target !== viewFoundItemsBtn && !viewFoundItemsBtn.contains(e.target)) {
                goToViewFoundItems();
            }
        });
    }
}

// Initialize Page
document.addEventListener('DOMContentLoaded', function() {
    bindEvents();
    loadData();
    resetNavLinksStyles();
});