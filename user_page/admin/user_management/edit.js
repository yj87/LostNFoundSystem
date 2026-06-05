        // Get user ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('id');
        
        if (!userId) {
            window.location.href = 'manage.html';
        }
        
        // Load user data
        fetch(`get_user.php?id=${userId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('userId').value = data.user.user_id;
                    document.getElementById('username').value = data.user.username;
                    document.getElementById('name').value = data.user.name;
                    document.getElementById('email').value = data.user.email;
                    document.getElementById('phone').value = data.user.phone || '';
                    document.getElementById('role').value = data.user.role;
                } else {
                    alert(data.message);
                    window.location.href = 'manage.html';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error loading user data');
                window.location.href = 'manage.html';
            });
        
        // Submit form
        document.getElementById('editUserForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            
            try {
                const response = await fetch('update.php', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                const alertDiv = document.getElementById('alertMessage');
                if (result.success) {
                    alertDiv.className = 'alert alert-success';
                    alertDiv.textContent = result.message;
                    alertDiv.style.display = 'block';
                    setTimeout(() => {
                        window.location.href = 'manage.html';
                    }, 1500);
                } else {
                    alertDiv.className = 'alert alert-danger';
                    alertDiv.textContent = result.message;
                    alertDiv.style.display = 'block';
                }
            } catch (error) {
                const alertDiv = document.getElementById('alertMessage');
                alertDiv.className = 'alert alert-danger';
                alertDiv.textContent = 'Network error. Please try again.';
                alertDiv.style.display = 'block';
            }
        });