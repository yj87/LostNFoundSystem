// staff_items.js
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('get_staff_items.php');
        const result = await response.json();
        
        const tableBody = document.getElementById('staffItemsTable');
        tableBody.innerHTML = ''; // Clear loading message

        if (result.success && result.data.length > 0) {
            result.data.forEach(item => {
                const statusClass = item.status === 'claimed' ? 'status-green' : 'status-yellow';
                
                const row = `
                    <tr>
                        <td><strong>${item.item_name}</strong></td>
                        <td>${item.category_name}</td>
                        <td>${item.location_found}</td>
                        <td>${item.date_found}</td>
                        <td><span class="badge ${statusClass}">${item.status}</span></td>
                        <td>
                            <button onclick="editItem(${item.item_id})" title="Edit"><i class="fas fa-edit"></i></button>
                            <button onclick="deleteItem(${item.item_id})" title="Delete" style="color:red;"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
                tableBody.insertAdjacentHTML('beforeend', row);
            });
        } else {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No items found. Start by adding one!</td></tr>';
        }
    } catch (error) {
        console.error('Error fetching items:', error);
    }
});