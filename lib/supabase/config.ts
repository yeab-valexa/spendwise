// Public Supabase config. NEXT_PUBLIC_* vars are inlined into the client bundle
// at build time and also available on the server at runtime.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

// Accepts both the newer "publishable" key (sb_publishable_…) and the legacy
// "anon public" key — both are safe to expose in the browser.
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

// True once both values are filled in (see .env.local). Until then the app
// shows a friendly setup screen instead of trying to connect.
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
