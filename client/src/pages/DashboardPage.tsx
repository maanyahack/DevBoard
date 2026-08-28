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
import { useState, type CSSProperties, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { ActivityTimeline } from '@/features/dashboard/components/ActivityTimeline';
import { DashboardPanel } from '@/features/dashboard/components/DashboardPanel';
import { DashboardSkeleton } from '@/features/dashboard/components/DashboardSkeleton';
import { StatCard } from '@/features/dashboard/components/StatCard';
import type { DashboardData } from '@/features/dashboard/types';
import { projectStatusLabels } from '@/features/projects/types';
import { taskPriorityLabels, taskStatusLabels } from '@/features/tasks/types';

const dashboardQueryKey = ['dashboard'];
const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

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

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const displayName = name.trim().split(' ')[0];
  return `${timeGreeting}, ${displayName}`;
}

export default function DashboardPage() {
  const { session, user } = useAuth();
  const accessToken = session?.access_token;
  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ??
    user?.email?.split('@')[0] ??
    'there';

  const dashboardQuery = useQuery({
    queryKey: [...dashboardQueryKey, accessToken],
    enabled: Boolean(accessToken),
    queryFn: () => fetchDashboard(requireToken(accessToken)),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {getGreeting(displayName)}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{formatDate()}</p>
        </div>
      </div>

      {dashboardQuery.isLoading && <DashboardSkeleton />}
      {dashboardQuery.isError && <ErrorMessage message={(dashboardQuery.error as Error).message} />}
      {dashboardQuery.data && (
        <div className="mt-8 space-y-5">
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div style={{ '--stagger': 0 } as CSSProperties}><StatCard label="Total Projects"   value={dashboardQuery.data.stats.projects}       icon={<FolderKanban className="h-4 w-4" />} accent="sky"     /></div>
            <div style={{ '--stagger': 1 } as CSSProperties}><StatCard label="Total Tasks"      value={dashboardQuery.data.stats.tasks}           icon={<ListTodo className="h-4 w-4" />}     accent="amber"   /></div>
            <div style={{ '--stagger': 2 } as CSSProperties}><StatCard label="Completed Tasks"  value={dashboardQuery.data.stats.completedTasks}  icon={<CheckCircle2 className="h-4 w-4" />} accent="emerald" /></div>
            <div style={{ '--stagger': 3 } as CSSProperties}><StatCard label="Total Notes"      value={dashboardQuery.data.stats.notes}           icon={<NotebookText className="h-4 w-4" />} accent="violet"  /></div>
          </div>

          {/* AI Insights */}
          <AIInsightsPanel accessToken={accessToken} />

          {/* Main data panels */}
          <div className="stagger-list grid gap-4 xl:grid-cols-3">
            <DashboardPanel title="Recent Tasks">
              <ListEmpty empty={dashboardQuery.data.recentTasks.length === 0} text="No tasks yet." icon="tasks">
                {dashboardQuery.data.recentTasks.map((task) => (
                  <ListItem key={task.id} title={task.title} meta={`${taskStatusLabels[task.status]} · ${taskPriorityLabels[task.priority]}`} />
                ))}
              </ListEmpty>
            </DashboardPanel>
            <DashboardPanel title="Recent Notes">
              <ListEmpty empty={dashboardQuery.data.recentNotes.length === 0} text="No notes yet." icon="notes">
                {dashboardQuery.data.recentNotes.map((note) => (
                  <ListItem key={note.id} title={note.title} meta={`Updated ${formatDate(note.updatedAt)}`} />
                ))}
              </ListEmpty>
            </DashboardPanel>
            <DashboardPanel title="Active Projects">
              <ListEmpty empty={dashboardQuery.data.activeProjects.length === 0} text="No active projects." icon="projects">
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
            <div className="stagger-list grid gap-2.5 sm:grid-cols-3">
              <QuickAction to="/notes"    label="New Note"    />
              <QuickAction to="/tasks"    label="New Task"    />
              <QuickAction to="/projects" label="New Project" />
            </div>
          </DashboardPanel>

          <DashboardPanel title="Activity Timeline">
            <ActivityTimeline activities={dashboardQuery.data.activities} />
          </DashboardPanel>
        </div>
      )}
    </motion.div>
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
    <section className="ai-surface card-highlight floating-card stagger-item rounded-xl border border-emerald-200/70 bg-[var(--surface-card)] shadow-[var(--shadow-card)] hover:border-emerald-300/60 hover:shadow-[var(--shadow-card-hover)] dark:border-emerald-500/20 dark:hover:border-emerald-500/35">
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20">
            <Bot className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-emerald-700/70 dark:text-emerald-300/70">
            AI Insights
          </h2>
        </div>
        <button
          onClick={() => insightsMutation.mutate()}
          disabled={insightsMutation.isPending}
          className="pressable inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_1px_2px_0_hsl(160_84%_20%/0.35)] hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
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
      <div className="relative z-10 px-5 py-4">
        {insightsMutation.isError && (
          <p className="text-sm text-red-500 dark:text-red-400">
            {(insightsMutation.error as Error).message}
          </p>
        )}
        {!insights && !insightsMutation.isPending && !insightsMutation.isError && (
          <p className="text-sm text-[var(--text-muted)]">
            Click{' '}
            <span className="font-medium text-slate-600 dark:text-slate-400">Generate Insights</span>{' '}
            to get personalised productivity feedback based on your current workspace.
          </p>
        )}
        {insightsMutation.isPending && (
          <div className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
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
    <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-500/8 dark:text-red-300">
      <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm-.75 3.5a.75.75 0 0 1 1.5 0v3.25a.75.75 0 0 1-1.5 0V4.5Zm.75 6.5a.875.875 0 1 1 0-1.75A.875.875 0 0 1 8 11Z" />
      </svg>
      <span className="font-medium">{message}</span>
    </div>
  );
}

type EmptyIcon = 'tasks' | 'notes' | 'projects';

const emptyIcons: Record<EmptyIcon, ReactNode> = {
  tasks: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="m8 12 3 3 5-6" />
    </svg>
  ),
  notes: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M4 4h11l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
      <path d="M14 4v5h5M8 13h8M8 17h5" />
    </svg>
  ),
  projects: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </svg>
  ),
};

