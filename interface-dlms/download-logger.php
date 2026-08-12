<?php
declare(strict_types=1);

function getDownloadLogPath(): string
{
    return __DIR__ . '/download-logs.json';
}

function logDownload(string $program, string $userEmail): void
{
    $path = getDownloadLogPath();
    $logs = [];

    if (file_exists($path)) {
        $raw = file_get_contents($path);
        if ($raw !== false) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                $logs = $decoded;
            }
        }
    }

    $logs[] = [
        'program' => $program,
        'email' => $userEmail,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
        'timestamp' => gmdate('Y-m-d\TH:i:s\Z'),
    ];

    if (count($logs) > 500) {
        $logs = array_slice($logs, -500);
    }

    $json = json_encode($logs, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    file_put_contents($path, $json . PHP_EOL, LOCK_EX);
}

function getDownloadLogs(): array
{
    $path = getDownloadLogPath();
    if (!file_exists($path)) return [];

    $raw = file_get_contents($path);
    if ($raw === false) return [];

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function getDownloadStats(): array
{
    $logs = getDownloadLogs();
    $stats = [
        'total' => count($logs),
        'by_program' => [],
        'by_user' => [],
        'recent' => array_slice(array_reverse($logs), 0, 50),
    ];

    foreach ($logs as $entry) {
        $prog = $entry['program'] ?? 'unknown';
        $email = $entry['email'] ?? 'unknown';

        $stats['by_program'][$prog] = ($stats['by_program'][$prog] ?? 0) + 1;
        $stats['by_user'][$email] = ($stats['by_user'][$email] ?? 0) + 1;
    }

    arsort($stats['by_program']);
    arsort($stats['by_user']);

    return $stats;
}
