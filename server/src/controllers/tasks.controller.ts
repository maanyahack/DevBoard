import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { User } from '@supabase/supabase-js';
import { HttpError } from '../middleware/error.middleware.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { createTask, deleteTask, listTasks, updateTask } from '../services/tasks.service.js';

export const taskBodySchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),
  description: z.string().max(20000, 'Description must be 20,000 characters or less').default(''),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().datetime({ offset: true }).nullable().default(null),
  sortOrder: z.number().int().default(0),
});

type TaskBody = z.infer<typeof taskBodySchema>;

function getAuthenticatedUser(req: Request): User {
  const user = (req as AuthenticatedRequest).user;

  if (!user) {
    throw new HttpError(401, 'Authentication required', 'Unauthorized');
  }

  return user;
}

export async function getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);
    const tasks = await listTasks(user.id);

    res.status(200).json({ tasks });
  } catch (error) {
    next(error);
  }
}

export async function postTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);
    const body = taskBodySchema.parse(req.body) as TaskBody;
    const task = await createTask(user.id, body);

    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
}

export async function putTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);
    const body = taskBodySchema.parse(req.body) as TaskBody;
    const task = await updateTask(user.id, req.params.id, body);

    res.status(200).json({ task });
  } catch (error) {
    next(error);
  }
}

export async function deleteTaskById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);
    await deleteTask(user.id, req.params.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
