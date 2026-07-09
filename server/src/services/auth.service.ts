import { supabaseAdmin } from '../config/supabase.js';
import type { User } from '@supabase/supabase-js';

/**
 * Verify a Supabase access token (JWT) sent by the client and return the user.
 *
 * The frontend authenticates directly with Supabase and receives a JWT. When
 * it calls OUR API, it sends that token as `Authorization: Bearer <token>`.
 * We hand the token to Supabase to validate its signature and expiry; if valid
 * we get the authenticated user back, otherwise null.
 *
 * The auth middleware (Feature 3) uses this to protect routes.
 */
export async function getUserFromToken(token: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return null;
  }
  return data.user;
}
