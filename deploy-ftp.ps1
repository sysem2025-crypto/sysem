param(
  [Parameter(Mandatory=$true)][string]$Server,
  [Parameter(Mandatory=$true)][string]$Username,
  [Parameter(Mandatory=$true)][string]$Password
)

$files = @(
  "ticketing.html",
  "resource.html",
  "utility.html",
  "assets\js\main.js",
  "assets\css\style.css",
  "assets\lang\it.json",
  "interface-dlms\auth-config.php",
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
