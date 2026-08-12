<?php
declare(strict_types=1);

require_once __DIR__ . '/auth-config.php';
require_once __DIR__ . '/download-logger.php';

// Auth check
$token = $_GET['token'] ?? '';
$user = null;
if ($token !== '') {
    $user = verifyDownloadToken($token);
}
if ($user === null) {
    http_response_code(401);
    echo json_encode(['error' => 'Non autorizzato']);
    exit;
}
if (($user['role'] ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Accesso negato. Ruolo admin richiesto.']);
    exit;
}

// Route by action
$action = $_GET['action'] ?? 'stats';

header('Content-Type: application/json; charset=utf-8');

switch ($action) {
    case 'stats':
        $stats = getDownloadStats();
        echo json_encode($stats, JSON_UNESCAPED_SLASHES);
        break;

    case 'logs':
        $limit = min((int)($_GET['limit'] ?? 100), 500);
        $offset = max((int)($_GET['offset'] ?? 0), 0);
        $program = $_GET['program'] ?? '';
        $email = $_GET['email'] ?? '';

        $logs = getDownloadLogs();
        $logs = array_reverse($logs);

        if ($program !== '') {
            $logs = array_filter($logs, fn($e) => ($e['program'] ?? '') === $program);
        }
        if ($email !== '') {
            $logs = array_filter($logs, fn($e) => stripos($e['email'] ?? '', $email) !== false);
        }

        $total = count($logs);
        $logs = array_slice($logs, $offset, $limit);

        echo json_encode([
            'total' => $total,
            'offset' => $offset,
            'limit' => $limit,
            'logs' => array_values($logs),
        ], JSON_UNESCAPED_SLASHES);
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Azione non valida']);
        break;
}
