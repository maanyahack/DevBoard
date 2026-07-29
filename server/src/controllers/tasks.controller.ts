import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { User } from '@supabase/supabase-js';
import { HttpError } from '../middleware/error.middleware.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import {
  createTask,
  deleteTask,
  listTasks,
  reorderTasks,
  updateTask,
  updateTaskStatus,
  type ReorderOperation,
} from '../services/tasks.service.js';
import { generateText } from '../services/ai.service.js';

export const taskBodySchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),
  description: z.string().max(20000, 'Description must be 20,000 characters or less').default(''),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().max(40).nullable().default(null),
  projectId: z.string().uuid().nullable().default(null),
  sortOrder: z.number().int().default(0),
});

type TaskBody = z.infer<typeof taskBodySchema>;

const taskStatusBodySchema = z.object({
  status: z.enum(['todo', 'in_progress', 'done']),
});

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
    const projectId = typeof req.query.projectId === 'string' ? req.query.projectId : undefined;
    const priority = typeof req.query.priority === 'string' ? req.query.priority : undefined;
    const tasks = await listTasks(user.id, {
      projectId: projectId && projectId !== 'all' ? projectId : undefined,
      priority: priority && priority !== 'all' ? priority : undefined,
    });

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

export async function patchTaskStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);
    const body = taskStatusBodySchema.parse(req.body);
    const task = await updateTaskStatus(user.id, req.params.id, body.status);

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

const reorderBodySchema = z.object({
  reorders: z
    .array(
      z.object({
        id: z.string().uuid(),
        status: z.enum(['todo', 'in_progress', 'done']),
        sortOrder: z.number().int(),
      }),
    )
    .min(1),
});

export async function patchTasksReorder(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);
    const { reorders } = reorderBodySchema.parse(req.body) as {
      reorders: ReorderOperation[];
    };
    const tasks = await reorderTasks(user.id, reorders);

    res.status(200).json({ tasks });
  } catch (error) {
    next(error);
  }
}

const suggestBodySchema = z.object({
  prompt: z.string().trim().min(1).max(2000),
  projectName: z.string().max(200).optional(),
  projectDescription: z.string().max(2000).optional(),
});

export async function postSuggestTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    getAuthenticatedUser(req);
    const { prompt, projectName, projectDescription } = suggestBodySchema.parse(req.body);

    const projectContext = projectName
      ? `Project: "${projectName}"${projectDescription ? `\nProject description: ${projectDescription}` : ''}\n\n`
      : '';

    const systemPrompt = `You are a helpful task management assistant. Given a user's description, generate a well-structured task.
Respond ONLY with a valid JSON object (no markdown, no explanation) with exactly these fields:
{
  "title": "concise task title (max 100 chars)",
  "description": "clear, actionable description (2-4 sentences)",
  "priority": "low" | "medium" | "high",
  "status": "todo"
}

${projectContext}User request: ${prompt}`;

    const { text } = await generateText({ prompt: systemPrompt });

    // Extract JSON from the response (handle potential markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new HttpError(502, 'AI returned an unexpected response format', 'Bad Gateway');
    }

    const suggestion = JSON.parse(jsonMatch[0]) as {
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
      status: 'todo' | 'in_progress' | 'done';
    };

    res.status(200).json({ suggestion });
  } catch (error) {
    next(error);
  }
}
