// edit_found_item.js

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

    if (!dropdown) return;

    dropdown.classList.toggle('show');
}

function logoutUser(event) {
    if (event) {
        event.preventDefault();
    }

    const confirmLogout = confirm('Are you sure you want to logout?');

    if (confirmLogout) {
        window.location.href = '../../../mainpage/logout/logout.php';
    }

    return false;
}

// ==============================
// GLOBAL EVENTS
// ==============================

document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.getElementById('menuToggle');
    const userInfoWrapper = document.getElementById('userInfoWrapper');
    const logoutLink = document.getElementById('logoutLink');
    const dropdownLogoutLink = document.getElementById('dropdownLogoutLink');

    if (menuToggle) {
        menuToggle.addEventListener('click', function (event) {
            event.preventDefault();
            toggleSidebar();
        });
    }

    if (userInfoWrapper) {
        userInfoWrapper.addEventListener('click', function (event) {
            event.stopPropagation();
            toggleUserDropdown();
        });
    }

    if (logoutLink) {
        logoutLink.addEventListener('click', logoutUser);
    }

    if (dropdownLogoutLink) {
        dropdownLogoutLink.addEventListener('click', logoutUser);
    }
});

document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('userDropdownMenu');
    const wrapper = document.getElementById('userInfoWrapper');

    if (dropdown && dropdown.classList.contains('show')) {
        if (wrapper && !wrapper.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    }

    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
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
<<<<<<< HEAD
                window.location.href = 'staff_found_items_page.php';
=======
                window.location.href = 'staff_found_items.php';
>>>>>>> 28d9b1c958fa2a6a794c5fea0f1fde71fa67dbcf
            }, 1800);

            return null;
        }

        console.log('Loaded item:', result.data);
        console.log('Photo path:', result.data.photo);

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
    const pageHeaderTitle = document.getElementById('pageTitleHeader');

    if (editTitle) editTitle.textContent = titleText;
    if (pageHeaderTitle) pageHeaderTitle.textContent = titleText;

    document.title = `${titleText} - Staff Panel`;

    renderCurrentPhoto(item.photo);
}

function renderCurrentPhoto(photoPath) {
    const currentPhotoBox = document.getElementById('currentPhotoBox');
    const currentPhoto = document.getElementById('currentPhoto');

    if (!currentPhotoBox || !currentPhoto) {
        console.error('Current photo elements not found.');
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

// ==============================
// PHOTO PREVIEW
// ==============================

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

            note.textContent = 'New photo selected. It will replace the current photo after update.';
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
<<<<<<< HEAD
                    window.location.href = 'staff_found_items_page.php';
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
<<<<<<< HEAD
            window.location.href = 'staff_found_items_page.php';
=======
            window.location.href = 'staff_found_items.php';
>>>>>>> 28d9b1c958fa2a6a794c5fea0f1fde71fa67dbcf
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