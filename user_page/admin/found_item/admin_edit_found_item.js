// admin_edit_found_item.js

// ── Sidebar & UI helpers ──────────────────────────────────
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const body = document.body;

    if (!sidebar) return;

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
    const dropdown = document.getElementById('userDropdownMenu');

    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

function logoutUser(event) {
    if (event) {
        event.preventDefault();
    }

    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '../../../mainpage/logout/logout.php';
        return true;
    }

    return false;
}

// ── Global click handlers ──────────────────────────────────
document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('userDropdownMenu');
    const wrapper = document.querySelector('.user-info-wrapper');

    if (dropdown && wrapper && dropdown.classList.contains('show')) {
        if (!wrapper.contains(event.target) && !dropdown.contains(event.target)) {
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

// ── Utility helpers ────────────────────────────────────────
function getEl(...ids) {
    for (const id of ids) {
        const element = document.getElementById(id);

        if (element) {
            return element;
        }
    }

    return null;
}

function escapeHtml(str) {
    if (str === null || str === undefined || str === '') return '-';

    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatStatus(status) {
    if (!status) return '-';
    return status.charAt(0).toUpperCase() + status.slice(1);
}

// ── Alert banner ──────────────────────────────────────────
function showAlert(message, type = 'success') {
    const banner = document.getElementById('alertBanner');
    const icon = document.getElementById('alertIcon');
    const msgEl = document.getElementById('alertMessage');

    // Support staff-style alertBox too
    const alertBox = document.getElementById('alertBox');

    if (banner && icon && msgEl) {
        banner.className = `alert-banner alert-${type} show`;
        icon.className = type === 'success'
            ? 'fas fa-check-circle'
            : 'fas fa-exclamation-triangle';
        msgEl.textContent = message;

        banner.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });

        if (type === 'success') {
            setTimeout(() => {
                banner.classList.remove('show');
            }, 4000);
        }

        return;
    }

    if (alertBox) {
        const bgColor = type === 'success' ? '#d4edda' : '#f8d7da';
        const textColor = type === 'success' ? '#155724' : '#721c24';
        const borderColor = type === 'success' ? '#c3e6cb' : '#f5c6cb';
        const alertIcon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';

        alertBox.innerHTML = `
            <div style="
                background:${bgColor};
                color:${textColor};
                border:1px solid ${borderColor};
                padding:12px 16px;
                border-radius:8px;
                margin-bottom:16px;
                font-size:14px;
                display:flex;
                align-items:center;
                gap:10px;
            ">
                <i class="fas ${alertIcon}"></i>
                <span>${escapeHtml(message)}</span>
            </div>
        `;

        alertBox.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });

        return;
    }

    alert(message);
}

function setSaveButtonLoading(isLoading) {
    const saveBtn = getEl('saveBtn', 'submitBtn');

    if (!saveBtn) return;

    if (isLoading) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    } else {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
    }
}

// ── Current photo rendering ────────────────────────────────
function renderCurrentPhoto(photoPath) {
    const currentPhotoBox = document.getElementById('currentPhotoBox');
    const currentPhoto = document.getElementById('currentPhoto');

    if (!currentPhotoBox || !currentPhoto) {
        console.warn('Current photo elements not found. Add currentPhotoBox and currentPhoto in admin_edit_found_item.php.');
        return;
    }

    if (photoPath && photoPath !== 'NULL' && photoPath !== 'null') {
        const imagePath = '../../../' + photoPath;

        currentPhoto.src = imagePath;
        currentPhoto.alt = 'Current found item photo';

        currentPhoto.onerror = function () {
            console.error('Image failed to load:', imagePath);
            currentPhotoBox.style.display = 'none';
        };

        currentPhoto.onload = function () {
            currentPhotoBox.style.display = 'block';
        };
    } else {
        currentPhoto.removeAttribute('src');
        currentPhotoBox.style.display = 'none';
    }
}

// ── New photo preview ──────────────────────────────────────
function setupNewPhotoPreview() {
    const photoInput = document.getElementById('photo');
    const currentPhotoBox = document.getElementById('currentPhotoBox');
    const currentPhoto = document.getElementById('currentPhoto');

    if (!photoInput || !currentPhotoBox || !currentPhoto) return;

    photoInput.addEventListener('change', function () {
        const file = this.files[0];

        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

        if (!allowedTypes.includes(file.type)) {
            showAlert('Only JPG and PNG images are allowed.', 'error');
            this.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showAlert('Image size must not exceed 5MB.', 'error');
            this.value = '';
            return;
        }

        const reader = new FileReader();

        reader.onload = function (event) {
            currentPhoto.src = event.target.result;
            currentPhoto.alt = 'New selected photo';
            currentPhotoBox.style.display = 'block';

            let note = document.getElementById('newPhotoNote');

            if (!note) {
                note = document.createElement('small');
                note.id = 'newPhotoNote';
                note.style.display = 'block';
                note.style.marginTop = '8px';
                note.style.color = '#666';
                currentPhotoBox.appendChild(note);
            }

            note.textContent = 'New photo selected. It will replace the current photo after saving.';
        };

        reader.readAsDataURL(file);
    });
}

