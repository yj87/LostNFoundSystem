<?php
// 1. Set required role
$required_role = 'user';

// 2. Include auth and database
require_once '../../../config/db_connect.php';
require_once '../../../includes/auth_check.php';
require_once '../../../includes/role_check.php';

// 3. Get user info from session
$user_id = $_SESSION['user_id'] ?? 0;
$user_name = $_SESSION['USER'] ?? 'User';
$user_avatar = strtoupper(substr($user_name, 0, 1));

// 4. Check if this is an AJAX request
$is_ajax = isset($_SERVER['HTTP_X_REQUESTED_WITH']) && 
           strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

// Also check for action parameter (alternative way to detect AJAX)
$has_action = isset($_GET['action']) || isset($_POST['action']);

if ($is_ajax || $has_action) {
    // This is an AJAX request - return JSON
    header('Content-Type: application/json');
    
    try {
        // Get user's lost reports
        if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'get_lost_reports') {
            $query = "SELECT report_id, item_name, location_lost, date_lost 
                      FROM lost_reports 
                      WHERE user_id = $user_id AND lost_status = 'searching'
                      ORDER BY created_at DESC";
            
            $result = mysqli_query($conn, $query);
            $reports = [];
            
            while ($row = mysqli_fetch_assoc($result)) {
                $reports[] = [
                    'report_id' => $row['report_id'],
                    'item_name' => htmlspecialchars($row['item_name']),
                    'location_lost' => htmlspecialchars($row['location_lost']),
                    'date_lost' => date('d M Y', strtotime($row['date_lost']))
                ];
            }
            
            echo json_encode(['success' => true, 'reports' => $reports]);
            mysqli_close($conn);
            exit();
        }
        
        // Get item details
        if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'get_item') {
            // Accept both 'id' and 'item_id' parameters
            $item_id = isset($_GET['item_id']) ? intval($_GET['item_id']) : (isset($_GET['id']) ? intval($_GET['id']) : 0);
            
            if ($item_id == 0) {
                echo json_encode(['success' => false, 'message' => 'Item ID not provided']);
                mysqli_close($conn);
                exit();
            }
            
            $query = "SELECT f.*, c.category_name 
                      FROM found_items f
                      LEFT JOIN categories c ON f.category_id = c.category_id
                      WHERE f.item_id = $item_id";
            
            $result = mysqli_query($conn, $query);
            
            if (mysqli_num_rows($result) == 0) {
                echo json_encode(['success' => false, 'message' => 'Item not found']);
                mysqli_close($conn);
                exit();
            }
            
            $item = mysqli_fetch_assoc($result);
            
            if ($item['found_status'] === 'claimed') {
                echo json_encode(['success' => false, 'message' => 'This item has already been claimed']);
                mysqli_close($conn);
                exit();
            }
            
            echo json_encode([
                'success' => true,
                'item' => [
                    'item_id' => $item['item_id'],
                    'item_name' => htmlspecialchars($item['item_name']),
                    'description' => nl2br(htmlspecialchars($item['description'])),
                    'location_found' => htmlspecialchars($item['location_found']),
                    'date_found' => date('d M Y', strtotime($item['date_found'])),
                    'found_status' => $item['found_status'],
                    'category_name' => $item['category_name'] ?? 'Uncategorized'
                ]
            ]);
            mysqli_close($conn);
            exit();
        }
        
        // Submit claim
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'submit') {
            $item_id = intval($_POST['item_id']);
            $ownership_proof = mysqli_real_escape_string($conn, $_POST['ownership_proof']);
            $identifying_details = mysqli_real_escape_string($conn, $_POST['identifying_details']);
            $lost_report_id = !empty($_POST['lost_report_id']) ? intval($_POST['lost_report_id']) : null;
            
            if (empty($ownership_proof) || empty($identifying_details)) {
                echo json_encode(['success' => false, 'message' => 'Please fill all required fields']);
                mysqli_close($conn);
                exit();
            }
            
            // Check if item exists and is unclaimed
            $check_query = "SELECT found_status FROM found_items WHERE item_id = $item_id";
            $check_result = mysqli_query($conn, $check_query);
            $item = mysqli_fetch_assoc($check_result);
            
            if (!$item) {
                echo json_encode(['success' => false, 'message' => 'Item not found']);
                mysqli_close($conn);
                exit();
            }
            
            if ($item['found_status'] === 'claimed') {
                echo json_encode(['success' => false, 'message' => 'This item has already been claimed']);
                mysqli_close($conn);
                exit();
            }
            
            // Check if user already submitted a claim
            $check_claim = mysqli_query($conn, "SELECT claim_id FROM claims WHERE item_id = $item_id AND user_id = $user_id");
            if (mysqli_num_rows($check_claim) > 0) {
                echo json_encode(['success' => false, 'message' => 'You have already submitted a claim for this item']);
                mysqli_close($conn);
                exit();
            }
            
            // Verify lost report belongs to user
            if ($lost_report_id) {
                $check_lost = mysqli_query($conn, "SELECT report_id FROM lost_reports WHERE report_id = $lost_report_id AND user_id = $user_id");
                if (mysqli_num_rows($check_lost) == 0) {
                    echo json_encode(['success' => false, 'message' => 'Invalid lost report selected']);
                    mysqli_close($conn);
                    exit();
                }
            }
            
            // Handle evidence photo upload
            $evidence_photo = null;
            $upload_dir = "../../../uploads/claims/";
            
            if (!file_exists($upload_dir)) {
                mkdir($upload_dir, 0777, true);
            }
            
            if (isset($_FILES['evidence_photo']) && $_FILES['evidence_photo']['error'] === UPLOAD_ERR_OK) {
                $file = $_FILES['evidence_photo'];
                $file_size = $file['size'];
                $file_tmp = $file['tmp_name'];
                $file_ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
                $allowed_ext = ['jpg', 'jpeg', 'png', 'pdf'];
                
                if ($file_size > 5 * 1024 * 1024) {
                    echo json_encode(['success' => false, 'message' => 'File size too large. Max 5MB']);
                    mysqli_close($conn);
                    exit();
                }
                
                if (!in_array($file_ext, $allowed_ext)) {
                    echo json_encode(['success' => false, 'message' => 'Only JPG, PNG, PDF files are allowed']);
                    mysqli_close($conn);
                    exit();
                }
                
                $new_filename = time() . '_' . uniqid() . '.' . $file_ext;
                $destination = $upload_dir . $new_filename;
                
                if (move_uploaded_file($file_tmp, $destination)) {
                    $evidence_photo = "uploads/claims/" . $new_filename;
                } else {
                    echo json_encode(['success' => false, 'message' => 'Failed to upload evidence photo']);
                    mysqli_close($conn);
                    exit();
                }
            }
            
            $photo_column = $evidence_photo ? ", evidence_photo" : "";
            $photo_value  = $evidence_photo ? ", '$evidence_photo'" : "";

            if ($lost_report_id) {
                $query = "INSERT INTO claims (
                            item_id,
                            user_id,
                            ownership_proof,
                            identifying_details,
                            claim_status,
                            submitted_at,
                            lost_report_id
                            $photo_column
                          )
                          VALUES (
                            $item_id,
                            $user_id,
                            '$ownership_proof',
                            '$identifying_details',
                            'pending',
                            NOW(),
                            $lost_report_id
                            $photo_value
                          )";
            } else {
                $query = "INSERT INTO claims (
                            item_id,
                            user_id,
                            ownership_proof,
                            identifying_details,
                            claim_status,
                            submitted_at
                            $photo_column
                          )
                          VALUES (
                            $item_id,
                            $user_id,
                            '$ownership_proof',
                            '$identifying_details',
                            'pending',
                            NOW()
                            $photo_value
                          )";
            }
            
            if (mysqli_query($conn, $query)) {
                echo json_encode(['success' => true, 'message' => 'Claim submitted successfully']);
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
    <title>Submit Claim - Lost & Found</title>
    <link rel="stylesheet" href="../dashboard.css">
    <link rel="stylesheet" href="submit_claim.css">
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
                        <div class="admin-tag">User Panel</div>
                    </div>
                </div>
            </div>
            <nav>
                <div class="nav-group">
                    <div class="nav-group-title">Main</div>
                    <a href="../dashboard.html" class="nav-item">
                        <span class="icon"><i class="fas fa-tachometer-alt"></i></span>
                        <span>Dashboard</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Lost Items</div>
                    <a href="../lost_reports/report_lost_items.html" class="nav-item">
                        <span class="icon"><i class="fas fa-plus-circle"></i></span>
                        <span>Report Lost Item</span>
                    </a>
                    <a href="../lost_reports/my_lost_reports.html" class="nav-item">
                        <span class="icon"><i class="fas fa-history"></i></span>
                        <span>My Lost Reports</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Found Items</div>
                    <a href="../found_item/browse_found_items.html" class="nav-item">
                        <span class="icon"><i class="fas fa-search"></i></span>
                        <span>Browse Found Items</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Claims</div>
                    <a href="my_claims.html" class="nav-item">
                        <span class="icon"><i class="fas fa-clipboard-list"></i></span>
                        <span>My Claims</span>
                    </a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Account</div>
                    <a href="../../profile/profile.html" class="nav-item">
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
                    <div class="page-title-header">Submit Claim</div>
                </div>
                <div class="user-dropdown">
                    <div class="user-info-wrapper" onclick="toggleUserDropdown()">
                        <div class="user-avatar" id="userAvatar"><?php echo $user_avatar; ?></div>
                    </div>
                    <div class="user-dropdown-menu" id="userDropdownMenu">
                        <a href="../../profile/profile.html">
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
                    <h1>Submit a Claim</h1>
                    <p>Follow the steps below to claim your item.</p>
                </div>

                <div id="loadingDiv" class="loading" style="display: none;">
                    <i class="fas fa-spinner fa-spin"></i> Loading item details...
                </div>

                <div id="errorDiv" class="alert alert-error" style="display: none;"></div>

                <div class="form-container" id="formContainer" style="display: none;">
                    <!-- Progress Steps -->
                    <div class="progress-steps">
                        <div class="step" id="step1Indicator">
                            <div class="step-number">1</div>
                            <div class="step-label">Review Item</div>
                        </div>
                        <div class="step-line"></div>
                        <div class="step" id="step2Indicator">
                            <div class="step-number">2</div>
                            <div class="step-label">Link Lost Report</div>
                        </div>
                        <div class="step-line"></div>
                        <div class="step" id="step3Indicator">
                            <div class="step-number">3</div>
                            <div class="step-label">Provide Details</div>
                        </div>
                        <div class="step-line"></div>
                        <div class="step" id="step4Indicator">
                            <div class="step-number">4</div>
                            <div class="step-label">Review & Submit</div>
                        </div>
                    </div>

                    <!-- STEP 1: Review Item -->
                    <div id="step1" class="step-content active">
                        <div class="card">
                            <div class="card-header">
                                <i class="fas fa-box"></i>
                                <h3>Item You Are Claiming</h3>
                            </div>
                            <div class="item-preview" id="itemPreview"></div>
                        </div>
                        <div class="step-actions">
                            <button type="button" class="btn-cancel-step" id="cancelBtn">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                            <button type="button" class="btn-next" id="confirmContinueBtn">
                                Confirm & Continue <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>

                    <!-- STEP 2: Link Lost Report -->
                    <div id="step2" class="step-content">
                        <div class="card">
                            <div class="card-header">
                                <i class="fas fa-link"></i>
                                <h3>Link to Lost Report (Optional)</h3>
                            </div>
                            <div class="card-body">
                                <div class="form-group">
                                    <label for="lost_report_id">
                                        <i class="fas fa-history"></i> Did you report this item as lost before?
                                    </label>
                                    <select id="lost_report_id" name="lost_report_id">
                                        <option value="">No, I haven't reported it as lost</option>
                                        <option value="new" disabled>────────── My Lost Reports ──────────</option>
                                    </select>
                                    <div class="form-hint">
                                        <i class="fas fa-info-circle"></i> Linking your claim to a lost report helps staff verify your claim faster.
                                    </div>
                                </div>
                                
                                <!-- Lost Report Preview -->
                                <div id="lostReportPreview" class="lost-report-preview">
                                    <div class="preview-header">
                                        <i class="fas fa-link"></i>
                                        <span>Linked Lost Report</span>
                                    </div>
                                    <div class="preview-body" id="lostReportPreviewContent">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="step-actions">
                            <button type="button" class="btn-back" id="backToStep1Btn">
                                <i class="fas fa-arrow-left"></i> Back
                            </button>
                            <button type="button" class="btn-next" id="nextToDetailsBtn">
                                Continue <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>

                    <!-- STEP 3: Provide Details -->
                    <div id="step3" class="step-content">
                        <div class="card">
                            <div class="card-header">
                                <i class="fas fa-file-alt"></i>
                                <h3>Claim Details</h3>
                            </div>
                            <div class="card-body">
                                <form id="claimForm">
                                    <input type="hidden" id="item_id" name="item_id">
                                    <input type="hidden" id="lost_report_id_hidden" name="lost_report_id">
                                    
                                    <div class="form-group">
                                        <label for="ownership_proof">
                                            <i class="fas fa-receipt"></i> Proof of Ownership <span class="required">*</span>
                                        </label>
                                        <textarea id="ownership_proof" name="ownership_proof" rows="4" required placeholder="e.g., receipt number, serial number, purchase date, warranty information, or other proof"></textarea>
                                        <div class="form-hint">
                                            <i class="fas fa-info-circle"></i> Enter details that help prove the item is yours (e.g., receipt number, serial number, or purchase date).
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label for="identifying_details">
                                            <i class="fas fa-search"></i> Identifying Details <span class="required">*</span>
                                        </label>
                                        <textarea id="identifying_details" name="identifying_details" rows="4" required placeholder="e.g., Scratches on the back, sticker on the left corner, color, brand, contents inside, or unique features"></textarea>
                                        <div class="form-hint">
                                            <i class="fas fa-info-circle"></i> Describe any unique details that only the true owner would know.
                                        </div>
                                    </div>

                                    <!-- EVIDENCE PHOTO UPLOAD SECTION -->
                                    <div class="photo-upload-section">
                                        <label><i class="fas fa-camera"></i> Evidence Photo (Optional)</label>
                                        
                                        <div class="photo-preview" id="photoPreview">
                                            <div class="photo-placeholder">
                                                <i class="fas fa-image"></i>
                                                <p>No image selected</p>
                                            </div>
                                        </div>
                                        
                                        <div class="evidence-file-name" id="evidenceFileName"></div>
                                        
                                        <button type="button" class="btn-upload" id="uploadBtn">
                                            <i class="fas fa-upload"></i> Upload Evidence Photo
                                        </button>
                                        <input type="file" id="evidence_photo" name="evidence_photo" accept="image/jpeg, image/png, image/jpg, application/pdf" style="display: none;">
                                        
                                        <div class="form-hint">
                                            <i class="fas fa-info-circle"></i> Upload photo or document as evidence (JPG, PNG, PDF, max 5MB).
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div class="step-actions">
                            <button type="button" class="btn-back" id="backToStep2Btn">
                                <i class="fas fa-arrow-left"></i> Back
                            </button>
                            <button type="button" class="btn-next" id="reviewClaimBtn">
                                Review Claim <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>

                    <!-- STEP 4: Review & Submit -->
                    <div id="step4" class="step-content">
                        <div class="card">
                            <div class="card-header">
                                <i class="fas fa-check-circle"></i>
                                <h3>Review Your Claim</h3>
                            </div>
                            <div class="card-body">
                                <!-- Item Details -->
                                <div class="review-section">
                                    <div class="review-section-header">
                                        <div class="header-icon"><i class="fas fa-box"></i></div>
                                        <h4>Item Details</h4>
                                        <span class="section-badge">Item Information</span>
                                    </div>
                                    <div id="reviewItemDetails" class="review-content review-grid"></div>
                                </div>

                                <!-- Linked Lost Report -->
                                <div class="review-section">
                                    <div class="review-section-header">
                                        <div class="header-icon"><i class="fas fa-link"></i></div>
                                        <h4>Linked Lost Report</h4>
                                        <span class="section-badge optional">Optional</span>
                                    </div>
                                    <div id="reviewLostReport" class="review-content review-grid"></div>
                                </div>

                                <!-- Proof of Ownership -->
                                <div class="review-section">
                                    <div class="review-section-header">
                                        <div class="header-icon"><i class="fas fa-receipt"></i></div>
                                        <h4>Proof of Ownership</h4>
                                        <span class="section-badge required">Required</span>
                                    </div>
                                    <div id="reviewOwnershipProof" class="review-content review-text-content"></div>
                                </div>

                                <!-- Identifying Details -->
                                <div class="review-section">
                                    <div class="review-section-header">
                                        <div class="header-icon"><i class="fas fa-search"></i></div>
                                        <h4>Identifying Details</h4>
                                        <span class="section-badge required">Required</span>
                                    </div>
                                    <div id="reviewIdentifyingDetails" class="review-content review-text-content"></div>
                                </div>

                                <!-- Evidence Photo -->
                                <div class="review-section">
                                    <div class="review-section-header">
                                        <div class="header-icon"><i class="fas fa-camera"></i></div>
                                        <h4>Evidence Photo</h4>
                                        <span class="section-badge optional">Optional</span>
                                    </div>
                                    <div id="reviewEvidencePhoto" class="review-content evidence-photo-content"></div>
                                </div>
                            </div>
                        </div>
                        <div class="step-actions">
                            <button type="button" class="btn-back" id="backToStep3Btn">
                                <i class="fas fa-arrow-left"></i> Back
                            </button>
                            <button type="button" class="btn-submit" id="submitBtn">
                                <i class="fas fa-paper-plane"></i> Submit Claim
                            </button>
                        </div>
                    </div>
                </div>
            </article>

            <footer>
                <p>&copy; <?php echo $current_year; ?> Lost & Found System - Universiti Teknologi Malaysia</p>
            </footer>
        </div>
    </div>

    <!-- Toast Notification -->
    <div class="toast" id="toast">
        <i class="fas fa-check-circle" id="toastIcon"></i>
        <span id="toastMessage"></span>
    </div>

    <script>
        // Pass session data to JavaScript
        const userId = <?php echo $user_id; ?>;
        const userName = '<?php echo addslashes($user_name); ?>';
        const userAvatar = '<?php echo $user_avatar; ?>';
        
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('active');
        }

        function toggleUserDropdown() {
            const dropdown = document.getElementById('userDropdownMenu');
            dropdown.classList.toggle('show');
        }

        function logoutUser() {
            if (confirm('Are you sure you want to logout?')) {
                window.location.href = '../../../mainpage/logout/logout.php';
                return true;
            }
            return false;
        }

        document.addEventListener('click', function(event) {
            const dropdown = document.getElementById('userDropdownMenu');
            const avatar = document.getElementById('userAvatar');
            if (dropdown && avatar && dropdown.classList.contains('show')) {
                if (!avatar.contains(event.target) && !dropdown.contains(event.target)) {
                    dropdown.classList.remove('show');
                }
            }
        });
    </script>
    <script src="submit_claim.js"></script>
</body>
</html>