// Store current search term
let currentSearch = '';

// Load users on page load
document.addEventListener('DOMContentLoaded', loadUsers);

function loadUsers() {
    let url = 'get.php';
    if (currentSearch) {
        url = `search.php?search=${encodeURIComponent(currentSearch)}`;
    }
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('userTableBody').innerHTML = `<tr><td colspan="8" class="text-center text-danger">${data.error}</td></tr>`;
                return;
            }
            displayUsers(data);
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('userTableBody').innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error loading users</td></tr>';
        });
}

function searchUsers() {
    currentSearch = document.getElementById('searchInput').value.trim();
    loadUsers(); // Reload with search term
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    currentSearch = '';
    loadUsers(); // Reload all users
}

function displayUsers(users) {
    const tbody = document.getElementById('userTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">No users found</td></tr>';
        return;
    }
    
    let html = '';
    users.forEach(user => {
        html += `
            <tr>
                <td>${user.user_id}</td>
                <td>${escapeHtml(user.username)}</td>
                <td>${escapeHtml(user.name)}</td>
                <td>${escapeHtml(user.email)}</td>
                <td><span class="badge ${getRoleBadgeClass(user.role)}">${user.role}</span></td>
                <td>${user.phone || '-'}</td>
                <td>${user.created_at || '-'}</td>
                <td>
                    <a class="btn btn-primary btn-sm" href="edit.html?id=${user.user_id}">Edit</a>
                    <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.user_id}, '${escapeHtml(user.username)}')">Delete</button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function deleteUser(id, username) {
    if (confirm(`Are you sure you want to delete user "${username}"?`)) {
        fetch('delete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `id=${id}`
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert(result.message);
                loadUsers();
            } else {
                alert('Error: ' + result.message);
            }
        })
        .catch(error => {
            alert('Network error. Please try again.');
        });
    }
}

function getRoleBadgeClass(role) {
    if (!role) return 'bg-secondary';
    switch(role.toLowerCase()) {
        case 'admin': return 'bg-danger';
        case 'staff': return 'bg-warning text-dark';
        case 'user': return 'bg-success';
        default: return 'bg-secondary';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}