// add_found_item.js

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
// PAGE LOGIC
// ==============================

document.addEventListener('DOMContentLoaded', async function () {
    const dateInput = document.getElementById('dateFound');
    const categorySelect = document.getElementById('categorySelect');
    const form = document.getElementById('addFoundItemForm');
    const alertBox = document.getElementById('alertBox');
    const submitBtn = document.getElementById('submitBtn');

    // Prevent selecting future dates
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('max', today);
    }

    // Load categories
    if (categorySelect) {
        try {
            const response = await fetch('get_categories.php', {
                credentials: 'same-origin'
            });

            const result = await response.json();

            if (result.success && result.data && result.data.length > 0) {
                result.data.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.category_id;
                    option.textContent = category.category_name;
                    categorySelect.appendChild(option);
                });
            } else {
                categorySelect.innerHTML = '<option value="">-- No Categories Found --</option>';
                console.error('Category fetch failed:', result.message || 'Empty result');
            }
        } catch (error) {
            console.error('Dropdown Error:', error);
            categorySelect.innerHTML = '<option value="">-- Failed to Load Categories --</option>';
        }
    }

    // Submit form
    if (form) {
        form.addEventListener('submit', async function (event) {
            event.preventDefault();

            const formData = new FormData(form);

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Saving...';

            try {
                const response = await fetch('add_found_item.php', {
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
                    throw new Error('Invalid JSON response from add_found_item.php');
                }

                if (result.success) {
                    alertBox.innerHTML = `
                        <div style="background: #d4edda; color: #155724; border: 1px solid #c3e6cb; padding: 15px; border-radius: 6px; margin-bottom: 20px; font-weight:500;">
                            <i class="fas fa-check-circle"></i> ${result.message || 'Item added successfully.'} Redirecting...
                        </div>
                    `;

                    form.reset();

                    setTimeout(() => {
                        window.location.href = 'staff_found_items_page.php';
                    }, 1200);
                } else {
                    throw new Error(result.message || 'Operation failed.');
                }
            } catch (error) {
                alertBox.innerHTML = `
                    <div style="background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; padding: 15px; border-radius: 6px; margin-bottom: 20px; font-weight:500;">
                        <i class="fas fa-exclamation-triangle"></i> ${error.message}
                    </div>
                `;

                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Registry Record';
            }
        });
    }
});