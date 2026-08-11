const API_BASE = (function() {
  const script = document.currentScript;
  const src = script && script.src;
  if (src) {
    const match = src.match(/[?&]api=([^&]+)/);
    if (match) return decodeURIComponent(match[1]);
  }
  return localStorage.getItem('sysem_api_base') || 'https://gianluca-ai-ten.vercel.app';
})();

const STORAGE_KEYS = {
  token: 'sysem_token',
  sessionEmail: 'sysem_session_email',
  users: 'sysem_users',
  roleChanges: 'sysem_role_changes'
};

const ROLE_LEVEL = { guest: 0, base: 1, pro: 2, admin: 3 };
const LANG_KEY = 'sysem_lang';
let currentLang = 'it';
let apiAvailable = null;

// --- i18next loader ---
const I18NEXT_CDN = 'https://unpkg.com/i18next@23.16.4/dist/umd/i18next.min.js';

function loadI18next() {
  return new Promise(function(resolve, reject) {
    if (window.i18next) { resolve(); return; }
    var s = document.createElement('script');
    s.src = I18NEXT_CDN;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function checkApi() {
  if (apiAvailable !== null) return apiAvailable;
  try {
    const resp = await fetch(API_BASE + '/api/health', { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    apiAvailable = resp.ok;
  } catch {
    apiAvailable = false;
  }
  return apiAvailable;
}

function getApiHeaders() {
  const token = localStorage.getItem(STORAGE_KEYS.token);
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  return headers;
}

async function apiGet(path) {
  if (!(await checkApi())) throw new Error('API non disponibile');
  const resp = await fetch(API_BASE + path, { headers: getApiHeaders(), credentials: 'include', signal: AbortSignal.timeout(10000) });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.detail || 'Errore ' + resp.status);
  return data;
}

async function apiPost(path, body) {
  if (!(await checkApi())) throw new Error('API non disponibile');
  const resp = await fetch(API_BASE + path, {
    method: 'POST',
    headers: getApiHeaders(),
    credentials: 'include',
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000)
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.detail || 'Errore ' + resp.status);
  return data;
}

async function apiPut(path, body) {
  if (!(await checkApi())) throw new Error('API non disponibile');
  const resp = await fetch(API_BASE + path, {
    method: 'PUT',
    headers: getApiHeaders(),
    credentials: 'include',
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000)
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.detail || 'Errore ' + resp.status);
  return data;
}

// --- Traduzioni Italiane inline (per caricamento immediato) ---
var IT_TRANSLATIONS = {
  "common": {
    "login": "Login", "logout": "Logout", "save": "Salva", "email": "Email",
    "password": "Password", "role": "Ruolo", "actions": "Azione",
    "searchEmail": "Cerca per email", "allRoles": "Tutti i ruoli",
    "noUsers": "Nessun utente trovato.", "user": "Utente", "signin": "Accedi",
    "authorizedOnly": "Solo utenti autorizzati.", "openMenu": "Apri menu", "homeLabel": "SYSEM home"
  },
  "nav": {
    "systema": "Systema", "datacenter": "Datacenter comunicazione dati",
    "volumeCorrector": "Correttore Volumi",
    "embedded": "Embedded", "embeddedHome": "Progetti Embedded",
    "assistenza": "Assistenza",
    "utility": "Utility",
    "sistemi": "Sistemi", "download": "Download applicativi",
    "sensori": "Sensori e caratterizzazione", "formule": "Formule di compressione", "protocolli": "Protocolli",
    "normative": "Normative", "guidaNorme": "Guida applicazione norme",
    "progetti": "Progetti", "progettiHome": "Progetti",
    "telecontrollo": "Telecontrollo", "telecontrolloHome": "Telecontrollo", "cedam3": "Cedam 3",
    "ctr": "Sezione CTR", "pot": "Sezione POT", "dlms": "Sezione DLMS",
    "sysem": "Sysem",
    "about": "Studio Tecnico Informatico", "ai": "Intelligenza Artificiale", "contatti": "Contatti",
    "architetturaModulare": "Architettura Modulare PIC",
    "osCooperativo": "Scheduler Semplificato",
    "gestioneInterrupt": "Gestione Interrupt",
    "letturaNtc": "Lettura NTC a Condensatore",
    "macchinaStati": "Macchina a Stati",
    "controlloTriac": "Controllo Triac",
    "letturaTacho": "Lettura Tachimetrica",
    "protocolloTlc": "Protocollo TLC",
    "gestioneEeprom": "Gestione EEPROM",
    "debugProduzione": "Debug & Produzione"
  },
  "auth": {
    "loginTitle": "Login", "loginDesc": "Inserisci le credenziali per entrare nell'area riservata.",
    "loginLabel": "Utente", "passwordLabel": "Password", "signinBtn": "Accedi",
    "invalidEmail": "Inserisci una email valida.", "passwordLength": "La password deve avere almeno 8 caratteri.",
    "emailExists": "Questa email è già registrata.",
    "registered": "Registrazione completata per {{email}}. Ruolo assegnato: base.",
    "userNotFound": "Utente non trovato.", "wrongPassword": "Password non corretta.",
    "mustLogin": "Devi essere autenticato per cambiare password.",
    "wrongCurrentPassword": "Password attuale non valida.", "passwordMismatch": "Le nuove password non coincidono.",
    "passwordUpdated": "Password aggiornata con successo.", "changePassword": "Cambio Password",
    "currentPassword": "Password attuale", "newPassword": "Nuova password",
    "confirmPassword": "Conferma nuova password", "changePasswordBtn": "Cambia password",
    "registerTitle": "Registrazione", "registerDesc": "Crea un account per accedere all'area riservata.",
    "registerBtn": "Registrati", "emailPlaceholder": "nome@azienda.it"
  },
  "admin": {
    "title": "Controllo accessi", "heading": "Gestione Accessi",
    "searchPlaceholder": "Cerca per email", "allRoles": "Tutti i ruoli",
    "thEmail": "Email", "thRole": "Ruolo", "thCreated": "Creato il", "thAction": "Azione",
    "noUsers": "Nessun utente trovato.", "noChange": "Nessuna modifica per {{email}}.",
    "confirmPromotion": "Confermi promozione admin per {{email}}?", "roleUpdated": "Ruolo aggiornato: {{email}} -> {{newRole}}.",
    "saveBtn": "Salva"
  },
  "download": {
    "appTitle": "Applicativi disponibili",
    "appDesc": "Gli applicativi sono distribuiti in area riservata per garantire tracciabilità versioni e controllo accessi.",
    "accessTitle": "Accesso area download", "accessDesc": "Per scaricare i pacchetti software accedi con un account autorizzato.",
    "supportTitle": "Supporto tecnico", "supportDesc": "Per attivazione utenze o supporto sui download contatta il team SYSEM.",
    "genius": "GeniusMonitor", "rtu": "RTU Terminal", "releases": "Aggiornamenti e release operative",
    "accessBtn": "Accedi all'area riservata", "catalogBtn": "Apri catalogo download", "contactBtn": "Contatta il supporto"
  },
  "resource": {
    "selectLabel": "Seleziona programma da scaricare", "diagnosticsTitle": "Indice diagnostico aggiornamenti",
    "manual": "Manual", "auto": "Auto", "updated": "Agg."
  },
  "lang": {
    "it": "IT",
    "en": "EN"
  },
  "page": {
    "home": { "overline": "Studio Tecnico Informatico", "title": "SYSEM", "metaTitle": "Soluzioni software per utilities", "subtitle": "soluzioni digitali per telecontrollo utilities" },
    "about": { "overline": "Chi siamo", "title": "SYSEM", "metaTitle": "Azienda", "desc1": "Siamo una realtà che sviluppa software per il settore dei servizi pubblici (utilities), attivo nella distribuzione di acqua, gas ed energia elettrica.", "desc2": "Uniamo competenza tecnica sul campo e approccio digitale per semplificare le attività quotidiane di tecnici e operatori." },
    "services": { "overline": "Servizi operativi", "title": "Servizi per utilities", "metaTitle": "Servizi", "desc1": "Supportiamo utility, distributori e partner tecnici nella gestione completa del ciclo operativo dei sistemi.", "desc2": "Copriamo avvio impianto, parametrizzazione, integrazione con sistemi centrali e supporto post-attivazione." },
    "industries": { "overline": "Ambiti applicativi", "title": "Dove operiamo", "metaTitle": "Applicazioni", "desc1": "Le nostre soluzioni sono pensate per reti utilities, cabine di misura e punti di consegna industriali.", "desc2": "Interveniamo in contesti dove affidabilità del dato, continuità del servizio e tracciabilità sono requisiti essenziali." },
    "sistemi": { "overline": "Panoramica", "title": "Sistemi", "metaTitle": "Sistemi" },
    "protocolli": { "overline": "Documentazione tecnica", "title": "Protocolli", "metaTitle": "Protocolli" },
    "ctr": { "overline": "Specifica tecnica", "title": "Sezione CTR", "metaTitle": "Protocollo CTR" },
    "pot": { "overline": "Norma tecnica", "title": "Sezione POT", "metaTitle": "Protocollo POT" },
    "dlms": { "overline": "Specifica tecnica", "title": "Sezione DLMS", "metaTitle": "Protocollo DLMS" },
    "sensori": { "overline": "Approfondimento tecnico", "title": "Sensori e caratterizzazione", "metaTitle": "Sensori e caratterizzazione" },
    "formule": { "overline": "Approfondimento tecnico", "title": "Formule di compressione", "metaTitle": "Formule di compressione" },
    "normative": { "overline": "Compliance", "title": "Normative", "metaTitle": "Normative" },
    "guidaNorme": { "overline": "Metodo operativo", "title": "Come Applicare le Norme", "metaTitle": "Guida Applicazione Norme" },
    "guida-norme": { "overline": "Metodo operativo", "title": "Come Applicare le Norme", "metaTitle": "Guida Applicazione Norme" },
    "sistemaMisura": { "overline": "Panoramica tecnica", "title": "Sistema di Misura", "metaTitle": "Sistema di Misura" },
    "ai": { "overline": "Innovazione", "title": "Intelligenza Artificiale", "metaTitle": "AI" },
    "progetti": { "overline": "Progetti", "title": "Progetti", "metaTitle": "Progetti" },
    "telecontrollo": { "overline": "Telecontrollo", "title": "Applicazioni di Telecontrollo", "subtitle": "Soluzioni per automazione e monitoraggio remoto di impianti utility", "metaTitle": "Telecontrollo" },
    "cedam3": { "overline": "Telecontrollo", "title": "Cedam 3", "subtitle": "Sistema di automazione e telecontrollo per impianti di sollevamento acque", "metaTitle": "Cedam 3" },
    "datacenter": { "overline": "Infrastruttura", "title": "Datacenter comunicazione dati", "metaTitle": "Datacenter" },
    "ticketing": { "overline": "Gestione", "title": "Sistema di Ticketing", "metaTitle": "Ticketing" },
    "embedded": { "overline": "Progetti Embedded", "title": "Firmware PIC", "subtitle": "Tutorial e progetti firmware per microcontrollori PIC 8-bit", "metaTitle": "Embedded" },
    "osCooperativo": { "overline": "Embedded &mdash; Progettazione Firmware", "title": "Scheduler Semplificato Round-Robin", "subtitle": "Scheduler a task multiple con wake-up a tempo o a evento su PIC a 8 bit, senza RTOS esterno", "metaTitle": "Scheduler Semplificato | SYSEM" },
    "architetturaModulare": { "overline": "Embedded &mdash; Progettazione Firmware", "title": "Architettura Modulare per PIC16Cxx", "subtitle": "Organizzare il codice Assembly su pagine ROM con moduli #include, header di dipendenza e controllo dimensionale", "metaTitle": "Architettura Modulare PIC | SYSEM" },
    "gestioneInterrupt": { "overline": "Embedded &mdash; Progettazione Firmware", "title": "Gestione Interrupt su PIC16Cxx", "subtitle": "Salvataggio contesto, interrupt on-change, decoder a cascata e sincronismo per triac, tacho e temperatura", "metaTitle": "Gestione Interrupt PIC | SYSEM" },
    "gestioneEeprom": { "overline": "Embedded &mdash; Progettazione Firmware", "title": "Gestione EEPROM Esterna", "subtitle": "Salvare e ripristinare la configurazione prodotto: parametri macchina, temperatura, timer, diagnostica", "metaTitle": "Gestione EEPROM | SYSEM" },
    "protocolloTlc": { "overline": "Embedded &mdash; Progettazione Firmware", "title": "Protocollo TLC Seriale", "subtitle": "Comunicazione seriale tra termostato e fan coil con encoding bit-bang su singolo filo", "metaTitle": "Protocollo TLC | SYSEM" },
    "debugProduzione": { "overline": "Embedded &mdash; Progettazione Firmware", "title": "Debug e Messa in Produzione", "subtitle": "Come sopravvivere a 60+ revisioni di firmware PIC Assembly: flag di simulazione, diagnostica seriale, autodiagnosi all'avvio", "metaTitle": "Debug e Produzione | SYSEM" },
    "controlloTriac": { "overline": "Embedded &mdash; Progettazione Firmware", "title": "Controllo Triac e Utenze", "subtitle": "Azionamento di carichi AC in ambiente domestico: taglio di fase, sincronismo di rete, zippillo a tempo da interrupt", "metaTitle": "Controllo Triac | SYSEM" },
    "macchinaStati": { "overline": "Embedded &mdash; Progettazione Firmware", "title": "Macchina a Stati per Prodotto", "subtitle": "Diagramma a palle: progettare la logica prodotto in modo che sia leggibile e modificabile dal cliente", "metaTitle": "Macchina a Stati | SYSEM" },
    "letturaTacho": { "overline": "Embedded &mdash; Progettazione Firmware", "title": "Lettura Tachimetrica", "subtitle": "Rilevare la velocit del motore con un sensore Hall e un pin di interrupt on-change", "metaTitle": "Lettura Tachimetrica | SYSEM" },
    "letturaNtc": { "overline": "Embedded &mdash; Progettazione Firmware", "title": "Lettura NTC a Condensatore", "subtitle": "Misurare la temperatura con un termistore NTC su PIC, usando il metodo carica/scarica RC senza ADC", "metaTitle": "Lettura NTC | SYSEM" },
    "download": { "overline": "Software operativi", "title": "Download applicativi", "metaTitle": "Download applicativi" },
    "resource": { "overline": "Learning & Assets", "title": "Resource", "metaTitle": "Resource" },
    "access": { "overline": "Area riservata", "title": "Accesso", "metaTitle": "Accesso" },
    "programAccess": { "overline": "Program access", "title": "Accesso Programma", "metaTitle": "Program Access" },
    "admin": { "overline": "Controllo accessi", "title": "Gestione Accessi", "metaTitle": "Admin Accessi" },
    "contact": { "overline": "Get in touch", "title": "Contact", "metaTitle": "Contact" },
    "utility": { "overline": "Documentazione tecnica", "title": "Utility", "metaTitle": "Utility" }
  }
};

async function initI18n() {
  await loadI18next();
  currentLang = localStorage.getItem(LANG_KEY) || 'it';
  var enResources = {};
  try {
    var resp = await fetch('assets/lang/en.json?v=20260718b');
    enResources = await resp.json();
  } catch {}
  await i18next.init({
    lng: currentLang,
    fallbackLng: 'it',
    interpolation: { prefix: '{{', suffix: '}}' },
    resources: {
      it: { translation: IT_TRANSLATIONS },
      en: { translation: enResources }
    }
  });
  applyTranslations();
  renderLangSwitcher();
  document.documentElement.lang = currentLang === 'en' ? 'en' : 'it';
}

function t(key, fallback) {
  return i18next.t(key, { defaultValue: fallback || key });
}

function formatT(key, vars) {
  return i18next.t(key, { defaultValue: key, ...vars });
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.dataset.i18n;
    var finalText = i18next.t(key);
    if (el.classList.contains('page-subtitle') && finalText === key) {
      return;
    }
    var tag = el.tagName;
    if (tag === 'TITLE') {
      el.textContent = finalText + ' | SYSEM';
    } else if (tag === 'INPUT' && el.hasAttribute('placeholder')) {
      el.placeholder = finalText;
    } else if (tag === 'SELECT') {
      el.setAttribute('aria-label', finalText);
    } else {
      el.textContent = finalText;
    }
  });
  updateAuthPill();
}

function renderLangSwitcher() {
  const navContainer = document.querySelector('.nav-container');
  if (!navContainer) return;
  var switcher = document.getElementById('lang-switcher');
  if (!switcher) {
    switcher = document.createElement('div');
    switcher.id = 'lang-switcher';
    switcher.className = 'lang-switcher';
    ['it', 'en'].forEach(function(code) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lang-btn';
      btn.dataset.lang = code;
      btn.textContent = code.toUpperCase();
      btn.setAttribute('aria-label', i18next.t('lang.' + code, { defaultValue: code.toUpperCase() }));
      btn.addEventListener('click', function() { setLang(code); });
      switcher.appendChild(btn);
    });
    navContainer.insertBefore(switcher, navContainer.firstChild);
  }
  switcher.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}

async function setLang(lang) {
  if (lang === currentLang) return;
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);
  await i18next.changeLanguage(lang);
  document.documentElement.lang = lang === 'en' ? 'en' : 'it';
  applyTranslations();
  renderLangSwitcher();
  const currentRole = await getCurrentRole();
  updateNavLabels(currentRole);
}

