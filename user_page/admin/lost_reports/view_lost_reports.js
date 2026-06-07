let currentPage = 1;
let currentFilters = {
    search: '',
    status: '',
    category: 0,
    date_from: '',
    date_to: ''
};

document.addEventListener('DOMContentLoaded', function() {
    loadReports();
    setupEventListeners();
});

function setupEventListeners() {
    const searchBtn = document.getElementById('searchBtn');
    const resetBtn = document.getElementById('resetBtn');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');
    
    if (searchBtn) searchBtn.addEventListener('click', applyFilters);
    if (resetBtn) resetBtn.addEventListener('click', resetFilters);
    if (searchInput) searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') applyFilters();
    });
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (dateFrom) dateFrom.addEventListener('change', applyFilters);
    if (dateTo) dateTo.addEventListener('change', applyFilters);
}

function applyFilters() {
    currentFilters = {
        search: document.getElementById('searchInput')?.value || '',
        status: document.getElementById('statusFilter')?.value || '',
        category: parseInt(document.getElementById('categoryFilter')?.value) || 0,
        date_from: document.getElementById('dateFrom')?.value || '',
        date_to: document.getElementById('dateTo')?.value || ''
    };
    currentPage = 1;
    loadReports();
}

function resetFilters() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');
    
    if (searchInput) searchInput.value = '';
    if (statusFilter) statusFilter.value = '';
    if (categoryFilter) categoryFilter.value = '0';
    if (dateFrom) dateFrom.value = '';
    if (dateTo) dateTo.value = '';
    
    applyFilters();
}

async function loadReports() {
    const tableBody = document.getElementById('reportsTableBody');
    const loadingRow = document.getElementById('loadingRow');
    
    if (loadingRow) loadingRow.style.display = 'table-row';
    
    try {
        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('limit', 20);
        params.append('search', currentFilters.search);
        params.append('status', currentFilters.status);
        params.append('category', currentFilters.category);
        params.append('date_from', currentFilters.date_from);
        params.append('date_to', currentFilters.date_to);
        
        const response = await fetch('view_lost_reports.php?' + params.toString());
        const data = await response.json();
        
        if (data.success) {
            updateStats(data.status_counts, data.total);
            renderReportsTable(data.reports);
            renderPagination(data);
            updateCategoryFilter(data.categories);
        } else {
            alert('Failed to load reports: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Network error: ' + error.message);
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:red;">Error loading reports</td></tr>';
        }
    } finally {
        if (loadingRow) loadingRow.style.display = 'none';
    }
}

function updateStats(statusCounts, total) {
    const searchingEl = document.getElementById('statSearching');
    const foundEl = document.getElementById('statFound');
    const closedEl = document.getElementById('statClosed');
    const totalEl = document.getElementById('statTotal');
    
    if (searchingEl) searchingEl.textContent = statusCounts.searching || 0;
    if (foundEl) foundEl.textContent = statusCounts.found || 0;
    if (closedEl) closedEl.textContent = statusCounts.closed || 0;
    if (totalEl) totalEl.textContent = total;
}

