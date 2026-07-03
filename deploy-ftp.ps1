param(
  [Parameter(Mandatory=$true)][string]$Server,
  [Parameter(Mandatory=$true)][string]$Username,
  [Parameter(Mandatory=$true)][string]$Password
)

$files = @(
  "utility.html",
  "assets\js\main.js",
  "assets\lang\it.json"
)

$webClient = New-Object System.Net.WebClient
$webClient.Credentials = New-Object System.Net.NetworkCredential($Username, $Password)

$baseUri = "ftp://$Server/public_html/"

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
