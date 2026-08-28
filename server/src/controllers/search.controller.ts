// Import Express types for handler signatures.
import type { NextFunction, Request, Response } from 'express';
// Import Zod for query parameter validation.
import { z } from 'zod';
// Import User type for the authenticated user.
import type { User } from '@supabase/supabase-js';
// Import HttpError for throwing typed HTTP errors.
import { HttpError } from '../middleware/error.middleware.js';
// Import AuthenticatedRequest type.
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
// Import the global search service function.
import { globalSearch } from '../services/search.service.js';

// Zod schema for validating query string parameters.
// Unlike body schemas, this validates req.query (URL query parameters).
const searchQuerySchema = z.object({
  // 'q' is the search query string. Trimmed, max 120 chars, defaults to empty string.
  q: z.string().trim().max(120).default(''),
});

// Helper — extracts and validates the authenticated user.
function getAuthenticatedUser(req: Request): User {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    throw new HttpError(401, 'Authentication required', 'Unauthorized');
  }
  return user;
}

/**
 * GET /api/search?q=term — global search across all modules.
 * Searches projects, tasks, notes, bookmarks, and knowledge entries.
 * Returns results grouped by category: { projects: [...], tasks: [...], ... }
 */
export async function getGlobalSearch(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);
    // Validate the query parameter. req.query is the parsed URL query string.
    const query = searchQuerySchema.parse(req.query);
    // Pass the validated search term to the search service.
    const results = await globalSearch(user.id, query.q);

    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
}
