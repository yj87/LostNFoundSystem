// browse_found_items.js

let searchTimer = null;

function handleSearch() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadItems, 350);
}

function escapeHtml(str) {
    if (str === null || str === undefined || str === '') return '-';

    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

function formatStatus(status) {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function getFoundStatusClass(status) {
    if (status === 'claimed') return 'status-approved';
    if (status === 'pending') return 'status-pending';
    return 'status-found';
}

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

document.addEventListener('click', function (event) {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    const overlay = document.querySelector('.sidebar-overlay');

    const dropdown = document.getElementById('userDropdownMenu');
    const avatar = document.getElementById('userAvatar');

    if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
        if (menuToggle && !menuToggle.contains(event.target) && !sidebar.contains(event.target)) {
            sidebar.classList.remove('active');

            if (overlay) {
                overlay.classList.remove('active');
            }

            document.body.style.overflow = '';
        }
    }

    if (dropdown && avatar && dropdown.classList.contains('show')) {
        if (!avatar.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.remove('show');
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
// LOAD CATEGORIES
// ==============================

async function loadCategories() {
    const select = document.getElementById('categoryFilter');

    if (!select) return;

    select.innerHTML = '<option value="">All Categories</option>';

    try {
        const response = await fetch('get_categories.php', {
            credentials: 'same-origin'
        });

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
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

// ==============================
// LOAD FOUND ITEMS
// ==============================

async function loadItems() {
    const search = document.getElementById('searchInput').value.trim();
    const category = document.getElementById('categoryFilter').value;

    let url = 'get_browse_items.php?';

    if (search) {
        url += `search=${encodeURIComponent(search)}&`;
    }

    if (category) {
        url += `category=${encodeURIComponent(category)}`;
    }

    const tbody = document.getElementById('userItemsTable');
    const summary = document.getElementById('resultsSummary');

    tbody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align:center;padding:24px;">
                <i class="fas fa-spinner fa-spin"></i> Loading…
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
            throw new Error('Invalid JSON response from get_browse_items.php');
        }

        if (result.success && result.data.length > 0) {
            summary.textContent = `Showing ${result.data.length} item${result.data.length !== 1 ? 's' : ''}`;

            tbody.innerHTML = result.data.map(item => {
                const statusClass = getFoundStatusClass(item.found_status);
                const statusLabel = formatStatus(item.found_status);
                const canClaim = item.found_status === 'unclaimed';

                const imageHtml = item.photo
                    ? `<img src="../../../${escapeHtml(item.photo)}" class="item-thumb" alt="Found item image">`
                    : `<div class="no-image"><i class="fas fa-image"></i></div>`;

                const viewUrl = `../../item_details/view_item_details.html?id=${encodeURIComponent(item.item_id)}&from=user`;

                const claimButton = canClaim
                    ? `
                        <a href="../claims/submit_claim.html?item_id=${encodeURIComponent(item.item_id)}" 
                           class="btn-claim" 
                           title="Claim this item">
                            <i class="fas fa-hand-paper"></i> Claim
                        </a>
                    `
                    : `
                        <span class="btn-claim disabled" title="Item not available for claim">
                            <i class="fas fa-hand-paper"></i> Claim
                        </span>
                    `;

                return `
                    <tr>
                        <td>${imageHtml}</td>

                        <td>
                            <strong>${escapeHtml(item.item_name)}</strong>
                        </td>

                        <td>${escapeHtml(item.category_name ?? '-')}</td>

                        <td>${escapeHtml(item.date_found)}</td>

                        <td>
                            <span class="status-badge ${statusClass}">
                                ${escapeHtml(statusLabel)}
                            </span>
                        </td>

                        <td>
                            <a href="../../item_details/view_item_details.html?id=${item.item_id}&from=user" class="btn-view" title="View Details">
                                <i class="fas fa-eye"></i> View
                            </a>

                            ${claimButton}
                        </td>
                    </tr>
                `;
            }).join('');
        } else {
            summary.textContent = '';

            tbody.innerHTML = `
                <tr>
                    <td colspan="6">
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

        summary.textContent = '';

        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;color:red;padding:20px;">
                    Failed to load items.
                </td>
            </tr>
        `;
    }
}

// ==============================
// INIT
// ==============================

document.addEventListener('DOMContentLoaded', function () {
    loadCategories();
    loadItems();
});