const STORAGE_KEYS = {
  users: 'sysem_users',
  sessionEmail: 'sysem_session_email',
  roleChanges: 'sysem_role_changes'
};

const ROLE_LEVEL = { guest: 0, base: 1, pro: 2, admin: 3 };

const LANG_KEY = 'sysem_lang';
let currentLang = 'it';
let translations = {};

async function initI18n() {
  currentLang = localStorage.getItem(LANG_KEY) || 'it';
  await loadLang(currentLang);
  applyTranslations();
  renderLangSwitcher();
  document.documentElement.lang = currentLang === 'en' ? 'en' : 'it';
}

async function loadLang(lang) {
  if (lang === 'it') {
    translations = {
      "common": {
        "login": "Login", "logout": "Logout", "save": "Salva", "email": "Email",
        "password": "Password", "role": "Ruolo", "actions": "Azione",
        "searchEmail": "Cerca per email", "allRoles": "Tutti i ruoli",
        "noUsers": "Nessun utente trovato.", "user": "Utente", "signin": "Accedi",
        "authorizedOnly": "Solo utenti autorizzati.", "openMenu": "Apri menu", "homeLabel": "SYSEM home"
      },
      "nav": {
        "systema": "Systema", "datacenter": "Datacenter comunicazione dati",
        "tiketing": "Tiketing", "ticketing": "Sistema di ticketing",
        "sysem": "Sysem",
        "sistemi": "Sistemi", "download": "Download applicativi", "about": "Studio Tecnico Informatico",
        "sensori": "Sensori", "compressione": "Compressione", "protocolli": "Protocolli",
        "normative": "Normative", "guidaNorme": "Guida norme", "ai": "Intelligenza Artificiale", "contatti": "Contatti"
      },
      "auth": {
        "loginTitle": "Login", "loginDesc": "Inserisci le credenziali per entrare nell'area riservata.",
        "loginLabel": "Utente", "passwordLabel": "Password", "signinBtn": "Accedi",
        "invalidEmail": "Inserisci una email valida.", "passwordLength": "La password deve avere almeno 8 caratteri.",
        "emailExists": "Questa email è già registrata.",
        "registered": "Registrazione completata per {email}. Ruolo assegnato: base.",
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
        "noUsers": "Nessun utente trovato.", "noChange": "Nessuna modifica per {email}.",
        "confirmPromotion": "Confermi promozione admin per {email}?", "roleUpdated": "Ruolo aggiornato: {email} -> {newRole}.",
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
        "datacenter": { "overline": "Infrastruttura", "title": "Datacenter comunicazione dati", "metaTitle": "Datacenter" },
        "ticketing": { "overline": "Gestione", "title": "Sistema di Ticketing", "metaTitle": "Ticketing" },
        "download": { "overline": "Software operativi", "title": "Download applicativi", "metaTitle": "Download applicativi" },
        "resource": { "overline": "Learning & Assets", "title": "Resource", "metaTitle": "Resource" },
        "access": { "overline": "Area riservata", "title": "Accesso", "metaTitle": "Accesso" },
        "programAccess": { "overline": "Program access", "title": "Accesso Programma", "metaTitle": "Program Access" },
        "admin": { "overline": "Controllo accessi", "title": "Gestione Accessi", "metaTitle": "Admin Accessi" },
        "contact": { "overline": "Get in touch", "title": "Contact", "metaTitle": "Contact" }
      }
    };
    return;
  }
  try {
    const resp = await fetch(`assets/lang/${lang}.json?v=20260601`);
    translations = await resp.json();
  } catch {
    await loadLang('it');
  }
}

function t(key, fallback) {
  const val = key.split('.').reduce((obj, k) => obj && obj[k], translations);
  return val || fallback || key;
}