function updateNavLabels() {
  const menuList = document.querySelector('#overlay-menu ul');
  if (!menuList) return;
  menuList.querySelectorAll('.nav-sub a').forEach(function(a) {
    const key = a.dataset.i18nItem;
    if (key) a.textContent = t(key);
  });
}

function updateAuthPill() {
  const authPill = document.getElementById('auth-pill');
  if (!authPill) return;
  const currentUser = getCachedUser();
  if (currentUser) {
    const span = authPill.querySelector('span');
    const btn = authPill.querySelector('button');
    if (span) span.textContent = currentUser.email + ' (' + currentUser.role + ')';
    if (btn) btn.textContent = t('common.logout');
  } else {
    const link = authPill.querySelector('a');
    if (link) link.textContent = t('common.login');
  }
}

function readJson(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function getCachedUser() {
  return readJson('sysem_cached_user', null);
}

function setCachedUser(user) {
  if (user) {
    writeJson('sysem_cached_user', user);
  } else {
    localStorage.removeItem('sysem_cached_user');
  }
}

async function getUsers() {
  try {
    const data = await apiGet('/api/auth/users');
    return data.users || [];
  } catch {
    return readJson(STORAGE_KEYS.users, []);
  }
}

async function getCurrentUser() {
  const token = localStorage.getItem(STORAGE_KEYS.token);
  if (token) {
    try {
      const data = await apiGet('/api/auth/me');
      if (data.authenticated && data.user) {
        setCachedUser(data.user);
        return data.user;
      }
    } catch {
      return readJson(STORAGE_KEYS.users, []).find(function(u) {
        return u.email === normalizeEmail(localStorage.getItem(STORAGE_KEYS.sessionEmail));
      }) || null;
    }
    return null;
  }
  const email = normalizeEmail(localStorage.getItem(STORAGE_KEYS.sessionEmail));
  if (!email) return null;
  const users = readJson(STORAGE_KEYS.users, []);
  return users.find(function(u) { return u.email === email; }) || null;
}

async function getCurrentRole() {
  const user = await getCurrentUser();
  return user ? user.role : 'guest';
}

function hasRoleAccess(currentRole, requiredRole) {
  const current = ROLE_LEVEL[currentRole] || 0;
  const required = ROLE_LEVEL[requiredRole] || 0;
  return current >= required;
}

function getAllowedLanding(role) {
  if (role === 'admin') return 'admin.html';
  if (role === 'pro' || role === 'base') return 'resource.html';
  return 'access.html';
}

function getSafeReturnUrl(candidate, fallback) {
  if (typeof candidate !== 'string' || !candidate) {
    return fallback;
  }

  if (!candidate.startsWith('/') || candidate.startsWith('//')) {
    return fallback;
  }

  try {
    const parsed = new URL(candidate, window.location.origin);
    if (parsed.origin !== window.location.origin) {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

window.getSafeReturnUrl = getSafeReturnUrl;

async function ensureDefaultAdminUser() {
  try {
    await checkApi();
    if (!apiAvailable) {
      const users = readJson(STORAGE_KEYS.users, []);
      const defaultAdminEmail = 'gianluca.piga@sysem.it';
      const defaultAdmin = users.find(function(u) { return u.email === defaultAdminEmail; });
      const defaultAdminPassword = 'ChangeMe123!';
      if (defaultAdmin) {
        if (defaultAdmin.role !== 'admin') defaultAdmin.role = 'admin';
        if (!defaultAdmin.password) defaultAdmin.password = defaultAdminPassword;
        writeJson(STORAGE_KEYS.users, users);
      } else {
        users.push({ email: defaultAdminEmail, role: 'admin', password: defaultAdminPassword, createdAt: new Date().toISOString() });
        writeJson(STORAGE_KEYS.users, users);
      }
    }
  } catch {
    // API not available, ignore
  }
}

const SITE_BASE = (function() {
  var scripts = document.getElementsByTagName('script');
  for (var i = 0; i < scripts.length; i++) {
    var src = scripts[i].src;
    var idx = src.indexOf('/assets/js/main.js');
    if (idx !== -1) return src.substring(0, idx + 1);
  }
  return '/';
})();

var NAV_STRUCTURE = [
  { labelKey: 'nav.systema', href: SITE_BASE + 'datacenter.html' },
  { labelKey: 'nav.assistenza', href: SITE_BASE + 'ticketing.html' },
  { labelKey: 'nav.progetti', href: SITE_BASE + 'progetti.html' },
  { labelKey: 'nav.utility', href: SITE_BASE + 'utility.html' },
  { labelKey: 'nav.telecontrollo', href: SITE_BASE + 'telecontrollo.html' },
  { labelKey: 'nav.sysem', href: SITE_BASE + 'sistemi.html' },
  { labelKey: 'nav.contatti', href: SITE_BASE + 'contact.html' }
];

var PAGE_MENU_MAP = {
  'systema': 'nav.systema',
  'datacenter': 'nav.systema',
  'ticketing': 'nav.assistenza',
  'resource': 'nav.assistenza',
  'program-access': 'nav.assistenza',
  'progetti': 'nav.progetti',
  'embedded': 'nav.progetti',
  'os-cooperativo': 'nav.progetti',
  'architettura-modulare': 'nav.progetti',
  'gestione-interrupt': 'nav.progetti',
  'gestione-eeprom': 'nav.progetti',
  'protocollo-tlc': 'nav.progetti',
  'debug-produzione': 'nav.progetti',
  'controllo-triac': 'nav.progetti',
  'macchina-a-stati': 'nav.progetti',
  'lettura-tachimetrica': 'nav.progetti',
  'lettura-ntc': 'nav.progetti',
  'utility': 'nav.utility',
  'telecontrollo': 'nav.telecontrollo',
  'cedam3': 'nav.telecontrollo',
  'sistemi': 'nav.sysem',
  'sistema-correttori': 'nav.sysem',
  'about': 'nav.sysem',
  'services': 'nav.sysem',
  'industries': 'nav.sysem',
  'ai': 'nav.sysem',
  'contact': 'nav.sysem',
  'protocolli': 'nav.sysem',
  'sensori-caratterizzazione': 'nav.sysem',
  'formule-compressione': 'nav.sysem',
  'normative': 'nav.sysem',
  'guida-norme': 'nav.sysem',
  'sistema-misura': 'nav.sysem',
  'ctr': 'nav.sysem',
  'pot': 'nav.sysem',
  'dlms': 'nav.sysem',
  'download-applicativi': 'nav.sysem',
  'volume-corrector': 'nav.sysem',
  'access': null,
  'admin': null,
  'home': null
};

function updateMenuLabel() {
  var label = document.getElementById('menu-label');
  if (!label) return;
  var page = document.body.dataset.page;
  var key = PAGE_MENU_MAP[page];
  label.textContent = key ? t(key) : '';
}

const ROLE_OPTIONS = ['base', 'pro', 'admin'];

function generateDownloadToken() {
  const user = getCachedUser();
  if (!user) return '';
  return btoa(user.email + '|' + user.role + '|' + new Date().toISOString().slice(0, 10));
}

function renderNavigation(currentPage) {
  const overlayMenu = document.getElementById('overlay-menu');
  if (!overlayMenu) return;
  const menuList = overlayMenu.querySelector('ul');
  if (!menuList) return;
  menuList.innerHTML = '';
  NAV_STRUCTURE.forEach(function(item) {
    const itemLi = document.createElement('li');
    itemLi.className = 'nav-sub';
    const link = document.createElement('a');
    link.href = item.href;
    link.dataset.i18nItem = item.labelKey;
    link.textContent = t(item.labelKey);
    if (item.href.indexOf('://') !== -1) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    } else if (currentPage && item.href.indexOf(currentPage) !== -1) {
      link.setAttribute('aria-current', 'page');
    }
    itemLi.appendChild(link);
    menuList.appendChild(itemLi);
  });
  const topNavContainer = document.querySelector('.nav-container');
  if (!topNavContainer) return;
  var oldAuth = document.getElementById('auth-pill');
  if (oldAuth) oldAuth.remove();
  var currentUser = getCachedUser();
  var authPill = document.createElement('div');
  authPill.id = 'auth-pill';
  authPill.className = 'auth-pill';
  if (currentUser) {
    authPill.innerHTML = '<span>' + currentUser.email + ' (' + currentUser.role + ')</span><button type="button" id="logout-btn">' + t('common.logout') + '</button>';
  } else {
    authPill.innerHTML = '<a href="access.html">' + t('common.login') + '</a>';
  }
  topNavContainer.appendChild(authPill);
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.removeItem(STORAGE_KEYS.token);
      localStorage.removeItem(STORAGE_KEYS.sessionEmail);
      setCachedUser(null);
      window.location.href = 'index.html';
    });
  }
}

