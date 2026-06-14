const urlParams = new URLSearchParams(window.location.search);
const claimId = urlParams.get('id');

let claimData = null;
let proofMatch = null;
let identifyingMatch = null;
let photoMatch = null;
let currentLostReport = null;

document.addEventListener('DOMContentLoaded', function() {
    if (!claimId) {
        showError('No claim ID specified');
        return;
    }
    
    loadStaffInfo();
    loadClaimDetails();
    setupEventListeners();
});

function setupEventListeners() {
    const approveBtn = document.getElementById('approveBtn');
    const rejectBtn = document.getElementById('rejectBtn');
    
    if (approveBtn) {
        approveBtn.addEventListener('click', function() { submitDecision('approved'); });
    }
    if (rejectBtn) {
        rejectBtn.addEventListener('click', function() { submitDecision('rejected'); });
    }
    
    const proofMatchYes = document.getElementById('proofMatchYes');
    const proofMatchNo = document.getElementById('proofMatchNo');
    if (proofMatchYes) {
        proofMatchYes.addEventListener('click', function() { setProofMatch(true); });
    }
    if (proofMatchNo) {
        proofMatchNo.addEventListener('click', function() { setProofMatch(false); });
    }
    
    const identifyingMatchYes = document.getElementById('identifyingMatchYes');
    const identifyingMatchNo = document.getElementById('identifyingMatchNo');
    if (identifyingMatchYes) {
        identifyingMatchYes.addEventListener('click', function() { setIdentifyingMatch(true); });
    }
    if (identifyingMatchNo) {
        identifyingMatchNo.addEventListener('click', function() { setIdentifyingMatch(false); });
    }
    
    const photoMatchYes = document.getElementById('photoMatchYes');
    const photoMatchNo = document.getElementById('photoMatchNo');
    if (photoMatchYes) {
        photoMatchYes.addEventListener('click', function() { setPhotoMatch(true); });
    }
    if (photoMatchNo) {
        photoMatchNo.addEventListener('click', function() { setPhotoMatch(false); });
    }
    
    const viewLostReportBtn = document.getElementById('viewLostReportBtn');
    if (viewLostReportBtn) {
        viewLostReportBtn.addEventListener('click', function() { viewLostReportDetails(); });
    }
}

function setProofMatch(match) {
    proofMatch = match;
    const yesBtn = document.getElementById('proofMatchYes');
    const noBtn = document.getElementById('proofMatchNo');
    
    if (match) {
        yesBtn.classList.add('active');
        noBtn.classList.remove('active');
    } else {
        yesBtn.classList.remove('active');
        noBtn.classList.add('active');
    }
    updateMatchSummary();
}

function setIdentifyingMatch(match) {
    identifyingMatch = match;
    const yesBtn = document.getElementById('identifyingMatchYes');
    const noBtn = document.getElementById('identifyingMatchNo');
    
    if (match) {
        yesBtn.classList.add('active');
        noBtn.classList.remove('active');
    } else {
        yesBtn.classList.remove('active');
        noBtn.classList.add('active');
    }
    updateMatchSummary();
}

function setPhotoMatch(match) {
    photoMatch = match;
    const yesBtn = document.getElementById('photoMatchYes');
    const noBtn = document.getElementById('photoMatchNo');
    
    if (match) {
        yesBtn.classList.add('active');
        noBtn.classList.remove('active');
    } else {
        yesBtn.classList.remove('active');
        noBtn.classList.add('active');
    }
    updateMatchSummary();
}

function updateMatchSummary() {
    const summaryDiv = document.getElementById('matchSummary');
    let html = '<strong>📋 Comparison Summary:</strong><br>';
    
    if (proofMatch === true) {
        html += '<span class="match-good">✓ Proof of ownership matches the found item</span><br>';
    } else if (proofMatch === false) {
        html += '<span class="match-bad">✗ Proof of ownership does NOT match the found item</span><br>';
    } else {
        html += '<span class="match-pending">○ Please verify if proof of ownership matches</span><br>';
    }
    
    if (identifyingMatch === true) {
        html += '<span class="match-good">✓ Identifying details match the found item</span><br>';
    } else if (identifyingMatch === false) {
        html += '<span class="match-bad">✗ Identifying details do NOT match the found item</span><br>';
    } else {
        html += '<span class="match-pending">○ Please verify if identifying details match</span><br>';
    }
    
    if (photoMatch === true) {
        html += '<span class="match-good">✓ Photos match the found item</span><br>';
    } else if (photoMatch === false) {
        html += '<span class="match-bad">✗ Photos do NOT match the found item</span><br>';
    } else {
        html += '<span class="match-pending">○ Please verify if photos match</span><br>';
    }
    
    summaryDiv.innerHTML = html;
}

