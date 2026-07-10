import { supabaseAdmin } from '../config/supabase.js';
import { HttpError } from '../middleware/error.middleware.js';

export interface TaskInput {
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
  sortOrder: number;
}

interface TaskRecord {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
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
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const taskSelectColumns =
  'id, title, description, status, priority, due_date, sort_order, user_id, created_at, updated_at';

function mapTask(record: TaskRecord): TaskResponse {
  return {
    id: record.id,
    title: record.title,
    description: record.description ?? '',
    status: record.status,
    priority: record.priority,
    dueDate: record.due_date,
    sortOrder: record.sort_order ?? 0,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export async function listTasks(userId: string): Promise<TaskResponse[]> {
  const { data, error } = await supabaseAdmin
    .from('tasks')
    .select(taskSelectColumns)
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .order('updated_at', { ascending: false });

  if (error) {
    throw new HttpError(500, 'Failed to fetch tasks', 'Internal Server Error');
  }

  return (data ?? []).map((record) => mapTask(record as TaskRecord));
}

export async function createTask(userId: string, input: TaskInput): Promise<TaskResponse> {
  const { data, error } = await supabaseAdmin
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
    .select(taskSelectColumns)
    .single();

  if (error || !data) {
    throw new HttpError(500, 'Failed to create task', 'Internal Server Error');
  }

  return mapTask(data as TaskRecord);
}

export async function updateTask(
  userId: string,
  taskId: string,
  input: TaskInput,
): Promise<TaskResponse> {
  const { data, error } = await supabaseAdmin
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
    .select(taskSelectColumns)
    .maybeSingle();

  if (error) {
    throw new HttpError(500, 'Failed to update task', 'Internal Server Error');
  }

  if (!data) {
    throw new HttpError(404, 'Task not found', 'Not Found');
  }

  return mapTask(data as TaskRecord);
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
