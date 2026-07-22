// Auth Supabase - sostituisce localStorage auth mantenendo stessa interfaccia
(function () {
  'use strict';

  const STORAGE_KEYS = {
    token: 'sysem_token',
    sessionEmail: 'sysem_session_email',
    users: 'sysem_users',
    roleChanges: 'sysem_role_changes'
  };

  const ROLE_LEVEL = { guest: 0, base: 1, pro: 2, admin: 3 };

  // Cache utente corrente
  let currentUserCache = null;
  let currentUserPromise = null;

  // Helpers localStorage (per compatibilità con codice esistente)
  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return fallback; }
  }
  function writeJson(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function normalizeEmail(e) { return String(e || '').trim().toLowerCase(); }

  // Supabase client
  function getSb() {
    if (typeof window.getSupabase === 'function') {
      return window.getSupabase();
    }

    return window.supabaseClient || (window.supabaseClient = supabase.createClient('https://auzzyobxnoliswpvcvsa.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1enp5b2J4bm9saXN3cHZjdnNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNzM4NTIsImV4cCI6MjA4OTc0OTg1Mn0.3t4QxdhjCAIaZ7Ae-29hptAkcDg0vPYjkRPuAkZF7eA'));
  }

  // Cache utente Supabase
  async function getCurrentUserSupabase() {
    if (currentUserCache) return currentUserCache;
    if (currentUserPromise) return currentUserPromise;

    currentUserPromise = (async () => {
      const sb = getSb();
      const { data: { user }, error } = await sb.auth.getUser();
      if (error || !user) {
        currentUserCache = null;
        return null;
      }
      const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single();
      currentUserCache = profile ? { ...profile, email: user.email, id: user.id } : { email: user.email, id: user.id, role: 'user' };
      return currentUserCache;
    })();

    try { return await currentUserPromise; }
    finally { currentUserPromise = null; }
  }

  // Sostituisce getCurrentUser
  window.getCurrentUser = async function () {
    // Prova Supabase prima
    const user = await getCurrentUserSupabase();
    if (user) return user;

    // Fallback localStorage per compatibilità
    const email = normalizeEmail(localStorage.getItem('sysem_session_email'));
    if (!email) return null;
    const users = readJson('sysem_users', []);
    return users.find(u => u.email === email) || null;
  };

  // Sostituisce getCurrentRole
  window.getCurrentRole = async function () {
    const user = await window.getCurrentUser();
    return user ? user.role : 'guest';
  };

  // Sostituisce getCachedUser / setCachedUser
  window.getCachedUser = function () { return readJson('sysem_cached_user', null); };
  window.setCachedUser = function (user) {
    if (user) writeJson('sysem_cached_user', user);
    else localStorage.removeItem('sysem_cached_user');
  };

  // Sostituisce hasRoleAccess
  window.hasRoleAccess = function (current, required) {
    return (ROLE_LEVEL[current] || 0) >= (ROLE_LEVEL[required] || 0);
  };

  // Sostituisce getAllowedLanding
  window.getAllowedLanding = function (role) {
    if (role === 'admin') return 'admin.html';
    if (role === 'pro' || role === 'base') return 'resource.html';
    return 'access.html';
  };

  // Sostituisce enforceRouteAccess
  window.enforceRouteAccess = async function (requiredRole) {
    const role = await window.getCurrentRole();
    if (requiredRole === 'guest') return;
    if (!window.hasRoleAccess(role, requiredRole)) {
      const dest = window.getAllowedLanding(role);
      const returnUrl = window.location.pathname + window.location.search;
      window.location.href = dest + (dest.includes('?') ? '&' : '?') + 'return=' + encodeURIComponent(returnUrl);
    }
  };

  // Login con Supabase
  window.supabaseLogin = async function (email, password) {
    const sb = getSb();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    currentUserCache = null; // invalida cache
    return data;
  };

  // Register con Supabase
  window.supabaseRegister = async function (email, password, name) {
    const sb = getSb();
    const { data, error } = await sb.auth.signUp({
      email, password,
      options: { data: { full_name: name } }
    });
    if (error) throw error;
    return data;
  };

  // Logout Supabase
  window.supabaseLogout = async function () {
    const sb = getSb();
    await sb.auth.signOut();
    currentUserCache = null;
    localStorage.removeItem('sysem_cached_user');
    localStorage.removeItem('sysem_token');
    localStorage.removeItem('sysem_session_email');
  };

  // Inizializzazione auth state change
  function initAuthListener() {
    const sb = getSb();
    sb.auth.onAuthStateChange((event, session) => {
      currentUserCache = null;
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('sysem_cached_user');
        localStorage.removeItem('sysem_token');
        localStorage.removeItem('sysem_session_email');
      }
    });
  }

  // Esporta funzioni globali per compatibilità
  window.readJson = function (k, f) { try { return JSON.parse(localStorage.getItem(k)); } catch { return f; } };
  window.writeJson = function (k, v) { localStorage.setItem(k, JSON.stringify(v)); };
  window.normalizeEmail = function (e) { return String(e || '').trim().toLowerCase(); };

  // Avvia listener
  document.addEventListener('DOMContentLoaded', initAuthListener);

  console.log('[Auth Supabase] Modulo caricato');
})();
