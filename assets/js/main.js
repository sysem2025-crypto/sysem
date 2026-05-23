const STORAGE_KEYS = {
  users: 'sysem_users',
  sessionEmail: 'sysem_session_email',
  roleChanges: 'sysem_role_changes'
};

const ROLE_LEVEL = { guest: 0, base: 1, pro: 2, admin: 3 };

const NAV_BY_ROLE = {
  guest: [
    { label: 'Sistemi', href: 'sistemi.html' },
    { label: 'Protocolli', href: 'protocolli.html' },
    { label: 'Contatti', href: 'contact.html' }
  ],
  base: [
    { label: 'Sistemi', href: 'sistemi.html' },
    { label: 'Protocolli', href: 'protocolli.html' },
    { label: 'Contatti', href: 'contact.html' }
  ],
  pro: [
    { label: 'Sistemi', href: 'sistemi.html' },
    { label: 'Protocolli', href: 'protocolli.html' },
    { label: 'Contatti', href: 'contact.html' }
  ],
  admin: [
    { label: 'Sistemi', href: 'sistemi.html' },
    { label: 'Protocolli', href: 'protocolli.html' },
    { label: 'Contatti', href: 'contact.html' }
  ]
};

const ROLE_OPTIONS = ['base', 'pro', 'admin'];

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
    return 'index.html';
  }
  if (role === 'base') {
    return 'resource.html';
  }
  return 'index.html';
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

function renderNavigation(currentPage, currentRole) {
  const overlayMenu = document.getElementById('overlay-menu');
  if (!overlayMenu) {
    return;
  }

  const menuList = overlayMenu.querySelector('ul');
  if (!menuList) {
    return;
  }

  const links = NAV_BY_ROLE[currentRole] || NAV_BY_ROLE.guest;
  menuList.innerHTML = '';

  links.forEach(linkData => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = linkData.href;
    link.textContent = linkData.label;
    if (currentPage && linkData.href.includes(currentPage)) {
      link.setAttribute('aria-current', 'page');
    }
    li.appendChild(link);
    menuList.appendChild(li);
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
    authPill.innerHTML = `<span>${currentUser.email} (${currentUser.role})</span><button type="button" id="logout-btn">Logout</button>`;
  } else {
    authPill.innerHTML = '<a href="access.html">Login</a>';
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
        feedback.textContent = 'Inserisci una email valida.';
        return;
      }
      if (password.length < 8) {
        feedback.textContent = 'La password deve avere almeno 8 caratteri.';
        return;
      }

      const users = getUsers();
      const existing = users.find(user => user.email === email);
      if (existing) {
        feedback.textContent = 'Questa email e gia registrata.';
        return;
      }

      users.push({ email, password, role: 'base', createdAt: new Date().toISOString() });
      setUsers(users);
      refreshLoginOptions();
      registerForm.reset();
      feedback.textContent = `Registrazione completata per ${email}. Ruolo assegnato: base.`;
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
      feedback.textContent = 'Utente non trovato.';
      return;
    }
    if (user.password !== password) {
      feedback.textContent = 'Password non corretta.';
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
        feedback.textContent = 'Devi essere autenticato per cambiare password.';
        return;
      }

      const formData = new FormData(changePasswordForm);
      const currentPassword = String(formData.get('currentPassword') || '');
      const newPassword = String(formData.get('newPassword') || '');
      const confirmPassword = String(formData.get('confirmPassword') || '');

      if (user.password !== currentPassword) {
        feedback.textContent = 'Password attuale non valida.';
        return;
      }
      if (newPassword.length < 8) {
        feedback.textContent = 'La nuova password deve avere almeno 8 caratteri.';
        return;
      }
      if (newPassword !== confirmPassword) {
        feedback.textContent = 'Le nuove password non coincidono.';
        return;
      }

      const users = getUsers();
      const target = users.find(item => item.email === user.email);
      if (!target) {
        feedback.textContent = 'Utente non trovato.';
        return;
      }
      target.password = newPassword;
      setUsers(users);
      changePasswordForm.reset();
      feedback.textContent = 'Password aggiornata con successo.';
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
      feedback.textContent = `Nessuna modifica per ${email}.`;
      return;
    }

    if (newRole === 'admin' && !window.confirm(`Confermi promozione admin per ${email}?`)) {
      return;
    }

    users[idx].role = newRole;
    setUsers(users);
    trackRoleChange(email, oldRole, newRole, currentUser ? currentUser.email : 'system');
    feedback.textContent = `Ruolo aggiornato: ${email} -> ${newRole}.`;
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
      saveBtn.textContent = 'Salva';
      saveBtn.addEventListener('click', () => saveRole(user.email, roleSelect.value));
      actionTd.appendChild(saveBtn);

      row.appendChild(emailTd);
      row.appendChild(roleTd);
      row.appendChild(createdTd);
      row.appendChild(actionTd);

      usersBody.appendChild(row);
    });

    if (filteredUsers.length === 0) {
      usersBody.innerHTML = '<tr><td colspan="4">Nessun utente trovato.</td></tr>';
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

  if (currentPage === 'access') {
    window.location.replace('index.html');
    return;
  }

  enforceRouteAccess(requiredRole);
  renderNavigation(currentPage, getCurrentRole());

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
        downloadHref: '/interface-dlms/manual-download-gm.php'
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
        downloadHref: '/interface-dlms/manual-download-rtu.php'
      }
    ];

    const renderActions = program => {
      detailActionsEl.innerHTML = '';
      const link = document.createElement('a');
      link.className = 'btn-download';
      link.href = program.downloadHref;
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
    const diagnosticsUrl = '/interface-dlms/stats.php';

    fetch(diagnosticsUrl, { cache: 'no-store' })
      .then(response => {
        if (!response.ok) {
          throw new Error('Diagnostics not available');
        }
        return response.json();
      })
      .then(data => {
        const manualValue = Number.isFinite(data.manual_downloads) ? data.manual_downloads : '--';
        const autoValue = Number.isFinite(data.automatic_downloads) ? data.automatic_downloads : '--';
        const lastUpdateValue = typeof data.last_update === 'string' && data.last_update.trim()
          ? data.last_update
          : '--';

        manualCountEl.textContent = String(manualValue);
        autoCountEl.textContent = String(autoValue);
        lastUpdateEl.textContent = lastUpdateValue;
      })
      .catch(() => {
        manualCountEl.textContent = '--';
        autoCountEl.textContent = '--';
        lastUpdateEl.textContent = 'n/d';
      });
  }
});
