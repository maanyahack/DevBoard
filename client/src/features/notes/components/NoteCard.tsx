import { Pin } from 'lucide-react';
import type { Note } from '@/features/notes/types';

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  selectionMode: boolean;
  onSelect: (id: string) => void;
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

export function NoteCard({
  note,
  isSelected,
  selectionMode,
  onSelect,
  onEdit,
  onDelete,
  onTogglePinned,
}: NoteCardProps) {
  return (
    <article
      className={`group relative rounded-xl border bg-white p-5 shadow-sm transition-all duration-150 dark:bg-slate-800 ${
        isSelected
          ? 'border-emerald-400 bg-emerald-50/30 ring-2 ring-emerald-400 dark:border-emerald-500 dark:bg-emerald-500/5 dark:ring-emerald-500'
          : 'border-slate-200 hover:-translate-y-px hover:border-slate-300 hover:shadow-md dark:border-slate-700/80 dark:hover:border-slate-600 dark:hover:shadow-black/20'
      }`}
    >
      {/* Checkbox */}
      <label
        className={`absolute left-3 top-3 z-10 flex h-5 w-5 cursor-pointer items-center justify-center transition-opacity duration-150 ${
          selectionMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        aria-label={isSelected ? 'Deselect note' : 'Select note'}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(note.id)}
          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          onClick={(e) => e.stopPropagation()}
        />
      </label>

      {/* Header row */}
      <div className={`flex items-start justify-between gap-4 ${selectionMode ? 'pl-7' : ''}`}>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700 ring-1 ring-inset ring-teal-600/15 dark:bg-teal-400/10 dark:text-teal-300 dark:ring-teal-400/25">
              {note.category}
            </span>
            {note.isPinned && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/15 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25">
                <Pin className="h-2.5 w-2.5" />
                Pinned
              </span>
            )}
          </div>
          <h2 className="mt-2.5 line-clamp-2 text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {note.title}
          </h2>
        </div>

        {/* Pin toggle */}
        <button
          type="button"
          onClick={() => onTogglePinned(note.id)}
          className={`rounded-lg p-1.5 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-800 ${
            note.isPinned
              ? 'text-amber-500 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-400/10'
              : 'text-slate-300 hover:bg-slate-100 hover:text-amber-500 dark:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-amber-400'
          }`}
          aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
          title={note.isPinned ? 'Unpin' : 'Pin'}
        >
          <Pin className={`h-4 w-4 ${note.isPinned ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Body */}
      <p className="mt-3 line-clamp-4 min-h-[4.5rem] text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {note.content || 'No content yet.'}
      </p>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3.5 dark:border-slate-700/60">
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Updated {formatDate(note.updatedAt)}
        </p>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onEdit(note)}
            className="rounded-md px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(note.id)}
            className="rounded-md px-2.5 py-1 text-xs font-medium text-red-500 transition-colors duration-150 hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
