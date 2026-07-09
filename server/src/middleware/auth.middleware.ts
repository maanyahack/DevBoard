import type { NextFunction, Request, Response } from 'express';
import type { User } from '@supabase/supabase-js';
import { HttpError } from './error.middleware.js';
import { getUserFromToken } from '../services/auth.service.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authorizationHeader = req.header('authorization');
    const [scheme, token] = authorizationHeader?.trim().split(/\s+/, 2) ?? [];

    if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
      next(new HttpError(401, 'Missing or invalid Authorization header', 'Unauthorized'));
      return;
    }

    const user = await getUserFromToken(token);

    if (!user) {
      next(new HttpError(401, 'Invalid or expired token', 'Unauthorized'));
      return;
    }

    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    next(error);
  }
}