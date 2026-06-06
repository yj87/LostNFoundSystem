// edit_found_item.js
document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id');

    if (!itemId) {
        window.location.href = 'staff_found_items.php';
        return;
    }

    // 1. Fetch Categories and Item Data
    try {
        const [catRes, itemRes] = await Promise.all([
            fetch('get_categories.php'),
            fetch(`edit_found_item.php?id=${itemId}`)
        ]);

        const categories = await catRes.json();
        const item = await itemRes.json();

        if (item.success) {
            // Fill categories
            const select = document.getElementById('categorySelect');
            categories.data.forEach(c => {
                const opt = new Option(c.category_name, c.category_id);
                if(c.category_id == item.data.category_id) opt.selected = true;
                select.add(opt);
            });

            // Fill Form Fields
            document.getElementById('itemId').value = item.data.item_id;
            document.getElementById('itemName').value = item.data.item_name;
            document.getElementById('locationFound').value = item.data.location_found;
            document.getElementById('dateFound').value = item.data.date_found;
            document.getElementById('foundStatus').value = item.data.found_status;
            document.getElementById('description').value = item.data.description;
            document.getElementById('pageTitle').innerText = `Edit Record: ${item.data.item_name}`;
        }
    } catch (e) { console.error("Load failed", e); }

    // 2. Handle Update
    document.getElementById('editItemForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const res = await fetch('update_found_item.php', {
            method: 'POST',
            body: new FormData(this)
        });
        const result = await res.json();
        if(result.success) window.location.href = 'staff_found_items.html';
        else alert(result.message);
    });
});