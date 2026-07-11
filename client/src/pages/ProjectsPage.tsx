import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FolderKanban, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { DeleteConfirmationModal } from '@/features/projects/components/DeleteConfirmationModal';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { ProjectModal } from '@/features/projects/components/ProjectModal';
import { ProjectSkeleton } from '@/features/projects/components/ProjectSkeleton';
import type { Project, ProjectEditableFields } from '@/features/projects/types';

const dashboardQueryKey = ['dashboard'], projectsQueryKey = ['projects'], apiBaseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '');

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

function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    if (a.status === 'archived' && b.status !== 'archived') return 1;
    if (a.status !== 'archived' && b.status === 'archived') return -1;
    return a.sortOrder - b.sortOrder;
  });
}

export default function ProjectsPage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const accessToken = session?.access_token;
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const projectsQuery = useQuery({
    queryKey: [...projectsQueryKey, accessToken],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const data = await apiRequest<ProjectsResponse>('/api/projects', requireToken(accessToken));
      return data.projects;
    },
  });

  const sortedProjects = useMemo(
    () => sortProjects(projectsQuery.data ?? []),
    [projectsQuery.data],
  );

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

  function openCreateModal() {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  }

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
      {!projectsQuery.isLoading && !projectsQuery.isError && (sortedProjects.length > 0 ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {sortedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={openEditModal}
              onDelete={setDeletingProject}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      ))}

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
