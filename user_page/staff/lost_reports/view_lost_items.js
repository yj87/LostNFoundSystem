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
    loadUserInfo();
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

async function loadUserInfo() {
    try {
        const response = await fetch('view_lost_items.php?action=user');
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
    
    loadingDiv.style.display = 'block';
    if (tableBody) tableBody.style.display = 'none';
    
    try {
        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('limit', 20);
        params.append('search', currentFilters.search);
        params.append('status', currentFilters.status);
        params.append('category', currentFilters.category);
        params.append('date_from', currentFilters.date_from);
        params.append('date_to', currentFilters.date_to);
        
        const response = await fetch('view_lost_items.php?' + params.toString());
        const data = await response.json();
        
        if (data.success) {
            updateStats(data.status_counts, data.total);
            renderReportsTable(data.reports);
            renderPagination(data);
            updateCategoryFilter(data.categories);
            if (tableBody) tableBody.style.display = 'table-row-group';
        } else {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Failed to load reports: ' + (data.message || 'Unknown error') + '</td></tr>';
        }
    } catch (error) {
        console.error('Error:', error);
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center" style="color: red;">Network error occurred</td></tr>';
        }
    } finally {
        loadingDiv.style.display = 'none';
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
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No lost reports found</td></tr>';
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
        
        // Photo thumbnail
        let photoHtml = '';
        if (report.photo) {
            photoHtml = '<img src="../../../' + report.photo + '" class="photo-thumb" alt="Photo" style="width: 45px; height: 45px; object-fit: cover; border-radius: 6px;">';
        } else {
            photoHtml = '<div class="photo-placeholder" style="width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; background: #f0f0f0; border-radius: 6px;"><i class="fas fa-image"></i></div>';
        }
        
        html += '<tr>';
        html += '<td>' + report.report_id + '</td>';
        html += '<td>' + photoHtml + '</td>';  // ADD THIS LINE
        html += '<td><strong>' + escapeHtml(report.item_name) + '</strong></td>';
        html += '<td>' + escapeHtml(report.user_name) + '</td>';
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

function updateCategoryFilter(categories) {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter || !categories) return;
    
    const currentValue = categoryFilter.value;
    
    let options = '<option value="0">All Categories</option>';
    for (let i = 0; i < categories.length; i++) {
        options += '<option value="' + categories[i].category_id + '">' + escapeHtml(categories[i].category_name) + '</option>';
    }
    
    categoryFilter.innerHTML = options;
    if (currentValue && currentValue !== '0') {
        categoryFilter.value = currentValue;
    }
}

function viewReport(reportId) {
    // Redirect to global view_item_details page
    window.location.href = '../../item_details/view_item_details.html?id=' + reportId + '&from=staff&type=lost';
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