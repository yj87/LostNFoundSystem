// Sidebar toggle with overlay
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const body = document.body;

    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.onclick = function() {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            body.style.overflow = '';
        };
        document.body.appendChild(overlay);
    }

    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');

    if (window.innerWidth <= 768) {
        body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    }
}

// Logout confirmation
function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '../../mainpage/logout/logout.php';
        return true;
    }
    return false;
}

// Close sidebar on outside click (mobile)
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    const overlay = document.querySelector('.sidebar-overlay');

    if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
        if (menuToggle && !menuToggle.contains(event.target) && !sidebar.contains(event.target)) {
            sidebar.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});

// Reset sidebar on desktop resize
window.addEventListener('resize', function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (window.innerWidth > 768 && sidebar) {
        sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Edit item — navigate to edit page
function editItem(id) {
    window.location.href = `edit_found_item.html?id=${id}`;
}
// Load and render items table
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('get_staff_items.php', { credentials: 'same-origin' });
        const result = await response.json();

        const tableBody = document.getElementById('staffItemsTable');
        tableBody.innerHTML = '';

        if (result.success && result.data.length > 0) {
            result.data.forEach(item => {
                const statusClass = item.found_status === 'claimed'  ? 'status-claimed'  :
                                    item.found_status === 'pending'  ? 'status-pending'  :
                                                                       'status-unclaimed';
                const row = `
                    <tr>
                        <td><strong>${item.item_name}</strong></td>
                        <td>${item.category_name ?? '-'}</td>
                        <td>${item.location_found}</td>
                        <td>${item.date_found}</td>
                        <td><span class="status-badge ${statusClass}">${item.found_status}</span></td>
                        <td>
                            <button onclick="editItem(${item.item_id})" title="Edit" class="btn btn-primary"><i class="fas fa-edit"></i></button>
                    </tr>`;
                tableBody.insertAdjacentHTML('beforeend', row);
            });
        } else {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No items found. Start by adding one!</td></tr>';
        }
    } catch (error) {
        console.error('Error fetching items:', error);
        document.getElementById('staffItemsTable').innerHTML =
            '<tr><td colspan="6" style="text-align:center;color:red;">Failed to load items.</td></tr>';
    }
});