async function enforceRouteAccess(requiredRole) {
  const currentRole = await getCurrentRole();
  if (requiredRole === 'guest') return;
  if (!hasRoleAccess(currentRole, requiredRole)) {
    var dest = getAllowedLanding(currentRole);
    var returnUrl = window.location.pathname + window.location.search;
    if (returnUrl && dest.indexOf('?') === -1) {
      dest += '?return=' + encodeURIComponent(returnUrl);
    }
    window.location.href = dest;
  }
}

function tFeedback(key, vars) {
  return formatT(key, vars);
}

function initAccessPage() {
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const loginEmailField = document.getElementById('login-email');
  const loginPasswordInput = document.getElementById('login-password');
  const changePasswordCard = document.getElementById('change-password-card');
  const changePasswordForm = document.getElementById('change-password-form');
  const feedback = document.getElementById('auth-feedback');
  if (!loginForm || !loginEmailField || !loginPasswordInput || !feedback) return;
  const cachedUser = getCachedUser();
  if (changePasswordCard && cachedUser) {
    changePasswordCard.hidden = false;
  }
  const refreshLoginOptions = function() {
    if (loginEmailField instanceof HTMLSelectElement) {
      getUsers().then(function(users) {
        loginEmailField.innerHTML = '';
        users.forEach(function(user) {
          const option = document.createElement('option');
          option.value = user.email;
          option.textContent = user.email + ' (' + user.role + ')';
          loginEmailField.appendChild(option);
        });
        if (users.length === 0) {
          const option = document.createElement('option');
          option.value = '';
          option.textContent = 'Nessun utente registrato';
          loginEmailField.appendChild(option);
        }
      });
    }
    if (loginEmailField instanceof HTMLInputElement) {
      getUsers().then(function(users) {
        var list = document.getElementById('login-email-list');
        if (!list) {
          list = document.createElement('datalist');
          list.id = 'login-email-list';
          loginEmailField.parentNode.appendChild(list);
          loginEmailField.setAttribute('list', 'login-email-list');
        }
        list.innerHTML = '';
        users.forEach(function(user) {
          const option = document.createElement('option');
          option.value = user.email;
          list.appendChild(option);
        });
      });
    }
  };
  if (registerForm) {
    registerForm.addEventListener('submit', function(event) {
      event.preventDefault();
      var formData = new FormData(registerForm);
      var email = normalizeEmail(formData.get('email'));
      var password = String(formData.get('password') || '');
      if (!email) {
        feedback.textContent = tFeedback('auth.invalidEmail');
        return;
      }
      if (password.length < 8) {
        feedback.textContent = tFeedback('auth.passwordLength');
        return;
      }
      apiPost('/api/auth/signup', { email: email, password: password, name: email.split('@')[0] })
        .then(function() {
          registerForm.reset();
          feedback.textContent = tFeedback('auth.registered', { email: email });
          refreshLoginOptions();
        })
        .catch(function(err) {
          feedback.textContent = err.message || 'Errore registrazione';
        });
    });
  }
  loginForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const email = normalizeEmail(formData.get('email'));
    const password = String(formData.get('password') || '');
    if (!email) {
      feedback.textContent = tFeedback('auth.invalidEmail');
      return;
    }
    if (password.length < 8) {
      feedback.textContent = tFeedback('auth.passwordLength');
      return;
    }
    apiPost('/api/auth/token-login', { email: email, password: password })
      .then(function(data) {
        localStorage.setItem(STORAGE_KEYS.token, data.access_token);
        setCachedUser(data.user);
        localStorage.setItem(STORAGE_KEYS.sessionEmail, data.user.email);
        var params = new URLSearchParams(window.location.search);
        var returnUrl = getSafeReturnUrl(params.get('return'), getAllowedLanding(data.user.role));
        window.location.href = returnUrl;
      })
      .catch(function(err) {
        feedback.textContent = err.message || 'Credenziali non valide';
      });
  });
  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', function(event) {
      event.preventDefault();
      const user = getCachedUser();
      if (!user) {
        feedback.textContent = tFeedback('auth.mustLogin');
        return;
      }
      const formData = new FormData(changePasswordForm);
      const currentPassword = String(formData.get('currentPassword') || '');
      const newPassword = String(formData.get('newPassword') || '');
      const confirmPassword = String(formData.get('confirmPassword') || '');
      if (newPassword.length < 8) {
        feedback.textContent = tFeedback('auth.passwordLength');
        return;
      }
      if (newPassword !== confirmPassword) {
        feedback.textContent = tFeedback('auth.passwordMismatch');
        return;
      }
      try {
        var users = readJson(STORAGE_KEYS.users, []);
        var target = users.find(function(u) { return u.email === user.email; });
        if (!target) {
          feedback.textContent = tFeedback('auth.userNotFound');
          return;
        }
        if (target.password !== currentPassword) {
          feedback.textContent = tFeedback('auth.wrongCurrentPassword');
          return;
        }
        target.password = newPassword;
        writeJson(STORAGE_KEYS.users, users);
        changePasswordForm.reset();
        feedback.textContent = tFeedback('auth.passwordUpdated');
      } catch {
        feedback.textContent = 'API cambio password non ancora disponibile';
      }
    });
  }
  refreshLoginOptions();
}

