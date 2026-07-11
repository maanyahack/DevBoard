import { supabaseAdmin } from '../config/supabase.js';
import { HttpError } from '../middleware/error.middleware.js';
import type { NoteResponse } from './notes.service.js';
import type { ProjectResponse } from './projects.service.js';
import type { TaskResponse } from './tasks.service.js';

interface NoteRecord {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

interface TaskRecord {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

interface ProjectRecord {
  id: string;
  name: string;
  description: string | null;
  status: 'planning' | 'active' | 'completed' | 'archived';
  github_url: string | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardResponse {
  stats: {
    projects: number;
    tasks: number;
    completedTasks: number;
    notes: number;
  };
  recentTasks: TaskResponse[];
  recentNotes: NoteResponse[];
  activeProjects: ProjectResponse[];
}

const noteSelectColumns = 'id, title, content, created_at, updated_at';
const taskSelectColumns =
  'id, title, description, status, priority, due_date, sort_order, created_at, updated_at';
const projectSelectColumns =
  'id, name, description, status, github_url, sort_order, created_at, updated_at';

function mapNote(record: NoteRecord): NoteResponse {
  return {
    id: record.id,
    title: record.title,
    content: record.content ?? '',
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

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

function mapProject(record: ProjectRecord): ProjectResponse {
  return {
    id: record.id,
    name: record.name,
    description: record.description ?? '',
    status: record.status,
    githubUrl: record.github_url,
    sortOrder: record.sort_order ?? 0,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

async function countRows(table: 'notes' | 'tasks' | 'projects', userId: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    throw new HttpError(500, `Failed to count ${table}`, 'Internal Server Error');
  }

  return count ?? 0;
}

async function countCompletedTasks(userId: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'done');

  if (error) {
    throw new HttpError(500, 'Failed to count completed tasks', 'Internal Server Error');
  }

  return count ?? 0;
}

export async function getDashboard(userId: string): Promise<DashboardResponse> {
  const [
    projects,
    tasks,
    completedTasks,
    notes,
    recentTasksResult,
    recentNotesResult,
    activeProjectsResult,
  ] = await Promise.all([
    countRows('projects', userId),
    countRows('tasks', userId),
    countCompletedTasks(userId),
    countRows('notes', userId),
    supabaseAdmin
      .from('tasks')
      .select(taskSelectColumns)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(5),
    supabaseAdmin
      .from('notes')
      .select(noteSelectColumns)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(5),
    supabaseAdmin
      .from('projects')
      .select(projectSelectColumns)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(5),
  ]);

  if (recentTasksResult.error || recentNotesResult.error || activeProjectsResult.error) {
    throw new HttpError(500, 'Failed to fetch dashboard data', 'Internal Server Error');
  }

  return {
    stats: { projects, tasks, completedTasks, notes },
    recentTasks: (recentTasksResult.data ?? []).map((record) => mapTask(record as TaskRecord)),
    recentNotes: (recentNotesResult.data ?? []).map((record) => mapNote(record as NoteRecord)),
    activeProjects: (activeProjectsResult.data ?? []).map((record) =>
      mapProject(record as ProjectRecord),
    ),
  };
}
