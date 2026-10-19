// Import Express types for middleware function signatures.
// 'type' keyword means we only need these at compile time for type-checking,
// not at runtime — this keeps the bundle smaller.
import type { NextFunction, Request, Response } from 'express';

// Import the User type from Supabase — represents an authenticated user
// with properties like id, email, user_metadata, etc.
import type { User } from '@supabase/supabase-js';

// Import our custom HttpError class for throwing HTTP-specific errors.
import { HttpError } from './error.middleware.js';

// Import the function that verifies a JWT token and returns the user.
import { getUserFromToken } from '../services/auth.service.js';

/**
 * AuthenticatedRequest extends Express's built-in Request to include
 * an optional 'user' property. After the auth middleware runs successfully,
 * 'req.user' will contain the authenticated Supabase user object.
 *
 * We use 'interface' (not 'type') because we're extending an existing type.
 * This is a TypeScript interface — it defines the shape/contract of an object.
 */
export interface AuthenticatedRequest extends Request {
  user?: User;  // The '?' makes it optional — it's undefined until middleware sets it.
}

/**
 * requireAuth — middleware that verifies the caller is authenticated.
 *
 * It extracts the JWT from the Authorization header, verifies it with
 * Supabase, and attaches the user to the request. If anything fails,
 * it calls next() with an HttpError instead of sending a response directly.
 *
 * This middleware is used on protected routes — e.g., any route that
 * requires the user to be logged in.
 */
export async function requireAuth(
  req: Request,       // The incoming HTTP request
  _res: Response,     // The response (prefixed with _ because we don't use it directly)
  next: NextFunction, // Function to call when middleware is done (pass error or continue)
): Promise<void> {    // Returns a Promise because we use 'await' inside
  try {
    // Extract the 'authorization' header from the request.
    // It looks like: "Bearer eyJhbGciOiJIUzI1NiIs..."
    const authorizationHeader = req.header('authorization');

    // Split the header into two parts: the scheme ("Bearer") and the token.
    // '.trim()' removes whitespace, '.split(/\s+/, 2)' splits on whitespace
    // into at most 2 parts. The '?? []' provides a fallback empty array
    // if authorizationHeader is undefined (so .split() doesn't crash).
    const [scheme, token] = authorizationHeader?.trim().split(/\s+/, 2) ?? [];

    // If there's no header, or it doesn't start with "Bearer", or there's
    // no token after "Bearer", send a 401 error and stop processing.
    if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
      next(new HttpError(401, 'Missing or invalid Authorization header', 'Unauthorized'));
      return;  // Stop — don't call next() again, don't send a response.
    }

    // Verify the JWT token with Supabase. If valid, returns the User object.
    // If invalid/expired, returns null.
    const user = await getUserFromToken(token);

    // If token verification failed (user is null), send a 401 error.
    if (!user) {
      next(new HttpError(401, 'Invalid or expired token', 'Unauthorized'));
      return;
    }

    // Token is valid! Attach the user to the request object.
    // We cast 'req' to AuthenticatedRequest because Express's base Request
    // type doesn't have a 'user' property — our custom interface adds it.
    (req as AuthenticatedRequest).user = user;

    // Call next() with no arguments to continue to the next middleware
    // or the actual route handler. The request now carries req.user.
    next();
  } catch (error) {
    // If anything unexpected goes wrong (network error, Supabase down, etc.),
    // pass the error to Express's error handler via next().
    next(error);
  }
}
