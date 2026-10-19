// Import Express types for handler signatures.
import type { NextFunction, Request, Response } from 'express';
// Import User type for the authenticated user.
import type { User } from '@supabase/supabase-js';
// Import HttpError for throwing typed HTTP errors.
import { HttpError } from '../middleware/error.middleware.js';
// Import AuthenticatedRequest type.
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
// Import the activity listing service function.
import { listActivities } from '../services/activity.service.js';

// Helper — extracts and validates the authenticated user.
function getAuthenticatedUser(req: Request): User {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    throw new HttpError(401, 'Authentication required', 'Unauthorized');
  }
  return user;
}

/**
 * GET /api/activity — fetch the user's recent activity feed.
 * Returns: { activities: ActivityResponse[] } (up to 30 most recent).
 * The activity feed shows actions like "Note created", "Task completed", etc.
 */
export async function getActivities(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);
    const activities = await listActivities(user.id);

    res.status(200).json({ activities });
  } catch (error) {
    next(error);
  }
}
