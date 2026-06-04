

        // Form submission
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('loginBtn');
            const btnText = submitBtn.querySelector('span:first-child');
            const spinner = submitBtn.querySelector('.spinner');
            
            // Show loading state
            btnText.style.display = 'none';
            spinner.style.display = 'inline-block';
            submitBtn.disabled = true;
            
            // Hide previous messages
            document.getElementById('errorMessage').style.display = 'none';
            document.getElementById('successMessage').style.display = 'none';
            
            // Get form data
            const formData = new FormData(this);
            
            try {
                const response = await fetch('login.php', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                // Reset button
                btnText.style.display = 'inline';
                spinner.style.display = 'none';
                submitBtn.disabled = false;
                
                if (data.success) {
                    // Show success message
                    const successDiv = document.getElementById('successMessage');
                    successDiv.textContent = data.message;
                    successDiv.style.display = 'block';
                    
                    // Redirect after 1 second
                    setTimeout(() => {
                        window.location.href = data.redirect;
                    }, 1000);
                } else {
                    // Show error
                    const errorDiv = document.getElementById('errorMessage');
                    errorDiv.textContent = data.message;
                    errorDiv.style.display = 'block';
                }
            } catch (error) {
                btnText.style.display = 'inline';
                spinner.style.display = 'none';
                submitBtn.disabled = false;
                
                const errorDiv = document.getElementById('errorMessage');
                errorDiv.textContent = 'Network error. Please try again.';
                errorDiv.style.display = 'block';
            }
        });
        
        // Toggle password visibility
        function togglePassword() {
            const passwordInput = document.getElementById('password');
            const toggleBtn = document.querySelector('.toggle-password');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleBtn.textContent = '🙈';
            } else {
                passwordInput.type = 'password';
                toggleBtn.textContent = '👁️';
            }
        }
        
        // Fill demo credentials
        function fillCredentials(email, password) {
            document.getElementById('email').value = email;
            document.getElementById('password').value = password;
        }
