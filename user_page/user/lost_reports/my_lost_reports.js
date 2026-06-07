let currentPage = 1;
let currentFilters = {
    search: '',
    status: ''
};

document.addEventListener('DOMContentLoaded', function() {
    loadReports();
    loadUserInfo();
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
    loadReports();
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
        const response = await fetch('my_lost_reports.php?action=user');
        const data = await response.json();
        if (data.success) {
            const userAvatar = document.getElementById('userAvatar');
            if (userAvatar) userAvatar.textContent = data.user_avatar;
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

async function loadReports() {
    const tableBody = document.getElementById('reportsTableBody');
    const loadingDiv = document.getElementById('loadingDiv');
    const reportsContainer = document.querySelector('.reports-table-container');
    
    loadingDiv.style.display = 'block';
    if (tableBody) tableBody.style.display = 'none';
    
    try {
        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('limit', 10);
        params.append('search', currentFilters.search);
        params.append('status', currentFilters.status);
        
        const response = await fetch('my_lost_reports.php?' + params.toString());
        const data = await response.json();
        
        if (data.success) {
            renderReportsTable(data.reports);
            renderPagination(data);
            if (tableBody) tableBody.style.display = 'table-row-group';
        } else {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Failed to load reports: ' + (data.message || 'Unknown error') + '</td></tr>';
        }
    } catch (error) {
        console.error('Error:', error);
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center" style="color: red;">Network error occurred</td></tr>';
        }
    } finally {
        loadingDiv.style.display = 'none';
    }
}

function renderReportsTable(reports) {
    const tableBody = document.getElementById('reportsTableBody');
    if (!tableBody) return;
    
    if (!reports || reports.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No lost reports found</td></tr>';
        return;
    }
    
    let html = '';
    for (let i = 0; i < reports.length; i++) {
        const report = reports[i];
        let statusClass = '';
        let statusText = '';
        
        if (report.lost_status === 'searching') {
            statusClass = 'status-searching';
            statusText = 'Searching';
        } else if (report.lost_status === 'found') {
            statusClass = 'status-found';
            statusText = 'Found';
        } else if (report.lost_status === 'closed') {
            statusClass = 'status-closed';
            statusText = 'Closed';
        }
        
        html += '<tr>';
        html += '<td>' + report.report_id + '</td>';
        html += '<td><strong>' + escapeHtml(report.item_name) + '</strong></td>';
        html += '<td>' + escapeHtml(report.location_lost) + '</td>';
        html += '<td>' + report.date_lost + '</td>';
        html += '<td><span class="status-badge ' + statusClass + '">' + statusText + '</span></td>';
        html += '<td><button class="btn-view" onclick="viewReport(' + report.report_id + ')"><i class="fas fa-eye"></i> View</button></td>';
        html += '</tr>';
    }
    
    tableBody.innerHTML = html;
}

function renderPagination(data) {
    const paginationDiv = document.getElementById('pagination');
    if (!paginationDiv) return;
    
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
    loadReports();
}

async function viewReport(reportId) {
    try {
        const response = await fetch('my_lost_reports.php?id=' + reportId);
        const data = await response.json();
        
        if (data.success) {
            showReportModal(data.report);
        } else {
            alert('Failed to load report details: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Network error occurred');
    }
}

function showReportModal(report) {
    const modal = document.getElementById('viewModal');
    const modalBody = document.getElementById('modalBody');
    
    let statusClass = '';
    let statusText = '';
    
    if (report.lost_status === 'searching') {
        statusClass = 'status-searching';
        statusText = 'Searching';
    } else if (report.lost_status === 'found') {
        statusClass = 'status-found';
        statusText = 'Found';
    } else if (report.lost_status === 'closed') {
        statusClass = 'status-closed';
        statusText = 'Closed';
    }
    
    modalBody.innerHTML = 
        '<div class="detail-row">' +
            '<div class="detail-label">Item Name:</div>' +
            '<div class="detail-value">' + escapeHtml(report.item_name) + '</div>' +
        '</div>' +
        '<div class="detail-row">' +
            '<div class="detail-label">Category:</div>' +
            '<div class="detail-value">' + escapeHtml(report.category_name) + '</div>' +
        '</div>' +
        '<div class="detail-row">' +
            '<div class="detail-label">Description:</div>' +
            '<div class="detail-value">' + (report.description || 'No description provided') + '</div>' +
        '</div>' +
        '<div class="detail-row">' +
            '<div class="detail-label">Location Lost:</div>' +
            '<div class="detail-value">' + escapeHtml(report.location_lost) + '</div>' +
        '</div>' +
        '<div class="detail-row">' +
            '<div class="detail-label">Date Lost:</div>' +
            '<div class="detail-value">' + report.date_lost + '</div>' +
        '</div>' +
        '<div class="detail-row">' +
            '<div class="detail-label">Status:</div>' +
            '<div class="detail-value"><span class="status-badge ' + statusClass + '">' + statusText + '</span></div>' +
        '</div>' +
        '<div class="detail-row">' +
            '<div class="detail-label">Reported On:</div>' +
            '<div class="detail-value">' + report.created_at + '</div>' +
        '</div>';
    
    modal.classList.add('active');
}

function closeViewModal() {
    const modal = document.getElementById('viewModal');
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