function initAdminPage() {
  const usersBody = document.getElementById('admin-users-body');
  const searchInput = document.getElementById('admin-search');
  const roleFilter = document.getElementById('admin-role-filter');
  const feedback = document.getElementById('admin-feedback');
  if (!usersBody || !searchInput || !roleFilter || !feedback) return;
  const trackRoleChange = function(targetUserEmail, oldRole, newRole, changedBy) {
    const roleChanges = readJson(STORAGE_KEYS.roleChanges, []);
    roleChanges.push({ targetUserEmail: targetUserEmail, oldRole: oldRole, newRole: newRole, changedBy: changedBy, changedAt: new Date().toISOString() });
    writeJson(STORAGE_KEYS.roleChanges, roleChanges);
  };
  const saveRole = function(email, uid, newRole) {
    var cachedUser = getCachedUser();
    var doSave = function() {
      apiPut('/api/auth/users/' + uid + '/role', { role: newRole })
        .then(function() {
          feedback.textContent = tFeedback('admin.roleUpdated', { email: email, newRole: newRole });
          renderTable();
        })
        .catch(function(err) {
          feedback.textContent = err.message || 'Errore aggiornamento';
        });
    };
    if (newRole === 'admin' && !window.confirm(tFeedback('admin.confirmPromotion', { email: email }))) return;
    // Try API first, fallback to localStorage
    if (uid && uid.indexOf('-') > 0) {
      doSave();
    } else {
      var users = readJson(STORAGE_KEYS.users, []);
      var idx = users.findIndex(function(u) { return u.email === email; });
      if (idx < 0) {
        feedback.textContent = tFeedback('admin.noChange', { email: email });
        return;
      }
      var oldRole = users[idx].role;
      if (oldRole === newRole) {
        feedback.textContent = tFeedback('admin.noChange', { email: email });
        return;
      }
      users[idx].role = newRole;
      writeJson(STORAGE_KEYS.users, users);
      trackRoleChange(email, oldRole, newRole, cachedUser ? cachedUser.email : 'system');
      feedback.textContent = tFeedback('admin.roleUpdated', { email: email, newRole: newRole });
      renderTable();
    }
  };
  const renderTable = function() {
    var search = searchInput.value.trim().toLowerCase();
    var filter = roleFilter.value;
    getUsers().then(function(allUsers) {
      var filtered = allUsers.filter(function(user) {
        return user.email.indexOf(search) !== -1 && (filter === 'all' || user.role === filter);
      });
      usersBody.innerHTML = '';
      filtered.forEach(function(user) {
        var row = document.createElement('tr');
        var emailTd = document.createElement('td');
        emailTd.textContent = user.email;
        var roleTd = document.createElement('td');
        var roleSelect = document.createElement('select');
        ROLE_OPTIONS.forEach(function(role) {
          var opt = document.createElement('option');
          opt.value = role;
          opt.textContent = role;
          opt.selected = user.role === role;
          roleSelect.appendChild(opt);
        });
        roleTd.appendChild(roleSelect);
        var createdTd = document.createElement('td');
        createdTd.textContent = user.created_at ? new Date(user.created_at).toLocaleString('it-IT') : '--';
        var actionTd = document.createElement('td');
        var saveBtn = document.createElement('button');
        saveBtn.type = 'button';
        saveBtn.className = 'btn-download admin-save-btn';
        saveBtn.textContent = t('admin.saveBtn');
        saveBtn.addEventListener('click', function() { saveRole(user.email, user.id, roleSelect.value); });
        actionTd.appendChild(saveBtn);
        row.appendChild(emailTd);
        row.appendChild(roleTd);
        row.appendChild(createdTd);
        row.appendChild(actionTd);
        usersBody.appendChild(row);
      });
      if (filtered.length === 0) {
        usersBody.innerHTML = '<tr><td colspan="4">' + t('admin.noUsers') + '</td></tr>';
      }
    }).catch(function() {
      usersBody.innerHTML = '<tr><td colspan="4">' + t('admin.noUsers') + '</td></tr>';
    });
  };
  searchInput.addEventListener('input', renderTable);
  roleFilter.addEventListener('change', renderTable);
  renderTable();
}

