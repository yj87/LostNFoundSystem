<?php
// 1. Set required role
$required_role = 'admin';

// 2. Include auth and database
require_once '../../../config/db_connect.php';
require_once '../../../includes/auth_check.php';
require_once '../../../includes/role_check.php';

// 3. Get user info from session
$admin_id = $_SESSION['user_id'] ?? 0;
$admin_name = $_SESSION['USER'] ?? 'Admin';
$user_avatar = strtoupper(substr($admin_name, 0, 1));

// 4. Check if this is an AJAX request - ONLY check for X-Requested-With header
$is_ajax = isset($_SERVER['HTTP_X_REQUESTED_WITH']) && 
           strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

// Only treat as AJAX if the header is present
if ($is_ajax) {
    // This is an AJAX request - return JSON
    header('Content-Type: application/json');
    
    try {
        // Get admin info
        if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'user') {
            echo json_encode([
                'success' => true, 
                'user_name' => $admin_name, 
                'user_avatar' => $user_avatar
            ]);
            mysqli_close($conn);
            exit();
        }

        // Get claim details
        if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
            $claim_id = intval($_GET['id']);
            
            $query = "SELECT c.*, 
                         f.item_name, f.description as item_description, f.location_found, f.date_found, f.photo as item_photo,
                         u.name as claimant_name, u.email as claimant_email, u.phone as claimant_phone,
                         s.name as staff_name,
                         lr.item_name as lost_item_name, lr.location_lost, lr.date_lost, lr.description as lost_description, lr.lost_status, lr.photo as lost_photo
                  FROM claims c
                  JOIN found_items f ON c.item_id = f.item_id
                  JOIN users u ON c.user_id = u.user_id
                  LEFT JOIN users s ON f.user_id = s.user_id
                  LEFT JOIN lost_reports lr ON c.lost_report_id = lr.report_id
                  WHERE c.claim_id = $claim_id";
            
            $result = mysqli_query($conn, $query);
            
            if (mysqli_num_rows($result) == 0) {
                echo json_encode(['success' => false, 'message' => 'Claim not found']);
                mysqli_close($conn);
                exit();
            }
            
            $row = mysqli_fetch_assoc($result);
            $claim = [
                'claim_id' => $row['claim_id'],
                'item_name' => htmlspecialchars($row['item_name']),
                'item_description' => nl2br(htmlspecialchars($row['item_description'])),
                'item_photo' => $row['item_photo'],
                'location_found' => htmlspecialchars($row['location_found']),
                'date_found' => date('d M Y', strtotime($row['date_found'])),
                'claim_status' => $row['claim_status'],
                'ownership_proof' => nl2br(htmlspecialchars($row['ownership_proof'])),
                'identifying_details' => nl2br(htmlspecialchars($row['identifying_details'])),
                'evidence_photo' => $row['evidence_photo'],
                'submitted_at' => date('d M Y, h:i A', strtotime($row['submitted_at'])),
                'claimant_name' => htmlspecialchars($row['claimant_name']),
                'claimant_email' => htmlspecialchars($row['claimant_email']),
                'claimant_phone' => htmlspecialchars($row['claimant_phone'] ?? '-'),
                'staff_name' => htmlspecialchars($row['staff_name'] ?? 'Unknown'),
                'lost_report_id' => $row['lost_report_id'],
                'lost_item_name' => htmlspecialchars($row['lost_item_name'] ?? ''),
                'lost_location' => htmlspecialchars($row['location_lost'] ?? ''),
                'lost_date' => $row['date_lost'] ? date('d M Y', strtotime($row['date_lost'])) : '',
                'lost_description' => nl2br(htmlspecialchars($row['lost_description'] ?? '')),
                'lost_status' => $row['lost_status'] ?? '',
                'lost_photo' => $row['lost_photo']
            ];
            
            echo json_encode(['success' => true, 'claim' => $claim]);
            mysqli_close($conn);
            exit();
        }

        // Process decision
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'decide') {
            $claim_id = intval($_POST['claim_id']);
            $decision = $_POST['decision'];
            $review_note = mysqli_real_escape_string($conn, $_POST['review_note'] ?? '');
            
            if (!in_array($decision, ['approved', 'rejected'])) {
                echo json_encode(['success' => false, 'message' => 'Invalid decision']);
                mysqli_close($conn);
                exit();
            }
            
            $check_query = "SELECT c.*, f.user_id as owner_id, f.item_id, c.lost_report_id
                            FROM claims c
                            JOIN found_items f ON c.item_id = f.item_id
                            WHERE c.claim_id = $claim_id";
            $check_result = mysqli_query($conn, $check_query);
            
            if (mysqli_num_rows($check_result) == 0) {
                echo json_encode(['success' => false, 'message' => 'Claim not found']);
                mysqli_close($conn);
                exit();
            }
            
            $claim = mysqli_fetch_assoc($check_result);
            
            if ($claim['claim_status'] !== 'pending') {
                echo json_encode(['success' => false, 'message' => 'This claim has already been reviewed']);
                mysqli_close($conn);
                exit();
            }
            
            $new_status = $decision;
            $query = "UPDATE claims SET 
                      claim_status = '$new_status',
                      reviewed_by = $admin_id,
                      reviewed_at = NOW(),
                      review_note = '$review_note'
                      WHERE claim_id = $claim_id";
            
            if (mysqli_query($conn, $query)) {
                if ($decision === 'approved') {
                    $item_id = $claim['item_id'];
                    $update_item = "UPDATE found_items SET found_status = 'claimed' WHERE item_id = $item_id";
                    mysqli_query($conn, $update_item);
                    
                    if (!empty($claim['lost_report_id'])) {
                        $update_lost = "UPDATE lost_reports SET lost_status = 'found' WHERE report_id = " . $claim['lost_report_id'];
                        mysqli_query($conn, $update_lost);
                    }
                }
                
                echo json_encode(['success' => true, 'message' => 'Claim ' . $decision . ' successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Database error: ' . mysqli_error($conn)]);
            }
            mysqli_close($conn);
            exit();
        }
        
        // If we get here, it's an invalid request
        echo json_encode(['success' => false, 'message' => 'Invalid request']);
        mysqli_close($conn);
        exit();
        
    } catch (Exception $e) {
        // Catch any PHP errors and return them as JSON
        echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
        mysqli_close($conn);
        exit();
    }
}

