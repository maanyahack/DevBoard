import { supabaseAdmin } from '../config/supabase.js';
import { HttpError } from '../middleware/error.middleware.js';

export type SearchGroup = 'projects' | 'tasks' | 'notes' | 'bookmarks' | 'knowledge';

export interface SearchResult {
  id: string;
  type: SearchGroup;
  title: string;
  subtitle: string;
  href: string;
  updatedAt: string | null;
}

export interface GlobalSearchResponse {
  projects: SearchResult[];
  tasks: SearchResult[];
  notes: SearchResult[];
  bookmarks: SearchResult[];
  knowledge: SearchResult[];
}

interface ProjectRecord {
  id: string;
  name: string;
  description: string | null;
  updated_at: string | null;
}

interface TaskRecord {
  id: string;
  title: string;
  description: string | null;
  updated_at: string | null;
}

interface NoteRecord {
  id: string;
  title: string;
  content: string | null;
  updated_at: string | null;
}

interface BookmarkRecord {
  id: string;
  title: string;
  url: string;
  updated_at: string | null;
}

interface KnowledgeRecord {
  id: string;
  title: string;
  content: string | null;
  updated_at: string | null;
}

const emptyResults: GlobalSearchResponse = {
  projects: [],
  tasks: [],
  notes: [],
  bookmarks: [],
  knowledge: [],
};

function pattern(query: string): string {
  return `%${query.replaceAll('%', '\\%').replaceAll('_', '\\_')}%`;
}

function isMissingSchema(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const value = error as { code?: string; message?: string };
  return (
    value.code === '42P01' ||
    value.code === 'PGRST205' ||
    Boolean(value.message?.toLowerCase().includes('could not find'))
  );
}

export async function globalSearch(userId: string, query: string): Promise<GlobalSearchResponse> {
  const normalized = query.trim();
  if (normalized.length < 2) return emptyResults;

  const like = pattern(normalized);

  const [projects, tasks, notes, bookmarks, knowledge] = await Promise.all([
    supabaseAdmin
      .from('projects')
      .select('id, name, description, updated_at')
      .eq('user_id', userId)
      .or(`name.ilike.${like},description.ilike.${like}`)
      .order('updated_at', { ascending: false })
      .limit(6),
    supabaseAdmin
      .from('tasks')
      .select('id, title, description, updated_at')
      .eq('user_id', userId)
      .or(`title.ilike.${like},description.ilike.${like}`)
      .order('updated_at', { ascending: false })
      .limit(6),
    supabaseAdmin
      .from('notes')
      .select('id, title, content, updated_at')
      .eq('user_id', userId)
      .or(`title.ilike.${like},content.ilike.${like}`)
      .order('updated_at', { ascending: false })
      .limit(6),
    supabaseAdmin
      .from('bookmarks')
      .select('id, title, url, updated_at')
      .eq('user_id', userId)
      .or(`title.ilike.${like},url.ilike.${like}`)
      .order('updated_at', { ascending: false })
      .limit(6),
    supabaseAdmin
      .from('knowledge_entries')
      .select('id, title, content, updated_at')
      .eq('user_id', userId)
      .or(`title.ilike.${like},content.ilike.${like}`)
      .order('updated_at', { ascending: false })
      .limit(6),
  ]);

  const errors = [projects.error, tasks.error, notes.error].filter(Boolean);
  if (errors.length > 0) {
    throw new HttpError(500, 'Failed to search workspace', 'Internal Server Error');
  }

  return {
    projects: (projects.data ?? []).map((item) => {
      const record = item as ProjectRecord;
      return {
        id: record.id,
        type: 'projects',
        title: record.name,
        subtitle: record.description ?? 'Project',
        href: '/projects',
        updatedAt: record.updated_at,
      };
    }),
    tasks: (tasks.data ?? []).map((item) => {
      const record = item as TaskRecord;
      return {
        id: record.id,
        type: 'tasks',
        title: record.title,
        subtitle: record.description ?? 'Task',
        href: '/tasks',
        updatedAt: record.updated_at,
      };
    }),
    notes: (notes.data ?? []).map((item) => {
      const record = item as NoteRecord;
      return {
        id: record.id,
        type: 'notes',
        title: record.title,
        subtitle: record.content ?? 'Note',
        href: '/notes',
        updatedAt: record.updated_at,
      };
    }),
    bookmarks: bookmarks.error && isMissingSchema(bookmarks.error) ? [] : (bookmarks.data ?? []).map((item) => {
      const record = item as BookmarkRecord;
      return {
        id: record.id,
        type: 'bookmarks',
        title: record.title,
        subtitle: record.url,
        href: '/bookmarks',
        updatedAt: record.updated_at,
      };
    }),
    knowledge: knowledge.error && isMissingSchema(knowledge.error) ? [] : (knowledge.data ?? []).map((item) => {
      const record = item as KnowledgeRecord;
      return {
        id: record.id,
        type: 'knowledge',
        title: record.title,
        subtitle: record.content ?? 'Knowledge entry',
        href: '/knowledge',
        updatedAt: record.updated_at,
      };
    }),
  };
}
