import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Note, NoteEditableFields } from '@/features/notes/types';

interface NoteModalProps {
  note?: Note | null;
  isOpen: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (fields: NoteEditableFields) => void;
}

const emptyFields: NoteEditableFields = {
  title: '',
  content: '',
  category: 'General',
  isPinned: false,
};

export function NoteModal({ note, isOpen, isSaving = false, onClose, onSave }: NoteModalProps) {
  const [fields, setFields] = useState<NoteEditableFields>(emptyFields);
  const [titleError, setTitleError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setFields(
      note
        ? {
            title: note.title,
            content: note.content,
            category: note.category || 'General',
            isPinned: note.isPinned,
          }
        : emptyFields,
    );
    setTitleError('');
  }, [isOpen, note]);

  if (!isOpen) {
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedFields = {
      ...fields,
      title: fields.title.trim(),
      category: fields.category.trim() || 'General',
      content: fields.content.trim(),
    };

    if (!normalizedFields.title) {
      setTitleError('Title is required.');
      return;
    }

    onSave(normalizedFields);
  }

  return (
    <div className="fixed inset-0 z-50 flex min-h-dvh items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {note ? 'Edit note' : 'New note'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:bg-slate-700 dark:hover:text-slate-100"
            aria-label="Close note editor"
            title="Close"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <Input
            id="note-title"
            label="Title"
            value={fields.title}
            onChange={(event) => {
              setFields((current) => ({ ...current, title: event.target.value }));
              setTitleError('');
            }}
            placeholder="Meeting notes"
            error={titleError}
            autoFocus
          />

          <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
            <Input
              id="note-category"
              label="Category"
              value={fields.category}
              onChange={(event) =>
                setFields((current) => ({ ...current, category: event.target.value }))
              }
              placeholder="General"
            />

            <label className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={fields.isPinned}
                onChange={(event) =>
                  setFields((current) => ({ ...current, isPinned: event.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Pin note
            </label>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="note-content"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Content
            </label>
            <textarea
              id="note-content"
              value={fields.content}
              onChange={(event) =>
                setFields((current) => ({ ...current, content: event.target.value }))
              }
              rows={8}
              placeholder="Write the details here..."
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-100"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end dark:border-slate-700">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {note ? 'Save changes' : 'Create note'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
