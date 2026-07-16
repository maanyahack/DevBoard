import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Bot,
  CheckCircle2,
  FolderKanban,
  ListTodo,
  Loader2,
  NotebookText,
  Plus,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DashboardPanel } from '@/features/dashboard/components/DashboardPanel';
import { DashboardSkeleton } from '@/features/dashboard/components/DashboardSkeleton';
import { StatCard } from '@/features/dashboard/components/StatCard';
import type { DashboardData } from '@/features/dashboard/types';
import { projectStatusLabels } from '@/features/projects/types';
import { taskPriorityLabels, taskStatusLabels } from '@/features/tasks/types';

const dashboardQueryKey = ['dashboard'];
const apiBaseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '');

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

async function fetchInsights(accessToken: string): Promise<string> {
  const response = await fetch(`${apiBaseUrl}/api/dashboard/insights`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(await getErrorMessage(response));
  const data = (await response.json()) as { insights: string };
  return data.insights;
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatDate()}</p>
        </div>
      </div>

      {dashboardQuery.isLoading && <DashboardSkeleton />}
      {dashboardQuery.isError && <ErrorMessage message={(dashboardQuery.error as Error).message} />}
      {dashboardQuery.data && (
        <div className="mt-8 space-y-6">
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Projects" value={dashboardQuery.data.stats.projects} icon={<FolderKanban className="h-4 w-4" />} />
            <StatCard label="Total Tasks" value={dashboardQuery.data.stats.tasks} icon={<ListTodo className="h-4 w-4" />} />
            <StatCard label="Completed Tasks" value={dashboardQuery.data.stats.completedTasks} icon={<CheckCircle2 className="h-4 w-4" />} />
            <StatCard label="Total Notes" value={dashboardQuery.data.stats.notes} icon={<NotebookText className="h-4 w-4" />} />
          </div>

          {/* AI Insights — full width, above the data panels */}
          <AIInsightsPanel accessToken={accessToken} />

          {/* Main data panels */}
          <div className="grid gap-4 xl:grid-cols-3">
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

          {/* Quick Actions */}
          <DashboardPanel title="Quick Actions">
            <div className="grid gap-2.5 sm:grid-cols-3">
              <QuickAction to="/notes" label="New Note" />
              <QuickAction to="/tasks" label="New Task" />
              <QuickAction to="/projects" label="New Project" />
            </div>
          </DashboardPanel>
        </div>
      )}
    </div>
  );
}

// ── AI Insights Panel ──────────────────────────────────────────────────────────

function AIInsightsPanel({ accessToken }: { accessToken: string | undefined }) {
  const [insights, setInsights] = useState<string | null>(null);

  const insightsMutation = useMutation({
    mutationFn: () => fetchInsights(requireToken(accessToken)),
    onSuccess: (text) => setInsights(text),
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 dark:border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
            <Bot className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-[13px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            AI Insights
          </h2>
        </div>
        <button
          onClick={() => insightsMutation.mutate()}
          disabled={insightsMutation.isPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-emerald-500/20 transition-all duration-150 hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          {insightsMutation.isPending ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3" />
              {insights ? 'Regenerate' : 'Generate Insights'}
            </>
          )}
        </button>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {insightsMutation.isError && (
          <p className="text-sm text-red-500 dark:text-red-400">
            {(insightsMutation.error as Error).message}
          </p>
        )}
        {!insights && !insightsMutation.isPending && !insightsMutation.isError && (
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Click <span className="font-medium text-slate-500 dark:text-slate-400">Generate Insights</span> to get personalised productivity feedback based on your current workspace.
          </p>
        )}
        {insightsMutation.isPending && (
          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
            Analysing your workspace…
          </div>
        )}
        {insights && !insightsMutation.isPending && (
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{insights}</p>
        )}
      </div>
    </section>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
      {message}
    </div>
  );
}

function ListEmpty({ empty, text, children }: { empty: boolean; text: string; children: ReactNode }) {
  return empty ? (
    <p className="text-sm text-slate-400 dark:text-slate-500">{text}</p>
  ) : (
    <div className="space-y-2">{children}</div>
  );
}

function ListItem({ title, meta, href }: { title: string; meta: string; href?: string }) {
  return (
    <div className="group rounded-lg border border-slate-100 p-3 transition-all duration-150 hover:border-slate-200 hover:bg-slate-50/80 dark:border-slate-700/60 dark:hover:border-slate-600 dark:hover:bg-slate-700/30">
      <p className="line-clamp-1 text-sm font-medium text-slate-900 dark:text-slate-100">{title}</p>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{meta}</p>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-emerald-600 transition-colors duration-150 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          GitHub Repository
        </a>
      )}
    </div>
  );
}

function QuickAction({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700/80"
    >
      <Plus className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
      {label}
    </Link>
  );
}
