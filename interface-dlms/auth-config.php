<?php
declare(strict_types=1);

define('DOWNLOAD_DIR', __DIR__ . '/../downloads');

function verifyDownloadToken(string $token): ?array
{
    $decoded = base64_decode($token, true);
    if ($decoded === false) return null;

    $parts = explode('|', $decoded);
    if (count($parts) !== 3) return null;

    $email = $parts[0];
    $role = $parts[1];
    $date = $parts[2];

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) return null;
    if ($date !== gmdate('Y-m-d')) return null;

    $roleLevel = ['guest' => 0, 'base' => 1, 'pro' => 2, 'admin' => 3];
    $required = $roleLevel['base'] ?? 1;
    $current = $roleLevel[$role] ?? 0;

    if ($current < $required) return null;

    return ['email' => $email, 'role' => $role];
}

function requireAuth(): array
{
    $token = $_GET['token'] ?? '';
    if ($token === '') {
        http_response_code(403);
        echo json_encode(['error' => 'Token richiesto']);
        exit;
    }

    $user = verifyDownloadToken($token);
    if ($user === null) {
        http_response_code(403);
        echo json_encode(['error' => 'Token non valido o scaduto']);
        exit;
    }

    return $user;
}
