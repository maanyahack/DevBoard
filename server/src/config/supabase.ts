import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

/**
 * Admin Supabase client for the SERVER ONLY.
 *
 * Uses the SERVICE ROLE key, which bypasses Row Level Security entirely.
 * This must never reach the browser. We disable session persistence and
 * auto-refresh because the server is stateless — it does not "log in" as a
 * user; it acts with elevated privileges per request.
 */
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