// ── Fill page data ─────────────────────────────────────────
function fillItemData(item) {
    const itemIdInput = getEl('itemId');
    const itemNameInput = getEl('itemName');
    const locationInput = getEl('locationFound');
    const dateInput = getEl('dateFound');
    const statusSelect = getEl('foundStatus', 'statusSelect');
    const descriptionInput = getEl('description');

    if (itemIdInput) itemIdInput.value = item.item_id || '';
    if (itemNameInput) itemNameInput.value = item.item_name || '';
    if (locationInput) locationInput.value = item.location_found || '';
    if (dateInput) dateInput.value = item.date_found || '';
    if (statusSelect) statusSelect.value = item.found_status || 'unclaimed';
    if (descriptionInput) descriptionInput.value = item.description ?? '';

    const titleText = `Edit: ${item.item_name}`;

    const pageTitle = getEl('pageTitle', 'editTitle');
    const pageHeaderTitle = getEl('pageHeaderTitle');

    if (pageTitle) pageTitle.textContent = titleText;
    if (pageHeaderTitle) pageHeaderTitle.textContent = titleText;

    document.title = `${titleText} - Admin Panel`;

    // Support old meta IDs and staff-style meta IDs
    const metaId = getEl('metaId', 'metaItemId');
    const metaReporter = getEl('metaReporter', 'metaReportedBy');
    const metaDateFound = getEl('metaDateFound');
    const metaStatus = getEl('metaStatus');
    const metaStrip = getEl('metaStrip', 'itemMeta');

    if (metaId) metaId.textContent = item.item_id || '-';
    if (metaReporter) metaReporter.textContent = item.reported_by || item.reporter_name || 'Unknown';
    if (metaDateFound) metaDateFound.textContent = item.date_found || '-';
    if (metaStatus) metaStatus.textContent = formatStatus(item.found_status);

    if (metaStrip) {
        metaStrip.style.display = 'flex';
    }

    renderCurrentPhoto(item.photo);
}

// ── Load categories ────────────────────────────────────────
function fillCategories(categories, selectedCategoryId) {
    const select = document.getElementById('categorySelect');

    if (!select) return;

    select.innerHTML = '<option value="">-- Select Category --</option>';

    categories.forEach(category => {
        const option = new Option(category.category_name, category.category_id);

        if (String(category.category_id) === String(selectedCategoryId)) {
            option.selected = true;
        }

        select.add(option);
    });
}

// ── Main logic ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async function () {
    setupNewPhotoPreview();

    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('id');

    if (!itemId) {
        window.location.href = 'admin_found_items.php';
        return;
    }

    try {
        const [catRes, itemRes] = await Promise.all([
            fetch('admin_get_categories.php', {
                credentials: 'same-origin'
            }),
            fetch(`admin_get_item.php?id=${encodeURIComponent(itemId)}`, {
                credentials: 'same-origin'
            })
        ]);

        const catText = await catRes.text();
        const itemText = await itemRes.text();

        let catData;
        let itemData;

        try {
            catData = JSON.parse(catText);
        } catch (error) {
            console.error('admin_get_categories.php did not return JSON:', catText);
            throw new Error('Invalid category response.');
        }

        try {
            itemData = JSON.parse(itemText);
        } catch (error) {
            console.error('admin_get_item.php did not return JSON:', itemText);
            throw new Error('Invalid item response.');
        }

        if (!itemData.success) {
            showAlert(itemData.message || 'Item not found. Redirecting...', 'error');

            setTimeout(() => {
                window.location.href = 'admin_found_items.php';
            }, 2500);

            return;
        }

        const item = itemData.data;

        if (catData.success && Array.isArray(catData.data)) {
            fillCategories(catData.data, item.category_id);
        }

        fillItemData(item);

    } catch (error) {
        console.error('Failed to load item data:', error);
        showAlert('Failed to load item data. Please refresh and try again.', 'error');
    }

    const form = getEl('editItemForm', 'editFoundItemForm');

    if (!form) {
        console.error('Edit form not found. Expected editItemForm or editFoundItemForm.');
        return;
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        setSaveButtonLoading(true);

        try {
            const response = await fetch('admin_update_found_item.php', {
                method: 'POST',
                body: new FormData(form),
                credentials: 'same-origin'
            });

            const text = await response.text();

            let result;

            try {
                result = JSON.parse(text);
            } catch (error) {
                console.error('admin_update_found_item.php did not return JSON:', text);
                throw new Error('Invalid update response.');
            }

            if (result.success) {
                showAlert(result.message || 'Item updated successfully! Redirecting...', 'success');

                setTimeout(() => {
                    window.location.href = 'admin_found_items.php';
                }, 1500);
            } else {
                showAlert(result.message || 'Update failed. Please try again.', 'error');
                setSaveButtonLoading(false);
            }
        } catch (error) {
            console.error('Update error:', error);
            showAlert('Network error or invalid PHP response. Please check console.', 'error');
            setSaveButtonLoading(false);
        }
    });
});