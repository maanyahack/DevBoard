// Import the Supabase admin client for database operations.
import { supabaseAdmin } from '../config/supabase.js';
// Import HttpError for throwing HTTP-specific errors.
import { HttpError } from '../middleware/error.middleware.js';
// Import the activity logger to record task actions in the activity feed.
import { logActivity } from './activity.service.js';
// Import sanitizers to prevent XSS in user-submitted content.
import { sanitizePlainText, sanitizeContent } from '../lib/sanitize.js';

// Interface — the shape of data the client sends when creating/updating a task.
export interface TaskInput {
  title: string;       // Task title (plain text, no HTML)
  description: string; // Task description (allows some HTML formatting)
  status: 'todo' | 'in_progress' | 'done';       // Union type — can ONLY be one of these 3 strings
  priority: 'low' | 'medium' | 'high';            // Union type — can ONLY be one of these 3 strings
  dueDate: string | null;   // ISO date string or null if no deadline
  projectId: string | null; // Parent project ID or null if unlinked
  sortOrder: number;        // Position in the list (for drag-and-drop reordering)
}

// Internal interface — matches DB column names (snake_case) for the tasks table.
interface TaskRecord {
  id: string;
  title: string;
  description: string | null;   // Nullable in DB
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;      // DB uses snake_case
  project_id: string | null;
  sort_order: number | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Exported interface — the API response format (camelCase) sent to the client.
export interface TaskResponse {
  id: string;
  title: string;
  description: string;   // Always string, never null (defaulted to '')
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;   // camelCase for client
  projectId: string | null;
  sortOrder: number;         // Never null (defaulted to 0)
  createdAt: string;
  updatedAt: string;
}

// Columns to SELECT — specifying them prevents leaking unintended data.
const taskSelectColumns =
  'id, title, description, status, priority, due_date, project_id, sort_order, user_id, created_at, updated_at';

// Fallback columns WITHOUT project_id — used when the 'project_id' column
// doesn't exist in the DB yet (schema migration might be pending).
const fallbackTaskSelectColumns =
  'id, title, description, status, priority, due_date, sort_order, user_id, created_at, updated_at';

/**
 * isMissingProjectColumn — detects if a Supabase error is because the
 * 'project_id' column doesn't exist in the database table yet.
 *
 * This is a graceful fallback: if the schema hasn't been migrated,
 * we retry the query without the project_id column instead of crashing.
 */
function isMissingProjectColumn(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  // Cast the error to access its properties — TypeScript needs this because
  // 'unknown' type doesn't have 'code' or 'message' properties.
  const value = error as { code?: string; message?: string };
  return (
    value.code === '42703' ||           // PostgreSQL: undefined column
    value.code === 'PGRST204' ||        // PostgREST: column not found
    Boolean(value.message?.toLowerCase().includes('project_id'))  // Fallback: message check
  );
}

// Maps a raw DB record (snake_case) to the API response format (camelCase).
function mapTask(record: TaskRecord): TaskResponse {
  return {
    id: record.id,
    title: record.title,
    description: record.description ?? '',  // Null → empty string
    status: record.status,
    priority: record.priority,
    dueDate: record.due_date,               // snake_case → camelCase
    projectId: record.project_id ?? null,
    sortOrder: record.sort_order ?? 0,      // Null → 0 (default position)
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

/**
 * listTasks — fetch all tasks for a user, with optional filtering by project/priority.
 * 'filters' has a default value of '{}' so it's optional when calling this function.
 */
export async function listTasks(
  userId: string,
  filters: { projectId?: string; priority?: string } = {},  // Optional filters object
): Promise<TaskResponse[]> {
  // Start building the query — we chain more filters conditionally below.
  let query = supabaseAdmin
    .from('tasks')
    .select(taskSelectColumns)
    .eq('user_id', userId);  // Only this user's tasks

  // If a project filter was provided, add it to the query.
  // '?.' is optional chaining — safely access .eq even if query is null (it won't be).
  if (filters.projectId) query = query.eq('project_id', filters.projectId);

  // If a priority filter was provided AND it's a valid value, add it.
  // '.includes()' checks if the priority string is in the allowed array.
  if (filters.priority && ['low', 'medium', 'high'].includes(filters.priority)) {
    query = query.eq('priority', filters.priority);
  }

  // Execute the query with sorting: first by sort_order (for drag-and-drop),
  // then by updated_at (newest first for same sort_order).
  const { data, error } = await query
    .order('sort_order', { ascending: true })   // Position 0, 1, 2, ...
    .order('updated_at', { ascending: false });  // Most recently updated first

  // If the error is about a missing project_id column, try a fallback query
  // that doesn't use that column — handles pending schema migrations gracefully.
  if (error) {
    if (isMissingProjectColumn(error)) {
      // If filtering by project and the column doesn't exist, return empty —
      // can't filter by something that doesn't exist.
      if (filters.projectId) return [];

      // Retry without the project_id column.
      let fallbackQuery = supabaseAdmin
        .from('tasks')
        .select(fallbackTaskSelectColumns)
        .eq('user_id', userId);

      if (filters.priority && ['low', 'medium', 'high'].includes(filters.priority)) {
        fallbackQuery = fallbackQuery.eq('priority', filters.priority);
      }

      const fallback = await fallbackQuery
        .order('sort_order', { ascending: true })
        .order('updated_at', { ascending: false });

      if (!fallback.error) {
        // Map each record with project_id forced to null (since the column doesn't exist).
        return (fallback.data ?? []).map((record) =>
          mapTask({ ...(record as Omit<TaskRecord, 'project_id'>), project_id: null }),
        );
      }
    }
    // If it's not a missing column error (or the fallback also failed), throw.
    throw new HttpError(500, 'Failed to fetch tasks', 'Internal Server Error');
  }

  return (data ?? []).map((record) => mapTask(record as TaskRecord));
}

/**
 * createTask — insert a new task and log it in the activity feed.
 */
export async function createTask(userId: string, input: TaskInput): Promise<TaskResponse> {
  // Sanitize inputs — titles are plain text, descriptions allow safe HTML.
  const safeTitle = sanitizePlainText(input.title);
  const safeDescription = sanitizeContent(input.description);

  // First, try inserting WITH project_id (the normal path).
  let result = await supabaseAdmin
    .from('tasks')
    .insert({
      user_id: userId,
      title: safeTitle,
      description: safeDescription,
      status: input.status,
      priority: input.priority,
      due_date: input.dueDate,
      project_id: input.projectId,
      sort_order: input.sortOrder,
    })
    .select(taskSelectColumns)
    .single();  // Expect exactly one inserted row.

  // If the project_id column doesn't exist, retry WITHOUT it.
  if (result.error && isMissingProjectColumn(result.error)) {
    result = await supabaseAdmin
      .from('tasks')
      .insert({
        user_id: userId,
        title: safeTitle,
        description: safeDescription,
        status: input.status,
        priority: input.priority,
        due_date: input.dueDate,
        // project_id is omitted — column doesn't exist
        sort_order: input.sortOrder,
      })
      .select(fallbackTaskSelectColumns)
      .single();
  }

  const { data, error } = result;

  if (error || !data) {
    throw new HttpError(500, 'Failed to create task', 'Internal Server Error');
  }

  // Map the record and manually attach projectId from the input
  // (since the fallback query doesn't include project_id from the DB).
  const task = mapTask({ ...(data as Omit<TaskRecord, 'project_id'>), project_id: input.projectId });

  // Log the activity: "Task created: Buy groceries"
  await logActivity(userId, {
    type: 'task_created',
    title: `Task created: ${task.title}`,
    metadata: { taskId: task.id },
  });

  return task;
}

/**
 * updateTask — update all fields of an existing task.
 * Also detects when a task transitions to 'done' and logs a completion activity.
 */
export async function updateTask(
  userId: string,
  taskId: string,
  input: TaskInput,
): Promise<TaskResponse> {
  // First, fetch the current status of the task so we can detect
  // when it transitions to 'done' (for activity logging).
  const { data: existing, error: existingError } = await supabaseAdmin
    .from('tasks')
    .select('status')
    .eq('id', taskId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingError) {
    throw new HttpError(500, 'Failed to update task', 'Internal Server Error');
  }

  const safeTitle = sanitizePlainText(input.title);
  const safeDescription = sanitizeContent(input.description);

  // Update all fields of the task.
  let result = await supabaseAdmin
    .from('tasks')
    .update({
      title: safeTitle,
      description: safeDescription,
      status: input.status,
      priority: input.priority,
      due_date: input.dueDate,
      project_id: input.projectId,
      sort_order: input.sortOrder,
    })
    .eq('id', taskId)
    .eq('user_id', userId)
    .select(taskSelectColumns)
    .maybeSingle();

  // Fallback: retry without project_id if the column doesn't exist.
  if (result.error && isMissingProjectColumn(result.error)) {
    result = await supabaseAdmin
      .from('tasks')
      .update({
        title: safeTitle,
        description: safeDescription,
        status: input.status,
        priority: input.priority,
        due_date: input.dueDate,
        sort_order: input.sortOrder,
      })
      .eq('id', taskId)
      .eq('user_id', userId)
      .select(fallbackTaskSelectColumns)
      .maybeSingle();
  }

  const { data, error } = result;

  if (error) {
    throw new HttpError(500, 'Failed to update task', 'Internal Server Error');
  }

  if (!data) {
    throw new HttpError(404, 'Task not found', 'Not Found');
  }

  const task = mapTask({ ...(data as Omit<TaskRecord, 'project_id'>), project_id: input.projectId });

  // Check if the task just moved to 'done' status.
  // 'existing?.status' uses optional chaining — safely accesses status even if existing is null.
  // The 'as { status?: string } | null' is a type assertion telling TypeScript
  // what shape to expect from the existing query result.
  if ((existing as { status?: string } | null)?.status !== 'done' && task.status === 'done') {
    // Task was NOT done before, but IS done now → log a completion activity.
    await logActivity(userId, {
      type: 'task_completed',
      title: `Task completed: ${task.title}`,
      metadata: { taskId: task.id },
    });
  }

  return task;
}

/**
 * updateTaskStatus — quick status-only update (e.g., drag a card from "Todo" to "Done" on Kanban board).
 * Fetches the full task data, then delegates to updateTask for the actual update.
 */
export async function updateTaskStatus(
  userId: string,
  taskId: string,
  status: TaskInput['status'],  // TypeScript indexed access type — extracts the type from the union
): Promise<TaskResponse> {
  // Fetch the current task data so we can preserve all other fields during the update.
  let existingResult = await supabaseAdmin
    .from('tasks')
    .select(taskSelectColumns)
    .eq('id', taskId)
    .eq('user_id', userId)
    .maybeSingle();

  // Fallback: try without project_id if the column doesn't exist.
  if (existingResult.error && isMissingProjectColumn(existingResult.error)) {
    existingResult = await supabaseAdmin
      .from('tasks')
      .select(fallbackTaskSelectColumns)
      .eq('id', taskId)
      .eq('user_id', userId)
      .maybeSingle();
  }

  const { data: existing, error: existingError } = existingResult;

  if (existingError) {
    throw new HttpError(500, 'Failed to update task status', 'Internal Server Error');
  }

  if (!existing) {
    throw new HttpError(404, 'Task not found', 'Not Found');
  }

  // Cast to TaskRecord to access its properties — TypeScript doesn't know the shape
  // of 'existing' without this cast because it could be either query's result type.
  const record = existing as TaskRecord;

  // Delegate the full update to updateTask, keeping all existing values
  // but changing only the status.
  const task = await updateTask(userId, taskId, {
    title: record.title,
    description: record.description ?? '',
    status,                    // The new status (the only thing changing)
    priority: record.priority,
    dueDate: record.due_date,
    projectId: record.project_id,
    sortOrder: record.sort_order ?? 0,
  });

  return task;
}

// Interface for a single reorder operation — used when the user drags tasks
// between columns or reorders within a column on the Kanban board.
export interface ReorderOperation {
  id: string;                                   // Task ID to move
  status: 'todo' | 'in_progress' | 'done';     // New column/status
  sortOrder: number;                             // New position in that column
}

/**
 * reorderTasks — bulk-update multiple tasks' positions and statuses.
 * Called when the user drags tasks around on the Kanban board.
 * Returns only the tasks that were successfully updated.
 */
export async function reorderTasks(
  userId: string,
  operations: ReorderOperation[],  // Array of reorder operations to perform
): Promise<TaskResponse[]> {
  const results: TaskResponse[] = [];  // Accumulate successful updates

  // Process each operation one at a time (sequential, not parallel).
  // This ensures sort_order updates don't conflict with each other.
  for (const op of operations) {
    // Update the task's status and sort_order.
    let result = await supabaseAdmin
      .from('tasks')
      .update({
        status: op.status,
        sort_order: op.sortOrder,
      })
      .eq('id', op.id)
      .eq('user_id', userId)
      .select(taskSelectColumns)
      .maybeSingle();

    // Fallback: retry without project_id if the column is missing.
    if (result.error && isMissingProjectColumn(result.error)) {
      result = await supabaseAdmin
        .from('tasks')
        .update({
          status: op.status,
          sort_order: op.sortOrder,
        })
        .eq('id', op.id)
        .eq('user_id', userId)
        .select(fallbackTaskSelectColumns)
        .maybeSingle();
    }

    // Skip failed operations silently (don't break the whole reorder).
    if (result.error) continue;
    if (!result.data) continue;

    // Add the successfully updated task to the results array.
    const record = result.data as TaskRecord;
    results.push(
      mapTask({
        ...record,
        project_id: record.project_id ?? null,
      }),
    );
  }

  return results;  // Return all tasks that were successfully updated
}

/**
 * deleteTask — permanently remove a task from the database.
 * Uses the standard dual-WHERE pattern (id + user_id) for ownership verification.
 */
export async function deleteTask(userId: string, taskId: string): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from('tasks')
    .delete()                              // DELETE FROM tasks
    .eq('id', taskId)                      // WHERE id = taskId
    .eq('user_id', userId)                 // AND user_id = userId
    .select('id')                          // Return just the ID to confirm deletion
    .maybeSingle();                        // null if not found

  if (error) {
    throw new HttpError(500, 'Failed to delete task', 'Internal Server Error');
  }

  if (!data) {
    throw new HttpError(404, 'Task not found', 'Not Found');
  }
}
