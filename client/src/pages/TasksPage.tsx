import { lazy, Suspense, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckSquare2, ListChecks, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { apiRequest, requireToken } from '@/lib/api';
import type { Project } from '@/features/projects/types';
import { DeleteConfirmationModal } from '@/features/tasks/components/DeleteConfirmationModal';
import { TaskCard } from '@/features/tasks/components/TaskCard';
import { TaskModal } from '@/features/tasks/components/TaskModal';
import { TaskSkeleton } from '@/features/tasks/components/TaskSkeleton';
import { TaskToolbar } from '@/features/tasks/components/TaskToolbar';
import type { Task, TaskEditableFields, TaskStatus } from '@/features/tasks/types';
import {
  filterTasks,
  type PriorityFilter,
  type TaskFilters,
  type TaskView,
} from '@/features/tasks/utils';

const KanbanBoard = lazy(() => import('@/features/tasks/components/KanbanBoard'));
const TaskCalendar = lazy(() => import('@/features/tasks/components/TaskCalendar'));

const dashboardQueryKey = ['dashboard'];
const tasksQueryKey = ['tasks'];
const projectsQueryKey = ['projects'];

type SortKey = 'priority' | 'dueDate' | 'newest' | 'oldest';

interface TasksResponse { tasks: Task[] }
interface TaskResponse { task: Task }
interface ProjectsResponse { projects: Project[] }

const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

function sortTasks(tasks: Task[], key: SortKey): Task[] {
  const copy = [...tasks];
  switch (key) {
    case 'priority':
      return copy.sort((a, b) => {
        if (a.status === 'done' && b.status !== 'done') return 1;
        if (a.status !== 'done' && b.status === 'done') return -1;
        const pd = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
        return pd !== 0 ? pd : a.sortOrder - b.sortOrder;
      });
    case 'dueDate':
      return copy.sort((a, b) => {
        if (a.status === 'done' && b.status !== 'done') return 1;
        if (a.status !== 'done' && b.status === 'done') return -1;
        if (!a.dueDate && !b.dueDate) return a.sortOrder - b.sortOrder;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    case 'newest':
      return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'oldest':
      return copy.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
}

export default function TasksPage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const accessToken = session?.access_token;

  // Sort state
  const [sortKey, setSortKey] = useState<SortKey>('priority');
  const [view, setView] = useState<TaskView>('list');
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    projectId: 'all',
    priority: 'all',
  });

  // Modal state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [prefillStatus, setPrefillStatus] = useState<TaskStatus | null>(null);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectionMode = selectedIds.size > 0;

  // ─── Query ─────────────────────────────────────────────────────────────────
  const tasksQuery = useQuery({
    queryKey: [...tasksQueryKey, accessToken],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const data = await apiRequest<TasksResponse>('/api/tasks', requireToken(accessToken));
      return data.tasks;
    },
  });

  const projectsQuery = useQuery({
    queryKey: [...projectsQueryKey, accessToken],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const data = await apiRequest<ProjectsResponse>('/api/projects', requireToken(accessToken));
      return data.projects;
    },
  });

  const filteredTasks = useMemo(
    () => filterTasks(tasksQuery.data ?? [], filters),
    [tasksQuery.data, filters],
  );

  const sortedTasks = useMemo(
    () => sortTasks(filteredTasks, sortKey),
    [filteredTasks, sortKey],
  );

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async (fields: TaskEditableFields) =>
      apiRequest<TaskResponse>('/api/tasks', requireToken(accessToken), {
        method: 'POST',
        body: JSON.stringify(fields),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tasksQueryKey });
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
      closeTaskModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ taskId, fields }: { taskId: string; fields: TaskEditableFields }) =>
      apiRequest<TaskResponse>(`/api/tasks/${taskId}`, requireToken(accessToken), {
        method: 'PUT',
        body: JSON.stringify(fields),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tasksQueryKey });
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
      closeTaskModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await apiRequest<void>(`/api/tasks/${taskId}`, requireToken(accessToken), { method: 'DELETE' });
    },
    onSuccess: () => {
      setDeletingTask(null);
      void queryClient.invalidateQueries({ queryKey: tasksQueryKey });
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    },
  });

  // ─── Reorder handler (Kanban drag-and-drop) ───────────────────────────────
  const reorderMutation = useMutation({
    mutationFn: async (
      operations: Array<{ id: string; status: TaskStatus; sortOrder: number }>,
    ) => {
      await apiRequest<{ tasks: Task[] }>(
        '/api/tasks/reorder',
        requireToken(accessToken),
        {
          method: 'PATCH',
          body: JSON.stringify({ reorders: operations }),
        },
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: tasksQueryKey });
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    },
  });

  const mutationError =
    createMutation.error ??
    updateMutation.error ??
    deleteMutation.error ??
    reorderMutation.error ??
    null;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ─── Modal handlers ────────────────────────────────────────────────────────
  function openCreateModal() {
    setEditingTask(null);
    setPrefillStatus(null);
    setIsTaskModalOpen(true);
  }
  function openEditModal(task: Task) {
    setEditingTask(task);
    setPrefillStatus(null);
    setIsTaskModalOpen(true);
  }
  function closeTaskModal() {
    setEditingTask(null);
    setIsTaskModalOpen(false);
    setPrefillStatus(null);
    createMutation.reset(); updateMutation.reset();
  }
  function handleSave(fields: TaskEditableFields) {
    if (editingTask) { updateMutation.mutate({ taskId: editingTask.id, fields }); return; }
    createMutation.mutate(fields);
  }
  function handleConfirmDelete() {
    if (!deletingTask) return;
    deleteMutation.mutate(deletingTask.id);
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
    if (selectedIds.size === sortedTasks.length) { clearSelection(); }
    else { setSelectedIds(new Set(sortedTasks.map((t) => t.id))); }
  }

  // ─── Bulk handlers ─────────────────────────────────────────────────────────
  async function handleBulkStatusChange(status: TaskStatus) {
    if (!accessToken) return;
    const token = requireToken(accessToken);
    const ids = Array.from(selectedIds);
    const tasks = tasksQuery.data ?? [];
    await Promise.allSettled(
      ids.map((id) => {
        const task = tasks.find((t) => t.id === id);
        if (!task) return Promise.resolve();
        const fields: TaskEditableFields = {
          title: task.title,
          description: task.description,
          status,
          priority: task.priority,
          dueDate: task.dueDate,
          projectId: task.projectId,
          sortOrder: task.sortOrder,
        };
        return apiRequest<TaskResponse>(`/api/tasks/${id}`, token, {
          method: 'PUT',
          body: JSON.stringify(fields),
        });
      }),
    );
    void queryClient.invalidateQueries({ queryKey: tasksQueryKey });
    void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    clearSelection();
  }

  function handleReorder(
    operations: Array<{ id: string; status: TaskStatus; sortOrder: number }>,
  ) {
    reorderMutation.mutate(operations);
  }

  async function handleBulkDelete() {
    if (!accessToken) return;
    const token = requireToken(accessToken);
    const ids = Array.from(selectedIds);
    await Promise.allSettled(
      ids.map((id) => apiRequest<void>(`/api/tasks/${id}`, token, { method: 'DELETE' })),
    );
    void queryClient.invalidateQueries({ queryKey: tasksQueryKey });
    void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    clearSelection();
  }

  const allSelected = sortedTasks.length > 0 && selectedIds.size === sortedTasks.length;

  return (
    <div>
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Tasks</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Plan, prioritize, and track the work moving through DevNest.
          </p>
        </div>
        <Button type="button" onClick={openCreateModal} className="gap-2 sm:shrink-0">
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
      </div>

      {tasksQuery.isLoading && <TaskSkeleton />}
      {tasksQuery.isError && <ErrorMessage message={(tasksQuery.error as Error).message} />}
      {mutationError && <ErrorMessage message={(mutationError as Error).message} />}

      {!tasksQuery.isLoading && !tasksQuery.isError && (
        <>
          {/* ── Toolbar ─────────────────────────────────────────────────────── */}
          {selectionMode ? (
            /* Bulk action bar */
            <div className="mt-6 flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
              >
                <CheckSquare2 className="h-4 w-4" />
                {allSelected ? 'Deselect all' : `${selectedIds.size} selected`}
              </button>

              <div className="mx-1 h-5 w-px bg-emerald-200 dark:bg-emerald-500/30" />

              <Button size="sm" variant="secondary" onClick={() => void handleBulkStatusChange('todo')}>
                Todo
              </Button>
              <Button size="sm" variant="secondary" onClick={() => void handleBulkStatusChange('in_progress')}>
                In Progress
              </Button>
              <Button size="sm" variant="secondary" onClick={() => void handleBulkStatusChange('done')}>
                Done
              </Button>
              <Button size="sm" variant="danger" onClick={() => void handleBulkDelete()}>
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>

              <div className="ml-auto flex items-center gap-2">
                <SortDropdown value={sortKey} onChange={setSortKey} />
                <Button size="sm" variant="ghost" onClick={clearSelection}>
                  <X className="h-3.5 w-3.5" />
                  Clear
                </Button>
              </div>
            </div>
          ) : (
            <TaskToolbar
              view={view}
              search={filters.search}
              projectId={filters.projectId}
              priority={filters.priority}
              projects={projectsQuery.data ?? []}
              onViewChange={setView}
              onSearchChange={(search) => setFilters((current) => ({ ...current, search }))}
              onProjectChange={(projectId) => setFilters((current) => ({ ...current, projectId }))}
              onPriorityChange={(priority: PriorityFilter) =>
                setFilters((current) => ({ ...current, priority }))
              }
            />
          )}

          {view === 'list' && !selectionMode && (
            <div className="mt-4 flex items-center justify-end gap-3">
              <label
                htmlFor="tasks-sort"
                className="text-sm font-medium text-slate-600 dark:text-slate-400"
              >
                Sort
              </label>
              <SortDropdown value={sortKey} onChange={setSortKey} id="tasks-sort" />
            </div>
          )}

          {view === 'list' && (
            sortedTasks.length > 0 ? (
              <div className="stagger-list mt-4 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                {sortedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isSelected={selectedIds.has(task.id)}
                    selectionMode={selectionMode}
                    onSelect={toggleSelect}
                    onEdit={openEditModal}
                    onDelete={setDeletingTask}
                  />
                ))}
              </div>
            ) : (
              <EmptyState />
            )
          )}

          {view === 'kanban' && !selectionMode && (
            <Suspense fallback={<TaskViewFallback label="Loading Kanban..." />}>
              <KanbanBoard
                tasks={filteredTasks}
                onEdit={openEditModal}
                onReorder={handleReorder}
                onCreateTask={(status) => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                  // Pre-select the status in the modal via the default
                  // The modal opens fresh — status defaults to "todo"
                  // We'll set the initial status via a prefill mechanism
                  setPrefillStatus(status);
                }}
              />
            </Suspense>
          )}

          {view === 'calendar' && !selectionMode && (
            <Suspense fallback={<TaskViewFallback label="Loading calendar..." />}>
              <TaskCalendar tasks={filteredTasks} />
            </Suspense>
          )}
        </>
      )}

      <TaskModal
        task={editingTask}
        isOpen={isTaskModalOpen}
        isSaving={isSaving}
        prefillStatus={prefillStatus}
        projects={projectsQuery.data ?? []}
        onClose={closeTaskModal}
        onSave={handleSave}
      />
      <DeleteConfirmationModal
        task={deletingTask}
        isDeleting={deleteMutation.isPending}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

// ─── Sort dropdown ───────────────────────────────────────────────────────────
function SortDropdown({
  value,
  onChange,
  id = 'tasks-sort-inline',
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
      className="h-9 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-emerald-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white [&>option]:dark:bg-slate-800 [&>option]:dark:text-white"
    >
      <option value="priority">Priority</option>
      <option value="dueDate">Due Date</option>
      <option value="newest">Newest</option>
      <option value="oldest">Oldest</option>
    </select>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
      {message}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-600 dark:bg-slate-800">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300">
        <ListChecks className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">No tasks yet</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create your first task to start organizing the next step.</p>
    </div>
  );
}

function TaskViewFallback({ label }: { label: string }) {
  return (
    <div className="mt-5 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
      {label}
    </div>
  );
}
