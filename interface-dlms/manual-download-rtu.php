<?php
declare(strict_types=1);

$releasePath = 'H:\\Life_OS\\01_Lavoro\\03_ProgettiInterni\\08_RTU_Terminal\\Software\\Release';
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

function findLatestExe(string $directory): ?string
{
    if (!is_dir($directory)) {
        return null;
    }

    $matches = glob($directory . DIRECTORY_SEPARATOR . '*.exe');
    if ($matches === false || $matches === []) {
        return null;
    }

    usort($matches, static function (string $a, string $b): int {
        return filemtime($b) <=> filemtime($a);
    });

    return $matches[0] ?? null;
}

$exeFile = findLatestExe($releasePath);
if ($exeFile === null || !is_file($exeFile)) {
    http_response_code(404);
    echo 'File EXE non trovato nella cartella Release.';
    exit;
}

$stats = loadStats($storePath);
if ($stats !== []) {
    $stats['manual_downloads'] = (int)($stats['manual_downloads'] ?? 0) + 1;
    $stats['automatic_downloads'] = (int)($stats['automatic_downloads'] ?? 0);
    $stats['last_update'] = gmdate('Y-m-d H:i') . ' UTC';
    saveStats($storePath, $stats);
}

$filename = basename($exeFile);
header('Content-Description: File Transfer');
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Content-Length: ' . (string)filesize($exeFile));
header('Cache-Control: no-cache, must-revalidate');
header('Pragma: public');
readfile($exeFile);
exit;
