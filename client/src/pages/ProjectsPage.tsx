import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckSquare2, FolderKanban, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { DeleteConfirmationModal } from '@/features/projects/components/DeleteConfirmationModal';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { ProjectModal } from '@/features/projects/components/ProjectModal';
import { ProjectSkeleton } from '@/features/projects/components/ProjectSkeleton';
import type { Project, ProjectEditableFields, ProjectStatus } from '@/features/projects/types';

const dashboardQueryKey = ['dashboard'];
const projectsQueryKey = ['projects'];
const apiBaseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '');

type SortKey = 'status' | 'updatedAt' | 'alpha';

interface ProjectsResponse { projects: Project[] }
interface ProjectResponse { project: Project }

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

const statusOrder: Record<ProjectStatus, number> = {
  planning: 0,
  active: 1,
  completed: 2,
  archived: 3,
};

function sortProjects(projects: Project[], key: SortKey): Project[] {
  const copy = [...projects];
  switch (key) {
    case 'status':
      return copy.sort((a, b) => {
        const diff = statusOrder[a.status] - statusOrder[b.status];
        if (diff !== 0) return diff;
        return a.sortOrder - b.sortOrder;
      });
    case 'updatedAt':
      return copy.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    case 'alpha':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export default function ProjectsPage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const accessToken = session?.access_token;

  // Sort state
  const [sortKey, setSortKey] = useState<SortKey>('status');

  // Modal / delete state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectionMode = selectedIds.size > 0;

  // ─── Query ─────────────────────────────────────────────────────────────────
  const projectsQuery = useQuery({
    queryKey: [...projectsQueryKey, accessToken],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const data = await apiRequest<ProjectsResponse>('/api/projects', requireToken(accessToken));
      return data.projects;
    },
  });

  const sortedProjects = useMemo(
    () => sortProjects(projectsQuery.data ?? [], sortKey),
    [projectsQuery.data, sortKey],
  );

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async (fields: ProjectEditableFields) => {
      return apiRequest<ProjectResponse>('/api/projects', requireToken(accessToken), {
        method: 'POST',
        body: JSON.stringify(fields),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectsQueryKey });
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
      closeProjectModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      projectId,
      fields,
    }: {
      projectId: string;
      fields: ProjectEditableFields;
    }) => {
      return apiRequest<ProjectResponse>(`/api/projects/${projectId}`, requireToken(accessToken), {
        method: 'PUT',
        body: JSON.stringify(fields),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectsQueryKey });
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
      closeProjectModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (projectId: string) => {
      await apiRequest<void>(`/api/projects/${projectId}`, requireToken(accessToken), {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      setDeletingProject(null);
      void queryClient.invalidateQueries({ queryKey: projectsQueryKey });
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    },
  });

  const mutationError =
    createMutation.error ?? updateMutation.error ?? deleteMutation.error ?? null;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ─── Modal handlers ────────────────────────────────────────────────────────
  function openCreateModal() {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  }

  // Open the edit modal
  function openEditModal(project: Project) {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  }

  function closeProjectModal() {
    setEditingProject(null);
    setIsProjectModalOpen(false);
    createMutation.reset();
    updateMutation.reset();
  }

  function handleSave(fields: ProjectEditableFields) {
    if (editingProject) {
      updateMutation.mutate({ projectId: editingProject.id, fields });
      return;
    }
    createMutation.mutate(fields);
  }

  function handleConfirmDelete() {
    if (!deletingProject) return;
    deleteMutation.mutate(deletingProject.id);
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

  // Toggle selection for all currently visible sorted projects
  function toggleSelectAll() {
    if (selectedIds.size === sortedProjects.length) {
      clearSelection();
    } else {
      setSelectedIds(new Set(sortedProjects.map((p) => p.id)));
    }
  }

  // ─── Bulk handlers ─────────────────────────────────────────────────────────
  async function handleBulkStatusChange(status: ProjectStatus) {
    if (!accessToken) return;
    const token = requireToken(accessToken);
    const ids = Array.from(selectedIds);
    const projects = projectsQuery.data ?? [];
    await Promise.allSettled(
      ids.map((id) => {
        const project = projects.find((p) => p.id === id);
        if (!project) return Promise.resolve();
        const fields: ProjectEditableFields = {
          name: project.name,
          description: project.description,
          status,
          githubUrl: project.githubUrl,
          sortOrder: project.sortOrder,
        };
        return apiRequest<ProjectResponse>(`/api/projects/${id}`, token, {
          method: 'PUT',
          body: JSON.stringify(fields),
        });
      }),
    );
    void queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    clearSelection();
  }

  async function handleBulkDelete() {
    if (!accessToken) return;
    const token = requireToken(accessToken);
    const ids = Array.from(selectedIds);
    await Promise.allSettled(
      ids.map((id) => apiRequest<void>(`/api/projects/${id}`, token, { method: 'DELETE' })),
    );
    void queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    clearSelection();
  }

  const allSelected = sortedProjects.length > 0 && selectedIds.size === sortedProjects.length;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Projects</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Organize larger bodies of work and keep repositories close at hand.
          </p>
        </div>
        <Button type="button" onClick={openCreateModal} className="gap-2 sm:shrink-0">
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </div>

      {projectsQuery.isLoading && <ProjectSkeleton />}
      {projectsQuery.isError && <ErrorMessage message={(projectsQuery.error as Error).message} />}
      {mutationError && <ErrorMessage message={(mutationError as Error).message} />}

      {!projectsQuery.isLoading && !projectsQuery.isError && (
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

              <Button size="sm" variant="secondary" onClick={() => void handleBulkStatusChange('planning')}>
                Planning
              </Button>
              <Button size="sm" variant="secondary" onClick={() => void handleBulkStatusChange('active')}>
                Active
              </Button>
              <Button size="sm" variant="secondary" onClick={() => void handleBulkStatusChange('completed')}>
                Completed
              </Button>
              <Button size="sm" variant="secondary" onClick={() => void handleBulkStatusChange('archived')}>
                Archived
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
            /* Normal sort toolbar */
            <div className="mt-6 flex items-center justify-end gap-3">
              <label
                htmlFor="projects-sort"
                className="text-sm font-medium text-slate-600 dark:text-slate-400"
              >
                Sort
              </label>
              <SortDropdown value={sortKey} onChange={setSortKey} id="projects-sort" />
            </div>
          )}

          {/* ── Card grid ───────────────────────────────────────────────────── */}
          {sortedProjects.length > 0 ? (
            <div className="stagger-list mt-4 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {sortedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isSelected={selectedIds.has(project.id)}
                  selectionMode={selectionMode}
                  onSelect={toggleSelect}
                  onEdit={openEditModal}
                  onDelete={setDeletingProject}
                />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </>
      )}

      <ProjectModal
        project={editingProject}
        isOpen={isProjectModalOpen}
        isSaving={isSaving}
        onClose={closeProjectModal}
        onSave={handleSave}
      />
      <DeleteConfirmationModal
        project={deletingProject}
        isDeleting={deleteMutation.isPending}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

// ─── Sort dropdown ───────────────────────────────────────────────────────────
function SortDropdown({
  value,
  onChange,
  id = 'projects-sort-inline',
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
      className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-emerald-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-100"
    >
      <option value="status">Status</option>
      <option value="updatedAt">Last Updated</option>
      <option value="alpha">Alphabetical</option>
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
        <FolderKanban className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
        No projects yet
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Create your first project to group related work.
      </p>
    </div>
  );
}
