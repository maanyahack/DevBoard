import type { Note } from '@/features/notes/types';

export const dummyNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Sprint planning notes',
    content:
      'Prioritize profile polish, ship the notes workspace, and keep the dashboard modules easy to scan.',
    category: 'Planning',
    isPinned: true,
    createdAt: '2026-07-01T09:30:00.000Z',
    updatedAt: '2026-07-05T14:10:00.000Z',
  },
  {
    id: 'note-2',
    title: 'Useful research links',
    content:
      'Collect auth references, Supabase row-level security notes, and UI patterns for compact workspaces.',
    category: 'Research',
    isPinned: false,
    createdAt: '2026-07-02T11:45:00.000Z',
    updatedAt: '2026-07-03T16:25:00.000Z',
  },
  {
    id: 'note-3',
    title: 'DevBoard ideas',
    content:
      'Quick capture, markdown previews, linked tasks, and project-level note collections could make the notes module feel alive.',
    category: 'General',
    isPinned: false,
    createdAt: '2026-07-04T08:20:00.000Z',
    updatedAt: '2026-07-04T08:20:00.000Z',
  },
];
