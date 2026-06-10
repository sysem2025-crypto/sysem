@echo off
set GIT_PATH="C:\Program Files\Git\bin\git.exe"
set PROJECT_DIR="E:\02_ProgettiPersonali\06_Sysem"

echo --------------------------------------------------
echo SYSEM - PUBBLICAZIONE SITO
echo --------------------------------------------------

cd /d %PROJECT_DIR%

echo.
echo 1. Analisi dei file modificati...
%GIT_PATH% status -s

echo.
set /p msg="Inserisci una breve descrizione della modifica (es. Aggiornato testo): "

echo.
echo 2. Preparazione caricamento...
%GIT_PATH% add .

echo.
echo 3. Creazione pacchetto (Commit)...
%GIT_PATH% commit -m "%msg%"

echo.
echo 4. Invio online (Push)...
%GIT_PATH% push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo --------------------------------------------------
    echo SUCCESS: Il sito e in fase di pubblicazione!
    echo Attendi 1-2 minuti e controlla online.
    echo --------------------------------------------------
) else (
    echo.
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    echo ERRORE: Qualcosa e andato storto durante il push.
    echo Controlla la connessione o le credenziali.
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
)

pause
