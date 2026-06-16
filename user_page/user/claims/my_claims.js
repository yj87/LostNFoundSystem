let currentPage = 1;
let currentFilters = {
    search: '',
    status: ''
};

document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadClaims();
    setupEventListeners();
});

function setupEventListeners() {
    const searchBtn = document.getElementById('searchBtn');
    const resetBtn = document.getElementById('resetBtn');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    
    if (searchBtn) searchBtn.addEventListener('click', applyFilters);
    if (resetBtn) resetBtn.addEventListener('click', resetFilters);
    if (searchInput) searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') applyFilters();
    });
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
}

function applyFilters() {
    currentFilters = {
        search: document.getElementById('searchInput')?.value || '',
        status: document.getElementById('statusFilter')?.value || ''
    };
    currentPage = 1;
    loadClaims();
}

function resetFilters() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    
    if (searchInput) searchInput.value = '';
    if (statusFilter) statusFilter.value = '';
    
    applyFilters();
}

async function loadUserInfo() {
    try {
        const response = await fetch('my_claims.php?action=user');
        const data = await response.json();
        if (data.success) {
            const userAvatar = document.getElementById('userAvatar');
            if (userAvatar) userAvatar.textContent = data.user_avatar;
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

async function loadClaims() {
    const container = document.getElementById('claimsContainer');
    const loadingDiv = document.getElementById('loadingDiv');
    const paginationDiv = document.getElementById('pagination');
    
    loadingDiv.style.display = 'block';
    container.style.display = 'none';
    paginationDiv.style.display = 'none';
    
    try {
        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('limit', 10);
        params.append('search', currentFilters.search);
        params.append('status', currentFilters.status);
        
        const response = await fetch('my_claims.php?' + params.toString());
        const data = await response.json();
        
        if (data.success) {
            renderClaims(data.claims);
            renderPagination(data);
            container.style.display = 'block';
            paginationDiv.style.display = 'block';
        } else {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Failed to load claims</p></div>';
        }
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Network error occurred</p></div>';
    } finally {
        loadingDiv.style.display = 'none';
    }
}

function renderClaims(claims) {
    const container = document.getElementById('claimsContainer');
    
    if (!claims || claims.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>You haven't submitted any claims yet.</p>
                <button class="btn-browse" onclick="location.href='../found_item/browse_found_items.php'">
                    <i class="fas fa-search"></i> Browse Found Items
                </button>
            </div>
        `;
        return;
    }
    
    let html = '';
    for (let i = 0; i < claims.length; i++) {
        const claim = claims[i];
        let statusClass = '';
        let statusText = '';
        
        if (claim.claim_status === 'pending') {
            statusClass = 'status-pending';
            statusText = 'Pending';
        } else if (claim.claim_status === 'approved') {
            statusClass = 'status-approved';
            statusText = 'Approved';
        } else if (claim.claim_status === 'rejected') {
            statusClass = 'status-rejected';
            statusText = 'Rejected';
        }
        
        html += `
            <div class="claim-card">
                <div class="claim-header">
                    <div class="claim-title">
                        <i class="fas fa-box"></i> ${escapeHtml(claim.item_name)}
                    </div>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="claim-details">
                    <div class="detail-item">
                        <div class="detail-label">Location Found</div>
                        <div class="detail-value">${escapeHtml(claim.location_found)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Date Found</div>
                        <div class="detail-value">${escapeHtml(claim.date_found)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Submitted On</div>
                        <div class="detail-value">${escapeHtml(claim.submitted_at)}</div>
                    </div>
                </div>
                ${claim.review_note && claim.claim_status === 'rejected' ? `
                <div class="review-note">
                    <div class="detail-label">Review Note</div>
                    <div class="detail-value">${escapeHtml(claim.review_note)}</div>
                </div>
                ` : ''}
                <div style="margin-top: 15px;">
                    <button class="btn-view" onclick="viewClaimDetails(${claim.claim_id})">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function renderPagination(data) {
    const paginationDiv = document.getElementById('pagination');
    
    if (data.total_pages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }
    
    let html = '<div class="pagination-controls">';
    
    if (data.page > 1) {
        html += '<button onclick="goToPage(' + (data.page - 1) + ')">← Previous</button>';
    } else {
        html += '<button disabled>← Previous</button>';
    }
    
    html += '<span class="page-info">Page ' + data.page + ' of ' + data.total_pages + '</span>';
    
    if (data.page < data.total_pages) {
        html += '<button onclick="goToPage(' + (data.page + 1) + ')">Next →</button>';
    } else {
        html += '<button disabled>Next →</button>';
    }
    
    html += '</div>';
    paginationDiv.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    loadClaims();
}

async function viewClaimDetails(claimId) {
    try {
        const response = await fetch('my_claims.php?id=' + claimId);
        const data = await response.json();
        
        if (data.success) {
            showClaimModal(data.claim);
        } else {
            alert('Failed to load claim details');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Network error occurred');
    }
}

// Add evidence photo to modal
function showClaimModal(claim) {
    const modal = document.getElementById('claimModal');
    const modalBody = document.getElementById('modalBody');
    
    let statusClass = '';
    let statusText = '';
    
    if (claim.claim_status === 'pending') {
        statusClass = 'status-pending';
        statusText = 'Pending';
    } else if (claim.claim_status === 'approved') {
        statusClass = 'status-approved';
        statusText = 'Approved';
    } else if (claim.claim_status === 'rejected') {
        statusClass = 'status-rejected';
        statusText = 'Rejected';
    }
    
    // Build evidence photo HTML
    let evidencePhotoHtml = '';
    if (claim.evidence_photo) {
        evidencePhotoHtml = `
            <div class="detail-row">
                <div class="detail-label">Evidence Photo</div>
                <div class="detail-value">
                    <a href="../../../${claim.evidence_photo}" target="_blank">
                        <img src="../../../${claim.evidence_photo}" style="max-width: 200px; max-height: 150px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd; margin-top: 5px;">
                    </a>
                </div>
            </div>
        `;
    }
    
    modalBody.innerHTML = `
        <div class="detail-row">
            <div class="detail-label">Item Name</div>
            <div class="detail-value">${escapeHtml(claim.item_name)}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Location Found</div>
            <div class="detail-value">${escapeHtml(claim.location_found)}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Date Found</div>
            <div class="detail-value">${escapeHtml(claim.date_found)}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Status</div>
            <div class="detail-value"><span class="status-badge ${statusClass}">${statusText}</span></div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Submitted On</div>
            <div class="detail-value">${escapeHtml(claim.submitted_at)}</div>
        </div>
        ${claim.reviewed_at ? `
        <div class="detail-row">
            <div class="detail-label">Reviewed On</div>
            <div class="detail-value">${escapeHtml(claim.reviewed_at)}</div>
        </div>
        ` : ''}
        ${claim.reviewed_by_name ? `
        <div class="detail-row">
            <div class="detail-label">Reviewed By</div>
            <div class="detail-value">${escapeHtml(claim.reviewed_by_name)}</div>
        </div>
        ` : ''}
        <div class="detail-row">
            <div class="detail-label">Ownership Proof</div>
            <div class="detail-value">${claim.ownership_proof}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Identifying Details</div>
            <div class="detail-value">${claim.identifying_details}</div>
        </div>
        ${evidencePhotoHtml}
        ${claim.review_note ? `
        <div class="detail-row">
            <div class="detail-label">Review Note</div>
            <div class="detail-value">${claim.review_note}</div>
        </div>
        ` : ''}
    `;
    
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('claimModal');
    modal.classList.remove('active');
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