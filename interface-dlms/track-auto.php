<?php
declare(strict_types=1);

require_once __DIR__ . '/auth-config.php';
requireAuth();

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$storePath = __DIR__ . '/stats-store.json';

function loadStats(string $path): array
{
    if (!file_exists($path)) {
        return [
            'manual_downloads' => 0,
            'automatic_downloads' => 0,
            'last_update' => gmdate('Y-m-d H:i') . ' UTC',
        ];
    }

    $raw = file_get_contents($path);
    if ($raw === false) {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function saveStats(string $path, array $stats): bool
{
    $json = json_encode($stats, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($json === false) {
        return false;
    }

    return file_put_contents($path, $json . PHP_EOL, LOCK_EX) !== false;
}

$stats = loadStats($storePath);
if ($stats === []) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Store read error'], JSON_UNESCAPED_SLASHES);
    exit;
}

$stats['manual_downloads'] = (int)($stats['manual_downloads'] ?? 0);
$stats['automatic_downloads'] = (int)($stats['automatic_downloads'] ?? 0) + 1;
$stats['last_update'] = gmdate('Y-m-d H:i') . ' UTC';

if (!saveStats($storePath, $stats)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Store write error'], JSON_UNESCAPED_SLASHES);
    exit;
}

echo json_encode(['ok' => true, 'automatic_downloads' => $stats['automatic_downloads']], JSON_UNESCAPED_SLASHES);
