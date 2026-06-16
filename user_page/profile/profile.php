<?php
require_once '../../config/db_connect.php';
require_once '../../includes/auth_check.php';
$required_role = 'admin';
require_once '../../includes/role_check.php';

$current_year = date('Y');
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Profile — Lost & Found System</title>

    <!-- Bootstrap 5 -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css">
    <!-- Font Awesome 6 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Base CSS -->
    <link rel="stylesheet" href="profile.css">
</head>
<body data-role="staff">
    <div class="container my-5">
        <div class="row">
            <!-- Header with return button and logout -->
            <div class="col-12 mb-4">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-3">
                        <button onclick="goBack()" class="btn btn-return" title="Return to previous page">
                            <i class="fas fa-arrow-left"></i> Return
                        </button>
                        <h1 class="mb-0"><i class="fas fa-user-circle me-2"></i>My Profile</h1>
                    </div>
                    <a href="../../mainpage/logout/logout.php" class="btn btn-logout" onclick="return confirm('Are you sure you want to logout?');">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                </div>
                <hr>
            </div>

            <!-- Left Column - Profile Card -->
            <div class="col-md-4 mb-4">
                <div class="card profile-sidebar-card">
                    <div class="card-body text-center">
                        <div class="avatar-container mb-3">
                            <i class="fas fa-user-circle fa-5x"></i>
                        </div>
                        
                        <h3 id="userFullName" class="mt-2">Loading…</h3>
                        <p class="text-muted mb-1">@<span id="username">Loading...</span></p>
                        <p class="mb-0">
                            <span id="userRoleBadge"></span>
                            <span id="userStatus" class="badge bg-success ms-2">Active</span>
                        </p>
                        
                        <hr>
                        
                        <div id="statsContainer" class="stats-box mt-3"></div>
                        
                        <hr>
                        
                        <p class="small text-muted mb-0">
                            <i class="fas fa-calendar-alt me-1"></i>
                            Member since: <span id="memberSince">Loading...</span>
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Right Column - Edit Form -->
            <div class="col-md-8">
                <div class="card profile-form-card">
                    <div class="card-header profile-form-header">
                        <h4 class="mb-0">
                            <i class="fas fa-user-edit me-2"></i>Edit Profile
                        </h4>
                    </div>
                    <div class="card-body profile-form-body">
                        
                        <!-- Loading spinner -->
                        <div id="loadingSpinner" class="text-center py-5">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading…</span>
                            </div>
                            <p class="mt-2 text-muted">Loading profile data…</p>
                        </div>
                        
                        <!-- Alert container -->
                        <div id="alertContainer"></div>
                        
                        <!-- Profile form -->
                        <form id="profileForm" class="d-none" novalidate>
                            <input type="hidden" name="user_id" id="userId">
                            
                            <!-- Username -->
                            <div class="mb-3">
                                <label class="form-label fw-bold">Username</label>
                                <input type="text" class="form-control" id="usernameDisplay" disabled>
                                <small class="text-muted">Username cannot be changed</small>
                            </div>
                            
                            <!-- Full Name -->
                            <div class="mb-3">
                                <label class="form-label fw-bold" for="name">
                                    Full Name <span class="text-danger">*</span>
                                </label>
                                <input type="text" class="form-control" name="name" id="name"
                                       placeholder="Enter your full name" autocomplete="name">
                                <small class="text-danger error-message" id="nameError"></small>
                            </div>
                            
                            <!-- Email -->
                            <div class="mb-3">
                                <label class="form-label fw-bold" for="email">
                                    Email <span class="text-danger">*</span>
                                </label>
                                <input type="email" class="form-control" name="email" id="email"
                                       placeholder="you@example.com" autocomplete="email">
                                <small class="text-danger error-message" id="emailError"></small>
                            </div>
                            
                            <!-- Phone -->
                            <div class="mb-3">
                                <label class="form-label fw-bold" for="phone">Phone</label>
                                <input type="tel" class="form-control" name="phone" id="phone"
                                       placeholder="e.g. 0123456789" autocomplete="tel">
                                <small class="text-muted d-block">10–11 digits, no spaces</small>
                                <small class="text-danger error-message" id="phoneError"></small>
                            </div>
                            
                            <!-- Change password toggle -->
                            <div class="mb-2">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="changePasswordCheck">
                                    <label class="form-check-label fw-semibold" for="changePasswordCheck">
                                        <i class="fas fa-key me-1"></i> Change Password
                                    </label>
                                </div>
                            </div>
                            
                            <!-- Password fields -->
                            <div id="passwordSection" class="d-none">
                                <div class="mb-3">
                                    <label class="form-label fw-bold" for="currentPassword">
                                        Current Password <span class="text-danger">*</span>
                                    </label>
                                    <input type="password" class="form-control" id="currentPassword"
                                           placeholder="Enter current password" autocomplete="current-password">
                                    <small class="text-danger error-message" id="currentPasswordError"></small>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label fw-bold" for="newPassword">New Password</label>
                                    <input type="password" class="form-control" name="new_password" id="newPassword"
                                           placeholder="Minimum 8 characters" autocomplete="new-password">
                                    <small class="text-muted d-block">Minimum 8 characters</small>
                                    <small class="text-danger error-message" id="newPasswordError"></small>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label fw-bold" for="confirmPassword">Confirm Password</label>
                                    <input type="password" class="form-control" id="confirmPassword"
                                           placeholder="Repeat new password" autocomplete="new-password">
                                    <small class="text-danger error-message" id="confirmPasswordError"></small>
                                </div>
                            </div>
                            
                            <!-- Action buttons -->
                            <div class="mt-4">
                                <button type="submit" class="btn btn-save" id="submitBtn">
                                    <i class="fas fa-save me-1"></i> Save Changes
                                </button>
                                <button type="button" class="btn btn-reset" id="cancelBtn">
                                    <i class="fas fa-undo me-1"></i> Reset
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
    <script src="profile.js"></script>

</body>
</html>