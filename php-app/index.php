<?php
/**
 * GS FAKIBOGORA - Official School Website & Integrated Admin System
 * Groupe Scolaire Frank Adamson de Kibogora, Rwanda (Est. 1969)
 * Single integrated application meeting all specification requirements.
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth.php';

$pdo = get_db_connection();
$lang = get_current_lang();
$currentAdmin = get_current_admin();

// Fetch School Information from DB
$schoolStmt = $pdo->query("SELECT * FROM school_info LIMIT 1");
$school = $schoolStmt->fetch() ?: [];

// Routing via ?page parameter (Default: home)
$page = $_GET['page'] ?? 'home';
$loginError = '';
$actionError = '';
$actionMessage = '';

if (!empty($_SESSION['action_success'])) {
    $actionMessage = $_SESSION['action_success'];
    unset($_SESSION['action_success']);
}
if (!empty($_SESSION['action_error'])) {
    $actionError = $_SESSION['action_error'];
    unset($_SESSION['action_error']);
}

// Handle Admin Login Submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'admin_login') {
    if (!verify_csrf_token($_POST['csrf_token'] ?? null)) {
        $loginError = 'Security validation failed (CSRF token mismatch). Please reload and try again.';
    } else {
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';
        $result = login_admin($email, $password);
        if ($result['success']) {
            header('Location: index.php?page=admin');
            exit;
        } else {
            $loginError = $result['error'];
        }
    }
}

// Handle Logout
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    logout_admin();
    header('Location: index.php?page=home');
    exit;
}

// Handle Gallery Photo Deletion (Strict Admin Authentication + CSRF + Safe File Removal)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete_gallery_photo') {
    if (!$currentAdmin) {
        http_response_code(403);
        $actionError = 'Unauthorized: Only authenticated school administrators are permitted to delete photos.';
    } elseif (!verify_csrf_token($_POST['csrf_token'] ?? null)) {
        $actionError = 'Security validation failed (CSRF token mismatch). Please reload and try again.';
    } else {
        $photoId = filter_var($_POST['photo_id'] ?? null, FILTER_VALIDATE_INT);
        if (!$photoId || $photoId <= 0) {
            $actionError = 'Invalid photo identification provided for deletion.';
        } else {
            $stmt = $pdo->prepare("SELECT * FROM gallery_items WHERE id = ? LIMIT 1");
            $stmt->execute([$photoId]);
            $photo = $stmt->fetch();

            if (!$photo) {
                $actionError = 'The requested gallery photo was not found or has already been removed.';
            } else {
                $imageUrl = $photo['image_url'] ?? '';
                $fileError = null;
                $fileRemoved = false;

                // Safe file-path handling: remove file only if it is managed in the server's uploads directory
                if (!empty($imageUrl)) {
                    $uploadBase = realpath(__DIR__ . '/uploads');
                    $parsedPath = parse_url($imageUrl, PHP_URL_PATH);
                    if ($parsedPath && $uploadBase) {
                        $relativePath = ltrim($parsedPath, '/');
                        if (str_starts_with($relativePath, 'php-app/')) {
                            $relativePath = substr($relativePath, 8);
                        }

                        if (str_starts_with($relativePath, 'uploads/')) {
                            $targetPath = __DIR__ . '/' . $relativePath;
                            $realTarget = realpath($targetPath);

                            // Strict path verification to prevent directory traversal
                            if ($realTarget && str_starts_with($realTarget, $uploadBase) && is_file($realTarget)) {
                                $protectedFiles = ['gsfak_logo.jpg', 'index.php', 'config.php', 'auth.php', 'admin_view.php', 'login_view.php', 'database.sql'];
                                if (in_array(basename($realTarget), $protectedFiles, true)) {
                                    $fileError = 'Security error: Cannot delete protected core system file.';
                                } else {
                                    if (!unlink($realTarget)) {
                                        $fileError = 'Failed to delete photo file from server storage. The photo record was kept intact.';
                                    } else {
                                        $fileRemoved = true;
                                    }
                                }
                            }
                        }
                    }
                }

                if ($fileError) {
                    $actionError = $fileError;
                } else {
                    try {
                        $delStmt = $pdo->prepare("DELETE FROM gallery_items WHERE id = ?");
                        $delStmt->execute([$photoId]);

                        record_audit_log(
                            'GALLERY_PHOTO_DELETED',
                            "Photo #{$photoId} ('" . ($photo['title_en'] ?? 'Untitled') . "') deleted by " . $currentAdmin['full_name'] . ($fileRemoved ? ' (associated file removed)' : '')
                        );

                        $_SESSION['action_success'] = 'Photo successfully deleted from the gallery and server storage.';
                        header('Location: index.php?page=admin&tab=gallery');
                        exit;
                    } catch (Exception $e) {
                        $actionError = 'Database deletion failed: ' . $e->getMessage() . '. The photo record was kept intact.';
                    }
                }
            }
        }
    }
}

// Handle Add Gallery Photo (Admin only)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_gallery_photo') {
    if (!$currentAdmin) {
        http_response_code(403);
        $actionError = 'Unauthorized: Administrator authentication required.';
    } elseif (!verify_csrf_token($_POST['csrf_token'] ?? null)) {
        $actionError = 'Security validation failed (CSRF token mismatch).';
    } else {
        $titleEn = trim($_POST['title_en'] ?? '');
        $category = trim($_POST['category'] ?? 'campus');
        $captionEn = trim($_POST['caption_en'] ?? '');
        $imageUrl = trim($_POST['image_url'] ?? '');

        // Check if photo file was uploaded
        if (!empty($_FILES['photo_file']['name']) && $_FILES['photo_file']['error'] === UPLOAD_ERR_OK) {
            $tmpFile = $_FILES['photo_file']['tmp_name'];
            $fileSize = $_FILES['photo_file']['size'];

            if ($fileSize > 10 * 1024 * 1024) {
                $actionError = 'Uploaded photo exceeds 10MB limit.';
            } else {
                $finfo = new finfo(FILEINFO_MIME_TYPE);
                $mime = $finfo->file($tmpFile);
                $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];

                if (!isset($allowed[$mime])) {
                    $actionError = 'Invalid image format. Allowed formats: JPG, PNG, WEBP.';
                } else {
                    $ext = $allowed[$mime];
                    $safeFilename = 'gallery_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
                    $uploadTargetDir = __DIR__ . '/uploads/gallery';
                    if (!is_dir($uploadTargetDir)) {
                        mkdir($uploadTargetDir, 0755, true);
                    }
                    $destPath = $uploadTargetDir . '/' . $safeFilename;
                    if (move_uploaded_file($tmpFile, $destPath)) {
                        $imageUrl = 'uploads/gallery/' . $safeFilename;
                    } else {
                        $actionError = 'Failed to move uploaded photo to server storage.';
                    }
                }
            }
        }

        if (empty($actionError)) {
            if (!$titleEn || !$imageUrl) {
                $actionError = 'Photo title and image (file upload or URL) are required.';
            } else {
                $insertStmt = $pdo->prepare("INSERT INTO gallery_items (title_en, title_rw, title_fr, caption_en, caption_rw, caption_fr, category, image_url, is_published, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0)");
                $insertStmt->execute([$titleEn, $titleEn, $titleEn, $captionEn, $captionEn, $captionEn, $category, $imageUrl]);
                record_audit_log('GALLERY_PHOTO_ADDED', "Added photo '{$titleEn}' to category {$category}");
                $_SESSION['action_success'] = 'Photo successfully added to the school gallery.';
                header('Location: index.php?page=admin&tab=gallery');
                exit;
            }
        }
    }
}

// =====================================================================
// STAFF MANAGEMENT HANDLERS (Add, Edit, Delete with Safe Image Handling)
// =====================================================================

function handle_staff_photo_upload(): array {
    if (empty($_FILES['staff_photo']['name']) || $_FILES['staff_photo']['error'] !== UPLOAD_ERR_OK) {
        return ['url' => null, 'error' => null];
    }

    $tmpFile = $_FILES['staff_photo']['tmp_name'];
    $fileSize = $_FILES['staff_photo']['size'];

    if ($fileSize > 10 * 1024 * 1024) {
        return ['url' => null, 'error' => 'Uploaded photograph exceeds 10MB limit.'];
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($tmpFile);
    $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];

    if (!isset($allowed[$mime])) {
        return ['url' => null, 'error' => 'Invalid photograph file format. Allowed formats: JPG, PNG, WEBP.'];
    }

    $ext = $allowed[$mime];
    $safeFilename = 'staff_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $targetDir = __DIR__ . '/uploads/staff';
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }

    $destPath = $targetDir . '/' . $safeFilename;
    if (move_uploaded_file($tmpFile, $destPath)) {
        return ['url' => 'uploads/staff/' . $safeFilename, 'error' => null];
    }

    return ['url' => null, 'error' => 'Failed to save photograph to server storage.'];
}

function safely_unlink_managed_staff_photo(?string $imageUrl): void {
    if (empty($imageUrl)) return;
    $uploadBase = realpath(__DIR__ . '/uploads/staff');
    $parsedPath = parse_url($imageUrl, PHP_URL_PATH);
    if (!$parsedPath || !$uploadBase) return;

    $relativePath = ltrim($parsedPath, '/');
    if (str_starts_with($relativePath, 'php-app/')) {
        $relativePath = substr($relativePath, 8);
    }
    if (str_starts_with($relativePath, 'uploads/staff/')) {
        $targetPath = __DIR__ . '/' . $relativePath;
        $realTarget = realpath($targetPath);
        if ($realTarget && str_starts_with($realTarget, $uploadBase) && is_file($realTarget)) {
            $protectedFiles = ['gsfak_logo.jpg', 'index.php', 'config.php', 'auth.php', 'admin_view.php'];
            if (!in_array(basename($realTarget), $protectedFiles, true)) {
                @unlink($realTarget);
            }
        }
    }
}

// Handle Add Staff Member
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_staff_member') {
    if (!$currentAdmin) {
        http_response_code(403);
        $actionError = 'Unauthorized: Administrator authentication required.';
    } elseif (!verify_csrf_token($_POST['csrf_token'] ?? null)) {
        $actionError = 'Security validation failed (CSRF token mismatch).';
    } else {
        $fullName = trim($_POST['full_name'] ?? '');
        $category = in_array($_POST['category'] ?? '', ['leader', 'teacher'], true) ? $_POST['category'] : 'teacher';
        $titleEn = trim($_POST['title_en'] ?? '');
        if (!$titleEn) {
            $titleEn = ($category === 'leader') ? 'School Leader' : 'Teacher';
        }
        $department = trim($_POST['department'] ?? ($category === 'leader' ? 'School Administration' : 'Teaching Faculty'));
        $qualification = trim($_POST['qualification'] ?? 'Degree in Education');
        $emailPlaceholder = trim($_POST['email_placeholder'] ?? 'staff@gsfakibogora.rw');
        $photoUrl = trim($_POST['photo_url'] ?? '');

        $uploadRes = handle_staff_photo_upload();
        if ($uploadRes['error']) {
            $actionError = $uploadRes['error'];
        } else {
            if ($uploadRes['url']) {
                $photoUrl = $uploadRes['url'];
            }
            if (!$photoUrl) {
                $photoUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';
            }

            if (!$fullName) {
                $actionError = 'Full name is required for adding a staff member.';
            } else {
                $stmt = $pdo->prepare("INSERT INTO staff_members (full_name, category, title_en, title_rw, title_fr, department, qualification, email_placeholder, photo_url, display_order, is_published, is_placeholder_notice) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, 0)");
                $titleRw = ($category === 'leader') ? $titleEn : 'Umwarimu';
                $titleFr = ($category === 'leader') ? $titleEn : 'Enseignant';
                $stmt->execute([$fullName, $category, $titleEn, $titleRw, $titleFr, $department, $qualification, $emailPlaceholder, $photoUrl]);

                record_audit_log('STAFF_MEMBER_ADDED', "Added staff member '{$fullName}' ({$category})");
                $_SESSION['action_success'] = "Staff member '{$fullName}' added successfully.";
                header('Location: index.php?page=admin&tab=staff');
                exit;
            }
        }
    }
}

// Handle Edit Staff Member
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'edit_staff_member') {
    if (!$currentAdmin) {
        http_response_code(403);
        $actionError = 'Unauthorized: Administrator authentication required.';
    } elseif (!verify_csrf_token($_POST['csrf_token'] ?? null)) {
        $actionError = 'Security validation failed (CSRF token mismatch).';
    } else {
        $staffId = filter_var($_POST['staff_id'] ?? null, FILTER_VALIDATE_INT);
        $fullName = trim($_POST['full_name'] ?? '');
        $category = in_array($_POST['category'] ?? '', ['leader', 'teacher'], true) ? $_POST['category'] : 'teacher';
        $titleEn = trim($_POST['title_en'] ?? '');
        $department = trim($_POST['department'] ?? '');
        $qualification = trim($_POST['qualification'] ?? '');
        $emailPlaceholder = trim($_POST['email_placeholder'] ?? '');
        $photoUrl = trim($_POST['photo_url'] ?? '');

        if (!$staffId || !$fullName) {
            $actionError = 'Valid staff ID and name are required.';
        } else {
            $stmt = $pdo->prepare("SELECT * FROM staff_members WHERE id = ? LIMIT 1");
            $stmt->execute([$staffId]);
            $existing = $stmt->fetch();

            if (!$existing) {
                $actionError = 'Staff member not found.';
            } else {
                $uploadRes = handle_staff_photo_upload();
                if ($uploadRes['error']) {
                    $actionError = $uploadRes['error'];
                } else {
                    if ($uploadRes['url']) {
                        safely_unlink_managed_staff_photo($existing['photo_url']);
                        $photoUrl = $uploadRes['url'];
                    } elseif (!$photoUrl) {
                        $photoUrl = $existing['photo_url'];
                    }

                    $upd = $pdo->prepare("UPDATE staff_members SET full_name = ?, category = ?, title_en = ?, department = ?, qualification = ?, email_placeholder = ?, photo_url = ? WHERE id = ?");
                    $upd->execute([
                        $fullName,
                        $category,
                        $titleEn ?: $existing['title_en'],
                        $department ?: $existing['department'],
                        $qualification ?: $existing['qualification'],
                        $emailPlaceholder ?: $existing['email_placeholder'],
                        $photoUrl,
                        $staffId
                    ]);

                    record_audit_log('STAFF_MEMBER_UPDATED', "Updated staff member '{$fullName}' (ID: {$staffId})");
                    $_SESSION['action_success'] = "Staff profile for '{$fullName}' updated successfully.";
                    header('Location: index.php?page=admin&tab=staff');
                    exit;
                }
            }
        }
    }
}

// Handle Delete Staff Member
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete_staff_member') {
    if (!$currentAdmin) {
        http_response_code(403);
        $actionError = 'Unauthorized: Administrator authentication required.';
    } elseif (!verify_csrf_token($_POST['csrf_token'] ?? null)) {
        $actionError = 'Security validation failed (CSRF token mismatch).';
    } else {
        $staffId = filter_var($_POST['staff_id'] ?? null, FILTER_VALIDATE_INT);
        if (!$staffId) {
            $actionError = 'Invalid staff ID.';
        } else {
            $stmt = $pdo->prepare("SELECT * FROM staff_members WHERE id = ? LIMIT 1");
            $stmt->execute([$staffId]);
            $staff = $stmt->fetch();

            if (!$staff) {
                $actionError = 'Staff member record not found.';
            } else {
                safely_unlink_managed_staff_photo($staff['photo_url']);
                $del = $pdo->prepare("DELETE FROM staff_members WHERE id = ?");
                $del->execute([$staffId]);

                record_audit_log('STAFF_MEMBER_DELETED', "Deleted staff member '{$staff['full_name']}' (ID: {$staffId})");
                $_SESSION['action_success'] = "Staff member '{$staff['full_name']}' removed successfully.";
                header('Location: index.php?page=admin&tab=staff');
                exit;
            }
        }
    }
}

// =====================================================================
// ADMINISTRATOR ACCOUNT MANAGEMENT HANDLERS (Add, Edit, Toggle, Delete, Password)
// =====================================================================

// Handle Add Administrator Account
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_admin') {
    if (!$currentAdmin || $currentAdmin['role_key'] !== 'super_admin') {
        http_response_code(403);
        $actionError = 'Unauthorized: Only Super Administrators can provision administrator accounts.';
    } elseif (!verify_csrf_token($_POST['csrf_token'] ?? null)) {
        $actionError = 'Security validation failed (CSRF token mismatch).';
    } else {
        $fullName = trim($_POST['full_name'] ?? '');
        $email = strtolower(trim($_POST['email'] ?? ''));
        $roleKey = in_array($_POST['role_key'] ?? '', ['super_admin', 'content_admin'], true) ? $_POST['role_key'] : 'content_admin';
        $password = $_POST['password'] ?? '';
        $notes = trim($_POST['notes'] ?? '');

        if (!$fullName || !$email || strlen($password) < 8) {
            $actionError = 'Full name, valid email, and password of at least 8 characters are required.';
        } else {
            $chk = $pdo->prepare("SELECT id FROM admins WHERE email = ? LIMIT 1");
            $chk->execute([$email]);
            if ($chk->fetch()) {
                $actionError = "An administrator account with email '{$email}' already exists.";
            } else {
                $hash = password_hash($password, PASSWORD_DEFAULT);
                $ins = $pdo->prepare("INSERT INTO admins (email, password_hash, full_name, role_key, is_active, created_by, notes) VALUES (?, ?, ?, ?, 1, ?, ?)");
                $ins->execute([$email, $hash, $fullName, $roleKey, $currentAdmin['full_name'], $notes]);

                record_audit_log('ADMIN_ACCOUNT_CREATED', "Created administrator '{$email}' with role '{$roleKey}'");
                $_SESSION['action_success'] = "Administrator account for '{$email}' created successfully.";
                header('Location: index.php?page=admin&tab=admins');
                exit;
            }
        }
    }
}

// Handle Edit Administrator Account
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'edit_admin') {
    if (!$currentAdmin) {
        http_response_code(403);
        $actionError = 'Unauthorized: Administrator authentication required.';
    } elseif (!verify_csrf_token($_POST['csrf_token'] ?? null)) {
        $actionError = 'Security validation failed (CSRF token mismatch).';
    } else {
        $targetId = filter_var($_POST['admin_id'] ?? null, FILTER_VALIDATE_INT);
        $fullName = trim($_POST['full_name'] ?? '');
        $email = strtolower(trim($_POST['email'] ?? ''));
        $roleKey = in_array($_POST['role_key'] ?? '', ['super_admin', 'content_admin'], true) ? $_POST['role_key'] : null;
        $notes = trim($_POST['notes'] ?? '');

        if (!$targetId || !$fullName || !$email) {
            $actionError = 'Target ID, full name, and valid email are required.';
        } elseif ($currentAdmin['role_key'] !== 'super_admin' && (int)$currentAdmin['id'] !== $targetId) {
            http_response_code(403);
            $actionError = 'Forbidden: You may only edit your own administrator profile.';
        } else {
            $chkEmail = $pdo->prepare("SELECT id FROM admins WHERE email = ? AND id != ? LIMIT 1");
            $chkEmail->execute([$email, $targetId]);
            if ($chkEmail->fetch()) {
                $actionError = "Email '{$email}' is already in use by another administrator.";
            } else {
                $stmt = $pdo->prepare("SELECT * FROM admins WHERE id = ? LIMIT 1");
                $stmt->execute([$targetId]);
                $targetAdmin = $stmt->fetch();

                if (!$targetAdmin) {
                    $actionError = 'Administrator account not found.';
                } else {
                    $finalRole = $targetAdmin['role_key'];
                    if ($currentAdmin['role_key'] === 'super_admin' && $roleKey) {
                        if ($targetAdmin['role_key'] === 'super_admin' && $roleKey !== 'super_admin') {
                            $superCount = (int)$pdo->query("SELECT COUNT(*) FROM admins WHERE role_key = 'super_admin'")->fetchColumn();
                            if ($superCount <= 1) {
                                $actionError = 'Security Violation: Cannot demote the last remaining Super Administrator.';
                            } else {
                                $finalRole = $roleKey;
                            }
                        } else {
                            $finalRole = $roleKey;
                        }
                    }

                    if (empty($actionError)) {
                        $upd = $pdo->prepare("UPDATE admins SET full_name = ?, email = ?, role_key = ?, notes = ? WHERE id = ?");
                        $upd->execute([$fullName, $email, $finalRole, $notes, $targetId]);

                        record_audit_log('ADMIN_ACCOUNT_UPDATED', "Updated administrator account '{$email}' (ID: {$targetId})");
                        $_SESSION['action_success'] = "Administrator account for '{$email}' updated successfully.";
                        header('Location: index.php?page=admin&tab=admins');
                        exit;
                    }
                }
            }
        }
    }
}

// Handle Toggle Admin Active Status
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'toggle_admin_status') {
    if (!$currentAdmin || $currentAdmin['role_key'] !== 'super_admin') {
        http_response_code(403);
        $actionError = 'Unauthorized: Only Super Administrators can alter administrator account status.';
    } elseif (!verify_csrf_token($_POST['csrf_token'] ?? null)) {
        $actionError = 'Security validation failed (CSRF token mismatch).';
    } else {
        $targetId = filter_var($_POST['admin_id'] ?? null, FILTER_VALIDATE_INT);
        if (!$targetId) {
            $actionError = 'Invalid administrator ID.';
        } elseif ((int)$currentAdmin['id'] === $targetId) {
            $actionError = 'Security Violation: You cannot deactivate your own active session.';
        } else {
            $stmt = $pdo->prepare("SELECT * FROM admins WHERE id = ? LIMIT 1");
            $stmt->execute([$targetId]);
            $targetAdmin = $stmt->fetch();

            if (!$targetAdmin) {
                $actionError = 'Administrator not found.';
            } else {
                $newStatus = $targetAdmin['is_active'] ? 0 : 1;
                if ($newStatus === 0) {
                    $activeCount = (int)$pdo->query("SELECT COUNT(*) FROM admins WHERE is_active = 1")->fetchColumn();
                    if ($activeCount <= 1) {
                        $actionError = 'Security Violation: Cannot deactivate the last remaining active administrator.';
                    }
                    if (empty($actionError) && $targetAdmin['role_key'] === 'super_admin') {
                        $activeSupers = (int)$pdo->query("SELECT COUNT(*) FROM admins WHERE is_active = 1 AND role_key = 'super_admin'")->fetchColumn();
                        if ($activeSupers <= 1) {
                            $actionError = 'Security Violation: Cannot deactivate the last active Super Administrator.';
                        }
                    }
                }

                if (empty($actionError)) {
                    $upd = $pdo->prepare("UPDATE admins SET is_active = ? WHERE id = ?");
                    $upd->execute([$newStatus, $targetId]);

                    if ($newStatus === 0) {
                        $pdo->prepare("DELETE FROM sessions WHERE admin_id = ?")->execute([$targetId]);
                    }

                    $statusWord = $newStatus ? 'activated' : 'deactivated';
                    record_audit_log('ADMIN_STATUS_CHANGED', "Administrator '{$targetAdmin['email']}' {$statusWord}");
                    $_SESSION['action_success'] = "Account '{$targetAdmin['email']}' has been {$statusWord}.";
                    header('Location: index.php?page=admin&tab=admins');
                    exit;
                }
            }
        }
    }
}

// Handle Delete Admin Account
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete_admin') {
    if (!$currentAdmin || $currentAdmin['role_key'] !== 'super_admin') {
        http_response_code(403);
        $actionError = 'Unauthorized: Only Super Administrators can delete administrator accounts.';
    } elseif (!verify_csrf_token($_POST['csrf_token'] ?? null)) {
        $actionError = 'Security validation failed (CSRF token mismatch).';
    } else {
        $targetId = filter_var($_POST['admin_id'] ?? null, FILTER_VALIDATE_INT);
        if (!$targetId) {
            $actionError = 'Invalid administrator ID.';
        } elseif ((int)$currentAdmin['id'] === $targetId) {
            $actionError = 'Security Violation: You cannot delete your own account while logged in.';
        } else {
            $stmt = $pdo->prepare("SELECT * FROM admins WHERE id = ? LIMIT 1");
            $stmt->execute([$targetId]);
            $targetAdmin = $stmt->fetch();

            if (!$targetAdmin) {
                $actionError = 'Administrator not found.';
            } else {
                if ($targetAdmin['is_active']) {
                    $activeCount = (int)$pdo->query("SELECT COUNT(*) FROM admins WHERE is_active = 1")->fetchColumn();
                    if ($activeCount <= 1) {
                        $actionError = 'Security Violation: Cannot delete the last active administrator.';
                    }
                }
                if (empty($actionError) && $targetAdmin['role_key'] === 'super_admin') {
                    $superCount = (int)$pdo->query("SELECT COUNT(*) FROM admins WHERE role_key = 'super_admin'")->fetchColumn();
                    if ($superCount <= 1) {
                        $actionError = 'Security Violation: Cannot delete the last remaining Super Administrator account.';
                    }
                }

                if (empty($actionError)) {
                    $pdo->prepare("DELETE FROM sessions WHERE admin_id = ?")->execute([$targetId]);
                    $pdo->prepare("DELETE FROM admins WHERE id = ?")->execute([$targetId]);

                    record_audit_log('ADMIN_ACCOUNT_DELETED', "Deleted administrator account '{$targetAdmin['email']}' (ID: {$targetId})");
                    $_SESSION['action_success'] = "Administrator account '{$targetAdmin['email']}' deleted successfully.";
                    header('Location: index.php?page=admin&tab=admins');
                    exit;
                }
            }
        }
    }
}

// Handle Change Own Password
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'change_my_password') {
    if (!$currentAdmin) {
        http_response_code(403);
        $actionError = 'Unauthorized: Administrator authentication required.';
    } elseif (!verify_csrf_token($_POST['csrf_token'] ?? null)) {
        $actionError = 'Security validation failed (CSRF token mismatch).';
    } else {
        $currentPassword = $_POST['current_password'] ?? '';
        $newPassword = $_POST['new_password'] ?? '';
        $confirmPassword = $_POST['confirm_password'] ?? '';

        if (!password_verify($currentPassword, $currentAdmin['password_hash'])) {
            $actionError = 'Current password entered is incorrect.';
        } elseif (strlen($newPassword) < 8) {
            $actionError = 'New password must be at least 8 characters long.';
        } elseif ($newPassword !== $confirmPassword) {
            $actionError = 'New password confirmation does not match.';
        } else {
            $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("UPDATE admins SET password_hash = ? WHERE id = ?");
            $stmt->execute([$newHash, $currentAdmin['id']]);

            record_audit_log('PASSWORD_CHANGED', "Administrator {$currentAdmin['email']} changed their password.");
            $_SESSION['action_success'] = 'Your password has been changed successfully.';
            header('Location: index.php?page=admin');
            exit;
        }
    }
}

// Handle Contact Form Submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'submit_contact') {
    if (verify_csrf_token($_POST['csrf_token'] ?? null)) {
        $name = trim($_POST['sender_name'] ?? '');
        $email = trim($_POST['sender_email'] ?? '');
        $phone = trim($_POST['sender_phone'] ?? '');
        $subject = trim($_POST['subject'] ?? '');
        $message = trim($_POST['message'] ?? '');

        if ($name && $email && $subject && $message) {
            $stmt = $pdo->prepare("INSERT INTO contact_messages (sender_name, sender_email, sender_phone, subject, message) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$name, $email, $phone, $subject, $message]);
            $actionMessage = ($lang === 'rw') ? 'Ubutumwa bwawe bwakiriwe neza! Ubuyobozi buzakuvugisha vuba.' :
                             (($lang === 'fr') ? 'Votre message a été envoyé avec succès!' : 'Your message has been sent successfully. The administration will contact you shortly.');
        }
    }
}

// Translation dictionaries for interface
$t = [
    'en' => [
        'home' => 'Home', 'about' => 'About Us', 'gallery' => 'Gallery', 'admin' => 'Admin', 'contact' => 'Contact Us',
        'motto_label' => 'Motto', 'est' => 'Established 1969 · Kibogora, Nyamasheke, Rwanda',
        'read_more' => 'Read Full Announcement', 'view_all' => 'View All', 'send_message' => 'Send Inquiry',
        'access_denied_title' => 'Access Denied: You are not authorized to access the administration area.',
        'access_denied_desc' => 'This gateway is restricted strictly to verified staff of GS FAKIBOGORA. Public visitors are not permitted into this portal.',
        'admin_signin_link' => 'Authorized Staff & Administrator Sign In',
        'login_title' => 'GS FAKIBOGORA Staff & Administrator Login',
        'email_label' => 'Administrator Email', 'pass_label' => 'Password', 'login_btn' => 'Authenticate & Enter Dashboard',
        'admin_dash_title' => 'GS FAKIBOGORA Administration Dashboard',
        'logged_as' => 'Logged in as', 'role' => 'Role', 'logout' => 'Log Out',
        'find_us_map' => 'Find Us on the Map',
        'get_directions' => 'Get Directions',
        'open_in_maps' => 'Open in Google Maps',
        'map_desc' => 'Groupe Scolaire Frank Adamson de Kibogora (GSFAK), located in Kibogora, Kanjongo Sector, Nyamasheke District, Western Province, Rwanda.',
    ],
    'rw' => [
        'home' => 'Ahabanza', 'about' => 'Ibyerekeye Ishuri', 'gallery' => 'Amafoto', 'admin' => 'Ubuyobozi', 'contact' => 'Twandikire',
        'motto_label' => 'Intego', 'est' => 'Ryashinzwe mu 1969 · Kibogora, Nyamasheke, Rwanda',
        'read_more' => 'Soma Itangazo Ryose', 'view_all' => 'Reba Byose', 'send_message' => 'Ohereza Ubutumwa',
        'access_denied_title' => 'Ntugifite Ububasha: Ntabwo wemerewe kwinjira mu cyiciro cy\'ubuyobozi.',
        'access_denied_desc' => 'Ubu buryo bwahariwe gusa abakozi n\'abayobozi b\'ishuri rya GS FAKIBOGORA bafite konti zemejwe.',
        'admin_signin_link' => 'Injira nka Perezida / Umuyobozi w\'Ishuri',
        'login_title' => 'Kwinjira kw\'Abayobozi ba GS FAKIBOGORA',
        'email_label' => 'Imeyili y\'Umuyobozi', 'pass_label' => 'Ijambo ry\'Ibanga', 'login_btn' => 'Injira mu Ikoranabuhanga',
        'admin_dash_title' => 'Ibiro By\'Ikoranabuhanga rya GS FAKIBOGORA',
        'logged_as' => 'Winjiye nka', 'role' => 'Inshingano', 'logout' => 'Sohoka',
        'find_us_map' => 'Dusange ku Ikarita',
        'get_directions' => 'Shaka Inzira (Get Directions)',
        'open_in_maps' => 'Fungura muri Google Maps',
        'map_desc' => 'Groupe Scolaire Frank Adamson de Kibogora (GSFAK) iherereye i Kibogora, mu Murenge wa Kanjongo, Akarere ka Nyamasheke, Intara y\'Iburengerazuba mu Rwanda.',
    ],
    'fr' => [
        'home' => 'Accueil', 'about' => 'À Propos', 'gallery' => 'Galerie', 'admin' => 'Administration', 'contact' => 'Contactez-nous',
        'motto_label' => 'Devise', 'est' => 'Fondé en 1969 · Kibogora, Nyamasheke, Rwanda',
        'read_more' => 'Lire la Suite', 'view_all' => 'Voir Tout', 'send_message' => 'Envoyer le Message',
        'access_denied_title' => 'Accès Refusé: Vous n\'êtes pas autorisé à accéder à l\'espace d\'administration.',
        'access_denied_desc' => 'Cet espace est strictement réservé au personnel administratif et pédagogique autorisé du GS FAKIBOGORA.',
        'admin_signin_link' => 'Connexion des Administrateurs Autorisés',
        'login_title' => 'Espace d\'Authentification Administrative GS FAKIBOGORA',
        'email_label' => 'Adresse Email', 'pass_label' => 'Mot de Passe', 'login_btn' => 'Se Connecter',
        'admin_dash_title' => 'Tableau de Bord Administratif du GS FAKIBOGORA',
        'logged_as' => 'Connecté en tant que', 'role' => 'Rôle', 'logout' => 'Déconnexion',
        'find_us_map' => 'Trouvez-nous sur la Carte',
        'get_directions' => 'Obtenir l\'Itinéraire (Get Directions)',
        'open_in_maps' => 'Ouvrir dans Google Maps',
        'map_desc' => 'Groupe Scolaire Frank Adamson de Kibogora (GSFAK), situé à Kibogora, Secteur Kanjongo, District de Nyamasheke, Province de l\'Ouest, Rwanda.',
    ]
];

$curT = $t[$lang] ?? $t['en'];
?>
<!DOCTYPE html>
<html lang="<?= e($lang) ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($school['school_name'] ?? 'GS FAKIBOGORA') ?> | Rwanda</title>
    <!-- Tailwind CSS (via official modern CDN for XAMPP portable preview) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        *, *::before, *::after, html, body, button, input, optgroup, select, textarea, h1, h2, h3, h4, h5, h6, p, span, a, li {
            font-family: Arial, Helvetica, sans-serif !important;
        }
    </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased" style="font-family: Arial, Helvetica, sans-serif;">

    <!-- Top Institutional Banner with Language Selector -->
    <div class="bg-slate-950 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div class="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
            <div class="flex items-center gap-3">
                <span class="text-amber-400 font-semibold uppercase tracking-wider">GSFAK</span>
                <span class="text-slate-500">·</span>
                <span><?= e($curT['est']) ?></span>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex items-center gap-1.5 text-slate-400">
                    <span class="text-[11px] uppercase tracking-wider text-slate-500">Language:</span>
                    <a href="?page=<?= e($page) ?>&lang=en" class="px-2 py-0.5 rounded <?= $lang === 'en' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:text-white' ?>">EN</a>
                    <a href="?page=<?= e($page) ?>&lang=rw" class="px-2 py-0.5 rounded <?= $lang === 'rw' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:text-white' ?>">RW</a>
                    <a href="?page=<?= e($page) ?>&lang=fr" class="px-2 py-0.5 rounded <?= $lang === 'fr' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:text-white' ?>">FR</a>
                </div>
                <?php if ($currentAdmin): ?>
                    <div class="flex items-center gap-2 pl-3 border-l border-slate-800 text-amber-300">
                        <span>● <?= e($currentAdmin['full_name']) ?> (<?= e($currentAdmin['role_key']) ?>)</span>
                        <a href="index.php?action=logout" class="text-slate-400 hover:text-rose-400 text-xs underline"><?= e($curT['logout']) ?></a>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <!-- Main School Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap justify-between items-center gap-4">
            <a href="index.php?page=home" class="flex items-center gap-3.5 group">
                <div class="w-12 h-12 rounded-xl bg-white border border-slate-200 p-0.5 flex items-center justify-center shadow-sm shrink-0 overflow-hidden group-hover:scale-105 transition">
                    <img src="gsfak_logo.jpg" alt="GS FAKIBOGORA Official Crest" class="w-full h-full object-contain">
                </div>
                <div>
                    <h1 class="text-lg sm:text-xl font-bold text-slate-950 tracking-tight leading-none group-hover:text-blue-900 transition">
                        <?= e($school['school_name'] ?? 'GS FAKIBOGORA') ?>
                    </h1>
                    <p class="text-xs text-slate-500 font-medium mt-1">
                        <?= e($school['motto_' . $lang] ?? $school['motto_en'] ?? '') ?>
                    </p>
                </div>
            </a>

            <!-- EXACT FIVE REQUIRED NAVIGATION ITEMS -->
            <nav class="flex items-center gap-1 sm:gap-2 text-sm font-semibold">
                <a href="index.php?page=home" class="px-3 py-2 rounded-lg transition <?= $page === 'home' ? 'text-blue-900 bg-blue-50 font-bold' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100' ?>">
                    <?= e($curT['home']) ?>
                </a>
                <a href="index.php?page=about" class="px-3 py-2 rounded-lg transition <?= $page === 'about' ? 'text-blue-900 bg-blue-50 font-bold' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100' ?>">
                    <?= e($curT['about']) ?>
                </a>
                <a href="index.php?page=gallery" class="px-3 py-2 rounded-lg transition <?= $page === 'gallery' ? 'text-blue-900 bg-blue-50 font-bold' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100' ?>">
                    <?= e($curT['gallery']) ?>
                </a>
                <a href="index.php?page=admin" class="px-3 py-2 rounded-lg transition <?= in_array($page, ['admin', 'admin_login', 'admin_denied']) ? 'text-blue-900 bg-blue-50 font-bold' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100' ?>">
                    <?= e($curT['admin']) ?>
                </a>
                <a href="index.php?page=contact" class="px-3 py-2 rounded-lg transition <?= $page === 'contact' ? 'text-blue-900 bg-blue-50 font-bold' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100' ?>">
                    <?= e($curT['contact']) ?>
                </a>
            </nav>
        </div>
    </header>

    <!-- Content Router Area -->
    <main class="flex-1">

        <?php if ($actionMessage): ?>
            <div class="max-w-4xl mx-auto mt-6 px-4">
                <div class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center justify-between">
                    <span>✓ <?= e($actionMessage) ?></span>
                </div>
            </div>
        <?php endif; ?>

        <?php if (!empty($actionError)): ?>
            <div class="max-w-4xl mx-auto mt-6 px-4">
                <div class="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm font-medium flex items-center justify-between">
                    <span>⚠️ <?= e($actionError) ?></span>
                </div>
            </div>
        <?php endif; ?>

        <?php
        // -------------------------------------------------------------
        // ADMIN ROUTE & EXACT ACCESS BEHAVIOR
        // -------------------------------------------------------------
        if ($page === 'admin'):
            if ($currentAdmin):
                // CASE 3: Authenticated Admin -> Direct access to dashboard
                include __DIR__ . '/admin_view.php';
            elseif (isset($_GET['flow']) && $_GET['flow'] === 'login'):
                // CASE 2: Staff login view
                include __DIR__ . '/login_view.php';
            else:
                // CASE 1: Unauthenticated public visitor clicks Admin -> Immediate access denied page
                ?>
                <section class="max-w-3xl mx-auto my-16 px-4">
                    <div class="bg-white border border-rose-200 rounded-2xl p-8 sm:p-12 shadow-sm text-center">
                        <div class="w-16 h-16 bg-rose-50 border border-rose-200 rounded-2xl mx-auto flex items-center justify-center text-rose-600 text-2xl font-bold mb-6">
                            ✕
                        </div>
                        <h2 class="text-2xl font-bold text-slate-900 tracking-tight mb-3">
                            <?= e($curT['access_denied_title']) ?>
                        </h2>
                        <p class="text-slate-600 max-w-xl mx-auto mb-8 text-sm leading-relaxed">
                            <?= e($curT['access_denied_desc']) ?>
                        </p>
                        <div class="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <a href="index.php?page=home" class="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition">
                                ← Return to Public Home
                            </a>
                            <a href="index.php?page=admin&flow=login" class="px-5 py-2.5 rounded-xl bg-blue-900 text-white text-sm font-semibold hover:bg-blue-800 transition shadow-sm">
                                <?= e($curT['admin_signin_link']) ?> →
                            </a>
                        </div>
                    </div>
                </section>
                <?php
            endif;

        // -------------------------------------------------------------
        // HOME PAGE
        // -------------------------------------------------------------
        elseif ($page === 'home'):
            // Fetch published announcements and latest news
            $annStmt = $pdo->query("SELECT * FROM news_announcements WHERE is_published = 1 ORDER BY is_important DESC, published_at DESC LIMIT 6");
            $announcements = $annStmt->fetchAll();

            $galStmt = $pdo->query("SELECT * FROM gallery_items WHERE is_published = 1 ORDER BY display_order ASC LIMIT 4");
            $galleryPreview = $galStmt->fetchAll();
            ?>
            <!-- Hero Section -->
            <section class="relative bg-slate-950 text-white py-20 lg:py-28 px-4 overflow-hidden">
                <div class="absolute inset-0 opacity-25 bg-cover bg-center" style="background-image: url('<?= e($school['hero_image_url'] ?? '') ?>');"></div>
                <div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent"></div>
                <div class="max-w-7xl mx-auto relative z-10">
                    <div class="max-w-2xl">
                        <div class="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-300 text-xs font-semibold mb-6">
                            <span>Established in 1969</span>
                            <span>·</span>
                            <span>Western Province, Rwanda</span>
                        </div>
                        <h2 class="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-6">
                            <?= e($school['school_name'] ?? 'GS FAKIBOGORA') ?>
                        </h2>
                        <p class="text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
                            <?= e($school['mission_' . $lang] ?? $school['mission_en'] ?? '') ?>
                        </p>
                        <div class="flex flex-wrap gap-4">
                            <a href="index.php?page=about" class="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition">
                                Discover Our Heritage & Curriculum
                            </a>
                            <a href="index.php?page=contact" class="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm transition">
                                Contact Administration
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Important Announcements & News Section -->
            <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div class="flex justify-between items-end mb-10">
                    <div>
                        <span class="text-xs uppercase font-bold tracking-wider text-blue-900">Official Notices</span>
                        <h3 class="text-2xl sm:text-3xl font-bold text-slate-950 mt-1">Announcements & School Life</h3>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <?php foreach ($announcements as $item): ?>
                        <article class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
                            <?php if (!empty($item['image_url'])): ?>
                                <img src="<?= e($item['image_url']) ?>" alt="Article cover" class="h-48 w-full object-cover">
                            <?php endif; ?>
                            <div class="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <div class="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                        <span class="capitalize font-medium text-blue-800"><?= e($item['type']) ?></span>
                                        <span>·</span>
                                        <span><?= date('M d, Y', strtotime($item['published_at'])) ?></span>
                                    </div>
                                    <h4 class="font-bold text-slate-950 text-base mb-2 line-clamp-2">
                                        <?= e($item['title_' . $lang] ?? $item['title_en']) ?>
                                    </h4>
                                    <p class="text-slate-600 text-sm line-clamp-3 leading-relaxed mb-4">
                                        <?= e($item['summary_' . $lang] ?? $item['summary_en']) ?>
                                    </p>
                                </div>
                                <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                    <span>By <?= e($item['author_name']) ?></span>
                                    <?php if ($item['is_important']): ?>
                                        <span class="text-amber-700 font-semibold">★ Urgent</span>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </article>
                    <?php endforeach; ?>
                </div>
            </section>

        <?php
        // -------------------------------------------------------------
        // ABOUT US PAGE
        // -------------------------------------------------------------
        elseif ($page === 'about'):
            $staffStmt = $pdo->query("SELECT * FROM staff_members WHERE is_published = 1 ORDER BY display_order ASC");
            $staffMembers = $staffStmt->fetchAll();
            ?>
            <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div class="max-w-3xl mb-12">
                    <span class="text-xs uppercase font-bold tracking-wider text-blue-900">About GSFAK</span>
                    <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-1 mb-4">
                        A Legacy of Excellence in Kibogora Since 1969
                    </h2>
                    <p class="text-slate-600 text-base leading-relaxed">
                        <?= e($school['about_' . $lang] ?? $school['about_en'] ?? '') ?>
                    </p>
                </div>

                <!-- Mission & Vision Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div class="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                        <div class="text-xs uppercase font-bold tracking-wider text-amber-700 mb-2">Our Mission</div>
                        <h3 class="text-xl font-bold text-slate-900 mb-3">Empowering Resilient Leaders</h3>
                        <p class="text-slate-600 text-sm leading-relaxed"><?= e($school['mission_' . $lang] ?? $school['mission_en'] ?? '') ?></p>
                    </div>
                    <div class="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                        <div class="text-xs uppercase font-bold tracking-wider text-blue-800 mb-2">Our Vision</div>
                        <h3 class="text-xl font-bold text-slate-900 mb-3">Pinnacle of Academic Distinction</h3>
                        <p class="text-slate-600 text-sm leading-relaxed"><?= e($school['vision_' . $lang] ?? $school['vision_en'] ?? '') ?></p>
                    </div>
                </div>

                <!-- Staff Leadership & Teaching Faculty Section -->
                <div class="mb-12">
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <span class="text-xs uppercase font-bold tracking-wider text-blue-900">Governance & Academic Faculty</span>
                            <h3 class="text-2xl font-bold text-slate-950 mt-1">School Leadership & Faculty</h3>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <?php foreach ($staffMembers as $member): ?>
                            <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                                <div>
                                    <img src="<?= e($member['photo_url']) ?>" alt="<?= e($member['full_name']) ?>" class="w-20 h-20 rounded-xl object-cover mb-4 border border-slate-200">
                                    <h4 class="font-bold text-slate-900 text-base"><?= e($member['full_name']) ?></h4>
                                    <?php if (($member['category'] ?? 'teacher') === 'leader'): ?>
                                        <!-- For school leaders: display name, photograph, and official role or position -->
                                        <p class="text-xs text-blue-900 font-bold mt-1 inline-block px-2 py-0.5 rounded bg-blue-50">
                                            <?= e($member['title_' . $lang] ?? $member['title_en']) ?>
                                        </p>
                                    <?php endif; ?>
                                    <!-- For teachers: display ONLY their name and photograph on public website -->
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </section>

        <?php
        // -------------------------------------------------------------
        // GALLERY PAGE
        // -------------------------------------------------------------
        elseif ($page === 'gallery'):
            $catFilter = $_GET['cat'] ?? 'all';
            if ($catFilter !== 'all') {
                $galQuery = $pdo->prepare("SELECT * FROM gallery_items WHERE is_published = 1 AND category = ? ORDER BY display_order ASC");
                $galQuery->execute([$catFilter]);
                $photos = $galQuery->fetchAll();
            } else {
                $galQuery = $pdo->query("SELECT * FROM gallery_items WHERE is_published = 1 ORDER BY display_order ASC");
                $photos = $galQuery->fetchAll();
            }
            ?>
            <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div class="mb-8">
                    <span class="text-xs uppercase font-bold tracking-wider text-blue-900">Campus Visuals</span>
                    <h2 class="text-3xl font-extrabold text-slate-950 mt-1">Photo Gallery & Campus Life</h2>
                </div>

                <!-- Category Filters -->
                <div class="flex flex-wrap gap-2 mb-8">
                    <a href="index.php?page=gallery&cat=all" class="px-4 py-2 rounded-xl text-xs font-semibold <?= $catFilter === 'all' ? 'bg-blue-900 text-white' : 'bg-white border border-slate-200 text-slate-700' ?>">All Images</a>
                    <a href="index.php?page=gallery&cat=campus" class="px-4 py-2 rounded-xl text-xs font-semibold <?= $catFilter === 'campus' ? 'bg-blue-900 text-white' : 'bg-white border border-slate-200 text-slate-700' ?>">Campus Grounds</a>
                    <a href="index.php?page=gallery&cat=labs" class="px-4 py-2 rounded-xl text-xs font-semibold <?= $catFilter === 'labs' ? 'bg-blue-900 text-white' : 'bg-white border border-slate-200 text-slate-700' ?>">Laboratories</a>
                    <a href="index.php?page=gallery&cat=academics" class="px-4 py-2 rounded-xl text-xs font-semibold <?= $catFilter === 'academics' ? 'bg-blue-900 text-white' : 'bg-white border border-slate-200 text-slate-700' ?>">Academics</a>
                    <a href="index.php?page=gallery&cat=sports" class="px-4 py-2 rounded-xl text-xs font-semibold <?= $catFilter === 'sports' ? 'bg-blue-900 text-white' : 'bg-white border border-slate-200 text-slate-700' ?>">Sports</a>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <?php foreach ($photos as $p): ?>
                        <div class="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                            <img src="<?= e($p['image_url']) ?>" alt="Gallery item" class="w-full h-60 object-cover group-hover:scale-105 transition duration-300">
                            <div class="p-5">
                                <span class="text-[11px] uppercase tracking-wider text-blue-800 font-bold"><?= e($p['category']) ?></span>
                                <h4 class="font-bold text-slate-900 text-base mt-1"><?= e($p['title_' . $lang] ?? $p['title_en']) ?></h4>
                                <p class="text-xs text-slate-600 mt-2 leading-relaxed"><?= e($p['caption_' . $lang] ?? $p['caption_en']) ?></p>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </section>

        <?php
        // -------------------------------------------------------------
        // CONTACT US PAGE
        // -------------------------------------------------------------
        elseif ($page === 'contact'):
            ?>
            <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div>
                        <span class="text-xs uppercase font-bold tracking-wider text-blue-900">Get in Touch</span>
                        <h2 class="text-3xl font-extrabold text-slate-950 mt-1 mb-6">Contact GS FAKIBOGORA</h2>
                        <div class="space-y-6 text-sm text-slate-700">
                            <div class="p-5 bg-white border border-slate-200 rounded-2xl">
                                <h4 class="font-bold text-slate-900 mb-1">Physical Location</h4>
                                <p><?= e($school['location_village'] ?? 'Kibogora') ?>, Kanjongo Sector, Nyamasheke District, Western Province, Rwanda</p>
                                <p class="text-xs text-slate-500 mt-1"><?= e($school['landmark'] ?? '') ?></p>
                            </div>
                            <div class="p-5 bg-white border border-slate-200 rounded-2xl">
                                <h4 class="font-bold text-slate-900 mb-1">Telephone & Email</h4>
                                <p>Phone (Primary): <?= e($school['phone_primary'] ?? '') ?></p>
                                <p>Email: <?= e($school['email_official'] ?? '') ?></p>
                            </div>
                            <div class="p-5 bg-white border border-slate-200 rounded-2xl">
                                <h4 class="font-bold text-slate-900 mb-1">Office Hours</h4>
                                <p><?= e($school['office_hours'] ?? 'Monday - Friday: 07:30 - 17:00') ?></p>
                            </div>
                        </div>
                    </div>

                    <!-- Contact Form -->
                    <div class="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                        <h3 class="text-xl font-bold text-slate-900 mb-6">Send an Inquiry or Message</h3>
                        <form method="POST" action="index.php?page=contact">
                            <input type="hidden" name="action" value="submit_contact">
                            <input type="hidden" name="csrf_token" value="<?= e(get_csrf_token()) ?>">
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                                    <input type="text" name="sender_name" required class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-900 focus:outline-none">
                                </div>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                                        <input type="email" name="sender_email" required class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-900 focus:outline-none">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                                        <input type="text" name="sender_phone" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-900 focus:outline-none">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                                    <input type="text" name="subject" required class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-900 focus:outline-none">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                                    <textarea name="message" rows="4" required class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-900 focus:outline-none"></textarea>
                                </div>
                                <button type="submit" class="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-sm transition shadow-sm">
                                    <?= e($curT['send_message']) ?>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- ========================================================= -->
                <!-- FIND US ON THE MAP SECTION                                -->
                <!-- Interactive Google Map with Get Directions button         -->
                <!-- ========================================================= -->
                <div class="mt-16 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
                    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-100">
                        <div class="space-y-1.5 max-w-2xl">
                            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider">
                                <span>📍 Campus Geolocation & Navigation</span>
                            </div>
                            <h3 class="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                                <?= e($curT['find_us_map']) ?>
                            </h3>
                            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                                <?= e($curT['map_desc']) ?>
                            </p>
                        </div>

                        <!-- Quick Navigation Action Buttons -->
                        <div class="flex flex-wrap items-center gap-3 shrink-0">
                            <?php
                            $directionsUrl = !empty($school['directions_url'])
                                ? $school['directions_url']
                                : 'https://www.google.com/maps/dir/?api=1&destination=' . urlencode('Groupe Scolaire Frank Adamson de Kibogora, Kibogora, Kanjongo, Nyamasheke, Western Province, Rwanda');
                            $mapsSearchUrl = 'https://www.google.com/maps/search/?api=1&query=' . urlencode('Groupe Scolaire Frank Adamson de Kibogora, Kibogora, Kanjongo, Nyamasheke, Western Province, Rwanda');
                            $embedUrl = !empty($school['map_embed_url'])
                                ? $school['map_embed_url']
                                : 'https://maps.google.com/maps?q=' . urlencode('Groupe Scolaire Frank Adamson de Kibogora, Kibogora, Kanjongo, Nyamasheke, Western Province, Rwanda') . '&t=&z=15&ie=UTF8&iwloc=&output=embed';
                            ?>
                            <a href="<?= e($directionsUrl) ?>" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-sm transition">
                                <span>🧭 <?= e($curT['get_directions']) ?></span>
                            </a>
                            <a href="<?= e($mapsSearchUrl) ?>" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition">
                                <span><?= e($curT['open_in_maps']) ?> ↗</span>
                            </a>
                        </div>
                    </div>

                    <!-- Campus Geographical Coordinates & Landmarks -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Administrative Location</span>
                            <span class="font-bold text-slate-900 block mt-1">Kibogora, Kanjongo Sector</span>
                            <span class="text-slate-500 text-[11px]">Nyamasheke District, Western Province, Rwanda</span>
                        </div>
                        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Campus Surroundings</span>
                            <span class="font-bold text-slate-900 block mt-1"><?= e($school['landmark'] ?? 'Near Kibogora Hospital & Lake Kivu') ?></span>
                            <span class="text-slate-500 text-[11px]">Scenic hills overlooking Lake Kivu</span>
                        </div>
                        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 sm:col-span-2 lg:col-span-1">
                            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Visiting & Inquiries Hours</span>
                            <span class="font-bold text-slate-900 block mt-1"><?= e($school['office_hours'] ?? 'Monday – Friday: 07:30 – 17:00') ?></span>
                            <span class="text-slate-500 text-[11px]">Admission office & campus tours open</span>
                        </div>
                    </div>

                    <!-- Responsive Embedded Google Map Frame -->
                    <div class="w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
                        <iframe
                            title="Groupe Scolaire Frank Adamson de Kibogora (GSFAK) Campus Map"
                            src="<?= e($embedUrl) ?>"
                            class="w-full h-72 sm:h-96 md:h-[440px] lg:h-[480px] border-0 block"
                            loading="lazy"
                            allowfullscreen
                            referrerpolicy="no-referrer-when-downgrade">
                        </iframe>
                    </div>

                    <!-- Travel & Transport Guidance -->
                    <div class="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                            <span><strong>Travel Advice:</strong> Accessible from the Karongi-Rusizi highway (RN10 / Kivu Belt road). Turn at Kibogora junction.</span>
                        </div>
                        <a href="<?= e($directionsUrl) ?>" target="_blank" rel="noopener noreferrer" class="font-bold text-blue-900 hover:underline shrink-0">
                            <?= e($curT['get_directions']) ?> →
                        </a>
                    </div>
                </div>
            </section>
        <?php endif; ?>

    </main>

    <!-- Professional School Footer -->
    <footer class="bg-slate-950 text-slate-400 text-xs py-12 px-4 border-t border-slate-800">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
                <p class="font-bold text-white text-sm"><?= e($school['school_name'] ?? 'GS FAKIBOGORA') ?> (Est. 1969)</p>
                <p class="mt-1 text-slate-400">Kibogora, Kanjongo Sector, Nyamasheke District, Western Province, Rwanda</p>
            </div>
            <div class="flex items-center gap-6">
                <a href="index.php?page=home" class="hover:text-white"><?= e($curT['home']) ?></a>
                <a href="index.php?page=about" class="hover:text-white"><?= e($curT['about']) ?></a>
                <a href="index.php?page=gallery" class="hover:text-white"><?= e($curT['gallery']) ?></a>
                <a href="index.php?page=admin" class="hover:text-white"><?= e($curT['admin']) ?></a>
                <a href="index.php?page=contact" class="hover:text-white"><?= e($curT['contact']) ?></a>
            </div>
            <div class="text-slate-500">
                &copy; <?= date('Y') ?> GS FAKIBOGORA. All rights reserved.
            </div>
        </div>
    </footer>

</body>
</html>