function formatT(key, vars) {
  let val = key.split('.').reduce((obj, k) => obj && obj[k], translations);
  if (!val) val = key;
  Object.keys(vars || {}).forEach(k => { val = val.replace(`{${k}}`, vars[k]); });
  return val;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const finalText = t(key);
    const tag = el.tagName;
    if (tag === 'TITLE') {
      el.textContent = `${finalText} | SYSEM`;
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
  let switcher = document.getElementById('lang-switcher');
  if (!switcher) {
    switcher = document.createElement('div');
    switcher.id = 'lang-switcher';
    switcher.className = 'lang-switcher';
    ['it', 'en'].forEach(code => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lang-btn';
      btn.dataset.lang = code;
      btn.textContent = code.toUpperCase();
      btn.setAttribute('aria-label', t(`lang.${code}`, code.toUpperCase()));
      btn.addEventListener('click', () => setLang(code));
      switcher.appendChild(btn);
    });
    navContainer.insertBefore(switcher, navContainer.firstChild);
  }
  switcher.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}

async function setLang(lang) {
  if (lang === currentLang) return;
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);
  await loadLang(lang);
  document.documentElement.lang = lang === 'en' ? 'en' : 'it';
  applyTranslations();
  renderLangSwitcher();
  const currentRole = getCurrentRole();
  updateNavLabels(currentRole);
  updateAuthPill();
}

function updateNavLabels() {
  const menuList = document.querySelector('#overlay-menu ul');
  if (!menuList) return;
  menuList.querySelectorAll('.nav-cat-label').forEach(el => {
    const key = el.dataset.i18nCat;
    if (key) el.textContent = t(key);
  });
  menuList.querySelectorAll('.nav-sub a').forEach(a => {
    const key = a.dataset.i18nItem;
    if (key) a.textContent = t(key);
  });
}

