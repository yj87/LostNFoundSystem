let itemData = null;
let lostReportsList = [];
const urlParams = new URLSearchParams(window.location.search);
const itemId = urlParams.get('item_id');

document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, itemId:', itemId);
    
    if (!itemId) {
        showError('No item selected. Please go back and select an item to claim.');
        document.getElementById('formContainer').style.display = 'none';
        return;
    }
    
    loadItemDetails();
    loadLostReports();
    
    // Attach event listeners
    const cancelBtn = document.getElementById('cancelBtn');
    const confirmBtn = document.getElementById('confirmContinueBtn');
    const backToStep1Btn = document.getElementById('backToStep1Btn');
    const nextToDetailsBtn = document.getElementById('nextToDetailsBtn');
    const backToStep2Btn = document.getElementById('backToStep2Btn');
    const reviewBtn = document.getElementById('reviewClaimBtn');
    const backToStep3Btn = document.getElementById('backToStep3Btn');
    const submitBtn = document.getElementById('submitBtn');
    
    if (cancelBtn) cancelBtn.onclick = goBack;
    if (confirmBtn) confirmBtn.onclick = goToStep2;
    if (backToStep1Btn) backToStep1Btn.onclick = goToStep1;
    if (nextToDetailsBtn) nextToDetailsBtn.onclick = goToStep3;
    if (backToStep2Btn) backToStep2Btn.onclick = goToStep2;
    if (reviewBtn) reviewBtn.onclick = goToStep4;
    if (backToStep3Btn) backToStep3Btn.onclick = goToStep3;
    if (submitBtn) submitBtn.onclick = submitClaim;
});

async function loadLostReports() {
    try {
        const response = await fetch('submit_claim.php?action=get_lost_reports');
        const data = await response.json();
        
        if (data.success && data.reports.length > 0) {
            lostReportsList = data.reports;
            populateLostReportsDropdown(data.reports);
            setupLostReportPreview();
        }
    } catch (error) {
        console.error('Error loading lost reports:', error);
    }
}

function populateLostReportsDropdown(reports) {
    const select = document.getElementById('lost_report_id');
    if (!select) return;
    
    let options = '<option value="">No, I haven\'t reported it as lost</option>';
    options += '<option value="new" disabled>────────── My Lost Reports ──────────</option>';
    
    for (let i = 0; i < reports.length; i++) {
        const report = reports[i];
        options += `<option value="${report.report_id}">📌 ${escapeHtml(report.item_name)} - Lost on ${report.date_lost} at ${escapeHtml(report.location_lost)}</option>`;
    }
    
    select.innerHTML = options;
}

function setupLostReportPreview() {
    const select = document.getElementById('lost_report_id');
    const previewDiv = document.getElementById('lostReportPreview');
    const previewContent = document.getElementById('lostReportPreviewContent');
    
    if (!select) return;
    
    select.addEventListener('change', function() {
        const selectedValue = this.value;
        const selectedReport = lostReportsList.find(r => r.report_id == selectedValue);
        
        if (selectedReport) {
            
            previewContent.innerHTML = `
                <div class="preview-row">
                    <div class="preview-icon"><i class="fas fa-tag"></i></div>
                    <div class="preview-label">Item Name</div>
                    <div class="preview-value"><strong>${escapeHtml(selectedReport.item_name)}</strong></div>
                </div>
                <div class="preview-row">
                    <div class="preview-icon"><i class="fas fa-map-marker-alt"></i></div>
                    <div class="preview-label">Location Lost</div>
                    <div class="preview-value">${escapeHtml(selectedReport.location_lost)}</div>
                </div>
                <div class="preview-row">
                    <div class="preview-icon"><i class="fas fa-calendar"></i></div>
                    <div class="preview-label">Date Lost</div>
                    <div class="preview-value">${escapeHtml(selectedReport.date_lost)}</div>
                </div>
            `;
            previewDiv.classList.remove('empty');
            previewDiv.classList.add('show');
            document.getElementById('lost_report_id_hidden').value = selectedValue;
        } else {
            previewDiv.classList.remove('show');
            document.getElementById('lost_report_id_hidden').value = '';
        }
    });
}

