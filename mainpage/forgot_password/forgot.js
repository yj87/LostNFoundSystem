// FORGOT PASSWORD PAGE (Verification)
if (document.getElementById('verifyForm')) {
    document.getElementById('verifyForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        document.getElementById('errorMessage').style.display = 'none';
        document.getElementById('successMessage').style.display = 'none';
        
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        
        if (!username || !email) {
            showError('Please enter both username and email');
            return;
        }
        
        const btn = document.getElementById('verifyBtn');
        const originalText = btn.textContent;
        btn.textContent = 'Verifying...';
        btn.disabled = true;
        
        try {
            const response = await fetch('reset.php?action=verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username, email: email })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Store data in sessionStorage
                sessionStorage.setItem('reset_username', result.username);
                sessionStorage.setItem('reset_email', result.email);
                
                // Redirect to reset password page
                window.location.href = 'reset.html';
            } else {
                showError(result.message);
            }
        } catch (error) {
            showError('Network error. Please try again.');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });
}

// RESET PASSWORD PAGE
if (document.getElementById('resetForm')) {
    // Check if user came from verification
    const username = sessionStorage.getItem('reset_username');
    const email = sessionStorage.getItem('reset_email');
    
    if (!username || !email) {
        window.location.href = 'forgot.html';
    }
    
    // Display username
    document.getElementById('displayUsername').textContent = username;
    document.getElementById('username').value = username;
    document.getElementById('email').value = email;
    
    document.getElementById('resetForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        document.getElementById('errorMessage').style.display = 'none';
        document.getElementById('successMessage').style.display = 'none';
        
        const password = document.getElementById('password').value;
        const confirm_password = document.getElementById('confirm_password').value;
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        
        if (!password || !confirm_password) {
            showError('Please fill in all fields');
            return;
        }
        
        if (password !== confirm_password) {
            showError('Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            showError('Password must be at least 6 characters');
            return;
        }
        
        const btn = document.getElementById('resetBtn');
        const originalText = btn.textContent;
        btn.textContent = 'Resetting...';
        btn.disabled = true;
        
        try {
            const response = await fetch('reset.php?action=reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: username, 
                    email: email, 
                    password: password,
                    confirm_password: confirm_password
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showSuccess(result.message);
                // Clear session storage
                sessionStorage.removeItem('reset_username');
                sessionStorage.removeItem('reset_email');
                setTimeout(() => {
                    window.location.href = '../login/loginpage.html';
                }, 2000);
            } else {
                showError(result.message);
            }
        } catch (error) {
            showError('Network error. Please try again.');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
}