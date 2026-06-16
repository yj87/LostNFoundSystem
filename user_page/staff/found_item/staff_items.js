// staff_items.js

// ==============================
// UI HELPERS
// ==============================

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const body = document.body;

    if (!sidebar) return;

    let overlay = document.querySelector('.sidebar-overlay');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';

        overlay.onclick = function () {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            body.style.overflow = '';
        };

        document.body.appendChild(overlay);
    }

    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');

    if (window.innerWidth <= 768) {
        body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    }
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdownMenu');

    if (dropdown) {
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

function escapeHtml(str) {
    if (str === null || str === undefined || str === '') return '-';

    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatStatus(status) {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusClass(status) {
    if (status === 'claimed') return 'status-claimed';
    if (status === 'pending') return 'status-pending';
    return 'status-unclaimed';
}

// ==============================
// SIDEBAR / DROPDOWN EVENTS
// ==============================

document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('userDropdownMenu');
    const wrapper = document.querySelector('.user-info-wrapper');

    if (dropdown && dropdown.classList.contains('show')) {
        if (wrapper && !wrapper.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    }

    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    const overlay = document.querySelector('.sidebar-overlay');

    if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
        if (menuToggle && !menuToggle.contains(event.target) && !sidebar.contains(event.target)) {
            sidebar.classList.remove('active');

            if (overlay) {
                overlay.classList.remove('active');
            }

            document.body.style.overflow = '';
        }
    }
});

window.addEventListener('resize', function () {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (window.innerWidth > 768 && sidebar) {
        sidebar.classList.remove('active');

        if (overlay) {
            overlay.classList.remove('active');
        }

        document.body.style.overflow = '';
    }
});

// ==============================
// FOUND ITEM LOGIC
// ==============================

let searchTimer = null;

function handleSearch() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadItems, 350);
}

async function loadCategories() {
    const categoryFilter = document.getElementById('categoryFilter');

    if (!categoryFilter) return;

    try {
        const response = await fetch('get_categories.php', {
            credentials: 'same-origin'
        });

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
            categoryFilter.innerHTML = '<option value="">All Categories</option>';

            result.data.forEach(category => {
                const option = document.createElement('option');
                option.value = category.category_id;
                option.textContent = category.category_name;
                categoryFilter.appendChild(option);
            });
        } else {
            console.error('Failed to load categories:', result.message || 'Unknown error');
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function loadItems() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const tbody = document.getElementById('itemsTableBody');

    if (!tbody) return;

    const search = searchInput ? searchInput.value.trim() : '';
    const status = statusFilter ? statusFilter.value : '';
    const category = categoryFilter ? categoryFilter.value : '';

    const params = new URLSearchParams();

    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (category) params.append('category', category);

    const url = `get_staff_items.php?${params.toString()}`;

    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center">
                <i class="fas fa-spinner fa-spin"></i>
                Loading found items...
            </td>
        </tr>
    `;

    try {
        const response = await fetch(url, {
            credentials: 'same-origin'
        });

        const text = await response.text();

        let result;

        try {
            result = JSON.parse(text);
        } catch (jsonError) {
            console.error('PHP did not return JSON. Response was:', text);
            throw new Error('Invalid JSON response from get_staff_items.php');
        }

        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
            tbody.innerHTML = result.data.map(item => {
                const statusClass = getStatusClass(item.found_status);
                const statusLabel = formatStatus(item.found_status);

                const imageHtml = item.photo
                    ? `<img src="../../../${escapeHtml(item.photo)}" class="item-photo" alt="Found item image">`
                    : `<div class="no-photo"><i class="fas fa-image"></i></div>`;

                return `
                    <tr>
                        <td>${escapeHtml(item.item_id)}</td>

                        <td>${imageHtml}</td>

                        <td>
                            <strong>${escapeHtml(item.item_name)}</strong>
                        </td>

                        <td>${escapeHtml(item.category_name)}</td>

                        <td>${escapeHtml(item.date_found)}</td>

                        <td>
                            <span class="status-badge ${statusClass}">
                                ${escapeHtml(statusLabel)}
                            </span>
                        </td>

                        <td>
                            <a href="../../item_details/view_item_details.html?id=${encodeURIComponent(item.item_id)}&from=staff&type=found"
                               class="btn btn-primary"
                               title="View Details">
                                <i class="fas fa-eye"></i>
                                View
                            </a>

                            <a href="edit_found_item_page.php?id=${encodeURIComponent(item.item_id)}"
                               class="btn btn-primary"
                               title="Edit Item">
                                <i class="fas fa-edit"></i>
                                Edit
                            </a>
                        </td>
                    </tr>
                `;
            }).join('');
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-box-open"></i>
                            No found items match your search.
                        </div>
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Error fetching items:', error);

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center" style="color: red;">
                    Failed to load items. Please check console or PHP response.
                </td>
            </tr>
        `;
    }
}

function resetFilters() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const categoryFilter = document.getElementById('categoryFilter');

    if (searchInput) searchInput.value = '';
    if (statusFilter) statusFilter.value = '';
    if (categoryFilter) categoryFilter.value = '';

    loadItems();
}

// ==============================
// INITIALIZE PAGE
// ==============================

document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.getElementById('menuToggle');
    const userInfoWrapper = document.getElementById('userInfoWrapper');
    const logoutLink = document.getElementById('logoutLink');
    const dropdownLogoutLink = document.getElementById('dropdownLogoutLink');

    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const searchBtn = document.getElementById('searchBtn');
    const resetBtn = document.getElementById('resetBtn');

    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }

    if (userInfoWrapper) {
        userInfoWrapper.addEventListener('click', toggleUserDropdown);
    }

    if (logoutLink) {
        logoutLink.addEventListener('click', function (event) {
            event.preventDefault();
            logoutUser();
        });
    }

    if (dropdownLogoutLink) {
        dropdownLogoutLink.addEventListener('click', function (event) {
            event.preventDefault();
            logoutUser();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', loadItems);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', loadItems);
    }
    loadCategories();
    loadItems();
});