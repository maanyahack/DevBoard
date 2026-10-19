// Import the Supabase admin client (server-side, bypasses Row Level Security).
import { supabaseAdmin } from '../config/supabase.js';

// Import the User type from Supabase — represents an authenticated user.
// 'type' keyword means it's only used at compile-time for TypeScript type-checking.
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
  // Call Supabase's built-in JWT verification. This checks:
  // 1. The token's signature matches Supabase's secret key
  // 2. The token hasn't expired
  // 3. The token was issued by this Supabase project
  const { data, error } = await supabaseAdmin.auth.getUser(token);

  // If verification failed (expired, tampered, invalid) or no user returned,
  // return null to signal the token is invalid.
  if (error || !data.user) {
    return null;
  }

  // Token is valid — return the full User object containing id, email,
  // user_metadata, app_metadata, and other Supabase user fields.
  return data.user;
}
