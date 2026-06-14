const urlParams = new URLSearchParams(window.location.search);
const reportId = urlParams.get('id');

let categories = [];

document.addEventListener('DOMContentLoaded', function() {
    if (!reportId) {
        showAlert('No report ID specified', 'error');
        return;
    }
    loadCategories();
    loadReport();
    setupFormSubmit();
});

async function loadCategories() {
    try {
        const response = await fetch('view_lost_reports.php?action=categories');
        const data = await response.json();
        if (data.success) {
            categories = data.categories;
            populateCategorySelect();
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function populateCategorySelect() {
    const select = document.getElementById('category_id');
    if (!select) return;
    
    let options = '<option value="0">Uncategorized</option>';
    for (let i = 0; i < categories.length; i++) {
        options += '<option value="' + categories[i].category_id + '">' + escapeHtml(categories[i].category_name) + '</option>';
    }
    select.innerHTML = options;
}

async function loadReport() {
    const loadingDiv = document.getElementById('loadingDiv');
    const formContainer = document.getElementById('formContainer');
    
    if (loadingDiv) loadingDiv.style.display = 'block';
    
    try {
        const response = await fetch('view_lost_reports.php?id=' + reportId);
        const data = await response.json();
        
        if (data.success) {
            displayReportData(data.report);
            if (formContainer) formContainer.style.display = 'block';
        } else {
            showAlert(data.message || 'Failed to load report', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Network error occurred', 'error');
    } finally {
        if (loadingDiv) loadingDiv.style.display = 'none';
    }
}

function displayReportData(report) {
    document.getElementById('report_id').value = report.report_id;
    document.getElementById('item_name').value = report.item_name;
    
    let description = report.description || '';
    description = description.replace(/<br\s*\/?>/gi, '\n');
    document.getElementById('description').value = description;
    document.getElementById('location_lost').value = report.location_lost;
    
    if (report.date_lost) {
        document.getElementById('date_lost').value = report.date_lost;
    }
    
    document.getElementById('lost_status').value = report.lost_status;
    
    if (report.category_id && document.getElementById('category_id')) {
        document.getElementById('category_id').value = report.category_id;
    }
    
    // Display current photo
    const photoContainer = document.getElementById('currentPhotoContainer');
    if (photoContainer) {
        if (report.photo) {
            photoContainer.innerHTML = '<img src="../../../' + report.photo + '" style="max-width: 300px; max-height: 200px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;">';
        } else {
            photoContainer.innerHTML = '<div style="padding: 20px; background: #f8f9fa; border-radius: 8px; color: #999;"><i class="fas fa-image"></i> No photo uploaded</div>';
        }
    }
}

function setupFormSubmit() {
    const form = document.getElementById('editForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveReport();
        });
    }
}

async function saveReport() {
    const formData = new FormData();
    formData.append('report_id', document.getElementById('report_id').value);
    formData.append('item_name', document.getElementById('item_name').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('location_lost', document.getElementById('location_lost').value);
    formData.append('date_lost', document.getElementById('date_lost').value);
    formData.append('lost_status', document.getElementById('lost_status').value);
    formData.append('category_id', document.getElementById('category_id').value);
    
    const photoFile = document.getElementById('photo').files[0];
    if (photoFile) {
        formData.append('photo', photoFile);
    }
    
    const saveBtn = document.querySelector('.btn-save');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    }
    
    try {
        const response = await fetch('edit_lost_reports.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        if (data.success) {
            showAlert('Report edited successfully!', 'success');
            setTimeout(function() {
                window.location.href = 'view_lost_reports.html';
            }, 1500);
        } else {
            showAlert(data.message || 'Failed to edit report', 'error');
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
            }
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Network error occurred', 'error');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
        }
    }
}

function showAlert(message, type) {
    const alertDiv = document.getElementById('alertMessage');
    if (alertDiv) {
        alertDiv.textContent = message;
        alertDiv.className = 'alert alert-' + type + ' show';
        
        setTimeout(function() {
            alertDiv.classList.remove('show');
        }, 3000);
    }
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