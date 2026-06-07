// ── Sidebar & UI helpers ──────────────────────────────────
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const body    = document.body;
    let overlay   = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay           = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.onclick   = () => {
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

document.addEventListener('click', function (e) {
    const dropdown = document.getElementById('userDropdownMenu');
    const wrapper  = document.querySelector('.user-info-wrapper');
    if (dropdown && wrapper && dropdown.classList.contains('show')) {
        if (!wrapper.contains(e.target) && !dropdown.contains(e.target))
            dropdown.classList.remove('show');
    }
});

window.addEventListener('resize', () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (window.innerWidth > 768 && sidebar) {
        sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ── Alert banner ──────────────────────────────────────────
function showAlert(message, type = 'success') {
    const banner  = document.getElementById('alertBanner');
    const icon    = document.getElementById('alertIcon');
    const msgEl   = document.getElementById('alertMessage');
    banner.className  = `alert-banner alert-${type} show`;
    icon.className    = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
    msgEl.textContent = message;
    banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    if (type === 'success') {
        setTimeout(() => banner.classList.remove('show'), 4000);
    }
}

// ── Main logic ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async function () {
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('id');

    if (!itemId) {
        window.location.href = 'admin_found_items.html';
        return;
    }

    // Fetch categories + item data in parallel
    try {
        const [catRes, itemRes] = await Promise.all([
            fetch('admin_get_categories.php', { credentials: 'same-origin' }),
            fetch(`admin_get_item.php?id=${itemId}`, { credentials: 'same-origin' })
        ]);

        const catData  = await catRes.json();
        const itemData = await itemRes.json();

        if (!itemData.success) {
            showAlert(itemData.message || 'Item not found. Redirecting…', 'error');
            setTimeout(() => window.location.href = 'admin_found_items.html', 2500);
            return;
        }

        const item = itemData.data;

        // Populate category dropdown
        if (catData.success) {
            const select = document.getElementById('categorySelect');
            catData.data.forEach(c => {
                const opt      = new Option(c.category_name, c.category_id);
                if (c.category_id == item.category_id) opt.selected = true;
                select.add(opt);
            });
        }

        // Populate form fields
        document.getElementById('itemId').value       = item.item_id;
        document.getElementById('itemName').value     = item.item_name;
        document.getElementById('locationFound').value = item.location_found;
        document.getElementById('dateFound').value    = item.date_found;
        document.getElementById('foundStatus').value  = item.found_status;
        document.getElementById('description').value  = item.description ?? '';

        // Update page titles
        const title = `Edit: ${item.item_name}`;
        document.getElementById('pageTitle').textContent      = title;
        document.getElementById('pageHeaderTitle').textContent = title;
        document.title = `${title} - Admin Panel`;

        // Populate meta strip
        document.getElementById('metaId').textContent       = item.item_id;
        document.getElementById('metaReporter').textContent  = item.reported_by || 'Unknown';
        document.getElementById('metaDateFound').textContent = item.date_found || '-';
        document.getElementById('metaStrip').style.display  = 'flex';

    } catch (err) {
        console.error('Failed to load item data:', err);
        showAlert('Failed to load item data. Please refresh and try again.', 'error');
    }

    // ── Form submit (Update) ──────────────────────────────
    document.getElementById('editItemForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const saveBtn = document.getElementById('saveBtn');
        saveBtn.disabled   = true;
        saveBtn.innerHTML  = '<i class="fas fa-spinner fa-spin"></i> Saving…';

        try {
            const res    = await fetch('admin_update_found_item.php', {
                method : 'POST',
                body   : new FormData(this)
            });
            const result = await res.json();

            if (result.success) {
                showAlert('Item updated successfully! Redirecting…', 'success');
                setTimeout(() => window.location.href = 'admin_found_items.html', 1800);
            } else {
                showAlert(result.message || 'Update failed. Please try again.', 'error');
                saveBtn.disabled  = false;
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
            }
        } catch (err) {
            console.error('Update error:', err);
            showAlert('Network error. Please check your connection and try again.', 'error');
            saveBtn.disabled  = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
        }
    });
});
