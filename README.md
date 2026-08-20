# SYSEM landing page

Template statico HTML/CSS in palette verde petrolio e azzurro metano.

## File

- index.html
- assets/css/style.css
- assets/img/logo.png

## Nota tecnica

Piano operativo Secure Code:

- separare il firmware in **Bootloader**, **Codice metrologico** e **Applicativo**;
- usare un manifesto firmato per descrivere la release completa;
- trasferire solo le sezioni modificate, ma verificare sempre la composizione totale;
- proteggere l'interfaccia tra **Applicativo** e **Codice metrologico** con API controllata;
- prevedere staging, verifica, rollback e audit trail per gli aggiornamenti;
- mantenere tracciati versione, CRC e hash delle sezioni rilevanti.

## Anteprima locale

Apri `index.html` con doppio clic oppure usa VS Code con Live Server.

## Pubblicazione su Netsons

Carica nella cartella `public_html`:

- index.html
- assets/

## Da personalizzare

Nel file `index.html` sostituisci:

- assistenza@sysem.it
- +39 000 0000000
- link WhatsApp
- indirizzo
- eventuale P.IVA
