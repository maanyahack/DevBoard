// Import the Supabase admin client for database operations.
import { supabaseAdmin } from '../config/supabase.js';
// Import HttpError for throwing typed HTTP errors.
import { HttpError } from '../middleware/error.middleware.js';

// TypeScript 'union type' with 'type' keyword — a string literal union.
// 'ActivityType' can only be one of these specific strings.
// This prevents typos and provides autocomplete in IDEs.
export type ActivityType =
  | 'project_created'
  | 'task_created'
  | 'task_completed'
  | 'note_created'
  | 'bookmark_added'
  | 'knowledge_entry_created'
  | 'ai_summary_generated'
  | 'ai_tasks_generated';

// Interface — what the activity logger needs to record an event.
export interface ActivityInput {
  type: ActivityType;     // Which kind of activity occurred
  title: string;          // Human-readable description ("Task completed: Buy milk")
  // 'Record<string, ...>' is a TypeScript utility type — an object with string keys
  // and values that can be string, number, boolean, or null.
  metadata?: Record<string, string | number | boolean | null>;  // Optional extra data
}

// Internal interface — raw DB record (snake_case).
interface ActivityRecord {
  id: string;
  type: ActivityType;
  title: string;
  metadata: Record<string, string | number | boolean | null> | null;  // Nullable in DB
  created_at: string;
}

// Exported interface — API response format (camelCase).
export interface ActivityResponse {
  id: string;
  type: ActivityType;
  title: string;
  metadata: Record<string, string | number | boolean | null>;  // Never null in response
  createdAt: string;
}

// Column list for SELECT queries.
const activitySelectColumns = 'id, type, title, metadata, created_at';

/**
 * isMissingSchema — detects if an error is because the activities table
 * or its columns don't exist in the database yet.
 * This allows the app to gracefully degrade if the activity feature
 * hasn't been fully set up.
 */
function isMissingSchema(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const value = error as { code?: string; message?: string };
  return (
    value.code === '42P01' ||           // PostgreSQL: undefined table
    value.code === '42703' ||           // PostgreSQL: undefined column
    value.code === 'PGRST204' ||        // PostgREST: column not found
    value.code === 'PGRST205' ||        // PostgREST: table not found
    Boolean(value.message?.toLowerCase().includes('could not find'))
  );
}

// Maps a DB record to the API response format.
function mapActivity(record: ActivityRecord): ActivityResponse {
  return {
    id: record.id,
    type: record.type,
    title: record.title,
    metadata: record.metadata ?? {},  // Null → empty object
    createdAt: record.created_at,
  };
}

/**
 * logActivity — record a user action in the activity feed.
 * Called after every CRUD operation (note created, task completed, etc.)
 * to build the activity timeline shown on the dashboard.
 */
export async function logActivity(userId: string, input: ActivityInput): Promise<void> {
  const { error } = await supabaseAdmin.from('activities').insert({
    user_id: userId,
    type: input.type,
    title: input.title,
    metadata: input.metadata ?? {},  // Default to empty object if not provided
  });

  // If the activities table doesn't exist or is misconfigured,
  // silently return — activity logging is a "nice to have," not critical.
  if (error) {
    if (isMissingSchema(error)) return;  // Graceful degradation
    throw new HttpError(500, 'Failed to log activity', 'Internal Server Error');
  }
}

/**
 * listActivities — fetch the most recent activities for a user.
 * Used by the dashboard to show the activity timeline.
 */
export async function listActivities(userId: string, limit = 30): Promise<ActivityResponse[]> {
  const { data, error } = await supabaseAdmin
    .from('activities')
    .select(activitySelectColumns)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })  // Newest first
    .limit(limit);                                // Default: last 30 activities

  if (error) {
    // If the table doesn't exist, return an empty array instead of crashing.
    if (isMissingSchema(error)) return [];
    throw new HttpError(500, 'Failed to fetch activity', 'Internal Server Error');
  }

  return (data ?? []).map((record) => mapActivity(record as ActivityRecord));
}
