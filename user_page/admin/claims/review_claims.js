let claimData = null;
let proofMatch = null;
let identifyingMatch = null;
let photoMatch = null;
let currentLostReport = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, claimId:', claimId);
    
    if (!claimId) {
        showError('No claim ID specified');
        return;
    }
    
    loadAdminInfo();
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

async function loadAdminInfo() {
    try {
        console.log('Loading admin info...');
        const response = await fetch('review_claims.php?action=user', {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        const data = await response.json();
        console.log('Admin info response:', data);
        if (data.success) {
            const userAvatar = document.getElementById('userAvatar');
            if (userAvatar) userAvatar.textContent = data.user_avatar;
        }
    } catch (error) {
        console.error('Error loading admin info:', error);
    }
}

async function loadClaimDetails() {
    const loadingDiv = document.getElementById('loadingDiv');
    const reviewContainer = document.getElementById('reviewContainer');
    const errorDiv = document.getElementById('errorDiv');
    
    if (loadingDiv) {
        loadingDiv.style.display = 'block';
        loadingDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading claim details...';
    }
    
    console.log('Loading claim details for ID:', claimId);
    
    try {
        const url = 'review_claims.php?id=' + claimId;
        console.log('Fetching from:', url);
        
        const response = await fetch(url, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        console.log('Response status:', response.status);
        
        // Check if response is OK
        if (!response.ok) {
            throw new Error('HTTP error! status: ' + response.status);
        }
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Received non-JSON response:', text.substring(0, 500));
            throw new Error('Server returned HTML instead of JSON');
        }
        
        const data = await response.json();
        console.log('Claim data response:', data);
        
        if (data.success) {
            claimData = data.claim;
            console.log('Claim data loaded successfully:', claimData);
            displayClaimDetails(data.claim);
            
            // Show the review container
            if (reviewContainer) {
                reviewContainer.style.display = 'block';
            }
        } else {
            showError(data.message || 'Failed to load claim details');
            if (reviewContainer) {
                reviewContainer.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error loading claim details:', error);
        showError('Failed to load claim details: ' + error.message);
        if (reviewContainer) {
            reviewContainer.style.display = 'none';
        }
    } finally {
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
    }
}

function displayClaimDetails(claim) {
    console.log('Displaying claim details:', claim);
    
    // Found Item Name
    const foundItemName = document.getElementById('foundItemName');
    if (foundItemName) {
        foundItemName.textContent = claim.item_name || 'Unknown Item';
    }
    
    // Found Item Meta
    const foundItemMeta = document.getElementById('foundItemMeta');
    if (foundItemMeta) {
        foundItemMeta.innerHTML = `
            <i class="fas fa-calendar-alt"></i> Found on ${claim.date_found || 'N/A'} 
            <span class="separator">|</span>
            <i class="fas fa-map-marker-alt"></i> ${claim.location_found || 'Unknown location'}
        `;
    }
    
    // Found Item Details
    let detailsHtml = `
        <div class="found-detail">
            <span class="label">📍 Location:</span>
            <span class="value">${claim.location_found || 'Unknown'}</span>
        </div>
        <div class="found-detail">
            <span class="label">📅 Date Found:</span>
            <span class="value">${claim.date_found || 'Unknown'}</span>
        </div>
    `;
    
    if (claim.item_description && claim.item_description !== '') {
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
            <span class="value">${claim.submitted_at || 'Unknown'}</span>
        </div>
        <div class="found-detail">
            <span class="label">📊 Status:</span>
            <span class="value"><span class="status-badge status-${claim.claim_status || 'pending'}">${(claim.claim_status || 'PENDING').toUpperCase()}</span></span>
        </div>
    `;
    
    const foundItemDetails = document.getElementById('foundItemDetails');
    if (foundItemDetails) {
        foundItemDetails.innerHTML = detailsHtml;
    }
    
    // Claimant Details
    const claimantDetails = document.getElementById('claimantDetails');
    if (claimantDetails) {
        claimantDetails.innerHTML = `
            <div class="detail-item">
                <div class="detail-label">Claimant Name</div>
                <div class="detail-value">${escapeHtml(claim.claimant_name || 'Unknown')}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Email Address</div>
                <div class="detail-value">${escapeHtml(claim.claimant_email || 'Unknown')}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Phone Number</div>
                <div class="detail-value">${escapeHtml(claim.claimant_phone || '-')}</div>
            </div>
        `;
    }
    
    // Staff Details
    const staffDetails = document.getElementById('staffDetails');
    if (staffDetails) {
        staffDetails.innerHTML = `
            <div class="detail-item">
                <div class="detail-label">Staff Name</div>
                <div class="detail-value">${escapeHtml(claim.staff_name || 'Unknown')}</div>
            </div>
        `;
    }
    
    // Proof of Ownership
    const ownershipProof = document.getElementById('ownershipProof');
    if (ownershipProof) {
        ownershipProof.innerHTML = claim.ownership_proof || '<em>No proof of ownership provided.</em>';
    }
    
    // Identifying Details
    const identifyingDetails = document.getElementById('identifyingDetails');
    if (identifyingDetails) {
        identifyingDetails.innerHTML = claim.identifying_details || '<em>No identifying details provided.</em>';
    }
    
    // Found Item Photo
    const foundItemPhotoContainer = document.getElementById('foundItemPhotoContainer');
    if (foundItemPhotoContainer) {
        if (claim.item_photo) {
            foundItemPhotoContainer.innerHTML = `<img src="../../../${claim.item_photo}" alt="Found Item" onerror="this.parentElement.innerHTML='<div class=\\'photo-placeholder\\'><i class=\\'fas fa-image\\'></i><p>Image not found</p></div>'">`;
        } else {
            foundItemPhotoContainer.innerHTML = '<div class="photo-placeholder"><i class="fas fa-image"></i><p>No photo available</p></div>';
        }
    }
    
    // Evidence Photo
    const evidencePhotoContainer = document.getElementById('evidencePhotoContainer');
    if (evidencePhotoContainer) {
        if (claim.evidence_photo) {
            evidencePhotoContainer.innerHTML = `<img src="../../../${claim.evidence_photo}" alt="Evidence Photo" onerror="this.parentElement.innerHTML='<div class=\\'photo-placeholder\\'><i class=\\'fas fa-camera\\'></i><p>Image not found</p></div>'">`;
        } else {
            evidencePhotoContainer.innerHTML = '<div class="photo-placeholder"><i class="fas fa-camera"></i><p>No evidence photo uploaded</p></div>';
        }
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
            description: claim.lost_description || 'No description provided',
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
                        <i class="fas fa-map-marker-alt"></i> ${escapeHtml(claim.lost_location || 'Unknown')} &nbsp;|&nbsp;
                        <i class="fas fa-calendar"></i> ${escapeHtml(claim.lost_date || 'Unknown')}
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
    
    if (!modal || !modalBody) return;
    
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
                <div class="modal-value"><img src="../../../${currentLostReport.photo}" style="max-width: 100%; max-height: 150px; object-fit: cover; border-radius: 8px;" onerror="this.parentElement.innerHTML='No photo available'"></div>
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
            <div class="modal-value">${escapeHtml(currentLostReport.location_lost || 'Unknown')}</div>
        </div>
        <div class="modal-row">
            <div class="modal-label">Date Lost:</div>
            <div class="modal-value">${escapeHtml(currentLostReport.date_lost || 'Unknown')}</div>
        </div>
        <div class="modal-row">
            <div class="modal-label">Status:</div>
            <div class="modal-value"><span class="status-badge ${statusClass}">${statusText}</span></div>
        </div>
        <div class="modal-row">
            <div class="modal-label">Description:</div>
            <div class="modal-value">${escapeHtml(currentLostReport.description || 'No description')}</div>
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

function setProofMatch(match) {
    proofMatch = match;
    const yesBtn = document.getElementById('proofMatchYes');
    const noBtn = document.getElementById('proofMatchNo');
    
    if (yesBtn && noBtn) {
        if (match) {
            yesBtn.classList.add('active');
            noBtn.classList.remove('active');
        } else {
            yesBtn.classList.remove('active');
            noBtn.classList.add('active');
        }
    }
    updateMatchSummary();
}

function setIdentifyingMatch(match) {
    identifyingMatch = match;
    const yesBtn = document.getElementById('identifyingMatchYes');
    const noBtn = document.getElementById('identifyingMatchNo');
    
    if (yesBtn && noBtn) {
        if (match) {
            yesBtn.classList.add('active');
            noBtn.classList.remove('active');
        } else {
            yesBtn.classList.remove('active');
            noBtn.classList.add('active');
        }
    }
    updateMatchSummary();
}

function setPhotoMatch(match) {
    photoMatch = match;
    const yesBtn = document.getElementById('photoMatchYes');
    const noBtn = document.getElementById('photoMatchNo');
    
    if (yesBtn && noBtn) {
        if (match) {
            yesBtn.classList.add('active');
            noBtn.classList.remove('active');
        } else {
            yesBtn.classList.remove('active');
            noBtn.classList.add('active');
        }
    }
    updateMatchSummary();
}

function updateMatchSummary() {
    const summaryDiv = document.getElementById('matchSummary');
    if (!summaryDiv) return;
    
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

async function submitDecision(decision) {
    if (decision === 'rejected') {
        const reviewNote = document.getElementById('review_note');
        const reviewNoteValue = reviewNote ? reviewNote.value.trim() : '';
        if (!reviewNoteValue) {
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
    
    if (approveBtn) approveBtn.disabled = true;
    if (rejectBtn) rejectBtn.disabled = true;
    
    if (approveBtn && decision === 'approved') {
        approveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    } else if (rejectBtn && decision === 'rejected') {
        rejectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }
    
    const reviewNoteValue = document.getElementById('review_note') ? document.getElementById('review_note').value : '';
    
    const formData = new FormData();
    formData.append('claim_id', claimId);
    formData.append('decision', decision);
    formData.append('review_note', reviewNoteValue);
    formData.append('action', 'decide');
    
    try {
        const response = await fetch('review_claims.php', {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (!response.ok) {
            throw new Error('HTTP error! status: ' + response.status);
        }
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            setTimeout(() => {
                window.location.href = 'view_claims.php';
            }, 2000);
        } else {
            showToast(data.message || 'Failed to process claim', 'error');
            if (approveBtn) {
                approveBtn.disabled = false;
                approveBtn.innerHTML = '<i class="fas fa-check-circle"></i> Approve Claim';
            }
            if (rejectBtn) {
                rejectBtn.disabled = false;
                rejectBtn.innerHTML = '<i class="fas fa-times-circle"></i> Reject Claim';
            }
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Network error occurred: ' + error.message, 'error');
        if (approveBtn) {
            approveBtn.disabled = false;
            approveBtn.innerHTML = '<i class="fas fa-check-circle"></i> Approve Claim';
        }
        if (rejectBtn) {
            rejectBtn.disabled = false;
            rejectBtn.innerHTML = '<i class="fas fa-times-circle"></i> Reject Claim';
        }
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorDiv');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
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
    
    if (toastIcon) toastIcon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    toast.className = 'toast toast-' + type + ' show';
    if (toastMessage) toastMessage.textContent = message;
    
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