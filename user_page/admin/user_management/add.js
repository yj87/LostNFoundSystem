document.getElementById('addUserForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            
            try {
                const response = await fetch('insert.php', {
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