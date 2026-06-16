// edit_found_item.js

// ==============================
// UI HELPERS
// ==============================

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

function escapeHtml(str) {
    if (str === null || str === undefined || str === '') return '-';

    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function showAlert(message, type = 'success') {
    const alertBox = document.getElementById('alertBox');

    if (!alertBox) {
        alert(message);
        return;
    }

    const bgColor = type === 'success' ? '#d4edda' : '#f8d7da';
    const textColor = type === 'success' ? '#155724' : '#721c24';
    const borderColor = type === 'success' ? '#c3e6cb' : '#f5c6cb';
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';

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
            <i class="fas ${icon}"></i>
            <span>${escapeHtml(message)}</span>
        </div>
    `;

    alertBox.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
    });
}

function setButtonLoading(isLoading) {
    const submitBtn = document.getElementById('submitBtn');

    if (!submitBtn) return;

    if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Record';
    }
}

// ==============================
// LOAD CATEGORIES
// ==============================

async function loadCategories(selectedCategoryId = null) {
    const select = document.getElementById('categorySelect');

    if (!select) return;

    select.innerHTML = '<option value="">-- Choose Category --</option>';

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

                if (String(category.category_id) === String(selectedCategoryId)) {
                    option.selected = true;
                }

                select.appendChild(option);
            });
        } else {
            showAlert(result.message || 'Failed to load categories.', 'error');
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        showAlert('Error loading categories.', 'error');
    }
}

// ==============================
// LOAD ITEM DETAILS
// ==============================

async function loadItemDetails(itemId) {
    try {
        const response = await fetch(`edit_found_item.php?id=${encodeURIComponent(itemId)}`, {
            credentials: 'same-origin'
        });

        const text = await response.text();

        let result;

        try {
            result = JSON.parse(text);
        } catch (jsonError) {
            console.error('PHP did not return JSON. Response was:', text);
            throw new Error('Invalid JSON response from edit_found_item.php');
        }

        if (!result.success) {
            showAlert(result.message || 'Item not found.', 'error');

            setTimeout(() => {
                window.location.href = 'staff_found_items.php';
            }, 1800);

            return null;
        }

        return result.data;
    } catch (error) {
        console.error('Error loading item details:', error);
        showAlert('Failed to load item details. Please refresh and try again.', 'error');
        return null;
    }
}

function fillForm(item) {
    const itemIdInput = document.getElementById('itemId');
    const itemNameInput = document.getElementById('itemName');
    const locationInput = document.getElementById('locationFound');
    const dateInput = document.getElementById('dateFound');
    const statusSelect = document.getElementById('statusSelect') || document.getElementById('foundStatus');
    const descriptionInput = document.getElementById('description');

    if (itemIdInput) itemIdInput.value = item.item_id || '';
    if (itemNameInput) itemNameInput.value = item.item_name || '';
    if (locationInput) locationInput.value = item.location_found || '';
    if (dateInput) dateInput.value = item.date_found || '';
    if (statusSelect) statusSelect.value = item.found_status || 'unclaimed';
    if (descriptionInput) descriptionInput.value = item.description || '';

    const titleText = item.item_name ? `Edit Record: ${item.item_name}` : 'Edit Found Item';

    const editTitle = document.getElementById('editTitle');
    const pageHeaderTitle = document.getElementById('pageHeaderTitle');

    if (editTitle) editTitle.textContent = titleText;
    if (pageHeaderTitle) pageHeaderTitle.textContent = titleText;

    document.title = `${titleText} - Staff Panel`;

    renderCurrentPhoto(item.photo);
}

function renderCurrentPhoto(photoPath) {
    const preview = document.getElementById('currentPhotoPreview');

    if (!preview) return;

    if (photoPath) {
        preview.innerHTML = `
            <img src="../../../${escapeHtml(photoPath)}"
                 alt="Current found item photo"
                 style="
                    width: 120px;
                    height: 90px;
                    object-fit: cover;
                    border-radius: 8px;
                    border: 1px solid #ddd;
                    background: #f8f8f8;
                 ">
        `;
    } else {
        preview.innerHTML = `
            <div class="no-image" style="
                width: 120px;
                height: 90px;
                border: 1px dashed #ccc;
                border-radius: 8px;
                background: #f8f8f8;
                color: #aaa;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <i class="fas fa-image"></i>
            </div>
        `;
    }
}

// ==============================
// PHOTO PREVIEW
// ==============================

function setupNewPhotoPreview() {
    const photoInput = document.getElementById('photo');
    const preview = document.getElementById('currentPhotoPreview');

    if (!photoInput || !preview) return;

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
            preview.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <img src="${event.target.result}"
                         alt="New selected photo"
                         style="
                            width: 120px;
                            height: 90px;
                            object-fit: cover;
                            border-radius: 8px;
                            border: 1px solid #ddd;
                            background: #f8f8f8;
                         ">
                    <small style="color:#666;">New photo selected. It will replace the current photo after update.</small>
                </div>
            `;
        };

        reader.readAsDataURL(file);
    });
}

// ==============================
// SUBMIT UPDATE
// ==============================

function setupFormSubmit() {
    const form = document.getElementById('editFoundItemForm') || document.getElementById('editItemForm');

    if (!form) {
        console.error('Edit form not found. Make sure the form ID is editFoundItemForm.');
        return;
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        setButtonLoading(true);

        try {
            const formData = new FormData(form);

            const response = await fetch('update_found_item.php', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });

            const text = await response.text();

            let result;

            try {
                result = JSON.parse(text);
            } catch (jsonError) {
                console.error('PHP did not return JSON. Response was:', text);
                throw new Error('Invalid JSON response from update_found_item.php');
            }

            if (result.success) {
                showAlert('Item updated successfully.', 'success');

                setTimeout(() => {
                    window.location.href = 'staff_found_items.php';
                }, 1000);
            } else {
                showAlert(result.message || 'Failed to update item.', 'error');
            }
        } catch (error) {
            console.error('Error updating item:', error);
            showAlert('Failed to update item. Please try again.', 'error');
        } finally {
            setButtonLoading(false);
        }
    });
}

// ==============================
// INIT
// ==============================

document.addEventListener('DOMContentLoaded', async function () {
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('id');

    if (!itemId) {
        showAlert('Invalid item ID. Redirecting...', 'error');

        setTimeout(() => {
            window.location.href = 'staff_found_items.php';
        }, 1200);

        return;
    }

    setupNewPhotoPreview();
    setupFormSubmit();

    const item = await loadItemDetails(itemId);

    if (!item) return;

    await loadCategories(item.category_id);
    fillForm(item);
});