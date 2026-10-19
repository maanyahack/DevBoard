/**
 * Note — represents a note object as returned by the API.
 * This is the "full" note type used throughout the client.
 */
export interface Note {
  id: string;         // UUID primary key
  title: string;      // Note title
  content: string;    // Note body (may contain HTML)
  category: string;   // Category label (e.g., "General", "Work", "Personal")
  isPinned: boolean;  // Whether the note is pinned to the top of the list
  createdAt: string;  // ISO timestamp string
  updatedAt: string;  // ISO timestamp string
}

/**
 * NoteEditableFields — the subset of Note fields that users can create/update.
 * Uses TypeScript's 'Pick' utility type to extract only these fields from Note.
 * This prevents accidentally sending read-only fields (like id, createdAt) to the API.
 *
 * NoteEditableFields = { title: string; content: string; category: string; isPinned: boolean }
 */
export type NoteEditableFields = Pick<Note, 'title' | 'content' | 'category' | 'isPinned'>;
