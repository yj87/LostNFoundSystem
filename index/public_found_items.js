// public_found_items.js

const LOGIN_URL = '../mainpage/login/loginpage.html';
const REGISTER_URL = '../mainpage/register/register.html';

let searchTimer = null;

function handleSearch() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadItems, 350);
}

function escapeHtml(str) {
    if (str === null || str === undefined || str === '') return '-';

    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

async function loadCategories() {
    try {
        const response = await fetch('get_public_categories.php');
        const result = await response.json();

        if (result.success) {
            const select = document.getElementById('categoryFilter');
            select.innerHTML = '<option value="">All Categories</option>';

            result.data.forEach(category => {
                const option = document.createElement('option');
                option.value = category.category_id;
                option.textContent = category.category_name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function loadItems() {
    const search = document.getElementById('searchInput').value.trim();
    const category = document.getElementById('categoryFilter').value;
    const itemsGrid = document.getElementById('itemsGrid');
    const summary = document.getElementById('resultsSummary');

    let url = 'get_public_found_items.php?';

    if (search) {
        url += `search=${encodeURIComponent(search)}&`;
    }

    if (category) {
        url += `category=${encodeURIComponent(category)}`;
    }

    itemsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #7A624C;">
            <i class="fas fa-spinner fa-spin" style="font-size: 36px; color: #F5A65B; margin-bottom: 12px;"></i>
            <p>Loading found items...</p>
        </div>
    `;

    try {
        const response = await fetch(url);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            summary.textContent = `Showing ${result.data.length} found item${result.data.length !== 1 ? 's' : ''}`;

            itemsGrid.innerHTML = result.data.map(item => {
                const statusLabel = item.found_status
                    ? item.found_status.charAt(0).toUpperCase() + item.found_status.slice(1)
                    : 'Unknown';

                const statusColor =
                    item.found_status === 'pending' ? '#856404' :
                    item.found_status === 'claimed' ? '#155724' :
                    '#0056b3';

                const statusBg =
                    item.found_status === 'pending' ? '#fff3cd' :
                    item.found_status === 'claimed' ? '#d4edda' :
                    '#d8ecff';

                const detailUrl = `../user_page/item_details/view_item_details.html?id=${encodeURIComponent(item.item_id)}&from=public`;

                const imageHtml = item.photo
                    ? `
                        <img src="../${escapeHtml(item.photo)}" 
                             alt="Found item image"
                             style="
                                width: 100%;
                                height: 150px;
                                object-fit: cover;
                                border-radius: 14px;
                                border: 1px solid rgba(245, 166, 91, 0.25);
                                background: #f8f8f8;
                                margin-bottom: 14px;
                             ">
                    `
                    : `
                        <div style="
                            width: 100%;
                            height: 150px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            border-radius: 14px;
                            border: 1px dashed rgba(245, 166, 91, 0.4);
                            background: #FFF9F2;
                            color: #C56218;
                            margin-bottom: 14px;
                        ">
                            <i class="fas fa-image" style="font-size: 34px;"></i>
                        </div>
                    `;

                return `
                    <div style="
                        background: white;
                        border: 1px solid rgba(245, 166, 91, 0.25);
                        border-radius: 20px;
                        padding: 20px;
                        box-shadow: 0 8px 18px rgba(0,0,0,0.04);
                        cursor: pointer;
                        transition: transform 0.2s, box-shadow 0.2s;
                    "
                    onclick="window.location.href='${detailUrl}'"
                    onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 14px 28px rgba(245,166,91,0.18)'"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 18px rgba(0,0,0,0.04)'">

                        ${imageHtml}

                        <div style="
                            display: flex;
                            justify-content: space-between;
                            gap: 12px;
                            align-items: flex-start;
                            margin-bottom: 14px;
                        ">
                            <div>
                                <h3 style="
                                    font-size: 20px;
                                    color: #2D1B0F;
                                    margin-bottom: 8px;
                                ">
                                    ${escapeHtml(item.item_name)}
                                </h3>

                                <span style="
                                    display: inline-block;
                                    padding: 5px 12px;
                                    border-radius: 30px;
                                    background: #FFF2E6;
                                    color: #C56218;
                                    font-size: 12px;
                                    font-weight: 700;
                                ">
                                    ${escapeHtml(item.category_name)}
                                </span>
                            </div>

                            <span style="
                                display: inline-block;
                                padding: 5px 12px;
                                border-radius: 30px;
                                background: ${statusBg};
                                color: ${statusColor};
                                font-size: 12px;
                                font-weight: 700;
                            ">
                                ${escapeHtml(statusLabel)}
                            </span>
                        </div>

                        <p style="color: #6B5240; font-size: 14px; margin-bottom: 10px;">
                            <i class="fas fa-map-marker-alt" style="color: #F5A65B; width: 18px;"></i>
                            ${escapeHtml(item.location_found)}
                        </p>

                        <p style="color: #6B5240; font-size: 14px; margin-bottom: 10px;">
                            <i class="fas fa-calendar-alt" style="color: #F5A65B; width: 18px;"></i>
                            ${escapeHtml(item.date_found)}
                        </p>

                        <p style="
                            color: #6B5240;
                            font-size: 14px;
                            line-height: 1.5;
                            margin-bottom: 14px;
                        ">
                            <i class="fas fa-align-left" style="color: #F5A65B; width: 18px;"></i>
                            ${escapeHtml(item.description)}
                        </p>

                        <a href="${detailUrl}"
                           onclick="event.stopPropagation();"
                           style="
                                display:inline-block;
                                background:#F5A65B;
                                color:white;
                                padding:8px 14px;
                                border-radius:20px;
                                text-decoration:none;
                                font-size:13px;
                                font-weight:600;
                                margin-right:8px;
                           ">
                            <i class="fas fa-eye"></i> View Details
                        </a>

                        <div style="
                            margin-top: 14px;
                            background: #FFF5EA;
                            color: #C56218;
                            padding: 10px 12px;
                            border-radius: 12px;
                            font-size: 13px;
                            font-weight: 600;
                        ">
                            <i class="fas fa-lock"></i>
                            Login is required to claim this item.
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            summary.textContent = '';

            itemsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; color: #7A624C;">
                    <i class="fas fa-box-open" style="font-size: 42px; color: #F5A65B; margin-bottom: 12px;"></i>
                    <h3>No found items available</h3>
                    <p>Try using another keyword or category.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading public found items:', error);

        summary.textContent = '';

        itemsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; color: #7A624C;">
                <i class="fas fa-exclamation-triangle" style="font-size: 42px; color: #E87A1E; margin-bottom: 12px;"></i>
                <h3>Error loading data</h3>
                <p>Please refresh the page and try again.</p>
            </div>
        `;
    }
}

function setupNavigation() {
    const loginBtn = document.getElementById('loginBtnNav');
    const registerBtn = document.getElementById('registerBtnNav');
    const mobileMenuBtn = document.getElementById('mobileMenu');
    const navLinks = document.getElementById('navLinks');

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.location.href = LOGIN_URL;
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            window.location.href = REGISTER_URL;
        });
    }

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function () {
            if (window.innerWidth <= 768) {
                if (navLinks.style.display === 'flex') {
                    navLinks.style.display = 'none';
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
                }
            }
        });
    }

    window.addEventListener('resize', function () {
        if (window.innerWidth > 768 && navLinks) {
            navLinks.removeAttribute('style');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    loadCategories();
    loadItems();
});