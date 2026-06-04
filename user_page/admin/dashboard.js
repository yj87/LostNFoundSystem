        // Toggle sidebar for mobile
        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('active');
        }

        // Fetch dashboard data
        async function loadDashboardData() {
            try {
                const response = await fetch('admin_dashboard_data.php');
                const data = await response.json();
                
                // Update stats
                document.getElementById('total-users').textContent = data.total_users;
                document.getElementById('total-items').textContent = data.total_items;
                document.getElementById('total-claims').textContent = data.total_claims;
                document.getElementById('pending-claims').textContent = data.pending_claims;
                document.getElementById('welcome-message').textContent = `Welcome back, ${data.user_name}! Here's what's happening today.`;
                document.getElementById('user-name').textContent = data.user_name;
                
                // Claims Chart
                new Chart(document.getElementById('claimsChart'), {
                    type: 'doughnut',
                    data: {
                        labels: data.status_labels,
                        datasets: [{
                            data: data.status_data,
                            backgroundColor: ['#ff9800', '#4caf50', '#f44336', '#2196f3']
                        }]
                    }
                });
                
                // Category Chart
                new Chart(document.getElementById('categoryChart'), {
                    type: 'bar',
                    data: {
                        labels: data.category_labels,
                        datasets: [{
                            label: 'Number of Items',
                            data: data.category_data,
                            backgroundColor: '#4361ee'
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: { y: { beginAtZero: true } }
                    }
                });
                
                // Recent Claims Table
                const tbody = document.getElementById('claims-table-body');
                tbody.innerHTML = '';
                data.recent_claims.forEach(claim => {
                    const row = tbody.insertRow();
                    row.innerHTML = `
                        <td>#${claim.claim_id}</td>
                        <td>${escapeHtml(claim.item_name)}</td>
                        <td>${escapeHtml(claim.claimant_name)}</td>
                        <td><span class="status-badge status-${claim.claim_status}">${claim.claim_status}</span></td>
                        <td>${new Date(claim.submitted_at).toLocaleDateString()}</td>
                        <td><a href="review_claim.php?id=${claim.claim_id}" class="btn btn-primary btn-sm">Review</a></td>
                    `;
                });
            } catch (error) {
                console.error('Error loading dashboard:', error);
                document.getElementById('claims-table-body').innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Error loading data</td></tr>';
            }
        }
        
        function escapeHtml(str) {
            if (!str) return '';
            return str.replace(/[&<>]/g, function(m) {
                if (m === '&') return '&amp;';
                if (m === '<') return '&lt;';
                if (m === '>') return '&gt;';
                return m;
            });
        }

        function logoutUser() {
    window.location.href = 'http://localhost/LostNFoundSystem/mainpage/logout/logout.php';
}
        
        // Load data when page loads
        document.addEventListener('DOMContentLoaded', loadDashboardData);