function renderReportsTable(reports) {
    const tableBody = document.getElementById('reportsTableBody');
    if (!tableBody) return;
    
    if (!reports || reports.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">No lost reports found</td></tr>';
        return;
    }
    
    let html = '';
    reports.forEach(report => {
        let statusClass = '';
        if (report.lost_status === 'searching') statusClass = 'status-searching';
        if (report.lost_status === 'found') statusClass = 'status-found';
        if (report.lost_status === 'closed') statusClass = 'status-closed';
        
        html += `
            <tr>
                <td>${report.report_id}</td>
                <td><strong>${escapeHtml(report.item_name)}</strong></td>
                <td>${escapeHtml(report.user_name)}</td>
                <td>${escapeHtml(report.location_lost)}</td>
                <td>${report.date_lost}</td>
                <td><span class="status-badge ${statusClass}">${report.status_label}</span></td>
                <td class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="viewReport(${report.report_id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="editReport(${report.report_id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteReport(${report.report_id}, '${escapeHtml(report.item_name)}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    });
    
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
        html += `<button class="btn btn-sm" onclick="goToPage(${data.page - 1})">← Previous</button>`;
    }
    
    html += `<span class="page-info">Page ${data.page} of ${data.total_pages}</span>`;
    
    if (data.page < data.total_pages) {
        html += `<button class="btn btn-sm" onclick="goToPage(${data.page + 1})">Next →</button>`;
    }
    
    html += '</div>';
    paginationDiv.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    loadReports();
}

function updateCategoryFilter(categories) {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter || !categories) return;
    
    const currentValue = categoryFilter.value;
    
    let options = '<option value="0">All Categories</option>';
    categories.forEach(cat => {
        options += `<option value="${cat.category_id}">${escapeHtml(cat.category_name)}</option>`;
    });
    
    categoryFilter.innerHTML = options;
    if (currentValue && currentValue !== '0') {
        categoryFilter.value = currentValue;
    }
}

async function viewReport(reportId) {
    try {
        const response = await fetch('view_lost_reports.php?id=' + reportId);
        const data = await response.json();
        
        if (data.success) {
            showReportModal(data.report);
        } else {
            alert('Failed to load report details: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Network error: ' + error.message);
    }
}

function showReportModal(report) {
    const modal = document.getElementById('viewModal');
    const modalBody = document.getElementById('modalBody');
    
    let statusClass = '';
    if (report.lost_status === 'searching') statusClass = 'status-searching';
    if (report.lost_status === 'found') statusClass = 'status-found';
    if (report.lost_status === 'closed') statusClass = 'status-closed';
    
    let statusLabel = '';
    if (report.lost_status === 'searching') statusLabel = 'Searching';
    if (report.lost_status === 'found') statusLabel = 'Found';
    if (report.lost_status === 'closed') statusLabel = 'Closed';
    
    modalBody.innerHTML = `
        <div class="detail-row">
            <div class="detail-label">Item Name:</div>
            <div class="detail-value">${escapeHtml(report.item_name)}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Category:</div>
            <div class="detail-value">${escapeHtml(report.category_name)}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Description:</div>
            <div class="detail-value">${report.description}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Location Lost:</div>
            <div class="detail-value">${escapeHtml(report.location_lost)}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Date Lost:</div>
            <div class="detail-value">${report.date_lost}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Status:</div>
            <div class="detail-value"><span class="status-badge ${statusClass}">${statusLabel}</span></div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Reported By:</div>
            <div class="detail-value">${escapeHtml(report.user_name)}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Email:</div>
            <div class="detail-value">${escapeHtml(report.user_email)}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Phone:</div>
            <div class="detail-value">${escapeHtml(report.user_phone)}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Reported At:</div>
            <div class="detail-value">${report.created_at}</div>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeViewModal() {
    const modal = document.getElementById('viewModal');
    modal.classList.remove('active');
}

function editReport(reportId) {
    window.location.href = `edit_lost_reports.html?id=${reportId}`;
}

async function deleteReport(reportId, itemName) {
    if (confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
        try {
            const formData = new FormData();
            formData.append('report_id', reportId);
            
            const response = await fetch('delete_lost_reports.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            
            if (data.success) {
                alert('Report deleted successfully');
                loadReports();
            } else {
                alert('Failed to delete: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Network error occurred');
        }
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

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdownMenu');
    dropdown.classList.toggle('show');
}

document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('userDropdownMenu');
    const userInfoWrapper = document.querySelector('.user-info-wrapper');
    
    if (dropdown && userInfoWrapper && dropdown.classList.contains('show')) {
        if (!userInfoWrapper.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    }
    
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
        if (menuToggle && !menuToggle.contains(event.target) && !sidebar.contains(event.target)) {
            sidebar.classList.remove('active');
        }
    }
});

window.addEventListener('resize', function() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth > 768 && sidebar) {
        sidebar.classList.remove('active');
    }
});