async function loadStaffInfo() {
    try {
        const response = await fetch('view_claims.php?action=user');
        const data = await response.json();
        if (data.success) {
            const userAvatar = document.getElementById('userAvatar');
            if (userAvatar) userAvatar.textContent = data.user_avatar;
        }
    } catch (error) {
        console.error('Error loading staff info:', error);
    }
}

async function loadClaimDetails() {
    const loadingDiv = document.getElementById('loadingDiv');
    const reviewContainer = document.getElementById('reviewContainer');
    const errorDiv = document.getElementById('errorDiv');
    
    loadingDiv.style.display = 'block';
    
    try {
        const response = await fetch('review_claims.php?id=' + claimId);
        const data = await response.json();
        
        if (data.success) {
            claimData = data.claim;
            displayClaimDetails(data.claim);
            reviewContainer.style.display = 'block';
        } else {
            showError(data.message || 'Failed to load claim details');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Network error occurred');
    } finally {
        loadingDiv.style.display = 'none';
    }
}

function displayClaimDetails(claim) {
    let statusClass = '';
    if (claim.claim_status === 'pending') statusClass = 'status-pending';

    document.getElementById('foundItemName').innerHTML = escapeHtml(claim.item_name);
    document.getElementById('foundItemMeta').innerHTML = `
        <i class="fas fa-calendar-alt"></i> Found on ${escapeHtml(claim.date_found)}
    `;
    
    let detailsHtml = `
        <div class="found-detail">
            <span class="label">📍 Location:</span>
            <span class="value">${escapeHtml(claim.location_found)}</span>
        </div>
    `;
    
    if (claim.item_description) {
        detailsHtml += `
            <div class="found-detail">
                <span class="label">📝 Description:</span>
                <span class="value">${claim.item_description}</span>
            </div>
        `;
    }
    
    detailsHtml += `
        <div class="found-detail">
            <span class="label">📅 Submitted:</span>
            <span class="value">${escapeHtml(claim.submitted_at)}</span>
        </div>
        <div class="found-detail">
            <span class="label">⏳ Status:</span>
            <span class="value"><span class="status-badge ${statusClass}">Pending Review</span></span>
        </div>
    `;
    
    document.getElementById('foundItemDetails').innerHTML = detailsHtml;
    
    document.getElementById('claimantDetails').innerHTML = `
        <div class="detail-item">
            <div class="detail-label">Claimant Name</div>
            <div class="detail-value">${escapeHtml(claim.claimant_name)}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Email Address</div>
            <div class="detail-value">${escapeHtml(claim.claimant_email)}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Phone Number</div>
            <div class="detail-value">${escapeHtml(claim.claimant_phone || '-')}</div>
        </div>
    `;
    
    document.getElementById('ownershipProof').innerHTML = claim.ownership_proof || '<em>No proof of ownership provided.</em>';
    document.getElementById('identifyingDetails').innerHTML = claim.identifying_details || '<em>No identifying details provided.</em>';
    
    // Display Found Item Photo
    const foundItemPhotoContainer = document.getElementById('foundItemPhotoContainer');
    if (claim.item_photo) {
        foundItemPhotoContainer.innerHTML = `<img src="../../../${claim.item_photo}" alt="Found Item">`;
    } else {
        foundItemPhotoContainer.innerHTML = '<div class="photo-placeholder"><i class="fas fa-image"></i><p>No photo available</p></div>';
    }
    
    // Display Evidence Photo
    const evidencePhotoContainer = document.getElementById('evidencePhotoContainer');
    if (claim.evidence_photo) {
        evidencePhotoContainer.innerHTML = `<img src="../../../${claim.evidence_photo}" alt="Evidence Photo">`;
    } else {
        evidencePhotoContainer.innerHTML = '<div class="photo-placeholder"><i class="fas fa-camera"></i><p>No evidence photo uploaded</p></div>';
    }
    
    displayLostReport(claim);
}

function displayLostReport(claim) {
    const lostReportCard = document.getElementById('lostReportCard');
    const lostReportSummary = document.getElementById('lostReportSummary');
    
    if (!lostReportCard || !lostReportSummary) return;
    
    if (claim.lost_report_id && claim.lost_item_name) {
        currentLostReport = {
            id: claim.lost_report_id,
            item_name: claim.lost_item_name,
            location_lost: claim.lost_location,
            date_lost: claim.lost_date,
            status: claim.lost_status,
            description: claim.lost_description,
            photo: claim.lost_photo
        };
        
        let statusBadge = '';
        
        if (claim.lost_status === 'searching') {
            statusBadge = '<span class="status-badge status-searching">🔍 Searching</span>';
        } else if (claim.lost_status === 'found') {
            statusBadge = '<span class="status-badge status-found">✅ Found</span>';
        } else {
            statusBadge = '<span class="status-badge status-closed">📋 Closed</span>';
        }
        
        lostReportSummary.innerHTML = `
            <div class="lost-report-summary">
                <div class="lost-report-icon">
                    <i class="fas fa-history"></i>
                </div>
                <div class="lost-report-info">
                    <div class="lost-report-name">
                        ${escapeHtml(claim.lost_item_name)}
                    </div>
                    <div class="lost-report-meta">
                        <i class="fas fa-map-marker-alt"></i> ${escapeHtml(claim.lost_location)} &nbsp;|&nbsp;
                        <i class="fas fa-calendar"></i> ${escapeHtml(claim.lost_date)}
                    </div>
                </div>
                <div class="lost-report-status">${statusBadge}</div>
            </div>
        `;
        lostReportCard.style.display = 'block';
    } else {
        lostReportCard.style.display = 'none';
        currentLostReport = null;
    }
}

function viewLostReportDetails() {
    if (!currentLostReport) {
        showToast('No lost report linked to this claim', 'error');
        return;
    }
    
    const modal = document.getElementById('lostReportModal');
    const modalBody = document.getElementById('lostReportModalBody');
    
    if (!modal) return;
    
    let statusClass = '';
    let statusText = '';
    if (currentLostReport.status === 'searching') {
        statusClass = 'status-searching';
        statusText = 'Searching';
    } else if (currentLostReport.status === 'found') {
        statusClass = 'status-found';
        statusText = 'Found';
    } else {
        statusClass = 'status-closed';
        statusText = 'Closed';
    }
    
    let photoHtml = '';
    if (currentLostReport.photo) {
        photoHtml = `
            <div class="modal-row">
                <div class="modal-label">Photo:</div>
                <div class="modal-value"><img src="../../../${currentLostReport.photo}" style="max-width: 100%; max-height: 150px; object-fit: cover; border-radius: 8px;"></div>
            </div>
        `;
    }
    
    modalBody.innerHTML = `
        <div class="modal-row">
            <div class="modal-label">Item Name:</div>
            <div class="modal-value"><strong>${escapeHtml(currentLostReport.item_name)}</strong></div>
        </div>
        <div class="modal-row">
            <div class="modal-label">Location Lost:</div>
            <div class="modal-value">${escapeHtml(currentLostReport.location_lost)}</div>
        </div>
        <div class="modal-row">
            <div class="modal-label">Date Lost:</div>
            <div class="modal-value">${escapeHtml(currentLostReport.date_lost)}</div>
        </div>
        <div class="modal-row">
            <div class="modal-label">Status:</div>
            <div class="modal-value"><span class="status-badge ${statusClass}">${statusText}</span></div>
        </div>
        <div class="modal-row">
            <div class="modal-label">Description:</div>
            <div class="modal-value">${escapeHtml(currentLostReport.description)}</div>
        </div>
        ${photoHtml}
    `;
    
    modal.classList.add('active');
}

function closeLostReportModal() {
    const modal = document.getElementById('lostReportModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

async function submitDecision(decision) {
    if (decision === 'rejected') {
        const reviewNote = document.getElementById('review_note').value.trim();
        if (!reviewNote) {
            showToast('Please provide a reason for rejection', 'error');
            return;
        }
    }
    
    if (decision === 'approved') {
        if (proofMatch === null || identifyingMatch === null || photoMatch === null) {
            showToast('Please verify all comparison criteria (proof, details, and photos)', 'error');
            return;
        }
    }
    
    const approveBtn = document.getElementById('approveBtn');
    const rejectBtn = document.getElementById('rejectBtn');
    
    approveBtn.disabled = true;
    rejectBtn.disabled = true;
    
    if (decision === 'approved') {
        approveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    } else {
        rejectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }
    
    const formData = new FormData();
    formData.append('claim_id', claimId);
    formData.append('decision', decision);
    formData.append('review_note', document.getElementById('review_note').value);
    
    try {
        const response = await fetch('review_claims.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            setTimeout(() => {
                window.location.href = 'view_claims.html';
            }, 2000);
        } else {
            showToast(data.message || 'Failed to process claim', 'error');
            approveBtn.disabled = false;
            rejectBtn.disabled = false;
            approveBtn.innerHTML = '<i class="fas fa-check-circle"></i> Approve Claim';
            rejectBtn.innerHTML = '<i class="fas fa-times-circle"></i> Reject Claim';
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Network error occurred', 'error');
        approveBtn.disabled = false;
        rejectBtn.disabled = false;
        approveBtn.innerHTML = '<i class="fas fa-check-circle"></i> Approve Claim';
        rejectBtn.innerHTML = '<i class="fas fa-times-circle"></i> Reject Claim';
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorDiv');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showToast(message, type) {
    let toast = document.getElementById('toast');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.innerHTML = '<i class="fas fa-check-circle" id="toastIcon"></i><span id="toastMessage"></span>';
        document.body.appendChild(toast);
    }
    
    const toastIcon = document.getElementById('toastIcon');
    const toastMessage = document.getElementById('toastMessage');
    
    toastIcon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    toast.className = 'toast toast-' + type + ' show';
    toastMessage.textContent = message;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
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