import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { User } from '@supabase/supabase-js';
import { HttpError } from '../middleware/error.middleware.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { globalSearch } from '../services/search.service.js';

const searchQuerySchema = z.object({
  q: z.string().trim().max(120).default(''),
});

function getAuthenticatedUser(req: Request): User {
  const user = (req as AuthenticatedRequest).user;

  if (!user) {
    throw new HttpError(401, 'Authentication required', 'Unauthorized');
  }

  return user;
}

export async function getGlobalSearch(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);
    const query = searchQuerySchema.parse(req.query);
    const results = await globalSearch(user.id, query.q);

    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
}
