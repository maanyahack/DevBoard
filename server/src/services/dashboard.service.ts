// Import the Supabase admin client for database operations.
import { supabaseAdmin } from '../config/supabase.js';
// Import HttpError for throwing typed HTTP errors.
import { HttpError } from '../middleware/error.middleware.js';
// Import response types from other services — dashboard aggregates data from all modules.
import type { NoteResponse } from './notes.service.js';
import type { ProjectResponse } from './projects.service.js';
import type { TaskResponse } from './tasks.service.js';
// Import the activity list function and its response type.
import { listActivities, type ActivityResponse } from './activity.service.js';

// Internal interfaces — match raw DB column names (snake_case) for each table.
// These are used to cast Supabase query results before mapping them to API responses.

// Interface for a row from the 'notes' table.
interface NoteRecord {
  id: string;
  title: string;
  content: string | null;
  category: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

// Interface for a row from the 'tasks' table.
interface TaskRecord {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  project_id: string | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

// Interface for a row from the 'projects' table.
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

// Exported interface — the complete dashboard data shape sent to the client.
// The dashboard is a single API call that aggregates everything: stats, recent items, and activities.
export interface DashboardResponse {
  stats: {
    projects: number;        // Total project count
    tasks: number;           // Total task count
    completedTasks: number;  // Tasks with status 'done'
    notes: number;           // Total note count
  };
  recentTasks: TaskResponse[];      // 5 most recently updated tasks
  recentNotes: NoteResponse[];      // 5 most recently updated notes
  activeProjects: ProjectResponse[]; // Up to 5 active projects
  activities: ActivityResponse[];    // Last 30 activities
}

// Explicit column lists for SELECT queries — prevents returning unintended columns.
const noteSelectColumns = 'id, title, content, category, is_pinned, created_at, updated_at';
const taskSelectColumns =
  'id, title, description, status, priority, due_date, project_id, sort_order, created_at, updated_at';
// Fallback without project_id — for when that column doesn't exist yet.
const fallbackTaskSelectColumns =
  'id, title, description, status, priority, due_date, sort_order, created_at, updated_at';
const projectSelectColumns =
  'id, name, description, status, github_url, sort_order, created_at, updated_at';

/**
 * isMissingProjectColumn — detects if a Supabase error is because
 * the 'project_id' column doesn't exist in the tasks table.
 */
function isMissingProjectColumn(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const value = error as { code?: string; message?: string };
  return (
    value.code === '42703' ||
    value.code === 'PGRST204' ||
    Boolean(value.message?.toLowerCase().includes('project_id'))
  );
}

// Maps a raw DB note record to the API response format (camelCase).
function mapNote(record: NoteRecord): NoteResponse {
  return {
    id: record.id,
    title: record.title,
    content: record.content ?? '',
    category: record.category,
    isPinned: record.is_pinned,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

// Maps a raw DB task record to the API response format.
function mapTask(record: TaskRecord): TaskResponse {
  return {
    id: record.id,
    title: record.title,
    description: record.description ?? '',
    status: record.status,
    priority: record.priority,
    dueDate: record.due_date,
    projectId: record.project_id,
    sortOrder: record.sort_order ?? 0,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

// Maps a raw DB project record to the API response format.
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

/**
 * countRows — generic helper to count total rows in a table for a specific user.
 * 'table' parameter is typed as a string literal union — can only be 'notes', 'tasks', or 'projects'.
 */
async function countRows(table: 'notes' | 'tasks' | 'projects', userId: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from(table)
    // '{ count: 'exact', head: true }' tells Supabase to:
    // - Return an exact count (not an estimate)
    // - Return ONLY the count, not the actual rows (head = just the header)
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    throw new HttpError(500, `Failed to count ${table}`, 'Internal Server Error');
  }

  return count ?? 0;  // null → 0 (defensive default)
}

/**
 * countCompletedTasks — count tasks with status 'done' for a specific user.
 */
async function countCompletedTasks(userId: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'done');  // Only count completed tasks

  if (error) {
    throw new HttpError(500, 'Failed to count completed tasks', 'Internal Server Error');
  }

  return count ?? 0;
}

/**
 * fetchRecentTasks — get the 5 most recently updated tasks.
 * Includes fallback logic for the project_id column.
 */
async function fetchRecentTasks(userId: string) {
  // Try the normal query first (with project_id column).
  const result = await supabaseAdmin
    .from('tasks')
    .select(taskSelectColumns)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(5);

  // If the error is about a missing project_id column, retry without it.
  // '||' means: if the first query succeeded OR the error isn't about project_id,
  // return the original result (no fallback needed).
  if (!result.error || !isMissingProjectColumn(result.error)) return result;

  // Fallback: query without project_id.
  const fallback = await supabaseAdmin
    .from('tasks')
    .select(fallbackTaskSelectColumns)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(5);

  if (fallback.error) return fallback;  // If fallback also fails, return the error

  // Merge the fallback results with a forced project_id: null.
  return {
    ...fallback,  // Spread operator — copy all properties from the fallback result
    data: (fallback.data ?? []).map((record) => ({
      ...(record as Omit<TaskRecord, 'project_id'>),  // Spread all task fields
      project_id: null,                                 // Add missing field as null
    })),
  };
}

/**
 * getDashboard — the main dashboard endpoint handler.
 * Fetches ALL dashboard data in parallel using Promise.all for maximum performance.
 * This single function replaces what would otherwise be 8 separate database queries.
 */
export async function getDashboard(userId: string): Promise<DashboardResponse> {
  // Promise.all runs all 8 queries simultaneously — much faster than running them one by one.
  // Each query starts immediately and the overall time = the slowest query, not the sum.
  const [
    projects,              // Count of all projects
    tasks,                 // Count of all tasks
    completedTasks,        // Count of completed tasks
    notes,                 // Count of all notes
    recentTasksResult,     // 5 most recent tasks (full objects)
    recentNotesResult,     // 5 most recent notes (full objects)
    activeProjectsResult,  // Up to 5 active projects (full objects)
    activities,            // Last 30 activities
  ] = await Promise.all([
    countRows('projects', userId),           // Query 1: count projects
    countRows('tasks', userId),              // Query 2: count tasks
    countCompletedTasks(userId),              // Query 3: count completed tasks
    countRows('notes', userId),              // Query 4: count notes
    fetchRecentTasks(userId),                 // Query 5: recent tasks
    supabaseAdmin                            // Query 6: recent notes
      .from('notes')
      .select(noteSelectColumns)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(5),
    supabaseAdmin                            // Query 7: active projects
      .from('projects')
      .select(projectSelectColumns)
      .eq('user_id', userId)
      .eq('status', 'active')                // Only show "active" projects
      .order('updated_at', { ascending: false })
      .limit(5),
    listActivities(userId, 30),              // Query 8: activity feed (from activity service)
  ]);

  // Check if any of the list queries failed.
  // Count queries throw internally, but list queries return error objects.
  if (recentTasksResult.error || recentNotesResult.error || activeProjectsResult.error) {
    throw new HttpError(500, 'Failed to fetch dashboard data', 'Internal Server Error');
  }

  // Assemble the final dashboard response by mapping DB records to API formats.
  return {
    stats: { projects, tasks, completedTasks, notes },  // Simple counts
    recentTasks: (recentTasksResult.data ?? []).map((record) => mapTask(record as TaskRecord)),
    recentNotes: (recentNotesResult.data ?? []).map((record) => mapNote(record as NoteRecord)),
    activeProjects: (activeProjectsResult.data ?? []).map((record) =>
      mapProject(record as ProjectRecord),
    ),
    activities,  // Already mapped by listActivities() in activity.service.ts
  };
}