function ListEmpty({
  empty,
  text,
  icon,
  children,
}: {
  empty: boolean;
  text: string;
  icon: EmptyIcon;
  children: ReactNode;
}) {
  return empty ? (
    <div className="flex flex-col items-center gap-2 py-4 text-center">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
        {emptyIcons[icon]}
      </span>
      <p className="text-sm text-[var(--text-muted)]">{text}</p>
    </div>
  ) : (
    <div className="space-y-1.5">{children}</div>
  );
}

function ListItem({ title, meta, href }: { title: string; meta: string; href?: string }) {
  return (
    <div className="group rounded-lg border border-[var(--border-subtle)] p-3 transition-all duration-150 hover:border-[var(--border-soft)] hover:bg-slate-50/60 hover:shadow-sm dark:hover:bg-slate-800/40">
      <p className="line-clamp-1 text-sm font-medium text-slate-900 dark:text-slate-100">{title}</p>
      <p className="mt-0.5 text-xs text-[var(--text-muted)]">{meta}</p>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 transition-colors duration-150 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-700/60 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
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
      className="pressable inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-2.5 text-sm font-medium text-slate-700 shadow-[var(--shadow-card)] transition-all duration-150 hover:border-emerald-200/80 hover:bg-emerald-50/60 hover:text-emerald-800 hover:shadow-[var(--shadow-card-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-emerald-500/25 dark:hover:bg-emerald-500/8 dark:hover:text-emerald-200"
    >
      <Plus className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
      {label}
    </Link>
  );
}
