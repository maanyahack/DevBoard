// Import Supabase admin client for database queries.
import { supabaseAdmin } from '../config/supabase.js';
// Import HttpError for typed HTTP errors.
import { HttpError } from '../middleware/error.middleware.js';

// Union type — the categories of items that can be searched.
export type SearchGroup = 'projects' | 'tasks' | 'notes' | 'bookmarks' | 'knowledge';

// Interface — a single search result item (consistent shape across all categories).
export interface SearchResult {
  id: string;                 // Unique ID of the matched item
  type: SearchGroup;          // Which category it belongs to (for UI filtering)
  title: string;              // Main display text (e.g., project name, task title)
  subtitle: string;           // Secondary text (e.g., description preview)
  href: string;               // URL path to navigate to (e.g., '/projects')
  updatedAt: string | null;   // When it was last modified (for sorting/display)
}

// Interface — the complete search response, organized by category.
// The client receives all categories at once and can filter them in the UI.
export interface GlobalSearchResponse {
  projects: SearchResult[];
  tasks: SearchResult[];
  notes: SearchResult[];
  bookmarks: SearchResult[];
  knowledge: SearchResult[];
}

// Internal interfaces — match raw DB column shapes for type-safe casting.

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
  url: string;               // Bookmarks store a URL, not content
  updated_at: string | null;
}

interface KnowledgeRecord {
  id: string;
  title: string;
  content: string | null;
  updated_at: string | null;
}

// Default empty response — returned when the query is too short (< 2 chars).
const emptyResults: GlobalSearchResponse = {
  projects: [],
  tasks: [],
  notes: [],
  bookmarks: [],
  knowledge: [],
};

/**
 * pattern — builds a SQL LIKE pattern for case-insensitive substring matching.
 * E.g., pattern("hello") returns "%hello%"
 *
 * Also escapes the special SQL wildcards % and _ in the user's query
 * so they're treated as literal characters, not wildcards.
 */
function pattern(query: string): string {
  return `%${query.replaceAll('%', '\\%').replaceAll('_', '\\_')}%`;
}

/**
 * isMissingSchema — detects if an error is because the table/column
 * doesn't exist in the database (e.g., 'bookmarks' table hasn't been created yet).
 * Allows graceful degradation for planned-but-not-yet-built features.
 */
function isMissingSchema(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const value = error as { code?: string; message?: string };
  return (
    value.code === '42P01' ||           // PostgreSQL: undefined table
    value.code === 'PGRST205' ||        // PostgREST: table not found
    Boolean(value.message?.toLowerCase().includes('could not find'))
  );
}

/**
 * globalSearch — search across all modules simultaneously.
 *
 * Searches project names, task titles/descriptions, note titles/content,
 * bookmark titles/URLs, and knowledge entries — all in parallel.
 * Returns the top 6 results per category.
 */
export async function globalSearch(userId: string, query: string): Promise<GlobalSearchResponse> {
  // Normalize the query — trim whitespace.
  const normalized = query.trim();

  // Require at least 2 characters — too-short queries would return too many results.
  if (normalized.length < 2) return emptyResults;

  // Build the LIKE pattern: "%search term%"
  const like = pattern(normalized);

  // Run all 5 search queries in parallel using Promise.all.
  // Each query searches a different table using Supabase's .or() method,
  // which allows matching against multiple columns (e.g., name OR description).
  const [projects, tasks, notes, bookmarks, knowledge] = await Promise.all([
    // Search projects by name or description
    supabaseAdmin
      .from('projects')
      .select('id, name, description, updated_at')
      .eq('user_id', userId)
      // '.or()' creates a SQL OR clause: WHERE name ILIKE '%query%' OR description ILIKE '%query%'
      .or(`name.ilike.${like},description.ilike.${like}`)
      .order('updated_at', { ascending: false })
      .limit(6),

    // Search tasks by title or description
    supabaseAdmin
      .from('tasks')
      .select('id, title, description, updated_at')
      .eq('user_id', userId)
      .or(`title.ilike.${like},description.ilike.${like}`)
      .order('updated_at', { ascending: false })
      .limit(6),

    // Search notes by title or content
    supabaseAdmin
      .from('notes')
      .select('id, title, content, updated_at')
      .eq('user_id', userId)
      .or(`title.ilike.${like},content.ilike.${like}`)
      .order('updated_at', { ascending: false })
      .limit(6),

    // Search bookmarks by title or URL
    supabaseAdmin
      .from('bookmarks')
      .select('id, title, url, updated_at')
      .eq('user_id', userId)
      .or(`title.ilike.${like},url.ilike.${like}`)
      .order('updated_at', { ascending: false })
      .limit(6),

    // Search knowledge entries by title or content
    supabaseAdmin
      .from('knowledge_entries')
      .select('id, title, content, updated_at')
      .eq('user_id', userId)
      .or(`title.ilike.${like},content.ilike.${like}`)
      .order('updated_at', { ascending: false })
      .limit(6),
  ]);

  // Check if any of the core searches (projects, tasks, notes) failed.
  // Bookmarks and knowledge are optional — their errors are handled individually below.
  const errors = [projects.error, tasks.error, notes.error].filter(Boolean);
  if (errors.length > 0) {
    throw new HttpError(500, 'Failed to search workspace', 'Internal Server Error');
  }

  // Map raw DB results to the standard SearchResult format for each category.
  return {
    // Projects: use 'name' as title, 'description' as subtitle
    projects: (projects.data ?? []).map((item) => {
      const record = item as ProjectRecord;
      return {
        id: record.id,
        type: 'projects' as SearchGroup,  // 'as SearchGroup' — type assertion to satisfy TypeScript
        title: record.name,
        subtitle: record.description ?? 'Project',
        href: '/projects',
        updatedAt: record.updated_at,
      };
    }),

    // Tasks: use 'title' as title, 'description' as subtitle
    tasks: (tasks.data ?? []).map((item) => {
      const record = item as TaskRecord;
      return {
        id: record.id,
        type: 'tasks' as SearchGroup,
        title: record.title,
        subtitle: record.description ?? 'Task',
        href: '/tasks',
        updatedAt: record.updated_at,
      };
    }),

    // Notes: use 'title' as title, 'content' as subtitle
    notes: (notes.data ?? []).map((item) => {
      const record = item as NoteRecord;
      return {
        id: record.id,
        type: 'notes' as SearchGroup,
        title: record.title,
        subtitle: record.content ?? 'Note',
        href: '/notes',
        updatedAt: record.updated_at,
      };
    }),

    // Bookmarks: if the table doesn't exist, return empty array instead of crashing.
    bookmarks: bookmarks.error && isMissingSchema(bookmarks.error) ? [] : (bookmarks.data ?? []).map((item) => {
      const record = item as BookmarkRecord;
      return {
        id: record.id,
        type: 'bookmarks' as SearchGroup,
        title: record.title,
        subtitle: record.url,  // Show the URL as subtitle for bookmarks
        href: '/bookmarks',
        updatedAt: record.updated_at,
      };
    }),

    // Knowledge: if the table doesn't exist, return empty array instead of crashing.
    knowledge: knowledge.error && isMissingSchema(knowledge.error) ? [] : (knowledge.data ?? []).map((item) => {
      const record = item as KnowledgeRecord;
      return {
        id: record.id,
        type: 'knowledge' as SearchGroup,
        title: record.title,
        subtitle: record.content ?? 'Knowledge entry',
        href: '/knowledge',
        updatedAt: record.updated_at,
      };
    }),
  };
}
