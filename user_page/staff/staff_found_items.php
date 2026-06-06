<?php
require_once '../../config/db_connect.php';
require_once '../../includes/auth_check.php';
$required_role = 'staff';
require_once '../../includes/role_check.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Found Items - Lost & Found</title>
    <link rel="stylesheet" href="staff_dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="dashboard-container">
        <main class="main-content">
            <header class="top-header">
                <h2>Manage My Registered Items</h2>
            </header>

            <div class="table-container" style="padding: 20px;">
                <table class="data-table" style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <thead style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                        <tr>
                            <th>Item Name</th>
                            <th>Category</th>
                            <th>Location</th>
                            <th>Date Found</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="staffItemsTable">
                        <tr><td colspan="6" style="text-align:center; padding: 20px;">Loading your items...</td></tr>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
    <script src="staff_items.js"></script>
</body>
</html>