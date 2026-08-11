<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$downloadDir = __DIR__ . '/../download';
$statsPath = __DIR__ . '/stats-store.json';

$programs = [
    [
        'id' => 'genius-monitor',
        'dir' => $downloadDir,
        'statsKey' => 'manual_downloads',
    ],
    [
        'id' => 'rtu-terminal',
        'dir' => $downloadDir . '/rtu-terminal',
        'statsKey' => 'rtu_downloads',
    ],
];

$stats = [];
if (file_exists($statsPath)) {
    $raw = file_get_contents($statsPath);
    if ($raw !== false) {
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            $stats = $decoded;
        }
    }
}

$result = [];

foreach ($programs as $program) {
    $info = [
        'id' => $program['id'],
        'downloads' => (int)($stats[$program['statsKey']] ?? $stats['manual_downloads'] ?? 0),
        'file_size' => null,
        'last_update' => null,
    ];

    $dir = $program['dir'];
    if (is_dir($dir)) {
        $files = glob($dir . DIRECTORY_SEPARATOR . '*.exe');
        if ($files !== false && $files !== []) {
            usort($files, static function (string $a, string $b): int {
                return filemtime($b) <=> filemtime($a);
            });
            $latest = $files[0];
            $info['file_size'] = filesize($latest);
            $info['last_update'] = gmdate('Y-m-d', filemtime($latest));
        }
    }

    $result[] = $info;
}

echo json_encode($result, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
