@echo off
cd /d "%~dp0"
set ASPNETCORE_ENVIRONMENT=Development
set ASPNETCORE_URLS=http://0.0.0.0:5000
start "ModusAPI" /MIN cmd /c "ModusClient.Web.exe > modus-api-run.log 2>&1"
