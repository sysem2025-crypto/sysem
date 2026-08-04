param(
  [switch]$SkipPush
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== SYSEM Push & Deploy ===" -ForegroundColor Cyan

# 1. Git push (se non skip)
if (-not $SkipPush) {
    Write-Host "`n[1/2] Git push..." -ForegroundColor Yellow
    git -C $scriptDir push
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRORE: git push fallito" -ForegroundColor Red
        exit 1
    }
    Write-Host "Push completato" -ForegroundColor Green
} else {
    Write-Host "`n[1/2] Git push saltato (-SkipPush)" -ForegroundColor DarkGray
}

# 2. FTP deploy
Write-Host "`n[2/2] FTP deploy..." -ForegroundColor Yellow
& "$scriptDir\deploy-ftp.ps1" -Server "ftp.sysem.it" -Username "ftpuser@sysem.it" -Password "4WYYXicYDzRSmb9"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRORE: deploy fallito" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Deploy completato ===" -ForegroundColor Green
