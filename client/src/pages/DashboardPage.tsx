import { useQuery } from '@tanstack/react-query';
import {
  Bot,
  CheckCircle2,
  FolderKanban,
  ListTodo,
  NotebookText,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DashboardPanel } from '@/features/dashboard/components/DashboardPanel';
import { DashboardSkeleton } from '@/features/dashboard/components/DashboardSkeleton';
import { StatCard } from '@/features/dashboard/components/StatCard';
import type { DashboardData } from '@/features/dashboard/types';
import { projectStatusLabels } from '@/features/projects/types';
import { taskPriorityLabels, taskStatusLabels } from '@/features/tasks/types';

const dashboardQueryKey = ['dashboard'], apiBaseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '');

function requireToken(token: string | undefined): string {
  if (!token) throw new Error('Authentication required.');
  return token;
}

function isErrorResponse(value: unknown): value is { message: string } {
  return typeof value === 'object' && value !== null && 'message' in value && typeof value.message === 'string';
}

async function getErrorMessage(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null);
  return isErrorResponse(body) ? body.message : `Request failed with status ${response.status}`;
}

async function fetchDashboard(accessToken: string): Promise<DashboardData> {
  const response = await fetch(`${apiBaseUrl}/api/dashboard`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(await getErrorMessage(response));
  return (await response.json()) as DashboardData;
}

function formatDate(value?: string): string {
  return new Intl.DateTimeFormat('en', {
    weekday: value ? undefined : 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(value ? new Date(value) : new Date());
}

export default function DashboardPage() {
  const { session } = useAuth();
  const accessToken = session?.access_token;
  const dashboardQuery = useQuery({
    queryKey: [...dashboardQueryKey, accessToken],
    enabled: Boolean(accessToken),
    queryFn: () => fetchDashboard(requireToken(accessToken)),
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatDate()}</p>
        </div>
      </div>

      {dashboardQuery.isLoading && <DashboardSkeleton />}
      {dashboardQuery.isError && <ErrorMessage message={(dashboardQuery.error as Error).message} />}
      {dashboardQuery.data && (
        <div className="mt-8 space-y-6">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Projects" value={dashboardQuery.data.stats.projects} icon={<FolderKanban className="h-5 w-5" />} />
            <StatCard label="Total Tasks" value={dashboardQuery.data.stats.tasks} icon={<ListTodo className="h-5 w-5" />} />
            <StatCard label="Completed Tasks" value={dashboardQuery.data.stats.completedTasks} icon={<CheckCircle2 className="h-5 w-5" />} />
            <StatCard label="Total Notes" value={dashboardQuery.data.stats.notes} icon={<NotebookText className="h-5 w-5" />} />
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            <DashboardPanel title="Recent Tasks">
              <ListEmpty empty={dashboardQuery.data.recentTasks.length === 0} text="No tasks yet.">
                {dashboardQuery.data.recentTasks.map((task) => (
                  <ListItem key={task.id} title={task.title} meta={`${taskStatusLabels[task.status]} · ${taskPriorityLabels[task.priority]}`} />
                ))}
              </ListEmpty>
            </DashboardPanel>
            <DashboardPanel title="Recent Notes">
              <ListEmpty empty={dashboardQuery.data.recentNotes.length === 0} text="No notes yet.">
                {dashboardQuery.data.recentNotes.map((note) => (
                  <ListItem key={note.id} title={note.title} meta={`Updated ${formatDate(note.updatedAt)}`} />
                ))}
              </ListEmpty>
            </DashboardPanel>
            <DashboardPanel title="Active Projects">
              <ListEmpty empty={dashboardQuery.data.activeProjects.length === 0} text="No active projects.">
                {dashboardQuery.data.activeProjects.map((project) => (
                  <ListItem
                    key={project.id}
                    title={project.name}
                    meta={projectStatusLabels[project.status]}
                    href={project.githubUrl ?? undefined}
                  />
                ))}
              </ListEmpty>
            </DashboardPanel>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
            <DashboardPanel title="Quick Actions">
              <div className="grid gap-3 sm:grid-cols-3">
                <QuickAction to="/notes" label="New Note" />
                <QuickAction to="/tasks" label="New Task" />
                <QuickAction to="/projects" label="New Project" />
              </div>
            </DashboardPanel>
            <DashboardPanel title="AI Insights">
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-700/40 dark:text-slate-300">
                <Bot className="h-5 w-5 text-indigo-500" />
                AI Insights coming soon.
              </div>
            </DashboardPanel>
          </div>
        </div>
      )}
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">{message}</div>;
}

function ListEmpty({ empty, text, children }: { empty: boolean; text: string; children: ReactNode }) {
  return empty ? <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p> : <div className="space-y-3">{children}</div>;
}

function ListItem({ title, meta, href }: { title: string; meta: string; href?: string }) {
  return (
    <div className="rounded-lg border border-slate-100 p-3 dark:border-slate-700">
      <p className="line-clamp-1 text-sm font-medium text-slate-900 dark:text-slate-100">{title}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{meta}</p>
      {href && <a href={href} target="_blank" rel="noreferrer" className="mt-1 block text-xs font-medium text-indigo-600 dark:text-indigo-300">GitHub Repository</a>}
    </div>
  );
}

function QuickAction({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
    >
      <Plus className="h-4 w-4" />
      {label}
    </Link>
  );
}
