// Import Express types for handler signatures.
import type { NextFunction, Request, Response } from 'express';
// Import Zod for request body validation.
import { z } from 'zod';
// Import User type for the authenticated user.
import type { User } from '@supabase/supabase-js';
// Import HttpError for throwing typed HTTP errors.
import { HttpError } from '../middleware/error.middleware.js';
// Import AuthenticatedRequest — our custom Request with a .user property.
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
// Import service functions for CRUD operations on projects.
import {
  createProject,
  deleteProject,
  listProjects,
  updateProject,
} from '../services/projects.service.js';

/**
 * Zod schema — validates the request body for creating/updating a project.
 */
export const projectBodySchema = z.object({
  // Title with trimming, minimum 1 char, max 200 chars.
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(200, 'Name must be 200 characters or less'),
  // Description allows empty string and has a 20K character limit.
  description: z.string().max(20000, 'Description must be 20,000 characters or less').default(''),
  // Status is one of 4 values. Defaults to 'planning' for new projects.
  status: z.enum(['planning', 'active', 'completed', 'archived']).default('planning'),
  // GitHub URL — special handling for empty strings.
  // '.preprocess()' transforms the value BEFORE validation:
  // if the user sends an empty string, convert it to null (no URL).
  // Otherwise validate it as a URL string.
  githubUrl: z
    .preprocess((value) => (value === '' ? null : value), z.string().url('GitHub URL must be a valid URL').nullable())
    .default(null),
  // Sort order for manual project ordering.
  sortOrder: z.number().int().default(0),
});

// Extract the TypeScript type from the Zod schema.
type ProjectBody = z.infer<typeof projectBodySchema>;

// Helper — extracts the authenticated user from the request.
function getAuthenticatedUser(req: Request): User {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    throw new HttpError(401, 'Authentication required', 'Unauthorized');
  }
  return user;
}

/**
 * GET /api/projects — list all projects for the authenticated user.
 * Returns: { projects: ProjectResponse[] }
 */
export async function getProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);
    const projects = await listProjects(user.id);

    res.status(200).json({ projects });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/projects — create a new project.
 * Expects: { name, description?, status?, githubUrl?, sortOrder? }
 * Returns: { project: ProjectResponse } with status 201.
 */
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

/**
 * PUT /api/projects/:id — update an existing project's fields.
 * Returns: { project: ProjectResponse }
 */
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

/**
 * DELETE /api/projects/:id — permanently delete a project.
 * Returns: empty response with status 204.
 */
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