// ========== LOAD ITEM DETAILS ==========
async function loadItemDetails() {
    const loadingDiv = document.getElementById('loadingDiv');
    const formContainer = document.getElementById('formContainer');
    const errorDiv = document.getElementById('errorDiv');
    
    loadingDiv.style.display = 'block';
    
    try {
        const response = await fetch('submit_claim.php?action=get_item&item_id=' + itemId);
        const data = await response.json();
        
        if (data.success) {
            itemData = data.item;
            displayItemPreview(data.item);
            document.getElementById('item_id').value = data.item.item_id;
            formContainer.style.display = 'block';
            
            document.getElementById('step1Indicator').classList.add('active');
        } else {
            showError(data.message || 'Failed to load item details');
            formContainer.style.display = 'none';
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Network error occurred');
        formContainer.style.display = 'none';
    } finally {
        loadingDiv.style.display = 'none';
    }
}

// ========== DISPLAY ITEM PREVIEW ==========
function displayItemPreview(item) {
    const previewDiv = document.getElementById('itemPreview');
    
    let statusClass = 'status-unclaimed';
    let statusText = 'Unclaimed';
    
    previewDiv.innerHTML = `
        <div class="preview-grid">
            <div class="preview-item">
                <div class="preview-label">Item Name</div>
                <div class="preview-value"><strong>${escapeHtml(item.item_name)}</strong></div>
            </div>
            <div class="preview-item">
                <div class="preview-label">Category</div>
                <div class="preview-value">${escapeHtml(item.category_name || 'Uncategorized')}</div>
            </div>
            <div class="preview-item">
                <div class="preview-label">Location Found</div>
                <div class="preview-value">${escapeHtml(item.location_found)}</div>
            </div>
            <div class="preview-item">
                <div class="preview-label">Date Found</div>
                <div class="preview-value">${escapeHtml(item.date_found)}</div>
            </div>
            <div class="preview-item">
                <div class="preview-label">Status</div>
                <div class="preview-value"><span class="status-badge ${statusClass}">${statusText}</span></div>
            </div>
        </div>
        ${item.description ? `
        <div class="preview-description">
            <div class="preview-label">Description</div>
            <div class="preview-value">${escapeHtml(item.description)}</div>
        </div>
        ` : ''}
    `;
}

// ========== STEP NAVIGATION ==========
function goToStep1() {
    document.getElementById('step1').classList.add('active');
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.remove('active');
    document.getElementById('step4').classList.remove('active');
    
    document.getElementById('step1Indicator').classList.add('active');
    document.getElementById('step2Indicator').classList.remove('active');
    document.getElementById('step3Indicator').classList.remove('active');
    document.getElementById('step4Indicator').classList.remove('active');
}

function goToStep2() {
    if (!itemData) {
        showToast('Loading item details. Please wait.', 'error');
        return;
    }
    
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.add('active');
    document.getElementById('step3').classList.remove('active');
    document.getElementById('step4').classList.remove('active');
    
    document.getElementById('step1Indicator').classList.remove('active');
    document.getElementById('step2Indicator').classList.add('active');
    document.getElementById('step3Indicator').classList.remove('active');
    document.getElementById('step4Indicator').classList.remove('active');
}

function goToStep3() {
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.add('active');
    document.getElementById('step4').classList.remove('active');
    
    document.getElementById('step1Indicator').classList.remove('active');
    document.getElementById('step2Indicator').classList.remove('active');
    document.getElementById('step3Indicator').classList.add('active');
    document.getElementById('step4Indicator').classList.remove('active');
}

function goToStep4() {
    const ownership_proof = document.getElementById('ownership_proof').value.trim();
    const identifying_details = document.getElementById('identifying_details').value.trim();
    const lostReportId = document.getElementById('lost_report_id').value;
    const selectedLostReport = lostReportsList.find(r => r.report_id == lostReportId);
    
    if (!ownership_proof) {
        showToast('Please provide proof of ownership', 'error');
        document.getElementById('ownership_proof').focus();
        return;
    }
    
    if (!identifying_details) {
        showToast('Please provide identifying details', 'error');
        document.getElementById('identifying_details').focus();
        return;
    }
    
    // Update review section
    if (itemData) {
        document.getElementById('reviewItemDetails').innerHTML = `
            <div class="review-row"><strong>Item Name:</strong> ${escapeHtml(itemData.item_name)}</div>
            <div class="review-row"><strong>Category:</strong> ${escapeHtml(itemData.category_name || 'Uncategorized')}</div>
            <div class="review-row"><strong>Location Found:</strong> ${escapeHtml(itemData.location_found)}</div>
            <div class="review-row"><strong>Date Found:</strong> ${escapeHtml(itemData.date_found)}</div>
            ${itemData.description ? `<div class="review-row"><strong>Description:</strong> ${escapeHtml(itemData.description)}</div>` : ''}
        `;
    }
    
    // Update lost report review section
    if (selectedLostReport) {
        document.getElementById('reviewLostReport').innerHTML = `
            <div class="review-row"><strong>Item Name:</strong> ${escapeHtml(selectedLostReport.item_name)}</div>
            <div class="review-row"><strong>Location Lost:</strong> ${escapeHtml(selectedLostReport.location_lost)}</div>
            <div class="review-row"><strong>Date Lost:</strong> ${escapeHtml(selectedLostReport.date_lost)}</div>
        `;
    } else {
        document.getElementById('reviewLostReport').innerHTML = `<div class="review-row">No lost report linked. You haven't reported this item as lost before.</div>`;
    }
    
    document.getElementById('reviewOwnershipProof').innerHTML = `<div class="review-text">${escapeHtml(ownership_proof)}</div>`;
    document.getElementById('reviewIdentifyingDetails').innerHTML = `<div class="review-text">${escapeHtml(identifying_details)}</div>`;
    
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.remove('active');
    document.getElementById('step4').classList.add('active');
    
    document.getElementById('step1Indicator').classList.remove('active');
    document.getElementById('step2Indicator').classList.remove('active');
    document.getElementById('step3Indicator').classList.remove('active');
    document.getElementById('step4Indicator').classList.add('active');
}

function goBack() {
    window.location.href = '../found_item/browse_found_items.html';
}

// ========== SUBMIT CLAIM ==========
async function submitClaim() {
    const ownership_proof = document.getElementById('ownership_proof').value.trim();
    const identifying_details = document.getElementById('identifying_details').value.trim();
    const lost_report_id = document.getElementById('lost_report_id_hidden').value;
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    
    const formData = new FormData();
    formData.append('action', 'submit');
    formData.append('item_id', document.getElementById('item_id').value);
    formData.append('ownership_proof', ownership_proof);
    formData.append('identifying_details', identifying_details);
    formData.append('lost_report_id', lost_report_id);
    
    try {
        const response = await fetch('submit_claim.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        if (data.success) {
            showToast('Claim submitted successfully! You will be notified once reviewed.', 'success');
            setTimeout(() => {
                window.location.href = 'my_claims.html';
            }, 2000);
        } else {
            showToast(data.message || 'Failed to submit claim', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Claim';
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Network error occurred', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Claim';
    }
}

// ========== HELPER FUNCTIONS ==========
function showError(message) {
    const errorDiv = document.getElementById('errorDiv');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showToast(message, type) {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toastIcon');
    const toastMessage = document.getElementById('toastMessage');
    
    toastIcon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    toast.className = 'toast toast-' + type + ' show';
    toastMessage.textContent = message;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
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