// 5. If not AJAX, display HTML
$current_year = date('Y');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Review Claims</title>
    <link rel="stylesheet" href="../admin_dashboard.css">
    <link rel="stylesheet" href="review_claims.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="dashboard-container">
        <aside id="sidebar">
            <div class="sidebar-header">
                <div class="logo-nav">
                    <div class="brand-logo">
                        <img src="../../../logo/lostfind.webp" alt="LostFind Logo">
                    </div>
                    <div class="brand-text">
                        <div class="brand-name">Lost<span>Find</span></div>
                        <div class="admin-tag">Admin Panel</div>
                    </div>
                </div>
            </div>
            <nav>
                <div class="nav-group">
                    <div class="nav-group-title">Main</div>
                    <a href="../dashboard_page.php" class="nav-item">
                        <span class="icon"><i class="fas fa-tachometer-alt"></i></span>
                        <span>Dashboard</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">User Management</div>
                    <a href="../user_management/manage.php" class="nav-item">
                        <span class="icon"><i class="fas fa-users"></i></span>
                        <span>View Users</span>
                    </a>
                    <a href="../user_management/add.php" class="nav-item">
                        <span class="icon"><i class="fas fa-user-plus"></i></span>
                        <span>Add User</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Found Items</div>
                    <a href="../found_item/admin_found_items.php" class="nav-item">
                        <span class="icon"><i class="fas fa-box"></i></span>
                        <span>View All Items</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Lost Reports</div>
                    <a href="../lost_reports/view_lost_reports.php" class="nav-item">
                        <span class="icon"><i class="fas fa-search"></i></span>
                        <span>View Lost Reports</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Claims</div>
                    <a href="view_claims.php" class="nav-item">
                        <span class="icon"><i class="fas fa-clipboard-list"></i></span>
                        <span>View All Claims</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Reports & Statistics</div>
                    <a href="../statistic/monthly_stats.php" class="nav-item">
                        <span class="icon"><i class="fas fa-chart-line"></i></span>
                        <span>Statistics</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Account</div>
                    <a href="../../profile/profile.php" class="nav-item">
                        <span class="icon"><i class="fas fa-user-circle"></i></span>
                        <span>My Profile</span>
                    </a>
                    <a href="../../../mainpage/logout/logout.php" class="nav-item" onclick="return logoutUser();">
                        <span class="icon"><i class="fas fa-sign-out-alt"></i></span>
                        <span>Logout</span>
                    </a>
                </div>
            </nav>
        </aside>

        <div class="main-content">
            <header class="top-header">
                <div class="header-left">
                    <button class="menu-toggle" onclick="toggleSidebar()">
                        <i class="fas fa-bars"></i>
                    </button>
                    <div class="page-title-header">Review Claim</div>
                </div>
                <div class="user-dropdown">
                    <div class="user-info-wrapper" onclick="toggleUserDropdown()">
                        <div class="user-avatar" id="userAvatar"><?php echo $user_avatar; ?></div>
                    </div>
                    <div class="user-dropdown-menu" id="userDropdownMenu">
                        <a href="../../profile/profile.php">
                            <i class="fas fa-user-circle"></i> My Profile
                        </a>
                        <div class="dropdown-divider"></div>
                        <a href="../../../mainpage/logout/logout.php" onclick="return logoutUser();">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </a>
                    </div>
                </div>
            </header>

            <article class="content-area">
                <div class="page-header">
                    <h1>Review Claim</h1>
                    <p>Review and make a decision on this claim</p>
                </div>

                <div id="loadingDiv" class="loading" style="display: none;">
                    <i class="fas fa-spinner fa-spin"></i> Loading claim details...
                </div>

                <div id="errorDiv" class="alert alert-error" style="display: none;"></div>

                <div class="review-container" id="reviewContainer" style="display: none;">
                    
                    <!-- CARD 1: Found Item Details -->
                    <div class="card reference-card">
                        <div class="card-header">
                            <i class="fas fa-box"></i>
                            <h3>Found Item Details</h3>
                            <span class="badge-reference">Reference</span>
                        </div>
                        <div class="card-body">
                            <div class="found-item-summary">
                                <div class="icon-tag">
                                    <i class="fas fa-box"></i>
                                </div>
                                <div class="found-item-info">
                                    <div class="found-item-name" id="foundItemName">Loading...</div>
                                    <div class="found-item-meta" id="foundItemMeta"></div>
                                </div>
                            </div>
                            <div class="found-item-details" id="foundItemDetails"></div>
                        </div>
                    </div>

                    <!-- CARD 2: Claimant Information -->
                    <div class="card">
                        <div class="card-header">
                            <i class="fas fa-user"></i>
                            <h3>Claimant Information</h3>
                        </div>
                        <div class="card-body">
                            <div class="detail-grid" id="claimantDetails"></div>
                        </div>
                    </div>

                    <!-- CARD 3: Photo Comparison -->
                    <div class="card">
                        <div class="card-header">
                            <i class="fas fa-images"></i>
                            <h3>Photo Comparison</h3>
                            <span class="badge-reference">Visual Evidence</span>
                        </div>
                        <div class="card-body">
                            <div class="photo-comparison-grid">
                                <div class="photo-card">
                                    <div class="photo-card-header">
                                        <i class="fas fa-box"></i>
                                        <h4>Found Item Photo</h4>
                                    </div>
                                    <div class="photo-card-body" id="foundItemPhotoContainer">
                                        <div class="photo-placeholder">
                                            <i class="fas fa-image"></i>
                                            <p>No photo available</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="photo-card">
                                    <div class="photo-card-header">
                                        <i class="fas fa-camera"></i>
                                        <h4>Claimant's Evidence Photo</h4>
                                    </div>
                                    <div class="photo-card-body" id="evidencePhotoContainer">
                                        <div class="photo-placeholder">
                                            <i class="fas fa-image"></i>
                                            <p>No evidence photo uploaded</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="photo-comparison-actions">
                                <label class="comparison-label">Do the photos match or show the same item?</label>
                                <div class="verdict-buttons">
                                    <button type="button" class="verdict-yes" id="photoMatchYes">✓ Yes, photos match</button>
                                    <button type="button" class="verdict-no" id="photoMatchNo">✗ No, photos don't match</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- CARD 4: Staff Who Uploaded the Item -->
                    <div class="card">
                        <div class="card-header">
                            <i class="fas fa-user-tie"></i>
                            <h3>Staff Who Uploaded this Item</h3>
                        </div>
                        <div class="card-body">
                            <div class="detail-grid" id="staffDetails"></div>
                        </div>
                    </div>

                    <!-- CARD 5: Linked Lost Report -->
                    <div id="lostReportCard" class="card lost-report-card" style="display: none;">
                        <div class="card-header">
                            <i class="fas fa-link"></i>
                            <h3>Linked Lost Report <span class="badge-reference">User's Original Report</span></h3>
                        </div>
                        <div class="card-body">
                            <div class="lost-report-summary" id="lostReportSummary"></div>
                            <div class="lost-report-action">
                                <button type="button" class="btn-view-lost" id="viewLostReportBtn">
                                    <i class="fas fa-eye"></i> View Full Lost Report Details
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- CARD 6: Side-by-Side Comparison -->
                    <div class="comparison-container">
                        <div class="comparison-col">
                            <div class="card comparison-card">
                                <div class="card-header">
                                    <i class="fas fa-receipt"></i>
                                    <h3>Proof of Ownership</h3>
                                    <span class="badge-claimant">Claimant's Evidence</span>
                                </div>
                                <div class="card-body">
                                    <div class="proof-content" id="ownershipProof"></div>
                                </div>
                                <div class="comparison-actions">
                                    <label class="comparison-label">Does this match the found item?</label>
                                    <div class="verdict-buttons">
                                        <button type="button" class="verdict-yes" id="proofMatchYes">✓ Yes, matches</button>
                                        <button type="button" class="verdict-no" id="proofMatchNo">✗ No, doesn't match</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="comparison-col">
                            <div class="card comparison-card">
                                <div class="card-header">
                                    <i class="fas fa-search"></i>
                                    <h3>Identifying Details</h3>
                                    <span class="badge-claimant">Claimant's Description</span>
                                </div>
                                <div class="card-body">
                                    <div class="proof-content" id="identifyingDetails"></div>
                                </div>
                                <div class="comparison-actions">
                                    <label class="comparison-label">Does this match the found item?</label>
                                    <div class="verdict-buttons">
                                        <button type="button" class="verdict-yes" id="identifyingMatchYes">✓ Yes, matches</button>
                                        <button type="button" class="verdict-no" id="identifyingMatchNo">✗ No, doesn't match</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- CARD 7: Make Decision -->
                    <div class="card decision-card">
                        <div class="card-header">
                            <i class="fas fa-gavel"></i>
                            <h3>Make Decision</h3>
                        </div>
                        <div class="card-body">
                            <div class="match-summary" id="matchSummary">
                                <strong>📋 Comparison Summary:</strong><br>
                                <span class="match-pending">○ Please verify if proof of ownership matches</span><br>
                                <span class="match-pending">○ Please verify if identifying details match</span><br>
                                <span class="match-pending">○ Please verify if photos match</span>
                            </div>
                            <div class="form-group">
                                <label for="review_note">Review Note <span class="required">(required for rejection)</span></label>
                                <textarea id="review_note" rows="3" placeholder="Provide reason for rejection or additional notes..."></textarea>
                            </div>
                            <div class="decision-buttons">
                                <button type="button" class="btn-approve" id="approveBtn">
                                    <i class="fas fa-check-circle"></i> Approve Claim
                                </button>
                                <button type="button" class="btn-reject" id="rejectBtn">
                                    <i class="fas fa-times-circle"></i> Reject Claim
                                </button>
                                <button type="button" class="btn-cancel" onclick="goBack()">
                                    <i class="fas fa-arrow-left"></i> Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </article>

            <footer>
                <p>&copy; <?php echo $current_year; ?> Lost & Found System - Universiti Teknologi Malaysia</p>
            </footer>
        </div>
    </div>

    <!-- Lost Report Modal Popup -->
    <div id="lostReportModal" class="modal-overlay">
        <div class="modal-container">
            <div class="modal-header">
                <h4><i class="fas fa-history"></i> Lost Report Details</h4>
                <button class="modal-close" onclick="closeLostReportModal()">&times;</button>
            </div>
            <div class="modal-body" id="lostReportModalBody"></div>
            <div class="modal-footer">
                <button class="btn btn-sm" onclick="closeLostReportModal()">Close</button>
            </div>
        </div>
    </div>

    <script>
        // Pass session data to JavaScript
        const adminId = <?php echo $admin_id; ?>;
        const adminName = '<?php echo addslashes($admin_name); ?>';
        const userAvatar = '<?php echo $user_avatar; ?>';
        
        // Get claim ID from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const claimId = urlParams.get('id');
        
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('active');
        }

        function toggleUserDropdown() {
            const dropdown = document.getElementById('userDropdownMenu');
            dropdown.classList.toggle('show');
        }

        function goBack() {
            window.location.href = 'view_claims.php';
        }

        function logoutUser() {
            if (confirm('Are you sure you want to logout?')) {
                window.location.href = '../../../mainpage/logout/logout.php';
                return true;
            }
            return false;
        }

        function closeLostReportModal() {
            const modal = document.getElementById('lostReportModal');
            if (modal) {
                modal.classList.remove('active');
            }
        }

        document.addEventListener('click', function(event) {
            const dropdown = document.getElementById('userDropdownMenu');
            const avatar = document.getElementById('userAvatar');
            if (dropdown && avatar && dropdown.classList.contains('show')) {
                if (!avatar.contains(event.target) && !dropdown.contains(event.target)) {
                    dropdown.classList.remove('show');
                }
            }
            
            const modal = document.getElementById('lostReportModal');
            if (modal && modal.classList.contains('active') && event.target === modal) {
                closeLostReportModal();
            }
        });
    </script>
    <script src="review_claims.js"></script>
</body>
</html>