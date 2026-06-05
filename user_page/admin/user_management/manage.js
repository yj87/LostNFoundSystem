// Load users on page load
document.addEventListener('DOMContentLoaded', loadUsers);

function loadUsers() {
   fetch('get.php')
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('userTableBody');
            tbody.innerHTML = '';
            
            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="text-center">No users found</td></tr>';
                return;
            }
            
            data.forEach(user => {
                const row = `
                    <tr>
                        <td>${user.user_id}</td>
                        <td>${escapeHtml(user.username)}</td>
                        <td>${escapeHtml(user.name)}</td>
                        <td>${escapeHtml(user.email)}</td>
                        <td>
                            <span class="badge ${getRoleBadgeClass(user.role)}">
                                ${user.role}
                            </span>
                        </td>
                        <td>${user.phone || '-'}</td>
                        <td>${user.created_at}</td>
                        <td>
                            <a class="btn btn-primary btn-sm" href="edit.html?id=${user.user_id}">Edit</a>
                            <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.user_id}, '${escapeHtml(user.username)}')">Delete</button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('userTableBody').innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error loading users</td></tr>';
        });
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
    switch(role) {
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