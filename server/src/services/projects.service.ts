// Import Supabase admin client for database operations.
import { supabaseAdmin } from '../config/supabase.js';
// Import HttpError for throwing typed HTTP errors.
import { HttpError } from '../middleware/error.middleware.js';
// Import activity logger to record project actions on the dashboard.
import { logActivity } from './activity.service.js';
// Import sanitizers to clean user input before storing.
import { sanitizePlainText, sanitizeContent } from '../lib/sanitize.js';

// Interface — what the client sends when creating/updating a project.
export interface ProjectInput {
  name: string;        // Project name (plain text, no HTML)
  description: string; // Project description (allows safe HTML)
  status: 'planning' | 'active' | 'completed' | 'archived';  // Union type: one of 4 states
  githubUrl: string | null;  // Optional GitHub repo URL
  sortOrder: number;          // Position for manual ordering
}

// Internal interface — matches the DB columns (snake_case).
interface ProjectRecord {
  id: string;
  name: string;
  description: string | null;  // Nullable in the database
  status: 'planning' | 'active' | 'completed' | 'archived';
  github_url: string | null;   // DB uses snake_case
  sort_order: number | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Exported interface — API response format (camelCase) sent to the client.
export interface ProjectResponse {
  id: string;
  name: string;
  description: string;    // Always string, never null (defaulted to '')
  status: 'planning' | 'active' | 'completed' | 'archived';
  githubUrl: string | null;
  sortOrder: number;       // Always number, defaulting to 0
  createdAt: string;
  updatedAt: string;
}

// Explicit column list to prevent leaking unintended data.
const projectSelectColumns =
  'id, name, description, status, github_url, sort_order, user_id, created_at, updated_at';

// Maps a raw DB record to the API response format.
function mapProject(record: ProjectRecord): ProjectResponse {
  return {
    id: record.id,
    name: record.name,
    description: record.description ?? '',  // Null → empty string
    status: record.status,
    githubUrl: record.github_url,           // snake_case → camelCase
    sortOrder: record.sort_order ?? 0,      // Null → 0
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

/**
 * listProjects — fetch all projects for a user, ordered by position then recency.
 */
export async function listProjects(userId: string): Promise<ProjectResponse[]> {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select(projectSelectColumns)
    .eq('user_id', userId)             // Only this user's projects
    .order('sort_order', { ascending: true })    // Manual position first
    .order('updated_at', { ascending: false });  // Then most recently updated

  if (error) {
    throw new HttpError(500, 'Failed to fetch projects', 'Internal Server Error');
  }

  return (data ?? []).map((record) => mapProject(record as ProjectRecord));
}

/**
 * createProject — insert a new project and log the activity.
 */
export async function createProject(
  userId: string,
  input: ProjectInput,
): Promise<ProjectResponse> {
  // Sanitize user input — strip HTML from name, allow safe HTML in description.
  const safeName = sanitizePlainText(input.name);
  const safeDescription = sanitizeContent(input.description);

  const { data, error } = await supabaseAdmin
    .from('projects')
    .insert({
      user_id: userId,
      name: safeName,
      description: safeDescription,
      status: input.status,
      github_url: input.githubUrl,
      sort_order: input.sortOrder,
    })
    .select(projectSelectColumns)
    .single();  // Expect exactly one inserted row

  if (error || !data) {
    throw new HttpError(500, 'Failed to create project', 'Internal Server Error');
  }

  const project = mapProject(data as ProjectRecord);

  // Log the creation in the activity feed.
  await logActivity(userId, {
    type: 'project_created',
    title: `Project created: ${project.name}`,
    metadata: { projectId: project.id },
  });

  return project;
}

/**
 * updateProject — update all fields of an existing project.
 * Only works if the project belongs to the authenticated user.
 */
export async function updateProject(
  userId: string,
  projectId: string,
  input: ProjectInput,
): Promise<ProjectResponse> {
  const safeName = sanitizePlainText(input.name);
  const safeDescription = sanitizeContent(input.description);

  // Update WHERE id = projectId AND user_id = userId (ownership check).
  const { data, error } = await supabaseAdmin
    .from('projects')
    .update({
      name: safeName,
      description: safeDescription,
      status: input.status,
      github_url: input.githubUrl,
      sort_order: input.sortOrder,
    })
    .eq('id', projectId)
    .eq('user_id', userId)
    .select(projectSelectColumns)
    .maybeSingle();  // Returns null (not error) if no row matched

  if (error) {
    throw new HttpError(500, 'Failed to update project', 'Internal Server Error');
  }

  // null data means the project wasn't found or doesn't belong to this user.
  if (!data) {
    throw new HttpError(404, 'Project not found', 'Not Found');
  }

  return mapProject(data as ProjectRecord);
}

/**
 * deleteProject — permanently remove a project.
 * Uses the dual-WHERE pattern for ownership verification.
 */
export async function deleteProject(userId: string, projectId: string): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', userId)
    .select('id')
    .maybeSingle();

  if (error) {
    throw new HttpError(500, 'Failed to delete project', 'Internal Server Error');
  }

  if (!data) {
    throw new HttpError(404, 'Project not found', 'Not Found');
  }
}
