export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NoteEditableFields = Pick<Note, 'title' | 'content' | 'category' | 'isPinned'>;
