import type { Note } from '@/features/notes/types';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onTogglePinned: (noteId: string) => void;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function NoteCard({ note, onEdit, onDelete, onTogglePinned }: NoteCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700 dark:bg-teal-400/10 dark:text-teal-300">
              {note.category}
            </span>
            {note.isPinned && (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                Pinned
              </span>
            )}
          </div>
          <h2 className="mt-3 line-clamp-2 text-base font-semibold text-slate-900 dark:text-slate-100">
            {note.title}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => onTogglePinned(note.id)}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-slate-700 dark:hover:text-amber-300"
          aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
          title={note.isPinned ? 'Unpin note' : 'Pin note'}
        >
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill={note.isPinned ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 17v5" />
            <path d="M5 17h14" />
            <path d="m7 3 10 10" />
            <path d="M8.5 4.5 5 8l11 11 3.5-3.5" />
          </svg>
        </button>
      </div>

      <p className="mt-3 line-clamp-4 min-h-20 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {note.content || 'No content yet.'}
      </p>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-700">
        <p className="text-xs text-slate-400 dark:text-slate-500">Updated {formatDate(note.updatedAt)}</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(note)}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(note.id)}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
