# Aggiornamento Release Web

Questo documento descrive come aggiornare la release pubblicata sul sito, in modo che i pulsanti di download scarichino automaticamente la versione piu recente.

## Obiettivo

Aggiornare gli eseguibili nelle cartelle `Release` monitorate dal web:

- `H:\Life_OS\01_Lavoro\02_ProgettiClienti\03_Fiorentini_GeniusMonitor\02_Sorgenti\Software\Release`
- `H:\Life_OS\01_Lavoro\03_ProgettiInterni\08_RTU_Terminal\Software\Release`

I due endpoint web (`manual-download-gm.php` e `manual-download-rtu.php`) scaricano in automatico il file `.exe` piu recente in base alla data di modifica.

## Procedura Operativa

1. Compilare la nuova versione dell'applicativo.
2. Copiare il nuovo file `.exe` nella cartella `Release` corretta.
3. Verificare che la data di modifica del nuovo `.exe` sia la piu recente nella cartella.
4. (Consigliato) Rimuovere o archiviare i vecchi `.exe` per evitare ambiguita.
5. Aprire la pagina `Resource` del sito e testare:
   - `Download GeniusMonitor`
   - `Download RTU Terminal`
6. Verificare che venga scaricato il file corretto (nome versione attesa).

## Come Caricare la Nuova Release sul Sito

1. Accedere al server web (RDP, condivisione di rete o pannello hosting) con credenziali autorizzate.
2. Raggiungere le cartelle sorgenti usate dai due endpoint:
   - `H:\Life_OS\01_Lavoro\02_ProgettiClienti\03_Fiorentini_GeniusMonitor\02_Sorgenti\Software\Release`
   - `H:\Life_OS\01_Lavoro\03_ProgettiInterni\08_RTU_Terminal\Software\Release`
3. Caricare/copiare i nuovi file `.exe` nelle rispettive cartelle `Release`.
4. Verificare che i nuovi `.exe` risultino con data/ora piu recente rispetto ai precedenti.
5. Controllare i permessi file (lettura per l'utente del web server/IIS) per evitare errori 404 o accesso negato.
6. Aprire la pagina `Resource` del sito e testare entrambi i pulsanti download per confermare la pubblicazione.

## Aggiornamento Versione Manifest (facoltativo ma consigliato)

Se vuoi mantenere aggiornata anche la versione esposta online:

1. Aprire `interface-dlms/update.json`.
2. Aggiornare i campi:
   - `latest_version`
   - `notes`
   - `download_url` (se necessario)
3. Pubblicare il file aggiornato sul server.

## Checklist Rapida

- Nuovo `.exe` copiato nella cartella `Release` corretta
- Data modifica del nuovo `.exe` piu recente
- Pulsanti download testati da browser
- (Opzionale) `update.json` aggiornato con versione e note
