<?php
/**
 * Groupe Scolaire Frank Adamson de Kibogora (GS FAKIBOGORA)
 * Server-Side Authentication & Role Management
 * Implements password_hash, password_verify, session regeneration, rate limiting & audit logs
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

// Authentication verification
function is_authenticated(): bool {
    if (empty($_SESSION['admin_logged_in']) || empty($_SESSION['admin_user_id'])) {
        return false;
    }

    // Verify account is still active in database
    $pdo = get_db_connection();
    $stmt = $pdo->prepare("SELECT id, is_active, role_key FROM admins WHERE id = ? LIMIT 1");
    $stmt->execute([$_SESSION['admin_user_id']]);
    $admin = $stmt->fetch();

    if (!$admin || (int)$admin['is_active'] !== 1) {
        // Account deactivated or deleted -> terminate session immediately
        logout_admin();
        return false;
    }

    return true;
}

function get_current_admin(): ?array {
    if (!is_authenticated()) {
        return null;
    }
    $pdo = get_db_connection();
    $stmt = $pdo->prepare("SELECT id, email, full_name, role_key, is_active, last_login_at FROM admins WHERE id = ? LIMIT 1");
    $stmt->execute([$_SESSION['admin_user_id']]);
    return $stmt->fetch() ?: null;
}

function is_super_admin(): bool {
    $admin = get_current_admin();
    return $admin !== null && $admin['role_key'] === 'super_admin';
}

function record_audit_log(string $action, string $details): void {
    try {
        $pdo = get_db_connection();
        $admin = get_current_admin();
        $adminId = $admin ? (string)$admin['id'] : 'system';
        $adminEmail = $admin ? $admin['email'] : 'unauthenticated';
        $adminName = $admin ? $admin['full_name'] : 'Guest/Visitor';
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

        $stmt = $pdo->prepare("INSERT INTO audit_logs (admin_id, admin_email, admin_name, action, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$adminId, $adminEmail, $adminName, $action, $details, $ip]);
    } catch (Exception $e) {
        // silent fail on audit log to avoid crashing primary flow
    }
}

// Attempt login with rate limiting & secure verification
function login_admin(string $email, string $password): array {
    // Basic rate limit check
    if (!isset($_SESSION['login_attempts'])) {
        $_SESSION['login_attempts'] = 0;
        $_SESSION['last_attempt_time'] = time();
    }

    if ($_SESSION['login_attempts'] >= 5 && (time() - $_SESSION['last_attempt_time']) < 60) {
        $remaining = 60 - (time() - $_SESSION['last_attempt_time']);
        return ['success' => false, 'error' => "Too many failed attempts. Please wait {$remaining} seconds before trying again."];
    }

    $pdo = get_db_connection();
    $stmt = $pdo->prepare("SELECT * FROM admins WHERE email = ? LIMIT 1");
    $stmt->execute([trim(strtolower($email))]);
    $admin = $stmt->fetch();

    if (!$admin) {
        $_SESSION['login_attempts']++;
        $_SESSION['last_attempt_time'] = time();
        record_audit_log('LOGIN_FAILED', "Failed login attempt for non-existent email: " . htmlspecialchars($email));
        return ['success' => false, 'error' => 'Invalid email address or password.'];
    }

    if ((int)$admin['is_active'] !== 1) {
        record_audit_log('LOGIN_BLOCKED', "Deactivated account attempted login: " . htmlspecialchars($email));
        return ['success' => false, 'error' => 'This administrator account has been deactivated. Please contact the Head of School.'];
    }

    if (!password_verify($password, $admin['password_hash'])) {
        $_SESSION['login_attempts']++;
        $_SESSION['last_attempt_time'] = time();
        record_audit_log('LOGIN_FAILED', "Incorrect password attempted for: " . htmlspecialchars($email));
        return ['success' => false, 'error' => 'Invalid email address or password.'];
    }

    // Success: Regenerate session ID to prevent session fixation attacks
    session_regenerate_id(true);
    $_SESSION['admin_logged_in'] = true;
    $_SESSION['admin_user_id'] = $admin['id'];
    $_SESSION['admin_email'] = $admin['email'];
    $_SESSION['admin_name'] = $admin['full_name'];
    $_SESSION['admin_role'] = $admin['role_key'];
    $_SESSION['login_attempts'] = 0;

    // Update last login
    $upd = $pdo->prepare("UPDATE admins SET last_login_at = NOW() WHERE id = ?");
    $upd->execute([$admin['id']]);

    record_audit_log('LOGIN_SUCCESS', "Administrator logged in successfully: " . $admin['email']);

    return ['success' => true, 'admin' => $admin];
}

function logout_admin(): void {
    if (isset($_SESSION['admin_email'])) {
        record_audit_log('LOGOUT', "Administrator logged out: " . $_SESSION['admin_email']);
    }
    unset($_SESSION['admin_logged_in'], $_SESSION['admin_user_id'], $_SESSION['admin_email'], $_SESSION['admin_name'], $_SESSION['admin_role']);
    session_regenerate_id(true);
}
