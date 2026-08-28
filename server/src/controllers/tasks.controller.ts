// Import Express types for handler function signatures.
import type { NextFunction, Request, Response } from 'express';
// Import Zod for request validation.
import { z } from 'zod';
// Import User type for the authenticated user.
import type { User } from '@supabase/supabase-js';
// Import HttpError for throwing HTTP errors.
import { HttpError } from '../middleware/error.middleware.js';
// Import our custom AuthenticatedRequest type.
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
// Import all service functions needed by this controller.
import {
  createTask,
  deleteTask,
  listTasks,
  reorderTasks,
  updateTask,
  updateTaskStatus,
  type ReorderOperation,  // 'type' import — only the TypeScript type, not a runtime value
} from '../services/tasks.service.js';
// Import the AI text generation function for the "suggest task" feature.
import { generateText } from '../services/ai.service.js';

/**
 * Zod schema — validates the request body for creating/updating a task.
 */
export const taskBodySchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),
  description: z.string().max(20000, 'Description must be 20,000 characters or less').default(''),
  // 'z.enum()' restricts to exactly these 3 string values — no other value is accepted.
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  // '.nullable()' allows null in addition to string. '.default(null)' sets null if omitted.
  dueDate: z.string().max(40).nullable().default(null),
  // UUID validation — ensures it's a valid UUID format if provided.
  projectId: z.string().uuid().nullable().default(null),
  // '.int()' ensures the number is a whole integer (not a decimal).
  sortOrder: z.number().int().default(0),
});

// Extract the TypeScript type from the Zod schema — always stays in sync.
type TaskBody = z.infer<typeof taskBodySchema>;

// Separate schema for the PATCH /status endpoint — only accepts the status field.
const taskStatusBodySchema = z.object({
  status: z.enum(['todo', 'in_progress', 'done']),
});

// Helper — extracts and validates the authenticated user from the request.
function getAuthenticatedUser(req: Request): User {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    throw new HttpError(401, 'Authentication required', 'Unauthorized');
  }
  return user;
}

/**
 * GET /api/tasks — list all tasks with optional filters.
 * Query params: ?projectId=xxx&priority=high (both optional)
 */
export async function getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);

    // 'typeof req.query.projectId === string' — TypeScript type guard.
    // Query params can be string | string[] | undefined. We only accept string.
    // 'as string' tells TypeScript "trust me, this is a string" after the check.
    const projectId = typeof req.query.projectId === 'string' ? req.query.projectId : undefined;
    const priority = typeof req.query.priority === 'string' ? req.query.priority : undefined;

    const tasks = await listTasks(user.id, {
      // If the filter is 'all' or empty, pass undefined (= no filter).
      projectId: projectId && projectId !== 'all' ? projectId : undefined,
      priority: priority && priority !== 'all' ? priority : undefined,
    });

    res.status(200).json({ tasks });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/tasks — create a new task.
 * Returns: { task: TaskResponse } with status 201.
 */
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

/**
 * PUT /api/tasks/:id — full update of an existing task.
 * Replaces ALL fields of the task (title, description, status, etc.).
 */
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

/**
 * PATCH /api/tasks/:id/status — quick status-only update.
 * Used when dragging a task card between Kanban columns.
 * PATCH (not PUT) because we're partially updating (only the status).
 */
export async function patchTaskStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);
    // Only validates the 'status' field — not the full task body.
    const body = taskStatusBodySchema.parse(req.body);
    const task = await updateTaskStatus(user.id, req.params.id, body.status);

    res.status(200).json({ task });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/tasks/:id — permanently delete a task.
 * Returns: empty response with status 204.
 */
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

// Schema for validating the bulk reorder request body.
// 'z.array()' validates that 'reorders' is an array of objects.
// '.min(1)' ensures at least one reorder operation is provided.
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

/**
 * PATCH /api/tasks/reorder — bulk update task positions and statuses.
 * Called when the user drags tasks on the Kanban board.
 * Returns: { tasks: TaskResponse[] } — only the successfully updated tasks.
 */
export async function patchTasksReorder(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);
    // Parse and validate the reorder operations array.
    // The 'as' cast tells TypeScript the parsed shape matches ReorderOperation[].
    const { reorders } = reorderBodySchema.parse(req.body) as {
      reorders: ReorderOperation[];
    };
    const tasks = await reorderTasks(user.id, reorders);

    res.status(200).json({ tasks });
  } catch (error) {
    next(error);
  }
}

// Schema for the AI task suggestion endpoint.
const suggestBodySchema = z.object({
  prompt: z.string().trim().min(1).max(2000),            // User's task description
  projectName: z.string().max(200).optional(),            // Optional project context
  projectDescription: z.string().max(2000).optional(),    // Optional project description
});

/**
 * POST /api/tasks/suggest — use AI to generate a structured task from a natural language prompt.
 * The user describes what they want to do in plain English, and the AI returns
 * a structured task with title, description, priority, and status.
 */
export async function postSuggestTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    getAuthenticatedUser(req);
    const { prompt, projectName, projectDescription } = suggestBodySchema.parse(req.body);

    // Build a context string with project info if available.
    // Template literals with backticks allow multi-line strings and ${} interpolation.
    const projectContext = projectName
      ? `Project: "${projectName}"${projectDescription ? `\nProject description: ${projectDescription}` : ''}\n\n`
      : '';

    // Construct a detailed system prompt that tells the AI exactly what format to return.
    const systemPrompt = `You are a helpful task management assistant. Given a user's description, generate a well-structured task.
Respond ONLY with a valid JSON object (no markdown, no explanation) with exactly these fields:
{
  "title": "concise task title (max 100 chars)",
  "description": "clear, actionable description (2-4 sentences)",
  "priority": "low" | "medium" | "high",
  "status": "todo"
}

${projectContext}User request: ${prompt}`;

    // Send the prompt to the Gemini AI and get the response.
    const { text } = await generateText({ prompt: systemPrompt });

    // Extract the JSON object from the AI's response.
    // The AI might wrap it in markdown code fences, so we use a regex to find the JSON.
    // /\{[\s\S]*\}/ matches an opening brace, any characters (including newlines), and a closing brace.
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new HttpError(502, 'AI returned an unexpected response format', 'Bad Gateway');
    }

    // Parse the matched JSON string into a JavaScript object.
    // 'as { ... }' tells TypeScript the shape of the parsed object.
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
