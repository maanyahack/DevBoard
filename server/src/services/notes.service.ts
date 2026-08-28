// Import the Supabase admin client for database operations.
import { supabaseAdmin } from '../config/supabase.js';
// Import HttpError for throwing HTTP-specific errors (404, 500, etc.)
import { HttpError } from '../middleware/error.middleware.js';
// Import the activity logger — every CRUD action logs an activity entry.
import { logActivity } from './activity.service.js';
// Import sanitization functions to prevent XSS attacks in user content.
import { sanitizeContent, sanitizePlainText } from '../lib/sanitize.js';

// TypeScript interface — defines what data a client must send to create/update a note.
// 'interface' describes the shape of an object with named properties and their types.
export interface NoteInput {
  title: string;      // Note title — required string
  content: string;    // Note body (HTML) — required string
  category: string;   // Category label like "General" or "Work"
  isPinned: boolean;  // Whether the note is pinned to the top
}

// Internal interface — matches the raw database column names (snake_case).
// This is what Supabase returns from the 'notes' table.
// Not exported because only this file needs it.
interface NoteRecord {
  id: string;             // UUID primary key
  title: string;
  content: string | null; // Content can be null in the DB
  category: string;
  is_pinned: boolean;     // DB column is snake_case
  user_id: string;        // Foreign key to the auth.users table
  created_at: string;     // ISO timestamp string
  updated_at: string;
}

// Exported interface — what the API sends back to the client.
// Uses camelCase (JavaScript convention) instead of snake_case (DB convention).
// This is a deliberate separation: the client never sees DB column names.
export interface NoteResponse {
  id: string;
  title: string;
  content: string;    // Always a string, never null (we default to '')
  category: string;
  isPinned: boolean;  // camelCase for the client
  createdAt: string;  // camelCase for the client
  updatedAt: string;
}

// Comma-separated list of columns to SELECT from Supabase.
// Specifying columns prevents accidentally returning sensitive data like user_id.
const noteSelectColumns = 'id, title, content, category, is_pinned, user_id, created_at, updated_at';

/**
 * mapNote — transforms a raw DB record into the API response format.
 * This is the "translation layer" between database snake_case and API camelCase.
 * Using a dedicated mapper function means if the DB schema changes, you only
 * update this one function instead of every query.
 */
function mapNote(record: NoteRecord): NoteResponse {
  return {
    id: record.id,
    title: record.title,
    content: record.content ?? '',  // '??' = nullish coalescing — replace null with ''
    category: record.category,
    isPinned: record.is_pinned,     // Convert snake_case to camelCase
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

/**
 * listNotes — fetch all notes for a specific user, ordered by most recently updated.
 */
export async function listNotes(userId: string): Promise<NoteResponse[]> {
  // Build a Supabase query:
  // .from('notes')       → query the 'notes' table
  // .select(columns)     → only return specific columns
  // .eq('user_id', uid)  → WHERE user_id = uid (filter by owner)
  // .order(...)          → ORDER BY updated_at DESC (newest first)
  const { data, error } = await supabaseAdmin
    .from('notes')
    .select(noteSelectColumns)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  // If the query failed (DB error, network issue), throw a 500 error.
  if (error) {
    throw new HttpError(500, 'Failed to fetch notes', 'Internal Server Error');
  }

  // 'data ?? []' — if data is null, use an empty array instead.
  // '.map()' — transform each DB record into a NoteResponse using mapNote.
  return (data ?? []).map((record) => mapNote(record as NoteRecord));
}

/**
 * createNote — insert a new note into the database and log the activity.
 */
export async function createNote(userId: string, input: NoteInput): Promise<NoteResponse> {
  // Sanitize all user input before storing it — defense against XSS.
  // 'sanitizePlainText' strips all HTML tags (for titles, categories).
  // 'sanitizeContent' allows safe HTML tags but removes dangerous ones.
  const safeTitle = sanitizePlainText(input.title);
  const safeContent = sanitizeContent(input.content);
  const safeCategory = sanitizePlainText(input.category);

  // Insert a new row into the 'notes' table with the sanitized data.
  // .insert({...})     → INSERT INTO notes (...)
  // .select(columns)   → return the inserted row
  // .single()          → expect exactly one result (not an array)
  const { data, error } = await supabaseAdmin
    .from('notes')
    .insert({
      user_id: userId,
      title: safeTitle,
      content: safeContent,
      category: safeCategory,
      is_pinned: input.isPinned,
    })
    .select(noteSelectColumns)
    .single();

  // If the insert failed, throw a 500 error.
  if (error || !data) {
    throw new HttpError(500, 'Failed to create note', 'Internal Server Error');
  }

  // Map the inserted DB record to the API response format.
  const note = mapNote(data as NoteRecord);

  // Log this action in the activity feed (shows up on the dashboard).
  // 'await' pauses until the activity is logged — we want this to complete.
  await logActivity(userId, {
    type: 'note_created',
    title: `Note created: ${note.title}`,
    metadata: { noteId: note.id },  // Extra data for linking back to the note
  });

  return note;  // Return the newly created note to the controller
}

/**
 * updateNote — update an existing note's content.
 * Both noteId AND userId must match — users can only update their own notes.
 */
export async function updateNote(
  userId: string,   // The authenticated user's ID
  noteId: string,   // The note's UUID
  input: NoteInput, // The new data for the note
): Promise<NoteResponse> {
  // Sanitize input just like createNote — never trust client data.
  const safeTitle = sanitizePlainText(input.title);
  const safeContent = sanitizeContent(input.content);
  const safeCategory = sanitizePlainText(input.category);

  // Update the note WHERE id = noteId AND user_id = userId.
  // The dual WHERE clause ensures users can only modify their own notes.
  const { data, error } = await supabaseAdmin
    .from('notes')
    .update({
      title: safeTitle,
      content: safeContent,
      category: safeCategory,
      is_pinned: input.isPinned,
    })
    .eq('id', noteId)       // WHERE id = noteId
    .eq('user_id', userId)  // AND user_id = userId
    .select(noteSelectColumns)
    .maybeSingle();  // 'maybeSingle' — returns null instead of error if no row found

  // DB-level error (not "not found", but an actual failure).
  if (error) {
    throw new HttpError(500, 'Failed to update note', 'Internal Server Error');
  }

  // If data is null, no note matched the ID + user combo → 404.
  if (!data) {
    throw new HttpError(404, 'Note not found', 'Not Found');
  }

  return mapNote(data as NoteRecord);
}

/**
 * deleteNote — permanently remove a note from the database.
 * Uses the same dual-WHERE pattern to ensure ownership.
 */
export async function deleteNote(userId: string, noteId: string): Promise<void> {
  // .delete()            → DELETE FROM notes
  // .select('id')        → return just the ID to confirm which row was deleted
  // .maybeSingle()       → null if no row matched (not found)
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

  // No data returned means the note didn't exist or wasn't owned by this user.
  if (!data) {
    throw new HttpError(404, 'Note not found', 'Not Found');
  }
}
