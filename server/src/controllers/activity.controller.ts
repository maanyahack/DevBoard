import type { NextFunction, Request, Response } from 'express';
import type { User } from '@supabase/supabase-js';
import { HttpError } from '../middleware/error.middleware.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { listActivities } from '../services/activity.service.js';

function getAuthenticatedUser(req: Request): User {
  const user = (req as AuthenticatedRequest).user;

  if (!user) {
    throw new HttpError(401, 'Authentication required', 'Unauthorized');
  }

  return user;
}

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
