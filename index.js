// Configuration
const API_URL = 'index.php';

// DOM Elements
const taglineElement = document.getElementById('tagline');
const featuresContainer = document.getElementById('featuresContainer');
const copyrightElement = document.getElementById('copyright');
const loadingOverlay = document.getElementById('loadingOverlay');

// Button Elements
const foundBtn = document.getElementById('foundBtn');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');

// Page URLs (update these based on your file structure)
const FOUND_ITEMS_URL = 'user_page/user/browse_found_items.html';
const LOGIN_URL = 'mainpage/login/loginpage.html';
const REGISTER_URL = 'mainpage/register/register.html';

// Show/Hide Loading Overlay
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// Navigation Functions
function goToFoundItems() {
    window.location.href = FOUND_ITEMS_URL;
}

function goToLogin() {
    window.location.href = LOGIN_URL;
}

function goToRegister() {
    window.location.href = REGISTER_URL;
}

// Load Features from PHP
async function loadFeatures() {
    try {
        showLoading();
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (data.success) {
            // Update tagline
            taglineElement.textContent = data.tagline;
            
            // Update copyright
            copyrightElement.innerHTML = `&copy; ${data.current_year} ${data.copyright_text}`;
            
            // Load features
            loadFeaturesCards(data.features);
        } else {
            console.error('Failed to load data');
            loadDefaultFeatures();
        }
    } catch (error) {
        console.error('Error loading features:', error);
        loadDefaultFeatures();
    } finally {
        hideLoading();
    }
}

// Load Features Cards
function loadFeaturesCards(features) {
    if (!featuresContainer) return;
    
    if (features && features.length > 0) {
        let html = '';
        features.forEach(feature => {
            html += `
                <div class="feature-card" onclick="window.location.href='${feature.link}'">
                    <i class="${feature.icon}"></i>
                    <h4>${escapeHtml(feature.title)}</h4>
                    <p>${escapeHtml(feature.description)}</p>
                </div>
            `;
        });
        featuresContainer.innerHTML = html;
    } else {
        loadDefaultFeatures();
    }
}

// Load Default Features (fallback)
function loadDefaultFeatures() {
    const defaultFeatures = [
        {
            icon: 'fas fa-box',
            title: 'Report Found Items',
            description: 'Register items you have found',
            link: '#'
        },
        {
            icon: 'fas fa-search',
            title: 'Search Lost Items',
            description: 'Find your lost belongings',
            link: '#'
        },
        {
            icon: 'fas fa-handshake',
            title: 'Claim Your Items',
            description: 'Request to claim your items',
            link: '#'
        },
        {
            icon: 'fas fa-shield-alt',
            title: 'Secure & Verified',
            description: 'Safe and secure process',
            link: '#'
        }
    ];
    
    loadFeaturesCards(defaultFeatures);
}

// Escape HTML to prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Button Event Listeners
function bindEvents() {
    if (foundBtn) {
        foundBtn.addEventListener('click', goToFoundItems);
    }
    
    if (loginBtn) {
        loginBtn.addEventListener('click', goToLogin);
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', goToRegister);
    }
}

// Initialize Page
document.addEventListener('DOMContentLoaded', function() {
    bindEvents();
    loadFeatures();
});