function updateAuthPill() {
  const authPill = document.getElementById('auth-pill');
  if (!authPill) return;
  const currentUser = getCurrentUser();
  if (currentUser) {
    const span = authPill.querySelector('span');
    const btn = authPill.querySelector('button');
    if (span) span.textContent = `${currentUser.email} (${currentUser.role})`;
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

function getUsers() {
  return readJson(STORAGE_KEYS.users, []);
}

function setUsers(users) {
  writeJson(STORAGE_KEYS.users, users);
}

function getCurrentUser() {
  const email = normalizeEmail(localStorage.getItem(STORAGE_KEYS.sessionEmail));
  if (!email) {
    return null;
  }
  const users = getUsers();
  return users.find(user => user.email === email) || null;
}

function getCurrentRole() {
  const currentUser = getCurrentUser();
  return currentUser ? currentUser.role : 'guest';
}

function hasRoleAccess(currentRole, requiredRole) {
  const current = ROLE_LEVEL[currentRole] || 0;
  const required = ROLE_LEVEL[requiredRole] || 0;
  return current >= required;
}

function getAllowedLanding(role) {
  if (role === 'admin') {
    return 'admin.html';
  }
  if (role === 'pro') {
    return 'resource.html';
  }
  if (role === 'base') {
    return 'resource.html';
  }
  return 'access.html';
}

function ensureDefaultAdminUser() {
  const users = getUsers();
  const defaultAdminEmail = 'gianluca.piga@sysem.it';
  const defaultAdmin = users.find(user => user.email === defaultAdminEmail);
  const defaultAdminPassword = 'ChangeMe123!';
  if (defaultAdmin) {
    if (defaultAdmin.role !== 'admin') {
      defaultAdmin.role = 'admin';
    }
    if (!defaultAdmin.password) {
      defaultAdmin.password = defaultAdminPassword;
    }
    setUsers(users);
    return;
  }
  users.push({
    email: defaultAdminEmail,
    role: 'admin',
    password: defaultAdminPassword,
    createdAt: new Date().toISOString()
  });
  setUsers(users);
}

const NAV_STRUCTURE = [
  { categoryKey: 'nav.systema', items: [
    { labelKey: 'nav.datacenter', href: 'datacenter.html' }
  ]},
  { categoryKey: 'nav.tiketing', items: [
    { labelKey: 'nav.ticketing', href: 'ticketing.html' }
  ]},
  { categoryKey: 'nav.sysem', items: [
    { labelKey: 'nav.sistemi', href: 'sistemi.html' },
    { labelKey: 'nav.download', href: 'download-applicativi.html' },
    { labelKey: 'nav.about', href: 'about.html' },
    { labelKey: 'nav.sensori', href: 'sensori-caratterizzazione.html' },
    { labelKey: 'nav.compressione', href: 'formule-compressione.html' },
    { labelKey: 'nav.protocolli', href: 'protocolli.html' },
    { labelKey: 'nav.normative', href: 'normative.html' },
    { labelKey: 'nav.guidaNorme', href: 'guida-applicazione-norme.html' },
    { labelKey: 'nav.ai', href: 'ai.html' },
    { labelKey: 'nav.contatti', href: 'contact.html' }
  ]}
];

const ROLE_OPTIONS = ['base', 'pro', 'admin'];

function generateDownloadToken() {
  const user = getCurrentUser();
  if (!user) return '';
  return btoa(user.email + '|' + user.role + '|' + new Date().toISOString().slice(0, 10));
}

function renderNavigation(currentPage) {
  const overlayMenu = document.getElementById('overlay-menu');
  if (!overlayMenu) {
    return;
  }
  const menuList = overlayMenu.querySelector('ul');
  if (!menuList) {
    return;
  }
  menuList.innerHTML = '';
  NAV_STRUCTURE.forEach(group => {
    const catLi = document.createElement('li');
    catLi.className = 'nav-category';
    const span = document.createElement('span');
    span.className = 'nav-cat-label';
    span.dataset.i18nCat = group.categoryKey;
    span.textContent = t(group.categoryKey);
    catLi.appendChild(span);
    menuList.appendChild(catLi);
    group.items.forEach(item => {
      const itemLi = document.createElement('li');
      itemLi.className = 'nav-sub';
      const link = document.createElement('a');
      link.href = item.href;
      link.dataset.i18nItem = item.labelKey;
      link.textContent = t(item.labelKey);
      if (currentPage && item.href.includes(currentPage)) {
        link.setAttribute('aria-current', 'page');
      }
      itemLi.appendChild(link);
      menuList.appendChild(itemLi);
    });
  });
  const topNavContainer = document.querySelector('.nav-container');
  if (!topNavContainer) {
    return;
  }
  const oldAuth = document.getElementById('auth-pill');
  if (oldAuth) {
    oldAuth.remove();
  }
  const currentUser = getCurrentUser();
  const authPill = document.createElement('div');
  authPill.id = 'auth-pill';
  authPill.className = 'auth-pill';
  if (currentUser) {
    authPill.innerHTML = `<span>${currentUser.email} (${currentUser.role})</span><button type="button" id="logout-btn">${t('common.logout')}</button>`;
  } else {
    authPill.innerHTML = `<a href="access.html">${t('common.login')}</a>`;
  }
  topNavContainer.appendChild(authPill);
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEYS.sessionEmail);
      window.location.href = 'index.html';
    });
  }
}

function enforceRouteAccess(requiredRole) {
  const currentRole = getCurrentRole();
  if (requiredRole === 'guest') {
    return;
  }
  if (!hasRoleAccess(currentRole, requiredRole)) {
    window.location.href = getAllowedLanding(currentRole);
  }
}

function tFeedback(key, vars) {
  return formatT(key, vars);
}

