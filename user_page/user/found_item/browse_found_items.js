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

        const result = await response.json();
        const summary = document.getElementById('resultsSummary');

        if (result.success && result.data.length > 0) {
            summary.textContent = `Showing ${result.data.length} item${result.data.length !== 1 ? 's' : ''}`;

            tbody.innerHTML = result.data.map(item => {
                const statusClass =
                    item.found_status === 'claimed' ? 'status-claimed' :
                    item.found_status === 'pending' ? 'status-pending' :
                    'status-unclaimed';

                const statusLabel = item.found_status
                    ? item.found_status.charAt(0).toUpperCase() + item.found_status.slice(1)
                    : 'Unknown';

                const canClaim = item.found_status === 'unclaimed';

                const claimButton = canClaim
                    ? `
                        <a href="../claims/submit_claim.html?item_id=${item.item_id}" 
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

                const imageHtml = item.photo
                    ? `<img src="../../../${escapeHtml(item.photo)}" class="item-thumb" alt="Found item image">`
                    : `<div class="no-image"><i class="fas fa-image"></i></div>`;

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
                                ${statusLabel}
                            </span>
                        </td>

                        <td style="white-space:nowrap;">
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

        document.getElementById('userItemsTable').innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;color:red;padding:20px;">
                    Failed to load items.
                </td>
            </tr>
        `;
    }
}

// Sidebar toggle with overlay
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const body = document.body;

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

// Logout confirmation
function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '../../../mainpage/logout/logout.php';
        return true;
    }

    return false;
}

// Close sidebar/dropdown on outside click
document.addEventListener('click', function (event) {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    const overlay = document.querySelector('.sidebar-overlay');

    const dropdown = document.getElementById('userDropdownMenu');
    const wrapper = document.querySelector('.user-info-wrapper') || document.querySelector('.user-avatar');

    if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
        if (menuToggle && !menuToggle.contains(event.target) && !sidebar.contains(event.target)) {
            sidebar.classList.remove('active');

            if (overlay) {
                overlay.classList.remove('active');
            }

            document.body.style.overflow = '';
        }
    }

    if (dropdown && dropdown.classList.contains('show')) {
        if (wrapper && !wrapper.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    }
});

// Reset sidebar on desktop resize
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

function toggleUserDropdown() {
    document.getElementById('userDropdownMenu')?.classList.toggle('show');
}

async function loadCategories() {
    try {
        const res = await fetch('get_categories.php', {
            credentials: 'same-origin'
        });

        const result = await res.json();

        if (result.success) {
            const select = document.getElementById('categoryFilter');

            result.data.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.category_id;
                opt.textContent = cat.category_name;
                select.appendChild(opt);
            });
        }
    } catch (err) {
        console.error('Error loading categories:', err);
    }
}

// Load data when page opens
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadItems();
});