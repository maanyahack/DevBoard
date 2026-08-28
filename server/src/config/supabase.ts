// Import the createClient function from the Supabase JavaScript SDK.
// This function creates a client instance that can talk to a Supabase project.
import { createClient } from '@supabase/supabase-js';

// Import our validated env config to access Supabase URLs and keys.
import { env } from './env.js';

/**
 * Admin Supabase client for the SERVER ONLY.
 *
 * Uses the SERVICE ROLE key, which bypasses Row Level Security entirely.
 * This must never reach the browser. We disable session persistence and
 * auto-refresh because the server is stateless — it does not "log in" as a
 * user; it acts with elevated privileges per request.
 */

// Create and export the Supabase client configured for server-side admin use.
// This client has full database access regardless of who the user is.
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  // Options object for configuring client behavior:
  auth: {
    // 'autoRefreshToken: false' — The server doesn't need to automatically
    // refresh auth tokens. The server is stateless; it receives a fresh
    // token with each request and verifies it on the spot.
    autoRefreshToken: false,

    // 'persistSession: false' — The server doesn't store the user's session
    // in localStorage or any storage. Unlike the browser client, the server
    // doesn't maintain a login session between requests.
    persistSession: false,
  },
});
