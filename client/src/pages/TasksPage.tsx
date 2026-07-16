import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ListChecks, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { DeleteConfirmationModal } from '@/features/tasks/components/DeleteConfirmationModal';
import { TaskCard } from '@/features/tasks/components/TaskCard';
import { TaskModal } from '@/features/tasks/components/TaskModal';
import { TaskSkeleton } from '@/features/tasks/components/TaskSkeleton';
import type { Task, TaskEditableFields } from '@/features/tasks/types';

const dashboardQueryKey = ['dashboard'], tasksQueryKey = ['tasks'], apiBaseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '');

interface TasksResponse { tasks: Task[] }
interface TaskResponse { task: Task }

function isErrorResponse(value: unknown): value is { message: string } {
  return typeof value === 'object' && value !== null && 'message' in value && typeof value.message === 'string';
}

async function getErrorMessage(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null);
  return isErrorResponse(body) ? body.message : `Request failed with status ${response.status}`;
}

function requireToken(token: string | undefined): string {
  if (!token) throw new Error('Authentication required.');
  return token;
}

async function apiRequest<T>(path: string, accessToken: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  if (!response.ok) throw new Error(await getErrorMessage(response));
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.status === 'done' && b.status !== 'done') return 1;
    if (a.status !== 'done' && b.status === 'done') return -1;
    return a.sortOrder - b.sortOrder;
  });
}

export default function TasksPage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const accessToken = session?.access_token;
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const tasksQuery = useQuery({
    queryKey: [...tasksQueryKey, accessToken],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const data = await apiRequest<TasksResponse>('/api/tasks', requireToken(accessToken));
      return data.tasks;
    },
  });

  const sortedTasks = useMemo(() => sortTasks(tasksQuery.data ?? []), [tasksQuery.data]);

  const createMutation = useMutation({
    mutationFn: async (fields: TaskEditableFields) => {
      return apiRequest<TaskResponse>('/api/tasks', requireToken(accessToken), {
        method: 'POST',
        body: JSON.stringify(fields),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tasksQueryKey });
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
      closeTaskModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ taskId, fields }: { taskId: string; fields: TaskEditableFields }) => {
      return apiRequest<TaskResponse>(`/api/tasks/${taskId}`, requireToken(accessToken), {
        method: 'PUT',
        body: JSON.stringify(fields),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tasksQueryKey });
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
      closeTaskModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await apiRequest<void>(`/api/tasks/${taskId}`, requireToken(accessToken), {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      setDeletingTask(null);
      void queryClient.invalidateQueries({ queryKey: tasksQueryKey });
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    },
  });

  const mutationError =
    createMutation.error ?? updateMutation.error ?? deleteMutation.error ?? null;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  function openCreateModal() {
    setEditingTask(null); setIsTaskModalOpen(true);
  }

  function openEditModal(task: Task) {
    setEditingTask(task); setIsTaskModalOpen(true);
  }

  function closeTaskModal() {
    setEditingTask(null); setIsTaskModalOpen(false); createMutation.reset(); updateMutation.reset();
  }

  function handleSave(fields: TaskEditableFields) {
    if (editingTask) {
      updateMutation.mutate({ taskId: editingTask.id, fields });
      return;
    }

    createMutation.mutate(fields);
  }

  function handleConfirmDelete() {
    if (!deletingTask) return;

    deleteMutation.mutate(deletingTask.id);
  }

  return (
    <div>
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
      {!tasksQuery.isLoading && !tasksQuery.isError && (sortedTasks.length > 0 ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {sortedTasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={openEditModal} onDelete={setDeletingTask} />
            ))}
          </div>
        ) : (
          <EmptyState />
        ))}

      <TaskModal task={editingTask} isOpen={isTaskModalOpen} isSaving={isSaving} onClose={closeTaskModal} onSave={handleSave} />
      <DeleteConfirmationModal
        task={deletingTask}
        isDeleting={deleteMutation.isPending}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
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
