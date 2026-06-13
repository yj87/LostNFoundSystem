<?php
// PHP Configuration
header('Content-Type: text/html; charset=UTF-8');

$current_year = date('Y');

// Handle copyright data for JavaScript
$copyright_data = [
    'success' => true,
    'copyright_text' => 'Lost & Found System - Universiti Teknologi Malaysia. All rights reserved.',
    'current_year' => $current_year
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
    <title>Lost & Found System | UTM Reunite</title>
    <!-- Google Fonts + Font Awesome -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700;14..32,800;14..32,900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', 'Segoe UI', sans-serif;
            background: #FFFFFF;
            min-height: 100vh;
            overflow-x: hidden;
        }

        /* ===== NAVIGATION BAR ===== */
        .navbar {
            width: 100%;
            background: #FEF3E4;
            position: sticky;
            top: 0;
            z-index: 1000;
        }

        .nav-container {
            max-width: 1280px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 40px;
            flex-wrap: wrap;
            gap: 20px;
        }

        .logo-nav {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .brand-logo {
            width: 48px;
            height: 48px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background: transparent;
        }

        .nav-brand {
            font-size: 28px;
            font-weight: 800;
            color: #2D1B0F;
        }

        .nav-brand span {
            color: #F5A65B;
        }

        .nav-links {
            display: flex;
            gap: 80px;
            align-items: center;
        }

        .nav-links a {
            text-decoration: none;
            font-weight: 500;
            color: #2D1B0F;
            transition: 0.2s;
            font-size: 16px;
        }

        .nav-links a:hover, .nav-links a.active {
            color: #F5A65B;
        }

        .nav-actions {
            display: flex;
            gap: 12px;
        }

        .btn-login-nav {
            background: linear-gradient(135deg, #F5A65B, #E87A1E);
            color: white;
            border: none;
            padding: 10px 24px;
            border-radius: 40px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: 0.2s;
        }

        .btn-register-nav {
            background: transparent;
            border: 2px solid #F5A65B;
            color: #F5A65B;
            padding: 8px 22px;
            border-radius: 40px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: 0.2s;
        }

        .btn-register-nav:hover {
            background: #F5A65B;
            color: white;
        }

        .btn-login-nav:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(245, 166, 91, 0.4);
        }

        .mobile-menu {
            display: none;
            font-size: 28px;
            cursor: pointer;
            color: #F5A65B;
        }

        /* ===== MAIN CONTAINER ===== */
        .main-container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 40px;
            background: #FFFFFF;
        }

        /* ===== HERO SECTION ===== */
        .hero-section {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 50px;
            padding: 60px 0 50px;
            flex-wrap: wrap;
        }

        .hero-left {
            flex: 1;
            min-width: 280px;
        }

        .badge-group {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
            flex-wrap: wrap;
        }

        .badge {
            background: #FFE4C4;
            padding: 6px 18px;
            border-radius: 40px;
            font-weight: 700;
            font-size: 14px;
            color: #E87A1E;
        }

        .badge-outline {
            background: #F5A65B20;
            padding: 6px 18px;
            border-radius: 40px;
            font-weight: 600;
            font-size: 14px;
            color: #C56218;
        }

        .hero-title {
            font-size: 56px;
            font-weight: 800;
            color: #2D1B0F;
            line-height: 1.2;
            margin-bottom: 20px;
        }

        .hero-title span {
            background: linear-gradient(135deg, #F5A65B, #E87A1E);
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
        }

        .hero-text {
            color: #6B5240;
            line-height: 1.6;
            margin-bottom: 30px;
            font-size: 16px;
            max-width: 500px;
        }

        .hero-buttons {
            display: flex;
            gap: 18px;
            flex-wrap: wrap;
        }

        .btn-primary {
            background: linear-gradient(135deg, #F5A65B, #E87A1E);
            color: white;
            padding: 14px 32px;
            border: none;
            border-radius: 50px;
            font-weight: 700;
            font-size: 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: 0.2s;
        }

        .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 24px rgba(232, 122, 30, 0.3);
        }

        .btn-secondary {
            background: transparent;
            border: 2px solid #F5A65B;
            color: #E87A1E;
            padding: 12px 30px;
            border-radius: 50px;
            font-weight: 700;
            font-size: 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: 0.2s;
        }

        .btn-secondary:hover {
            background: #F5A65B;
            color: white;
        }

        /* Hero Right Side */
        .hero-right {
            flex: 1;
            min-width: 280px;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 320px;
        }

        .hero-icon-circle {
            width: 200px;
            height: 200px;
            background: linear-gradient(145deg, #FFF2E6, #FFE4D0);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 20px 35px rgba(0, 0, 0, 0.1);
            animation: float 3s ease-in-out infinite;
        }

        .hero-icon-circle i {
            font-size: 90px;
            color: #F5A65B;
        }

        .floating-badge {
            position: absolute;
            background: white;
            padding: 10px 20px;
            border-radius: 50px;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
            font-weight: 600;
            font-size: 14px;
            color: #E87A1E;
        }

        .floating-badge i {
            font-size: 16px;
        }

        .f1 {
            top: 0;
            left: 0;
            animation: float 2.5s ease-in-out infinite;
        }

        .f2 {
            bottom: 20px;
            right: 0;
            animation: float 3s ease-in-out infinite 0.5s;
        }

        .f3 {
            top: 50%;
            right: -30px;
            animation: float 2.8s ease-in-out infinite 0.3s;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
        }

        /* ===== FEATURE SECTION ===== */
        .feature-section {
            padding: 20px 0 60px;
        }

        .section-header {
            text-align: center;
            margin-bottom: 40px;
        }

        .section-badge {
            color: #F5A65B;
            font-weight: 700;
            letter-spacing: 1px;
            font-size: 14px;
            text-transform: uppercase;
        }

        .section-title {
            font-size: 42px;
            font-weight: 800;
            color: #2D1B0F;
            margin: 12px 0 8px;
        }

        .section-title span {
            color: #F5A65B;
        }

        .section-desc {
            color: #7A624C;
            font-size: 16px;
        }

        /* SINGLE LAYER FEATURE CARD */
        .feature-card-single {
            background: linear-gradient(135deg, #FFF9F2, #FFF5EA);
            border-radius: 32px;
            padding: 48px;
            border: 1px solid rgba(245, 166, 91, 0.3);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
            max-width: 900px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            gap: 40px;
            flex-wrap: wrap;
            cursor: pointer;
        }

        .feature-card-single:hover {
            transform: translateY(-5px);
            box-shadow: 0 25px 45px rgba(245, 166, 91, 0.12);
            border-color: #F5A65B;
        }

        .feature-icon {
            width: 110px;
            height: 110px;
            background: linear-gradient(145deg, #F5A65B, #E87A1E);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .feature-icon i {
            font-size: 52px;
            color: white;
        }

        .feature-content {
            flex: 1;
            text-align: center;
        }

        .feature-content h3 {
            font-size: 32px;
            font-weight: 800;
            color: #2D1B0F;
            margin-bottom: 12px;
        }

        .feature-content p {
            color: #6B5240;
            line-height: 1.6;
            margin-bottom: 24px;
            font-size: 16px;
        }

        .feature-btn {
            background: linear-gradient(135deg, #F5A65B, #E87A1E);
            color: white;
            border: none;
            padding: 14px 32px;
            border-radius: 50px;
            font-weight: 700;
            font-size: 16px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            transition: 0.2s;
            margin: 0 auto;
        }

        .feature-btn:hover {
            transform: translateX(5px);
            box-shadow: 0 8px 20px rgba(245, 166, 91, 0.4);
        }

        /* ===== FULL WIDTH FOOTER ===== */
        .full-width-footer {
            width: 100%;
            background: #FEF3E4;
            padding: 24px 0;
            margin-top: 20px;
        }

        .footer-container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 40px;
            text-align: center;
        }

        .full-width-footer p {
            font-size: 14px;
            color: #2D1B0F;
            letter-spacing: 0.3px;
        }

        /* Loading Overlay */
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.85);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            color: white;
        }

        .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(245,166,91,0.3);
            border-top: 4px solid #F5A65B;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* ===== RESPONSIVE MEDIA QUERIES ===== */
        @media (max-width: 1024px) {
            .nav-container { padding: 20px 24px; }
            .main-container { padding: 0 24px; }
            .footer-container { padding: 0 24px; }
            .hero-title { font-size: 44px; }
            .feature-card-single { padding: 32px; }
            .feature-content h3 { font-size: 28px; }
        }

        @media (max-width: 768px) {
            /* Hide normal nav links, show hamburger */
            .nav-links {
                display: none;
            }
            .mobile-menu {
                display: block;
            }
            .hero-section { flex-direction: column; text-align: center; }
            .hero-left { text-align: center; }
            .hero-text { margin: 0 auto 30px; }
            .hero-buttons { justify-content: center; }
            .badge-group { justify-content: center; }
            .section-title { font-size: 32px; }
            .feature-card-single { flex-direction: column; text-align: center; padding: 32px 24px; }
            .feature-content { text-align: center; }
            .f3 { right: -10px; }
        }

        /* Reset for larger screens */
        @media (min-width: 769px) {
            .nav-links {
                display: flex !important;
                flex-direction: row !important;
                position: relative !important;
                top: auto !important;
                left: auto !important;
                background: transparent !important;
                padding: 0 !important;
                box-shadow: none !important;
                width: auto !important;
            }
            .mobile-menu {
                display: none !important;
            }
        }

        @media (max-width: 480px) {
            .hero-title { font-size: 32px; }
            .btn-primary, .btn-secondary { padding: 10px 20px; font-size: 14px; }
            .nav-actions { display: none; }
            .feature-icon { width: 80px; height: 80px; }
            .feature-icon i { font-size: 38px; }
            .feature-content h3 { font-size: 22px; }
            .feature-btn { padding: 10px 20px; font-size: 14px; }
            .f1, .f2, .f3 { display: none; }
        }
    </style>
</head>
<body>

    <!-- Navigation Bar -->
    <nav class="navbar">
        <div class="nav-container">
            <div class="logo-nav">
                <div class="brand-logo">
                    <img src="logo/lostfind.webp" alt="LostFind Logo" style="width: 100%; height: 100%; object-fit: cover; border-radius: 16px;">
                </div>
                <h2 class="nav-brand">Lost<span>Find</span></h2>
            </div>
            <div class="nav-links" id="navLinks">
                <a href="index.php" class="active">Home</a>
                <a href="index/home/about.html">About</a>
                <a href="index/home/faq.html">FAQ</a>
            </div>
            <div class="nav-actions">
                <button class="btn-login-nav" id="loginBtnNav">
                    <i class="fas fa-sign-in-alt"></i> Login
                </button>
                <button class="btn-register-nav" id="registerBtnNav">
                    <i class="fas fa-user-plus"></i> Register
                </button>
            </div>
            <div class="mobile-menu" id="mobileMenu">
                <i class="fas fa-bars"></i>
            </div>
        </div>
    </nav>

    <!-- MAIN CONTAINER - Fully White -->
    <div class="main-container">
        
        <!-- Hero Section -->
        <div class="hero-section">
            <div class="hero-left">
                <div class="badge-group">
                    <span class="badge">✨ Get Connected</span>
                    <span class="badge-outline">100% Free Service</span>
                </div>
                <h1 class="hero-title">
                    Lost & Found<br>
                    <span>Reunite With Ease</span>
                </h1>
                <p class="hero-text">
                    Report lost items, browse found belongings, and reconnect with your valuables. 
                    Trusted by thousands of students and staff at Universiti Teknologi Malaysia.
                </p>
                <div class="hero-buttons">
                    <button class="btn-primary" id="registerBtnHero">
                        <i class="fas fa-user-plus"></i> Register Now
                    </button>
                    <button class="btn-secondary" id="loginBtnHero">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </button>
                </div>
            </div>
            <div class="hero-right">
                <div class="hero-icon-circle">
                    <i class="fas fa-handshake"></i>
                </div>
                <div class="floating-badge f1">
                    <i class="fas fa-search"></i> Browse Found
                </div>
                <div class="floating-badge f2">
                    <i class="fas fa-check-circle"></i> Claim Items
                </div>
                <div class="floating-badge f3">
                    <i class="fas fa-shield-alt"></i> Secure
                </div>
            </div>
        </div>

        <!-- Feature Section - Single Layer Card -->
        <div class="feature-section">
            <div class="section-header">
                <span class="section-badge">START BROWSING</span>
                <h2 class="section-title">View <span>Found Items</span></h2>
                <p class="section-desc">Browse all reported lost items across campus</p>
            </div>

            <!-- Single Layer Feature Card -->
            <div class="feature-card-single" id="featureCard">
                <div class="feature-icon">
                    <i class="fas fa-eye"></i>
                </div>
                <div class="feature-content">
                    <h3>Browse Found Items</h3>
                    <p>Explore all items that have been reported as found by the UTM community. Search by category, location, or date to find what you're looking for.</p>
                    <button class="feature-btn" id="viewFoundItemsBtn">
                        <i class="fas fa-arrow-right"></i> View All Found Items
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Full Width Footer -->
    <footer class="full-width-footer">
        <div class="footer-container">
            <p id="copyright"></p>
        </div>
    </footer>

    <!-- Loading Overlay -->
    <div class="loading-overlay" id="loadingOverlay" style="display: none;">
        <div class="spinner"></div>
        <p>Loading lost & found hub...</p>
    </div>

    <script>
        // PHP data passed to JavaScript
        const copyrightData = <?php echo json_encode($copyright_data); ?>;
        
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
        
        // Page URLs
        const LOGIN_URL = 'mainpage/login/loginpage.html';
        const REGISTER_URL = 'mainpage/register/register.html';
        const VIEW_FOUND_ITEMS_URL = 'index/public_found_items.html';
        
        // Mobile menu elements
        const mobileMenuBtn = document.getElementById('mobileMenu');
        const navLinks = document.getElementById('navLinks');
        
        // Track menu state
        let isMobileMenuOpen = false;
        
        // Function to reset nav-links (for larger screens)
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
                
                if (window.innerWidth <= 768) {
                    if (isMobileMenuOpen) {
                        navLinks.style.display = 'none';
                        isMobileMenuOpen = false;
                    } else {
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
        
        // Load data from PHP (embedded)
        function loadData() {
            try {
                showLoading();
                // Use the embedded PHP data
                const data = copyrightData;
                
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
        
        // Set default copyright if fails
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
    </script>
</body>
</html>