document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showError('Please enter both username and password');
        return;
    }
    
    const btn = document.getElementById('loginBtn');
    const btnText = btn.querySelector('span:first-child');
    const spinner = btn.querySelector('.spinner');
    btnText.style.display = 'none';
    spinner.style.display = 'inline-block';
    btn.disabled = true;
    
    try {
        // Create form data for POST
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        
        const response = await fetch('login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess(result.message);
            setTimeout(() => {
                window.location.href = result.redirect;
            }, 1500);
        } else {
            showError(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Network error. Please try again.');
    } finally {
        btnText.style.display = 'inline';
        spinner.style.display = 'none';
        btn.disabled = false;
    }
});

function togglePassword() {
    const passwordField = document.getElementById('password');
    const type = passwordField.type === 'password' ? 'text' : 'password';
    passwordField.type = type;
}

function fillCredentials(username, password) {
    document.getElementById('username').value = username;
    document.getElementById('password').value = password;
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