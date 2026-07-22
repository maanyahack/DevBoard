import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckSquare2, Pin, PinOff, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { NoteCard } from '@/features/notes/components/NoteCard';
import { NoteModal } from '@/features/notes/components/NoteModal';
import { apiRequest } from '@/lib/api';
import type { Note, NoteEditableFields } from '@/features/notes/types';

const allCategoriesLabel = 'All categories';
const dashboardQueryKey = ['dashboard'];
const notesQueryKey = ['notes'];

type SortKey = 'newest' | 'oldest' | 'pinned' | 'alpha';

interface NotesResponse {
  notes: Note[];
}

interface NoteResponse {
  note: Note;
}

function sortNotes(notes: Note[], key: SortKey): Note[] {
  const copy = [...notes];
  switch (key) {
    case 'newest':
      return copy.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    case 'oldest':
      return copy.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      });
    case 'pinned':
      return copy.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    case 'alpha':
      return copy.sort((a, b) => a.title.localeCompare(b.title));
  }
}

export default function NotesPage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const accessToken = session?.access_token;

  // Filter / sort state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(allCategoriesLabel);
  const [sortKey, setSortKey] = useState<SortKey>('newest');

  // Modal state
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);



  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectionMode = selectedIds.size > 0;

  // ─── Queries ───────────────────────────────────────────────────────────────
  const notesQuery = useQuery({
    queryKey: [...notesQueryKey, accessToken],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) throw new Error('Authentication required.');
      const data = await apiRequest<NotesResponse>('/api/notes', accessToken);
      return data.notes;
    },
  });

  const notes = notesQuery.data ?? [];

  const categories = useMemo(
    () => [allCategoriesLabel, ...Array.from(new Set(notes.map((n) => n.category))).sort()],
    [notes],
  );

  const visibleNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = notes.filter((note) => {
      const matchesCategory =
        selectedCategory === allCategoriesLabel || note.category === selectedCategory;
      const matchesSearch =
        !query ||
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
    return sortNotes(filtered, sortKey);
  }, [notes, search, selectedCategory, sortKey]);

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async (fields: NoteEditableFields) => {
      if (!accessToken) throw new Error('Authentication required.');
      const payload = {
        title: fields.title,
        content: fields.content,
        category: fields.category || 'General',
        isPinned: fields.isPinned,
      };
      const data = await apiRequest<NoteResponse>('/api/notes', accessToken, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return data.note;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notesQueryKey });
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ noteId, fields }: { noteId: string; fields: NoteEditableFields }) => {
      if (!accessToken) throw new Error('Authentication required.');
      const payload = {
        title: fields.title,
        content: fields.content,
        category: fields.category || 'General',
        isPinned: fields.isPinned,
      };
      const data = await apiRequest<NoteResponse>(`/api/notes/${noteId}`, accessToken, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return data.note;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notesQueryKey });
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      if (!accessToken) throw new Error('Authentication required.');
      await apiRequest<void>(`/api/notes/${noteId}`, accessToken, { method: 'DELETE' });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notesQueryKey });
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    },
  });

  const mutationError =
    createMutation.error ?? updateMutation.error ?? deleteMutation.error ?? null;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ─── Modal handlers ────────────────────────────────────────────────────────
  function openCreateModal() { setEditingNote(null); setIsModalOpen(true); }
  function openEditModal(note: Note) { setEditingNote(note); setIsModalOpen(true); }
  function closeModal() {
    setIsModalOpen(false);
    setEditingNote(null);
    createMutation.reset();
    updateMutation.reset();
  }
  function handleSave(fields: NoteEditableFields) {
    if (editingNote) { updateMutation.mutate({ noteId: editingNote.id, fields }); return; }
    createMutation.mutate(fields);
  }

  // ─── Single-item handlers ──────────────────────────────────────────────────
  function handleDelete(noteId: string) { deleteMutation.mutate(noteId); }

  function handleTogglePinned(noteId: string) {
    const note = notes.find((item) => item.id === noteId);
    if (!note) return;

    updateMutation.mutate({
      noteId,
      fields: {
        title: note.title,
        content: note.content,
        category: note.category,
        isPinned: !note.isPinned,
      },
    });
  }

  // ─── Selection handlers ────────────────────────────────────────────────────
  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  function clearSelection() { setSelectedIds(new Set()); }

  function toggleSelectAll() {
    if (selectedIds.size === visibleNotes.length) {
      clearSelection();
    } else {
      setSelectedIds(new Set(visibleNotes.map((n) => n.id)));
    }
  }

  // ─── Bulk action handlers ──────────────────────────────────────────────────
  async function handleBulkDelete() {
    if (!accessToken) return;
    const ids = Array.from(selectedIds);
    await Promise.allSettled(
      ids.map((id) => apiRequest<void>(`/api/notes/${id}`, accessToken, { method: 'DELETE' })),
    );
    void queryClient.invalidateQueries({ queryKey: notesQueryKey });
    void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    clearSelection();
  }

  async function handleBulkPin() {
    if (!accessToken) return;
    const token = accessToken;
    const ids = Array.from(selectedIds);
    await Promise.allSettled(
      ids.map((id) => {
        const note = notes.find((n) => n.id === id);
        if (!note) return Promise.resolve();
        return apiRequest<NoteResponse>(`/api/notes/${id}`, token, {
          method: 'PUT',
          body: JSON.stringify({
            title: note.title,
            content: note.content,
            category: note.category,
            isPinned: true,
          }),
        });
      }),
    );
    void queryClient.invalidateQueries({ queryKey: notesQueryKey });
    void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    clearSelection();
  }

  async function handleBulkUnpin() {
    if (!accessToken) return;
    const token = accessToken;
    const ids = Array.from(selectedIds);
    await Promise.allSettled(
      ids.map((id) => {
        const note = notes.find((n) => n.id === id);
        if (!note) return Promise.resolve();
        return apiRequest<NoteResponse>(`/api/notes/${id}`, token, {
          method: 'PUT',
          body: JSON.stringify({
            title: note.title,
            content: note.content,
            category: note.category,
            isPinned: false,
          }),
        });
      }),
    );
    void queryClient.invalidateQueries({ queryKey: notesQueryKey });
    void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    clearSelection();
  }

  const allVisibleSelected = visibleNotes.length > 0 && selectedIds.size === visibleNotes.length;

  return (
    <div>
      {/* Page heading */}
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

      {/* Loading / error states */}
      {notesQuery.isLoading && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          Loading notes...
        </div>
      )}
      {notesQuery.isError && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {(notesQuery.error as Error).message}
        </div>
      )}
      {mutationError && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {(mutationError as Error).message}
        </div>
      )}

      {!notesQuery.isLoading && !notesQuery.isError && (
        <>
          {/* ── Toolbar ─────────────────────────────────────────────────────── */}
          {selectionMode ? (
            /* Bulk action bar */
            <div className="mt-6 flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              {/* Count / select-all toggle */}
              <button
                type="button"
                onClick={toggleSelectAll}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
              >
                <CheckSquare2 className="h-4 w-4" />
                {allVisibleSelected ? 'Deselect all' : `${selectedIds.size} selected`}
              </button>

              <div className="mx-1 h-5 w-px bg-emerald-200 dark:bg-emerald-500/30" />

              <Button size="sm" variant="secondary" onClick={handleBulkPin}>
                <Pin className="h-3.5 w-3.5" />
                Pin
              </Button>
              <Button size="sm" variant="secondary" onClick={handleBulkUnpin}>
                <PinOff className="h-3.5 w-3.5" />
                Unpin
              </Button>
              <Button size="sm" variant="danger" onClick={() => void handleBulkDelete()}>
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>

              <div className="ml-auto flex items-center gap-2">
                {/* Sort — always visible */}
                <SortDropdown value={sortKey} onChange={setSortKey} />
                <Button size="sm" variant="ghost" onClick={clearSelection}>
                  <X className="h-3.5 w-3.5" />
                  Clear
                </Button>
              </div>
            </div>
          ) : (
            /* Normal search / filter toolbar */
            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_200px_160px]">
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
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-emerald-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-100"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="notes-sort"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Sort
                </label>
                <SortDropdown value={sortKey} onChange={setSortKey} id="notes-sort" />
              </div>
            </div>
          )}

          {/* ── Card grid ───────────────────────────────────────────────────── */}
          {visibleNotes.length > 0 ? (
            <div className="stagger-list mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {visibleNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isSelected={selectedIds.has(note.id)}
                  selectionMode={selectionMode}
                  onSelect={toggleSelect}
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
        </>
      )}

      <NoteModal
        note={editingNote}
        isOpen={isModalOpen}
        isSaving={isSaving}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
}

// ─── Sort dropdown ───────────────────────────────────────────────────────────
function SortDropdown({
  value,
  onChange,
  id = 'notes-sort-inline',
}: {
  value: SortKey;
  onChange: (v: SortKey) => void;
  id?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as SortKey)}
      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-emerald-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-100"
    >
      <option value="newest">Newest</option>
      <option value="oldest">Oldest</option>
      <option value="pinned">Pinned first</option>
      <option value="alpha">Alphabetical</option>
    </select>
  );
}
