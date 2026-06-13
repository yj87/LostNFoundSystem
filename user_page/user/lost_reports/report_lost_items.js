document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    loadUserInfo();
    setupFormSubmit();
    setMaxDate();
});

function setMaxDate() {
    const dateInput = document.getElementById('date_lost');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.max = today;
    }
}

async function loadUserInfo() {
    try {
        const response = await fetch('report_lost_items.php?action=user');
        const data = await response.json();
        if (data.success) {
            const userAvatar = document.getElementById('userAvatar');
            if (userAvatar) userAvatar.textContent = data.user_avatar;
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

async function loadCategories() {
    try {
        const response = await fetch('report_lost_items.php?action=categories');
        const data = await response.json();
        
        if (data.success) {
            populateCategorySelect(data.categories);
        } else {
            showAlert('Failed to load categories', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Network error occurred', 'error');
    }
}

function populateCategorySelect(categories) {
    const select = document.getElementById('category_id');
    if (!select) return;
    
    let options = '<option value="">Select Category</option>';
    for (let i = 0; i < categories.length; i++) {
        options += '<option value="' + categories[i].category_id + '">' + escapeHtml(categories[i].category_name) + '</option>';
    }
    select.innerHTML = options;
}

function setupFormSubmit() {
    const form = document.getElementById('reportForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            submitReport();
        });
    }
}

async function submitReport() {
    const item_name = document.getElementById('item_name').value;
    const category_id = document.getElementById('category_id').value;
    const description = document.getElementById('description').value;
    const location_lost = document.getElementById('location_lost').value;
    const date_lost = document.getElementById('date_lost').value;
    const photo = document.getElementById('photo').files[0]; // Get photo file
    
    if (!item_name || !category_id || !location_lost || !date_lost) {
        showAlert('Please fill all required fields', 'error');
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    const loadingDiv = document.getElementById('loadingDiv');
    
    submitBtn.disabled = true;
    loadingDiv.style.display = 'block';
    
    const formData = new FormData();
    formData.append('action', 'submit');
    formData.append('item_name', item_name);
    formData.append('category_id', category_id);
    formData.append('description', description);
    formData.append('location_lost', location_lost);
    formData.append('date_lost', date_lost);
    
    // Add photo if selected
    if (photo) {
        formData.append('photo', photo);
    }
    
    try {
        const response = await fetch('report_lost_items.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        if (data.success) {
            showAlert(data.message, 'success');
            document.getElementById('reportForm').reset();
            setMaxDate();
            loadCategories();
            // Clear file input
            document.getElementById('photo').value = '';
        } else {
            showAlert(data.message || 'Failed to submit report', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Network error occurred', 'error');
    } finally {
        submitBtn.disabled = false;
        loadingDiv.style.display = 'none';
    }
}

function showAlert(message, type) {
    const alertDiv = document.getElementById('alertMessage');
    alertDiv.textContent = message;
    alertDiv.className = 'alert alert-' + type + ' show';
    
    setTimeout(function() {
        alertDiv.classList.remove('show');
    }, 5000);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}