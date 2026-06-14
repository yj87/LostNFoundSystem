// ── Sidebar & UI helpers ──────────────────────────────────
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const body = document.body;

    let overlay = document.querySelector('.sidebar-overlay');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';

        overlay.onclick = () => {
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
    document.getElementById('userDropdownMenu')?.classList.toggle('show');
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

    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

// Close dropdown / sidebar on outside click
document.addEventListener('click', function (e) {
    const dropdown = document.getElementById('userDropdownMenu');
    const wrapper = document.querySelector('.user-info-wrapper');
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    const overlay = document.querySelector('.sidebar-overlay');

    if (dropdown && wrapper && dropdown.classList.contains('show')) {
        if (!wrapper.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    }

    if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
        if (menuToggle && !menuToggle.contains(e.target) && !sidebar.contains(e.target)) {
            sidebar.classList.remove('active');

            if (overlay) {
                overlay.classList.remove('active');
            }

            document.body.style.overflow = '';
        }
    }
});

window.addEventListener('resize', () => {
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

// ── Toast ─────────────────────────────────────────────────
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toastIcon');
    const msgEl = document.getElementById('toastMessage');

    toast.className = `toast toast-${type} show`;
    icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    msgEl.textContent = message;

    setTimeout(() => toast.classList.remove('show'), 3500);
}

// ── Delete Modal ──────────────────────────────────────────
let pendingDeleteId = null;

function openDeleteModal(id, name) {
    pendingDeleteId = id;
    document.getElementById('deleteItemName').textContent = name;
    document.getElementById('deleteModal').classList.add('show');
}

function closeDeleteModal() {
    pendingDeleteId = null;
    document.getElementById('deleteModal').classList.remove('show');
}

async function confirmDelete() {
    if (!pendingDeleteId) return;

    const btn = document.getElementById('confirmDeleteBtn');

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting…';

    try {
        const res = await fetch('admin_delete_found_item.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `item_id=${encodeURIComponent(pendingDeleteId)}`
        });

        const result = await res.json();

        if (result.success) {
            showToast('Item deleted successfully.', 'success');
            closeDeleteModal();
            loadItems();
        } else {
            showToast(result.message || 'Delete failed.', 'error');
        }
    } catch (err) {
        console.error('Delete error:', err);
        showToast('Network error. Please try again.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-trash-alt"></i> Delete';
    }
}

// ── Data Loading ──────────────────────────────────────────
let searchTimer = null;

function handleSearch() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadItems, 350);
}

function getStatusClass(status) {
    if (status === 'claimed') return 'status-claimed';
    if (status === 'pending') return 'status-pending';
    return 'status-unclaimed';
}

function getStatusLabel(status) {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
}

async function loadItems() {
    const search = document.getElementById('searchInput').value.trim();
    const status = document.getElementById('statusFilter').value;
    const category = document.getElementById('categoryFilter').value;

    let url = 'get_admin_items.php?';

    if (search) {
        url += `search=${encodeURIComponent(search)}&`;
    }

    if (status) {
        url += `status=${encodeURIComponent(status)}&`;
    }

    if (category) {
        url += `category=${encodeURIComponent(category)}`;
    }

    const tbody = document.getElementById('adminItemsTable');

    tbody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align:center;padding:24px;">
                <i class="fas fa-spinner fa-spin"></i> Loading…
            </td>
        </tr>
    `;

    try {
        const res = await fetch(url, {
            credentials: 'same-origin'
        });

        const result = await res.json();
        const summary = document.getElementById('resultsSummary');

        if (result.success && result.data.length > 0) {
            summary.textContent = `Showing ${result.data.length} item${result.data.length !== 1 ? 's' : ''}`;

            tbody.innerHTML = result.data.map(item => {
                const statusClass = getStatusClass(item.found_status);
                const statusLabel = getStatusLabel(item.found_status);

                const imageHtml = item.photo
                    ? `<img src="../../../${escapeHtml(item.photo)}" class="item-thumb" alt="Found item image">`
                    : `<div class="no-image"><i class="fas fa-image"></i></div>`;

                const safeItemNameForModal = escapeHtml(item.item_name).replace(/'/g, "\\'");

                return `
                <tr>

                <td>F${escapeHtml(item.item_id)}</td>

                <td>${imageHtml}</td>

                <td>
                <strong>${escapeHtml(item.item_name)}</strong>
                </td>

                <td>${escapeHtml(item.category_name)}</td>

                <td>${escapeHtml(item.date_found)}</td>

                <td>
                    <span class="status-badge ${statusClass}">
                    ${statusLabel}
                    </span>
                </td>

                <td style="white-space:nowrap;">
                            <a href="../../item_details/view_item_details.html?id=${item.item_id}&from=admin"
                               class="btn-view"
                               title="View Details">
                                <i class="fas fa-eye"></i> View
                            </a>

                            <a href="admin_edit_found_item.html?id=${item.item_id}"
                               class="btn-edit"
                               title="Edit">
                                <i class="fas fa-edit"></i> Edit
                            </a>

                            <button onclick="openDeleteModal(${item.item_id}, '${safeItemNameForModal}')"
                                    class="btn-delete"
                                    title="Delete">
                                <i class="fas fa-trash-alt"></i> Delete
                            </button>
                        </td>
                    </tr>
                `;
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
                </tr>
            `;
        }
    } catch (err) {
        console.error('Error loading items:', err);

        document.getElementById('adminItemsTable').innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;color:red;padding:20px;">
                    Failed to load items. Please try again.
                </td>
            </tr>
        `;
    }
}

async function loadCategories() {
    try {
        const res = await fetch('admin_get_categories.php', {
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

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadItems();
});