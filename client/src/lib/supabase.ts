// Import createClient from the Supabase JavaScript SDK.
// This creates a client instance that connects to our Supabase project.
import { createClient } from '@supabase/supabase-js';

/**
 * The single Supabase client for the browser.
 *
 * Uses the ANON (publishable) key. This key is PUBLIC by design: it only
 * grants whatever Row Level Security policies allow. Never put the
 * service-role key here — it would ship to every visitor's browser.
 */

// Read environment variables from Vite's import.meta.env.
// Variables prefixed with VITE_ are exposed to the client-side code.
// 'import.meta.env' is Vite's way of accessing .env file values.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Safety check — crash early if env vars are missing.
// This prevents cryptic errors later when Supabase calls fail silently.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Copy client/.env.example to ' +
    'client/.env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
  );
}

// Create and export the Supabase client instance.
// This is a singleton — imported wherever Supabase access is needed.
// Configuration options:
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 'persistSession: true' — store the user's session in localStorage
    // so they stay logged in when they close and reopen the browser.
    persistSession: true,

    // 'autoRefreshToken: true' — automatically refresh the JWT before it expires.
    // The Supabase SDK handles this behind the scenes so the user never gets
    // logged out unexpectedly.
    autoRefreshToken: true,

    // 'detectSessionInUrl: true' — parse tokens from the URL after email actions.
    // When a user clicks a password reset link, Supabase puts tokens in the URL.
    // This option automatically reads them and establishes the session.
    detectSessionInUrl: true,
  },
});
