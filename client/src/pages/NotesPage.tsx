import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { NoteCard } from '@/features/notes/components/NoteCard';
import { NoteModal } from '@/features/notes/components/NoteModal';
import { dummyNotes } from '@/features/notes/dummyNotes';
import type { Note, NoteEditableFields } from '@/features/notes/types';

const allCategoriesLabel = 'All categories';

function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(dummyNotes);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(allCategoriesLabel);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = useMemo(
    () => [allCategoriesLabel, ...Array.from(new Set(notes.map((note) => note.category))).sort()],
    [notes],
  );

  const visibleNotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sortNotes(
      notes.filter((note) => {
        const matchesCategory =
          selectedCategory === allCategoriesLabel || note.category === selectedCategory;
        const matchesSearch =
          !query ||
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.category.toLowerCase().includes(query);

        return matchesCategory && matchesSearch;
      }),
    );
  }, [notes, search, selectedCategory]);

  function openCreateModal() {
    setEditingNote(null);
    setIsModalOpen(true);
  }

  function openEditModal(note: Note) {
    setEditingNote(note);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingNote(null);
  }

  function handleSave(fields: NoteEditableFields) {
    const now = new Date().toISOString();

    setNotes((currentNotes) => {
      if (editingNote) {
        return currentNotes.map((note) =>
          note.id === editingNote.id
            ? {
                ...note,
                ...fields,
                updatedAt: now,
              }
            : note,
        );
      }

      return [
        {
          id: crypto.randomUUID(),
          ...fields,
          category: fields.category || 'General',
          createdAt: now,
          updatedAt: now,
        },
        ...currentNotes,
      ];
    });

    closeModal();
  }

  function handleDelete(noteId: string) {
    setNotes((currentNotes) => currentNotes.filter((note) => note.id !== noteId));
  }

  function handleTogglePinned(noteId: string) {
    const now = new Date().toISOString();

    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === noteId ? { ...note, isPinned: !note.isPinned, updatedAt: now } : note,
      ),
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Notes</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Capture ideas, decisions, and working context in one place.
          </p>
        </div>
        <Button type="button" onClick={openCreateModal} className="sm:shrink-0">
          New note
        </Button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <Input
          id="notes-search"
          label="Search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search notes"
        />

        <div className="space-y-1.5">
          <label
            htmlFor="notes-category"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Category
          </label>
          <select
            id="notes-category"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-indigo-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-100"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {visibleNotes.length > 0 ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {visibleNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={openEditModal}
              onDelete={handleDelete}
              onTogglePinned={handleTogglePinned}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-600 dark:bg-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            No notes found
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create a note or clear the filters to see everything again.
          </p>
        </div>
      )}

      <NoteModal
        note={editingNote}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
}
