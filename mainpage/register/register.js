document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
    
    const username = document.getElementById('username').value.trim();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirm_password = document.getElementById('confirm_password').value;
    const terms = document.getElementById('terms').checked;
    
    if (!username || !name || !email || !password) {
        showError('All required fields must be filled');
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
    
    if (!terms) {
        showError('You must agree to the Terms of Service');
        return;
    }
    
    const btn = document.getElementById('registerBtn');
    const originalText = btn.textContent;
    btn.textContent = 'Registering...';
    btn.disabled = true;
    
    try {
        // Fetching register.php (the processor)
        const response = await fetch('register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, name, email, phone, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess(result.message);
            setTimeout(() => {
                window.location.href = '../../user_page/user/dashboard.html';
            }, 2000);
        } else {
            showError(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Network error. Please try again.');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
});

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