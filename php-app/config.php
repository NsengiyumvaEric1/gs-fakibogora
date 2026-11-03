<?php
/**
 * Groupe Scolaire Frank Adamson de Kibogora (GS FAKIBOGORA / GSFAK)
 * Database & Application Configuration
 * Compatible with PHP 8.2+ and MySQL / MariaDB (XAMPP for Windows)
 */

declare(strict_types=1);

// Start secure session with hardened parameters
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_samesite', 'Lax');
    session_start();
}

// Database Credentials (Default XAMPP settings)
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'gsfakibogora');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_CHARSET', 'utf8mb4');

// Establish PDO connection
function get_db_connection(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            die("Database connection failed. Please ensure MySQL is running in XAMPP and 'gsfakibogora' database is imported. Details: " . htmlspecialchars($e->getMessage()));
        }
    }
    return $pdo;
}

// CSRF Token Management
function get_csrf_token(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verify_csrf_token(?string $token): bool {
    if (!$token || empty($_SESSION['csrf_token'])) {
        return false;
    }
    return hash_equals($_SESSION['csrf_token'], $token);
}

// XSS Sanitization helper
function e(?string $text): string {
    return htmlspecialchars($text ?? '', ENT_QUOTES, 'UTF-8');
}

// Current language selection (default: en)
function get_current_lang(): string {
    if (isset($_GET['lang']) && in_array($_GET['lang'], ['en', 'rw', 'fr'], true)) {
        $_SESSION['app_lang'] = $_GET['lang'];
    }
    return $_SESSION['app_lang'] ?? 'en';
}
