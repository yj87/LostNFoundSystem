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
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:red;">Error loading reports</td></tr>';
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
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <div class="empty-state-content">
                        <i class="fas fa-search"></i>
                        <h3>No Lost Reports Found</h3>
                        <p>We couldn't find any lost reports matching your criteria.</p>
                        <div class="empty-state-suggestions">
                            <span class="suggestion-tag">Try clearing your filters</span>
                            <span class="suggestion-tag">Check your spelling</span>
                            <span class="suggestion-tag">Use fewer keywords</span>
                        </div>
                        <button class="btn-empty-reset" onclick="resetFilters()">
                            ✕ Clear All Filters
                        </button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    for (let i = 0; i < reports.length; i++) {
        const report = reports[i];
        let statusClass = '';
        if (report.lost_status === 'searching') statusClass = 'status-searching';
        if (report.lost_status === 'found') statusClass = 'status-found';
        if (report.lost_status === 'closed') statusClass = 'status-closed';
        
        // Photo thumbnail
        let photoHtml = '';
        if (report.photo) {
            photoHtml = '<img src="../../../' + report.photo + '" class="photo-thumb" alt="Photo">';
        } else {
            photoHtml = '<div class="photo-placeholder"><i class="fas fa-image"></i></div>';
        }
        
        html += '<tr>';
        html += '<td>' + report.report_id + '</td>';
        html += '<td>' + photoHtml + '</td>';
        html += '<td><strong>' + escapeHtml(report.item_name) + '</strong></td>';
        html += '<td>' + escapeHtml(report.user_name) + '</td>';
        html += '<td>' + escapeHtml(report.location_lost) + '</td>';
        html += '<td>' + report.date_lost + '</td>';
        html += '<td><span class="status-badge ' + statusClass + '">' + report.status_label + '</span></td>';
        html += '<td>';
        html += '<div class="action-buttons">';
        html += '<button class="btn btn-primary btn-sm" onclick="viewReport(' + report.report_id + ')"><i class="fas fa-eye"></i> View</button>';
        html += '<button class="btn btn-warning btn-sm" onclick="editReport(' + report.report_id + ')"><i class="fas fa-edit"></i> Edit</button>';
        html += '<button class="btn btn-danger btn-sm" onclick="deleteReport(' + report.report_id + ', \'' + escapeHtml(report.item_name) + '\')"><i class="fas fa-trash"></i> Delete</button>';
        html += '</div>';
        html += '</td>';
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
        html += '<button class="btn btn-sm" onclick="goToPage(' + (data.page - 1) + ')">← Previous</button>';
    }
    
    html += '<span class="page-info">Page ' + data.page + ' of ' + data.total_pages + '</span>';
    
    if (data.page < data.total_pages) {
        html += '<button class="btn btn-sm" onclick="goToPage(' + (data.page + 1) + ')">Next →</button>';
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
    window.location.href = '../../item_details/view_item_details.html?id=' + reportId + '&from=admin&type=lost';
}

function editReport(reportId) {
    window.location.href = 'edit_lost_reports.html?id=' + reportId;
}

async function deleteReport(reportId, itemName) {
    if (!confirm('Are you sure you want to delete "' + itemName + '"? This action cannot be undone.')) {
        return;
    }
    
    try {
        console.log('Deleting report ID:', reportId);
        
        const formData = new FormData();
        formData.append('report_id', reportId);
        
        const response = await fetch('delete_lost_reports.php', {
            method: 'POST',
            body: formData
        });
        
        // Check if response is OK
        if (!response.ok) {
            const text = await response.text();
            console.error('Server response:', text);
            alert('Server error. Check console.');
            return;
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
            alert('Report deleted successfully');
            loadReports(); // Refresh the table
        } else {
            alert('Failed to delete: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Network error: ' + error.message);
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