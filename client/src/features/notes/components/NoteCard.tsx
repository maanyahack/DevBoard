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
      className={`floating-card tilt-card stagger-item group relative rounded-xl border bg-white p-5 shadow-sm shadow-slate-200/50 dark:bg-slate-800 dark:shadow-black/10 ${
        isSelected
          ? 'border-emerald-400 bg-emerald-50/30 ring-2 ring-emerald-400 dark:border-emerald-500 dark:bg-emerald-500/5 dark:ring-emerald-500'
          : note.isPinned
            ? 'border-amber-200 hover:-translate-y-px hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100/60 dark:border-amber-500/25 dark:hover:border-amber-400/45 dark:hover:shadow-black/25'
            : 'border-slate-200 hover:-translate-y-px hover:border-violet-200 hover:shadow-lg hover:shadow-slate-200/70 dark:border-slate-700/80 dark:hover:border-violet-500/30 dark:hover:shadow-black/25'
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
            <span className="inline-flex items-center rounded-md bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700 ring-1 ring-inset ring-violet-600/15 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/25">
              {note.category}
            </span>
            {note.isPinned && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/30">
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
          className={`pressable rounded-lg p-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-800 ${
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
      <p className="mt-3 line-clamp-4 min-h-[4.5rem] text-sm leading-relaxed text-slate-600 dark:text-slate-400">
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
            className="pressable rounded-md px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-slate-400 dark:hover:bg-sky-500/10 dark:hover:text-sky-300"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(note.id)}
            className="pressable rounded-md px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