function initAccessPage() {
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const loginEmailField = document.getElementById('login-email');
  const loginEmailList = document.getElementById('login-email-list');
  const loginPasswordInput = document.getElementById('login-password');
  const changePasswordCard = document.getElementById('change-password-card');
  const changePasswordForm = document.getElementById('change-password-form');
  const feedback = document.getElementById('auth-feedback');
  if (!loginForm || !loginEmailField || !loginPasswordInput || !feedback) {
    return;
  }
  const currentUser = getCurrentUser();
  if (changePasswordCard && currentUser) {
    changePasswordCard.hidden = false;
  }
  const refreshLoginOptions = () => {
    const users = getUsers();
    if (loginEmailField instanceof HTMLSelectElement) {
      loginEmailField.innerHTML = '';
      users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.email;
        option.textContent = `${user.email} (${user.role})`;
        loginEmailField.appendChild(option);
      });
      if (users.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Nessun utente registrato';
        loginEmailField.appendChild(option);
      }
      return;
    }
    if (loginEmailList instanceof HTMLDataListElement) {
      loginEmailList.innerHTML = '';
      users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.email;
        loginEmailList.appendChild(option);
      });
    }
  };
  if (registerForm) {
    registerForm.addEventListener('submit', event => {
      event.preventDefault();
      const formData = new FormData(registerForm);
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
      const users = getUsers();
      const existing = users.find(user => user.email === email);
      if (existing) {
        feedback.textContent = tFeedback('auth.emailExists');
        return;
      }
      users.push({ email, password, role: 'base', createdAt: new Date().toISOString() });
      setUsers(users);
      refreshLoginOptions();
      registerForm.reset();
      feedback.textContent = tFeedback('auth.registered', { email });
    });
  }
  loginForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const email = normalizeEmail(formData.get('email'));
    const password = String(formData.get('password') || '');
    const users = getUsers();
    const user = users.find(item => item.email === email);
    if (!user) {
      feedback.textContent = tFeedback('auth.userNotFound');
      return;
    }
    if (user.password !== password) {
      feedback.textContent = tFeedback('auth.wrongPassword');
      return;
    }
    localStorage.setItem(STORAGE_KEYS.sessionEmail, user.email);
    window.location.href = getAllowedLanding(user.role);
  });
  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', event => {
      event.preventDefault();
      const user = getCurrentUser();
      if (!user) {
        feedback.textContent = tFeedback('auth.mustLogin');
        return;
      }
      const formData = new FormData(changePasswordForm);
      const currentPassword = String(formData.get('currentPassword') || '');
      const newPassword = String(formData.get('newPassword') || '');
      const confirmPassword = String(formData.get('confirmPassword') || '');
      if (user.password !== currentPassword) {
        feedback.textContent = tFeedback('auth.wrongCurrentPassword');
        return;
      }
      if (newPassword.length < 8) {
        feedback.textContent = tFeedback('auth.passwordLength');
        return;
      }
      if (newPassword !== confirmPassword) {
        feedback.textContent = tFeedback('auth.passwordMismatch');
        return;
      }
      const users = getUsers();
      const target = users.find(item => item.email === user.email);
      if (!target) {
        feedback.textContent = tFeedback('auth.userNotFound');
        return;
      }
      target.password = newPassword;
      setUsers(users);
      changePasswordForm.reset();
      feedback.textContent = tFeedback('auth.passwordUpdated');
    });
  }
  refreshLoginOptions();
}

