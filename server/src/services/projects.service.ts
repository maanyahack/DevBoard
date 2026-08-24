import { supabaseAdmin } from '../config/supabase.js';
import { HttpError } from '../middleware/error.middleware.js';
import { logActivity } from './activity.service.js';
import { sanitizePlainText, sanitizeContent } from '../lib/sanitize.js';

export interface ProjectInput {
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'archived';
  githubUrl: string | null;
  sortOrder: number;
}

interface ProjectRecord {
  id: string;
  name: string;
  description: string | null;
  status: 'planning' | 'active' | 'completed' | 'archived';
  github_url: string | null;
  sort_order: number | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'archived';
  githubUrl: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const projectSelectColumns =
  'id, name, description, status, github_url, sort_order, user_id, created_at, updated_at';

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

export async function listProjects(userId: string): Promise<ProjectResponse[]> {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select(projectSelectColumns)
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .order('updated_at', { ascending: false });

  if (error) {
    throw new HttpError(500, 'Failed to fetch projects', 'Internal Server Error');
  }

  return (data ?? []).map((record) => mapProject(record as ProjectRecord));
}

export async function createProject(
  userId: string,
  input: ProjectInput,
): Promise<ProjectResponse> {
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
    .single();

  if (error || !data) {
    throw new HttpError(500, 'Failed to create project', 'Internal Server Error');
  }

  const project = mapProject(data as ProjectRecord);
  await logActivity(userId, {
    type: 'project_created',
    title: `Project created: ${project.name}`,
    metadata: { projectId: project.id },
  });

  return project;
}

export async function updateProject(
  userId: string,
  projectId: string,
  input: ProjectInput,
): Promise<ProjectResponse> {
  const safeName = sanitizePlainText(input.name);
  const safeDescription = sanitizeContent(input.description);

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
    .maybeSingle();

  if (error) {
    throw new HttpError(500, 'Failed to update project', 'Internal Server Error');
  }

  if (!data) {
    throw new HttpError(404, 'Project not found', 'Not Found');
  }

  return mapProject(data as ProjectRecord);
}

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
