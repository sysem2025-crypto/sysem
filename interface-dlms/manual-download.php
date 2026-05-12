<?php
declare(strict_types=1);

$downloadUrl = 'https://sysem.it/download/InterfaceDLMS_Setup.exe';
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
if ($stats !== []) {
    $stats['manual_downloads'] = (int)($stats['manual_downloads'] ?? 0) + 1;
    $stats['automatic_downloads'] = (int)($stats['automatic_downloads'] ?? 0);
    $stats['last_update'] = gmdate('Y-m-d H:i') . ' UTC';
    saveStats($storePath, $stats);
}

header('Location: ' . $downloadUrl, true, 302);
exit;
