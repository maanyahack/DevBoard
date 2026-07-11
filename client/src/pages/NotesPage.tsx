import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { NoteCard } from '@/features/notes/components/NoteCard';
import { NoteModal } from '@/features/notes/components/NoteModal';
import type { Note, NoteEditableFields } from '@/features/notes/types';

const allCategoriesLabel = 'All categories';
const dashboardQueryKey = ['dashboard'];
const notesQueryKey = ['notes'];
const apiBaseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '');

type ApiNote = Omit<Note, 'category' | 'isPinned'>;
type NotePayload = Pick<NoteEditableFields, 'title' | 'content'>;

interface NotesResponse {
  notes: ApiNote[];
}

interface NoteResponse {
  note: ApiNote;
}

interface NoteMeta {
  category: string;
  isPinned: boolean;
}

function isErrorResponse(value: unknown): value is { message: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string'
  );
}

async function getErrorMessage(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null);

  if (isErrorResponse(body)) {
    return body.message;
  }

  return `Request failed with status ${response.status}`;
}

async function apiRequest<T>(
  path: string,
  accessToken: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function toNote(apiNote: ApiNote, meta?: NoteMeta): Note {
  return {
    ...apiNote,
    category: meta?.category ?? 'General',
    isPinned: meta?.isPinned ?? false,
  };
}

function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export default function NotesPage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const accessToken = session?.access_token;
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(allCategoriesLabel);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteMeta, setNoteMeta] = useState<Record<string, NoteMeta>>({});

  const notesQuery = useQuery({
    queryKey: [...notesQueryKey, accessToken],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) {
        throw new Error('Authentication required.');
      }

      const data = await apiRequest<NotesResponse>('/api/notes', accessToken);
      return data.notes;
    },
  });

  const notes = useMemo(
    () => (notesQuery.data ?? []).map((note) => toNote(note, noteMeta[note.id])),
    [notesQuery.data, noteMeta],
  );

  const createMutation = useMutation({
    mutationFn: async (fields: NoteEditableFields) => {
      if (!accessToken) {
        throw new Error('Authentication required.');
      }

      const payload: NotePayload = {
        title: fields.title,
        content: fields.content,
      };
      const data = await apiRequest<NoteResponse>('/api/notes', accessToken, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return { note: data.note, fields };
    },
    onSuccess: ({ note, fields }) => {
      setNoteMeta((current) => ({
        ...current,
        [note.id]: {
          category: fields.category || 'General',
          isPinned: fields.isPinned,
        },
      }));
      void queryClient.invalidateQueries({ queryKey: notesQueryKey });
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ noteId, fields }: { noteId: string; fields: NoteEditableFields }) => {
      if (!accessToken) {
        throw new Error('Authentication required.');
      }

      const payload: NotePayload = {
        title: fields.title,
        content: fields.content,
      };
      const data = await apiRequest<NoteResponse>(`/api/notes/${noteId}`, accessToken, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      return { note: data.note, fields };
    },
    onSuccess: ({ note, fields }) => {
      setNoteMeta((current) => ({
        ...current,
        [note.id]: {
          category: fields.category || 'General',
          isPinned: fields.isPinned,
        },
      }));
      void queryClient.invalidateQueries({ queryKey: notesQueryKey });
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      if (!accessToken) {
        throw new Error('Authentication required.');
      }

      await apiRequest<void>(`/api/notes/${noteId}`, accessToken, {
        method: 'DELETE',
      });

      return noteId;
    },
    onSuccess: (noteId) => {
      setNoteMeta((current) => {
        const next = { ...current };
        delete next[noteId];
        return next;
      });
      void queryClient.invalidateQueries({ queryKey: notesQueryKey });
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    },
  });

  const mutationError =
    createMutation.error ?? updateMutation.error ?? deleteMutation.error ?? null;
  const isSaving = createMutation.isPending || updateMutation.isPending;

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
    createMutation.reset();
    updateMutation.reset();
  }

  function handleSave(fields: NoteEditableFields) {
    if (editingNote) {
      updateMutation.mutate({ noteId: editingNote.id, fields });
      return;
    }

    createMutation.mutate(fields);
  }

  function handleDelete(noteId: string) {
    deleteMutation.mutate(noteId);
  }

  function handleTogglePinned(noteId: string) {
    setNoteMeta((current) => {
      const currentMeta = current[noteId];
      const note = notes.find((item) => item.id === noteId);

      return {
        ...current,
        [noteId]: {
          category: currentMeta?.category ?? note?.category ?? 'General',
          isPinned: !(currentMeta?.isPinned ?? note?.isPinned ?? false),
        },
      };
    });
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
