import { supabaseAdmin } from '../config/supabase.js';
import { HttpError } from '../middleware/error.middleware.js';
import { logActivity } from './activity.service.js';

export interface TaskInput {
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
  projectId: string | null;
  sortOrder: number;
}

interface TaskRecord {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  project_id: string | null;
  sort_order: number | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskResponse {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
  projectId: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const taskSelectColumns =
  'id, title, description, status, priority, due_date, project_id, sort_order, user_id, created_at, updated_at';
const fallbackTaskSelectColumns =
  'id, title, description, status, priority, due_date, sort_order, user_id, created_at, updated_at';

function isMissingProjectColumn(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const value = error as { code?: string; message?: string };
  return (
    value.code === '42703' ||
    value.code === 'PGRST204' ||
    Boolean(value.message?.toLowerCase().includes('project_id'))
  );
}

function mapTask(record: TaskRecord): TaskResponse {
  return {
    id: record.id,
    title: record.title,
    description: record.description ?? '',
    status: record.status,
    priority: record.priority,
    dueDate: record.due_date,
    projectId: record.project_id ?? null,
    sortOrder: record.sort_order ?? 0,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export async function listTasks(
  userId: string,
  filters: { projectId?: string; priority?: string } = {},
): Promise<TaskResponse[]> {
  let query = supabaseAdmin
    .from('tasks')
    .select(taskSelectColumns)
    .eq('user_id', userId);

  if (filters.projectId) query = query.eq('project_id', filters.projectId);
  if (filters.priority && ['low', 'medium', 'high'].includes(filters.priority)) {
    query = query.eq('priority', filters.priority);
  }

  const { data, error } = await query
    .order('sort_order', { ascending: true })
    .order('updated_at', { ascending: false });

  if (error) {
    if (isMissingProjectColumn(error)) {
      if (filters.projectId) return [];

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
        return (fallback.data ?? []).map((record) =>
          mapTask({ ...(record as Omit<TaskRecord, 'project_id'>), project_id: null }),
        );
      }
    }
    throw new HttpError(500, 'Failed to fetch tasks', 'Internal Server Error');
  }

  return (data ?? []).map((record) => mapTask(record as TaskRecord));
}

export async function createTask(userId: string, input: TaskInput): Promise<TaskResponse> {
  let result = await supabaseAdmin
    .from('tasks')
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      due_date: input.dueDate,
      project_id: input.projectId,
      sort_order: input.sortOrder,
    })
    .select(taskSelectColumns)
    .single();

  if (result.error && isMissingProjectColumn(result.error)) {
    result = await supabaseAdmin
      .from('tasks')
      .insert({
        user_id: userId,
        title: input.title,
        description: input.description,
        status: input.status,
        priority: input.priority,
        due_date: input.dueDate,
        sort_order: input.sortOrder,
      })
      .select(fallbackTaskSelectColumns)
      .single();
  }

  const { data, error } = result;

  if (error || !data) {
    throw new HttpError(500, 'Failed to create task', 'Internal Server Error');
  }

  const task = mapTask({ ...(data as Omit<TaskRecord, 'project_id'>), project_id: input.projectId });
  await logActivity(userId, {
    type: 'task_created',
    title: `Task created: ${task.title}`,
    metadata: { taskId: task.id },
  });

  return task;
}

export async function updateTask(
  userId: string,
  taskId: string,
  input: TaskInput,
): Promise<TaskResponse> {
  const { data: existing, error: existingError } = await supabaseAdmin
    .from('tasks')
    .select('status')
    .eq('id', taskId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingError) {
    throw new HttpError(500, 'Failed to update task', 'Internal Server Error');
  }

  let result = await supabaseAdmin
    .from('tasks')
    .update({
      title: input.title,
      description: input.description,
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

  if (result.error && isMissingProjectColumn(result.error)) {
    result = await supabaseAdmin
      .from('tasks')
      .update({
        title: input.title,
        description: input.description,
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

  if ((existing as { status?: string } | null)?.status !== 'done' && task.status === 'done') {
    await logActivity(userId, {
      type: 'task_completed',
      title: `Task completed: ${task.title}`,
      metadata: { taskId: task.id },
    });
  }

  return task;
}

export async function updateTaskStatus(
  userId: string,
  taskId: string,
  status: TaskInput['status'],
): Promise<TaskResponse> {
  let existingResult = await supabaseAdmin
    .from('tasks')
    .select(taskSelectColumns)
    .eq('id', taskId)
    .eq('user_id', userId)
    .maybeSingle();

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

  const record = existing as TaskRecord;
  const task = await updateTask(userId, taskId, {
    title: record.title,
    description: record.description ?? '',
    status,
    priority: record.priority,
    dueDate: record.due_date,
    projectId: record.project_id,
    sortOrder: record.sort_order ?? 0,
  });

  return task;
}

export interface ReorderOperation {
  id: string;
  status: 'todo' | 'in_progress' | 'done';
  sortOrder: number;
}

export async function reorderTasks(
  userId: string,
  operations: ReorderOperation[],
): Promise<TaskResponse[]> {
  const results: TaskResponse[] = [];

  for (const op of operations) {
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

    if (result.error) continue;
    if (!result.data) continue;

    const record = result.data as TaskRecord;
    results.push(
      mapTask({
        ...record,
        project_id: record.project_id ?? null,
      }),
    );
  }

  return results;
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId)
    .select('id')
    .maybeSingle();

  if (error) {
    throw new HttpError(500, 'Failed to delete task', 'Internal Server Error');
  }

  if (!data) {
    throw new HttpError(404, 'Task not found', 'Not Found');
  }
}
