// add_found_item.js

document.addEventListener('DOMContentLoaded', async function() {
    
    // 1. Prevent selecting future dates
    const dateInput = document.getElementById('dateFound');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('max', today);

    // 2. Fetch categories dynamically from PHP API
try {
    const response = await fetch('get_categories.php');
    const result = await response.json();
    
    // Check if the dropdown exists before trying to fill it
    const categorySelect = document.getElementById('categorySelect');
    if (categorySelect) {
        categorySelect.innerHTML = '<option value="">-- Choose Category --</option>'; 
        
        if (result.success) {
            result.data.forEach(category => {
                const option = document.createElement('option');
                option.value = category.category_id; // Matches your PHP query
                option.textContent = category.category_name; // Matches your PHP query
                categorySelect.appendChild(option);
            });
        }
    }
} catch (error) {
    console.error('Dropdown Error:', error);
}
    // 3. Handle Form Submission
    document.getElementById('addFoundItemForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const alertBox = document.getElementById('alertBox');
        const submitBtn = document.getElementById('submitBtn');
        const formData = new FormData(this);
        
        // Prevent double clicking
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Persisting...';

        try {
            const response = await fetch('add_found_item.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.success) {
                alertBox.innerHTML = `
                    <div style="background: #d4edda; color: #155724; border: 1px solid #c3e6cb; padding: 15px; border-radius: 6px; margin-bottom: 20px; font-weight:500;">
                        <i class="fas fa-check-circle"></i> ${result.message} Redirecting...
                    </div>
                `;
                this.reset();
                setTimeout(() => {
                    window.location.href = 'staff_found_items.php';
                }, 2000);
            } else {
                throw new Error(result.message || 'Operation failed.');
            }
        } catch (error) {
            alertBox.innerHTML = `
                <div style="background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; padding: 15px; border-radius: 6px; margin-bottom: 20px; font-weight:500;">
                    <i class="fas fa-exclamation-triangle"></i> Execution Blocked: ${error.message}
                </div>
            `;
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Registry Record';
        }
    });
});