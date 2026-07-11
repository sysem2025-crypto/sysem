// Supabase Client per SYSEM (static hosting compatible)
(() => {
  const SUPABASE_URL = "https://auzzyobxnoliswpvcvsa.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1enp5b2J4bm9saXN3cHZjdnNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNzI4MDAsImV4cCI6MjA1ODk0ODgwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8"; // TODO: sostituisci con la tua anon key reale

  let supabaseClient = null;

  function getSupabase() {
    if (!supabaseClient) {
      supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      window.supabaseClient = supabaseClient;
    }

    return supabaseClient;
  }

  async function signUp(email, password, name) {
    const sb = getSupabase();
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/index.html`
      }
    });

    return { data, error };
  }

  async function signIn(email, password) {
    const sb = getSupabase();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    return { data, error };
  }

  async function signOut() {
    const sb = getSupabase();
    const { error } = await sb.auth.signOut();
    return { error };
  }

  async function getUser() {
    const sb = getSupabase();
    const {
      data: { user },
      error
    } = await sb.auth.getUser();

    return { user, error };
  }

  async function getSession() {
    const sb = getSupabase();
    const {
      data: { session },
      error
    } = await sb.auth.getSession();

    return { session, error };
  }

  function onAuthStateChange(callback) {
    const sb = getSupabase();
    return sb.auth.onAuthStateChange(callback);
  }

  async function getProfile(userId) {
    const sb = getSupabase();
    const { data, error } = await sb.from("profiles").select("*").eq("id", userId).single();
    return { data, error };
  }

  async function hasRole(userId, roles) {
    const { data, error } = await getProfile(userId);
    if (error || !data) return false;
    return roles.includes(data.role);
  }

  window.getSupabase = getSupabase;
  window.signUp = signUp;
  window.signIn = signIn;
  window.signOut = signOut;
  window.getUser = getUser;
  window.getSession = getSession;
  window.onAuthStateChange = onAuthStateChange;
  window.getProfile = getProfile;
  window.hasRole = hasRole;
})();
