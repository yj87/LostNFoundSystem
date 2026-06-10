// Shared JavaScript for About and FAQ pages
// Handles mobile menu toggle, navigation, and copyright

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile menu elements
    const mobileMenuBtn = document.getElementById('mobileMenu');
    const navLinks = document.getElementById('navLinks');
    
    // Button elements
    const loginNavBtn = document.getElementById('loginBtnNav');
    const registerNavBtn = document.getElementById('registerBtnNav');
    
    // Page URLs
    const LOGIN_URL = '../mainpage/login/loginpage.html';
    const REGISTER_URL = '../mainpage/register/register.html';
    
    // Track menu state
    let isMobileMenuOpen = false;
    
    // Function to reset nav-links inline styles (for larger screens)
    function resetNavLinksStyles() {
        if (window.innerWidth > 768 && navLinks) {
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
            if (navLinks && !navLinks.contains(event.target) && 
                mobileMenuBtn && !mobileMenuBtn.contains(event.target)) {
                navLinks.style.display = 'none';
                isMobileMenuOpen = false;
            }
        }
    });
    
    // Navigation Functions
    function goToLogin() {
        window.location.href = LOGIN_URL;
    }
    
    function goToRegister() {
        window.location.href = REGISTER_URL;
    }
    
    // Button Event Listeners
    if (loginNavBtn) loginNavBtn.addEventListener('click', goToLogin);
    if (registerNavBtn) registerNavBtn.addEventListener('click', goToRegister);
    
    // Initial reset
    resetNavLinksStyles();
});