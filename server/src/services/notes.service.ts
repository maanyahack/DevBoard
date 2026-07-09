import { supabaseAdmin } from '../config/supabase.js';
import { HttpError } from '../middleware/error.middleware.js';

export interface NoteInput {
  title: string;
  content: string;
}

interface NoteRecord {
  id: string;
  title: string;
  content: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface NoteResponse {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const noteSelectColumns = 'id, title, content, user_id, created_at, updated_at';

function mapNote(record: NoteRecord): NoteResponse {
  return {
    id: record.id,
    title: record.title,
    content: record.content ?? '',
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export async function listNotes(userId: string): Promise<NoteResponse[]> {
  const { data, error } = await supabaseAdmin
    .from('notes')
    .select(noteSelectColumns)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new HttpError(500, 'Failed to fetch notes', 'Internal Server Error');
  }

  return (data ?? []).map((record) => mapNote(record as NoteRecord));
}

export async function createNote(userId: string, input: NoteInput): Promise<NoteResponse> {
  const { data, error } = await supabaseAdmin
    .from('notes')
    .insert({
      user_id: userId,
      title: input.title,
      content: input.content,
    })
    .select(noteSelectColumns)
    .single();

  if (error || !data) {
    throw new HttpError(500, 'Failed to create note', 'Internal Server Error');
  }

  return mapNote(data as NoteRecord);
}

export async function updateNote(
  userId: string,
  noteId: string,
  input: NoteInput,
): Promise<NoteResponse> {
  const { data, error } = await supabaseAdmin
    .from('notes')
    .update({
      title: input.title,
      content: input.content,
    })
    .eq('id', noteId)
    .eq('user_id', userId)
    .select(noteSelectColumns)
    .maybeSingle();

  if (error) {
    throw new HttpError(500, 'Failed to update note', 'Internal Server Error');
  }

  if (!data) {
    throw new HttpError(404, 'Note not found', 'Not Found');
  }

  return mapNote(data as NoteRecord);
}

export async function deleteNote(userId: string, noteId: string): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', userId)
    .select('id')
    .maybeSingle();

  if (error) {
    throw new HttpError(500, 'Failed to delete note', 'Internal Server Error');
  }

  if (!data) {
    throw new HttpError(404, 'Note not found', 'Not Found');
  }
}