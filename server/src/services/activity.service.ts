import { supabaseAdmin } from '../config/supabase.js';
import { HttpError } from '../middleware/error.middleware.js';

export type ActivityType =
  | 'project_created'
  | 'task_created'
  | 'task_completed'
  | 'note_created'
  | 'bookmark_added'
  | 'knowledge_entry_created'
  | 'ai_summary_generated'
  | 'ai_tasks_generated';

export interface ActivityInput {
  type: ActivityType;
  title: string;
  metadata?: Record<string, string | number | boolean | null>;
}

interface ActivityRecord {
  id: string;
  type: ActivityType;
  title: string;
  metadata: Record<string, string | number | boolean | null> | null;
  created_at: string;
}

export interface ActivityResponse {
  id: string;
  type: ActivityType;
  title: string;
  metadata: Record<string, string | number | boolean | null>;
  createdAt: string;
}

const activitySelectColumns = 'id, type, title, metadata, created_at';

function isMissingSchema(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const value = error as { code?: string; message?: string };
  return (
    value.code === '42P01' ||
    value.code === '42703' ||
    value.code === 'PGRST204' ||
    value.code === 'PGRST205' ||
    Boolean(value.message?.toLowerCase().includes('could not find'))
  );
}

function mapActivity(record: ActivityRecord): ActivityResponse {
  return {
    id: record.id,
    type: record.type,
    title: record.title,
    metadata: record.metadata ?? {},
    createdAt: record.created_at,
  };
}

export async function logActivity(userId: string, input: ActivityInput): Promise<void> {
  const { error } = await supabaseAdmin.from('activities').insert({
    user_id: userId,
    type: input.type,
    title: input.title,
    metadata: input.metadata ?? {},
  });

  if (error) {
    if (isMissingSchema(error)) return;
    throw new HttpError(500, 'Failed to log activity', 'Internal Server Error');
  }
}

export async function listActivities(userId: string, limit = 30): Promise<ActivityResponse[]> {
  const { data, error } = await supabaseAdmin
    .from('activities')
    .select(activitySelectColumns)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingSchema(error)) return [];
    throw new HttpError(500, 'Failed to fetch activity', 'Internal Server Error');
  }

  return (data ?? []).map((record) => mapActivity(record as ActivityRecord));
}
