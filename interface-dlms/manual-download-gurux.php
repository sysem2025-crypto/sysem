<?php
declare(strict_types=1);

require_once __DIR__ . '/auth-config.php';
require_once __DIR__ . '/download-logger.php';

$user = requireAuth();

$guruxDir = DOWNLOAD_DIR . '/gurux';
$manifestPath = $guruxDir . '/version.json';

if (!is_file($manifestPath)) {
    http_response_code(404);
    echo 'Manifesto non trovato.';
    exit;
}

$raw = file_get_contents($manifestPath);
if ($raw === false) {
    http_response_code(500);
    echo 'Errore lettura manifesto.';
    exit;
}

$manifest = json_decode($raw, true);
if (!is_array($manifest) || empty($manifest['file'])) {
    http_response_code(500);
    echo 'Manifesto non valido.';
    exit;
}

$fileName = basename((string)$manifest['file']);
$exeFile = $guruxDir . '/' . $fileName;

if (!is_file($exeFile)) {
    http_response_code(404);
    echo 'File EXE non trovato nella cartella download/gurux.';
    exit;
}

logDownload('gurux', $user['email']);

header('Content-Description: SYSEM Software Download');
header('Content-Type: application/x-msdownload');
header('X-Content-Type-Options: nosniff');
header('Content-Disposition: attachment; filename="' . $fileName . '"');
header('Content-Length: ' . (string)filesize($exeFile));
header('Cache-Control: no-cache, must-revalidate');
header('Pragma: public');
readfile($exeFile);
exit;