function initAdminPage() {
  const usersBody = document.getElementById('admin-users-body');
  const searchInput = document.getElementById('admin-search');
  const roleFilter = document.getElementById('admin-role-filter');
  const feedback = document.getElementById('admin-feedback');
  if (!usersBody || !searchInput || !roleFilter || !feedback) {
    return;
  }
  const trackRoleChange = (targetUserEmail, oldRole, newRole, changedBy) => {
    const roleChanges = readJson(STORAGE_KEYS.roleChanges, []);
    roleChanges.push({
      targetUserEmail,
      oldRole,
      newRole,
      changedBy,
      changedAt: new Date().toISOString()
    });
    writeJson(STORAGE_KEYS.roleChanges, roleChanges);
  };
  const saveRole = (email, newRole) => {
    const users = getUsers();
    const currentUser = getCurrentUser();
    const idx = users.findIndex(user => user.email === email);
    if (idx < 0) {
      return;
    }
    const oldRole = users[idx].role;
    if (oldRole === newRole) {
      feedback.textContent = tFeedback('admin.noChange', { email });
      return;
    }
    if (newRole === 'admin' && !window.confirm(tFeedback('admin.confirmPromotion', { email }))) {
      return;
    }
    users[idx].role = newRole;
    setUsers(users);
    trackRoleChange(email, oldRole, newRole, currentUser ? currentUser.email : 'system');
    feedback.textContent = tFeedback('admin.roleUpdated', { email, newRole });
    renderTable();
  };
  const renderTable = () => {
    const search = searchInput.value.trim().toLowerCase();
    const filter = roleFilter.value;
    const filteredUsers = getUsers().filter(user => {
      const matchesSearch = user.email.includes(search);
      const matchesRole = filter === 'all' || user.role === filter;
      return matchesSearch && matchesRole;
    });
    usersBody.innerHTML = '';
    filteredUsers.forEach(user => {
      const row = document.createElement('tr');
      const emailTd = document.createElement('td');
      emailTd.textContent = user.email;
      const roleTd = document.createElement('td');
      const roleSelect = document.createElement('select');
      ROLE_OPTIONS.forEach(role => {
        const opt = document.createElement('option');
        opt.value = role;
        opt.textContent = role;
        opt.selected = user.role === role;
        roleSelect.appendChild(opt);
      });
      roleTd.appendChild(roleSelect);
      const createdTd = document.createElement('td');
      createdTd.textContent = new Date(user.createdAt).toLocaleString('it-IT');
      const actionTd = document.createElement('td');
      const saveBtn = document.createElement('button');
      saveBtn.type = 'button';
      saveBtn.className = 'btn-download admin-save-btn';
      saveBtn.textContent = t('admin.saveBtn');
      saveBtn.addEventListener('click', () => saveRole(user.email, roleSelect.value));
      actionTd.appendChild(saveBtn);
      row.appendChild(emailTd);
      row.appendChild(roleTd);
      row.appendChild(createdTd);
      row.appendChild(actionTd);
      usersBody.appendChild(row);
    });
    if (filteredUsers.length === 0) {
      usersBody.innerHTML = '<tr><td colspan="4">' + t('admin.noUsers') + '</td></tr>';
    }
  };
  searchInput.addEventListener('input', renderTable);
  roleFilter.addEventListener('change', renderTable);
  renderTable();
}

