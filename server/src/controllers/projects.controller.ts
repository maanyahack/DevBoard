import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { User } from '@supabase/supabase-js';
import { HttpError } from '../middleware/error.middleware.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import {
  createProject,
  deleteProject,
  listProjects,
  updateProject,
} from '../services/projects.service.js';

export const projectBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(200, 'Name must be 200 characters or less'),
  description: z.string().max(20000, 'Description must be 20,000 characters or less').default(''),
  status: z.enum(['planning', 'active', 'completed', 'archived']).default('planning'),
  githubUrl: z
    .preprocess((value) => (value === '' ? null : value), z.string().url('GitHub URL must be a valid URL').nullable())
    .default(null),
  sortOrder: z.number().int().default(0),
});

type ProjectBody = z.infer<typeof projectBodySchema>;

function getAuthenticatedUser(req: Request): User {
  const user = (req as AuthenticatedRequest).user;

  if (!user) {
    throw new HttpError(401, 'Authentication required', 'Unauthorized');
  }

  return user;
}

export async function getProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);
    const projects = await listProjects(user.id);

    res.status(200).json({ projects });
  } catch (error) {
    next(error);
  }
}

export async function postProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);
    const body = projectBodySchema.parse(req.body) as ProjectBody;
    const project = await createProject(user.id, body);

    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
}

export async function putProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);
    const body = projectBodySchema.parse(req.body) as ProjectBody;
    const project = await updateProject(user.id, req.params.id, body);

    res.status(200).json({ project });
  } catch (error) {
    next(error);
  }
}

export async function deleteProjectById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);
    await deleteProject(user.id, req.params.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