document.addEventListener('DOMContentLoaded', function() {
  ensureDefaultAdminUser();

  // --- Floating "under construction" badge ---
  (function() {
    var dismissed = sessionStorage.getItem('construction_dismissed');
    if (dismissed) return;
    var badge = document.createElement('div');
    badge.className = 'construction-float';
    badge.setAttribute('role', 'status');
    badge.setAttribute('aria-label', 'Sito in costruzione');
    badge.innerHTML = 'Site under construction<button class="construction-float-close" title="Chiudi" aria-label="Chiudi avviso">&times;</button>';
    document.body.appendChild(badge);
    badge.querySelector('.construction-float-close').addEventListener('click', function() {
      badge.style.animation = 'none';
      badge.style.opacity = '0';
      badge.style.transform = 'translateY(20px)';
      badge.style.transition = 'opacity 0.3s, transform 0.3s';
      setTimeout(function() { badge.remove(); }, 300);
      sessionStorage.setItem('construction_dismissed', '1');
    });
  })();

  const body = document.body;
  const currentPage = body.dataset.page || '';
  const requiredRole = body.dataset.requiredRole || 'base';
  if (currentPage === 'access' && getCachedUser()) {
    window.location.replace('index.html');
    return;
  }
  enforceRouteAccess(requiredRole).then(function() {
    return initI18n();
  }).then(function() {
    return getCurrentUser().then(function(user) {
      if (user) setCachedUser(user);
    });
  }).then(function() {
    renderNavigation(currentPage);
    updateMenuLabel();
    const menuToggle = document.getElementById('menu-toggle');
    const overlayMenu = document.getElementById('overlay-menu');
    if (menuToggle && overlayMenu) {
      menuToggle.addEventListener('click', function() {
        menuToggle.classList.toggle('active');
        overlayMenu.classList.toggle('active');
        body.style.overflow = overlayMenu.classList.contains('active') ? 'hidden' : '';
      });
      overlayMenu.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
          menuToggle.classList.remove('active');
          overlayMenu.classList.remove('active');
          body.style.overflow = '';
        });
      });
    }
    initAccessPage();
    initAdminPage();
    var resourceListEl = document.getElementById('resource-list');
    if (resourceListEl) {
      var programs = [
        { id: 'genius-monitor', title: 'GeniusMonitor', description: 'Software di monitoraggio per dispositivi DLMS/COSEM.', meta: [['Piattaforma', 'Windows 10/11'], ['Formato', 'Installer .exe']], downloadHref: 'interface-dlms/manual-download-gm.php', releaseHistoryUrl: 'download/Genius_Monitor-release-history.md' },
        { id: 'rtu-terminal', title: 'RTU Terminal', description: 'Terminale seriale per la configurazione e il debugging di dispositivi RTU e apparati di comunicazione.', meta: [['Piattaforma', 'Windows 10/11'], ['Formato', 'Installer .exe']], downloadHref: 'interface-dlms/manual-download-rtu.php', releaseHistoryUrl: '' }
      ];

      function parseReleaseHistory(md) {
        var lines = md.split('\n');
        var version = '';
        var description = '';
        var html = '';
        var inRelease = false;
        var firstHeading = true;
        lines.forEach(function(line) {
          if (line.match(/^# /) && firstHeading) {
            var title = line.replace(/^# /, '').trim();
            var dashIdx = title.indexOf(' - ');
            if (dashIdx !== -1) {
              description = title.substring(dashIdx + 3).trim();
            }
            firstHeading = false;
            return;
          }
          if (line.match(/^## /)) {
            var entry = line.replace(/^## /, '').trim();
            var vMatch = entry.match(/v([\d.]+)/);
            if (vMatch && !version) version = vMatch[1];
            if (inRelease) html += '</ul>';
            html += '<div class="release-entry"><h5>' + entry + '</h5><ul>';
            inRelease = true;
          } else if (line.match(/^### /)) {
            html += '<li class="release-category">' + line.replace(/^### /, '').trim() + '</li>';
          } else if (line.match(/^- /)) {
            html += '<li>' + line.replace(/^- /, '') + '</li>';
          }
        });
        if (inRelease) html += '</ul></div>';
        return { version: version, description: description, html: html };
      }

      function renderResourceCard(program) {
        var card = document.createElement('article');
        card.className = 'resource-card';
        card.setAttribute('data-program-id', program.id);

        var token = generateDownloadToken();
        var downloadUrl = token ? program.downloadHref + '?token=' + encodeURIComponent(token) : program.downloadHref;
        var releaseId = 'release-panel-' + program.id;

        var headerHtml = '<div class="resource-card-header">'
          + '<div class="resource-card-title-row">'
          + '<h3 class="resource-card-title">' + program.title + '</h3>'
          + '<span class="resource-version-badge" data-version-badge="' + program.id + '"></span>'
          + '</div>'
          + '<p class="resource-card-description">' + program.description + '</p>'
          + '<div class="resource-card-meta">';
        program.meta.forEach(function(entry) {
          headerHtml += '<span>' + entry[0] + ': <strong>' + entry[1] + '</strong></span>';
        });
        headerHtml += '</div>'
          + '<div class="resource-card-stats" data-resource-stats="' + program.id + '">'
          + '<span class="stat-item" data-stat="downloads"></span>'
          + '<span class="stat-item" data-stat="size"></span>'
          + '<span class="stat-item" data-stat="updated"></span>'
          + '</div>'
          + '</div>';

        var hasRelease = !!program.releaseHistoryUrl;
        var actionsHtml = '<div class="resource-card-actions">'
          + '<a class="btn-download" href="' + downloadUrl + '" target="_blank" rel="noopener noreferrer">Download ' + program.title + '</a>';
        if (hasRelease) {
          actionsHtml += '<button class="btn-release-toggle" aria-expanded="false" aria-controls="' + releaseId + '" data-toggle-release="' + program.id + '">Storico release <span class="chevron">&#9662;</span></button>';
        }
        actionsHtml += '</div>';

        var releaseHtml = '';
        if (hasRelease) {
          releaseHtml = '<div class="resource-release-panel" id="' + releaseId + '" aria-hidden="true">'
            + '<div class="resource-release-content" data-release-content="' + program.id + '"></div>'
            + '</div>';
        }

        card.innerHTML = headerHtml + actionsHtml + releaseHtml;
        return card;
      }

      programs.forEach(function(program) {
        var card = renderResourceCard(program);
        resourceListEl.appendChild(card);
      });

      resourceListEl.addEventListener('click', function(e) {
        var btn = e.target.closest('[data-toggle-release]');
        if (!btn) return;
        var progId = btn.getAttribute('data-toggle-release');
        var panel = document.getElementById('release-panel-' + progId);
        if (!panel) return;
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        panel.setAttribute('aria-hidden', String(expanded));
      });

      programs.forEach(function(program) {
        if (!program.releaseHistoryUrl) return;
        var contentEl = resourceListEl.querySelector('[data-release-content="' + program.id + '"]');
        var badgeEl = resourceListEl.querySelector('[data-version-badge="' + program.id + '"]');
        if (!contentEl) return;
        contentEl.innerHTML = '<p class="resource-card-description">Caricamento...</p>';
        fetch(program.releaseHistoryUrl, { cache: 'no-store' })
          .then(function(r) { if (!r.ok) throw new Error(); return r.text(); })
          .then(function(md) {
            var parsed = parseReleaseHistory(md);
            if (parsed.version && badgeEl) {
              badgeEl.textContent = 'v' + parsed.version;
            }
            if (parsed.description && parsed.description !== 'Storico Release') {
              var descEl = resourceListEl.querySelector('[data-program-id="' + program.id + '"] .resource-card-description');
              if (descEl) descEl.textContent = parsed.description;
            }
            contentEl.innerHTML = parsed.html || '<p class="resource-no-release">Nessun dettaglio disponibile.</p>';
          })
          .catch(function() {
            contentEl.innerHTML = '<p class="resource-no-release">Storico non disponibile.</p>';
          });
      });

      fetch('interface-dlms/resource-info.php', { cache: 'no-store' })
        .then(function(r) { if (!r.ok) throw new Error(); return r.json(); })
        .then(function(infos) {
          infos.forEach(function(info) {
            var statsEl = resourceListEl.querySelector('[data-resource-stats="' + info.id + '"]');
            if (!statsEl) return;
            var dl = statsEl.querySelector('[data-stat="downloads"]');
            var sz = statsEl.querySelector('[data-stat="size"]');
            var up = statsEl.querySelector('[data-stat="updated"]');
            if (dl) dl.textContent = info.downloads + ' download';
            if (sz && info.file_size) {
              var mb = (info.file_size / (1024 * 1024)).toFixed(1);
              sz.textContent = mb + ' MB';
            }
            if (up && info.last_update) up.textContent = 'Agg. ' + info.last_update;
          });
        })
        .catch(function() {});
    }
    loadChangelog();
  });
});

function loadChangelog() {
  var list = document.getElementById('changelog-list');
  if (!list) return;
  fetch(SITE_BASE + 'changelog.json?v=' + Date.now())
    .then(function(r) { return r.json(); })
    .then(function(entries) {
      var lastThree = entries.slice(-3).reverse();
      list.innerHTML = '';
      lastThree.forEach(function(entry) {
        var row = document.createElement('div');
        row.className = 'changelog-entry';
        var time = document.createElement('time');
        time.className = 'changelog-date';
        time.textContent = entry.date;
        var text = document.createElement('span');
        text.className = 'changelog-text';
        text.textContent = entry.text;
        row.appendChild(time);
        row.appendChild(text);
        list.appendChild(row);
      });
    })
    .catch(function() {
      list.innerHTML = '<p class="changelog-empty">Nessun aggiornamento registrato.</p>';
    });
}