document.addEventListener('DOMContentLoaded', () => {
  ensureDefaultAdminUser();
  const body = document.body;
  const currentPage = body.dataset.page || '';
  const requiredRole = body.dataset.requiredRole || 'base';
  if (currentPage === 'access' && getCurrentUser()) {
    window.location.replace('index.html');
    return;
  }
  enforceRouteAccess(requiredRole);
  initI18n().then(() => {
    renderNavigation(currentPage);
    const menuToggle = document.getElementById('menu-toggle');
    const overlayMenu = document.getElementById('overlay-menu');
    if (menuToggle && overlayMenu) {
      menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        overlayMenu.classList.toggle('active');
        body.style.overflow = overlayMenu.classList.contains('active') ? 'hidden' : '';
      });
      const menuLinks = overlayMenu.querySelectorAll('a');
      menuLinks.forEach(link => {
        link.addEventListener('click', () => {
          menuToggle.classList.remove('active');
          overlayMenu.classList.remove('active');
          body.style.overflow = '';
        });
      });
    }
    initAccessPage();
    initAdminPage();
    const resourceSelectEl = document.getElementById('resource-select');
    const detailTitleEl = document.getElementById('resource-detail-title');
    const detailDescriptionEl = document.getElementById('resource-detail-description');
    const detailMetaEl = document.getElementById('resource-detail-meta');
    const detailActionsEl = document.getElementById('resource-detail-actions');
    const diagnosticsEl = document.getElementById('resource-diagnostics');
    const manualCountEl = document.getElementById('manual-download-count');
    const autoCountEl = document.getElementById('auto-download-count');
    const lastUpdateEl = document.getElementById('diag-last-update');
    if (resourceSelectEl && detailTitleEl && detailDescriptionEl && detailMetaEl && detailActionsEl && diagnosticsEl) {
      const programs = [
        {
          id: 'genius-monitor',
          title: 'GeniusMonitor',
          description: '',
          meta: [
            ['Tipologia', 'Software desktop'],
            ['Formato', 'Installer .exe'],
            ['Compatibilita', 'Windows 10/11'],
            ['Canale', 'Release stabile']
          ],
          downloadHref: 'interface-dlms/manual-download-gm.php'
        },
        {
          id: 'rtu-terminal',
          title: 'RTU Terminal',
          description: '',
          meta: [
            ['Tipologia', 'Software desktop'],
            ['Formato', 'Installer .exe'],
            ['Compatibilita', 'Windows 10/11'],
            ['Canale', 'Release stabile']
          ],
          downloadHref: 'interface-dlms/manual-download-rtu.php'
        }
      ];
      const renderActions = program => {
        detailActionsEl.innerHTML = '';
        const link = document.createElement('a');
        link.className = 'btn-download';
        const token = generateDownloadToken();
        link.href = token ? program.downloadHref + '?token=' + encodeURIComponent(token) : program.downloadHref;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = `Download ${program.title}`;
        detailActionsEl.appendChild(link);
      };
      const renderMeta = program => {
        detailMetaEl.innerHTML = '';
        program.meta.forEach(entry => {
          const row = document.createElement('p');
          row.className = 'resource-meta-line';
          const label = document.createElement('span');
          label.className = 'resource-meta-label';
          label.textContent = `${entry[0]}:`;
          const value = document.createElement('strong');
          value.className = 'resource-meta-value';
          value.textContent = entry[1];
          row.appendChild(label);
          row.appendChild(document.createTextNode(' '));
          row.appendChild(value);
          detailMetaEl.appendChild(row);
        });
      };
      const selectProgram = programId => {
        const selected = programs.find(item => item.id === programId);
        if (!selected) {
          return;
        }
        const description = typeof selected.description === 'string' ? selected.description.trim() : '';
        detailTitleEl.textContent = selected.title;
        detailDescriptionEl.textContent = description;
        detailDescriptionEl.hidden = description.length === 0;
        renderMeta(selected);
        diagnosticsEl.hidden = false;
        renderActions(selected);
        resourceSelectEl.value = selected.id;
      };
      programs.forEach(program => {
        const option = document.createElement('option');
        option.value = program.id;
        option.textContent = program.title;
        resourceSelectEl.appendChild(option);
      });
      resourceSelectEl.addEventListener('change', event => {
        const target = event.target;
        if (!(target instanceof HTMLSelectElement)) {
          return;
        }
        selectProgram(target.value);
      });
      selectProgram(programs[0].id);
    }
    if (manualCountEl && autoCountEl && lastUpdateEl) {
      var diagUrl = 'interface-dlms/stats.php';
      var diagToken = generateDownloadToken();
      if (diagToken) diagUrl += '?token=' + encodeURIComponent(diagToken);
      fetch(diagUrl, { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
        .then(function (data) {
          manualCountEl.textContent = Number.isFinite(data.manual_downloads) ? String(data.manual_downloads) : '--';
          autoCountEl.textContent = Number.isFinite(data.automatic_downloads) ? String(data.automatic_downloads) : '--';
          lastUpdateEl.textContent = data.last_update && data.last_update.trim() ? data.last_update : '--';
        })
        .catch(function () {
          manualCountEl.textContent = '--';
          autoCountEl.textContent = '--';
          lastUpdateEl.textContent = 'n/d';
        });
    }
  });
});
