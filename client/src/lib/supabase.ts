import { createClient } from '@supabase/supabase-js';

/**
 * The single Supabase client for the browser.
 *
 * Uses the ANON (publishable) key. This key is PUBLIC by design: it only
 * grants whatever Row Level Security policies allow. Never put the
 * service-role key here — it would ship to every visitor's browser.
 */

// Read any value from .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// if key values are missing and anon key is used for supabase client
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Copy client/.env.example to ' +
    'client/.env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Keep the user logged in across refreshes (stored in localStorage).
    persistSession: true,
    // Silently refresh the access token before it expires.
    autoRefreshToken: true,
    // Parse tokens from the URL after email links (password reset, magic links).
    detectSessionInUrl: true,
  },
});
