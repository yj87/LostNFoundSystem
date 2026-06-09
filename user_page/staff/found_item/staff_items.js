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

// Close sidebar on outside click (mobile)
document.addEventListener('click', function (event) {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    const overlay = document.querySelector('.sidebar-overlay');

    if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
        if (menuToggle && !menuToggle.contains(event.target) && !sidebar.contains(event.target)) {
            sidebar.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});

// Reset sidebar on desktop resize
window.addEventListener('resize', function () {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (window.innerWidth > 768 && sidebar) {
        sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Edit item — navigate to edit page
function editItem(id) {
    window.location.href = `edit_found_item.html?id=${id}`;
}
let searchTimer = null;

function handleSearch() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadItems, 350);
}

function escapeHtml(str) {
    if (!str) return '-';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

async function loadItems() {
    const search = document.getElementById('searchInput').value.trim();
    const status = document.getElementById('statusFilter').value;

    let url = 'get_staff_items.php?';
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (status) url += `status=${encodeURIComponent(status)}`;

    const tbody = document.getElementById('staffItemsTable');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;"><i class="fas fa-spinner fa-spin"></i> Loading…</td></tr>';

    try {
        const response = await fetch(url, { credentials: 'same-origin' });
        const result = await response.json();

        const summary = document.getElementById('resultsSummary');

        if (result.success && result.data.length > 0) {
            summary.textContent = `Showing ${result.data.length} item${result.data.length !== 1 ? 's' : ''}`;
            tbody.innerHTML = result.data.map(item => {
                const statusClass = item.found_status === 'claimed' ? 'status-claimed' :
                    item.found_status === 'pending' ? 'status-pending' :
                        'status-unclaimed';
                const statusLabel = item.found_status
                    ? item.found_status.charAt(0).toUpperCase() + item.found_status.slice(1)
                    : 'Unknown';

                return `
                    <tr>
                        <td><strong>${escapeHtml(item.item_name)}</strong></td>
                        <td>${escapeHtml(item.category_name ?? '-')}</td>
                        <td>${escapeHtml(item.location_found)}</td>
                        <td>${escapeHtml(item.description ?? '-')}</td>
                        <td>${escapeHtml(item.date_found)}</td>
                        <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
                        <td>
                            <a href="edit_found_item.html?id=${item.item_id}" class="btn-edit" title="Edit">
                                <i class="fas fa-edit"></i> Edit
                            </a>
                        </td>
                    </tr>`;
            }).join('');
        } else {
            summary.textContent = '';
            tbody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="empty-state">
                            <i class="fas fa-box-open"></i>
                            No found items match your search.
                        </div>
                    </td>
                </tr>`;
        }
    } catch (error) {
        console.error('Error fetching items:', error);
        document.getElementById('staffItemsTable').innerHTML =
            '<tr><td colspan="7" style="text-align:center;color:red;padding:20px;">Failed to load items.</td></tr>';
    }
}

// Load and render items table
document.addEventListener('DOMContentLoaded', loadItems);