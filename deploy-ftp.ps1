param(
  [Parameter(Mandatory=$true)][string]$Server,
  [Parameter(Mandatory=$true)][string]$Username,
  [Parameter(Mandatory=$true)][string]$Password
)

$files = @(
  "about.html",
  "access.html",
  "admin.html",
  "ai.html",
  "cedam3.html",
  "contact.html",
  "datacenter.html",
  "download-applicativi.html",
  "embedded.html",
  "formule-compressione.html",
  "guida-applicazione-norme.html",
  "gurux.html",
  "index.html",
  "industries.html",
  "normative.html",
  "progetti.html",
  "progetti-industriali.html",
  "program-access.html",
  "protocolli.html",
  "protocollo-ctr.html",
  "protocollo-dlms.html",
  "protocollo-pot.html",
  "resource.html",
  "sensori-caratterizzazione.html",
  "services.html",
  "sistema-misura.html",
  "sistemi.html",
  "telecontrollo.html",
  "ticketing.html",
  "utility.html",
  "volume-corrector.html",
  "embedded\architettura-modulare.html",
  "embedded\controllo-triac.html",
  "embedded\debug-produzione.html",
  "embedded\gestione-eeprom.html",
  "embedded\gestione-interrupt.html",
  "embedded\lettura-ntc.html",
  "embedded\lettura-tachimetrica.html",
  "embedded\macchina-a-stati.html",
  "embedded\protocollo-tlc.html",
  "embedded\sistema-operativo-cooperativo.html",
  "assets\js\main.js",
  "assets\js\auth-supabase.js",
  "assets\css\style.css",
  "assets\lang\it.json",
  "assets\lang\en.json",
  "assets\img\logo.png",
  "changelog.json",
  "interface-dlms\auth-config.php",
  "interface-dlms\download-logger.php",
  "interface-dlms\manual-download-gm.php",
  "interface-dlms\manual-download-rtu.php",
  "interface-dlms\manual-download-interface.php",
  "interface-dlms\manual-download-gurux.php",
  "interface-dlms\admin-stats.php",
  "interface-dlms\resource-info.php",
  "interface-dlms\update.json"
)

$webClient = New-Object System.Net.WebClient
$webClient.Credentials = New-Object System.Net.NetworkCredential($Username, $Password)

$baseUri = "ftp://$Server/"

foreach ($file in $files) {
  $localPath = Join-Path "$PSScriptRoot" $file
  $remotePath = $baseUri + ($file -replace '\\', '/')
  Write-Host "Carico $file ..." -NoNewline
  try {
    $webClient.UploadFile($remotePath, $localPath)
    Write-Host " OK" -ForegroundColor Green
  } catch {
    Write-Host " ERRORE: $_" -ForegroundColor Red
  }
}

$webClient.Dispose()
Write-Host "`nFatto!" -ForegroundColor Green
