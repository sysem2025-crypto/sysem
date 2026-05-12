<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$storePath = __DIR__ . '/stats-store.json';

if (!file_exists($storePath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Store not found'], JSON_UNESCAPED_SLASHES);
    exit;
}

$raw = file_get_contents($storePath);
if ($raw === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Read error'], JSON_UNESCAPED_SLASHES);
    exit;
}

$data = json_decode($raw, true);
if (!is_array($data)) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid store format'], JSON_UNESCAPED_SLASHES);
    exit;
}

echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
