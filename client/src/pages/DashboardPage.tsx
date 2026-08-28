// ─── DashboardPage.tsx ─────────────────────────────────────────────────────────
// The main dashboard — the first page users see after logging in.
// Shows a personalized greeting, stat cards, AI insights, recent items, quick actions,
// and an activity timeline.
//
// TypeScript concepts used:
//   - `import type` for type-only imports (erased at compile time)
//   - Type guards: `isErrorResponse(value): value is { message: string }` — narrows a union
//   - `async/await` with typed returns (`Promise<DashboardData>`, `Promise<string>`)
//   - Optional chaining (`user?.user_metadata?.display_name`) for safe nested access
//   - Nullish coalescing (`??`) for fallback values
//   - Type assertion (`as Error`) when we know the error shape
//   - `CSSProperties` type for inline style with custom CSS variables

import { useMutation, useQuery } from '@tanstack/react-query';  // React Query for server state
import {
  Bot,            // AI insights icon
  CheckCircle2,   // Completed tasks icon
  FolderKanban,   // Projects icon
  ListTodo,       // Tasks icon
  Loader2,        // Spinning loader icon
  NotebookText,   // Notes icon
  Plus,           // Plus icon for quick actions
  Sparkles,       // Sparkle icon for AI generate button
} from 'lucide-react';
import { Link } from 'react-router-dom';                      // Client-side navigation
import { useState, type CSSProperties, type ReactNode } from 'react';  // CSSProperties for typed inline styles
import { motion } from 'framer-motion';                       // Entry animation
import { useAuth } from '@/context/AuthContext';               // Access current user + session
import { ActivityTimeline } from '@/features/dashboard/components/ActivityTimeline';
import { DashboardPanel } from '@/features/dashboard/components/DashboardPanel';
import { DashboardSkeleton } from '@/features/dashboard/components/DashboardSkeleton';  // Loading placeholder
import { StatCard } from '@/features/dashboard/components/StatCard';                     // Animated stat card
import type { DashboardData } from '@/features/dashboard/types';    // TypeScript interface for API response
import { projectStatusLabels } from '@/features/projects/types';   // { active: "Active", archived: "Archived", ... }
import { taskPriorityLabels, taskStatusLabels } from '@/features/tasks/types';  // Label maps for display

// ─── Constants ────────────────────────────────────────────────────────────────
const dashboardQueryKey = ['dashboard'];  // React Query cache key prefix

// API base URL — falls back to localhost if env var is missing.
// `.replace(/\/$/, '')` removes trailing slash to prevent double-slash in URLs.
const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

// ─── Helper: Require Token ────────────────────────────────────────────────────
// Throws if the token is missing. Used inside queryFn/mutationFn where we know
// the token should exist (guarded by `enabled` in useQuery).
function requireToken(token: string | undefined): string {
  if (!token) throw new Error('Authentication required.');
  return token;  // TypeScript now knows this is a `string`, not `string | undefined`
}

// ─── Type Guard: Error Response ───────────────────────────────────────────────
// A "type predicate" (`value is { message: string }`) — if this returns true,
// TypeScript narrows the type so you can safely access `.message`.
function isErrorResponse(value: unknown): value is { message: string } {
  return typeof value === 'object' && value !== null && 'message' in value && typeof value.message === 'string';
}

// ─── Helper: Parse Error from Response ────────────────────────────────────────
// Tries to extract a meaningful error message from the API response body.
// Falls back to a generic status-based message if parsing fails.
async function getErrorMessage(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null);  // `.catch(() => null)` handles non-JSON responses
  return isErrorResponse(body) ? body.message : `Request failed with status ${response.status}`;
}

// ─── API Functions ────────────────────────────────────────────────────────────
// These are plain async functions, not hooks. They fetch data from the server.
// React Query wraps them to handle loading, caching, and error states.

// Fetch the full dashboard data (stats, recent tasks/notes/projects, activities)
async function fetchDashboard(accessToken: string): Promise<DashboardData> {
  const response = await fetch(`${apiBaseUrl}/api/dashboard`, {
    headers: { Authorization: `Bearer ${accessToken}` },  // JWT in the Authorization header
  });
  if (!response.ok) throw new Error(await getErrorMessage(response));  // Non-2xx → throw error
  return (await response.json()) as DashboardData;  // `as DashboardData` — type assertion for the JSON
}

// Fetch AI-generated insights from the Gemini API
async function fetchInsights(accessToken: string): Promise<string> {
  const response = await fetch(`${apiBaseUrl}/api/dashboard/insights`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(await getErrorMessage(response));
  const data = (await response.json()) as { insights: string };  // API returns { insights: "..." }
  return data.insights;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Format a date string (or today) into a readable format like "Wednesday, Aug 28, 2026"
function formatDate(value?: string): string {
  return new Intl.DateTimeFormat('en', {
    weekday: value ? undefined : 'long',     // Show weekday only for today (no input)
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(value ? new Date(value) : new Date());
}

// Generate a time-of-day greeting with the user's first name
function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const displayName = name.trim().split(' ')[0];  // First word of their display name
  return `${timeGreeting}, ${displayName}`;
}

// ─── DashboardPage Component ──────────────────────────────────────────────────
export default function DashboardPage() {
  // Extract auth state from context — session has the JWT, user has profile info
  const { session, user } = useAuth();
  const accessToken = session?.access_token;  // Optional chaining: session might be null during loading

  // Get display name: prefer user_metadata.display_name, fall back to email prefix, fall back to "there"
  // TypeScript: `as string | undefined` narrows the type for the next `??` operator
  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ??
    user?.email?.split('@')[0] ??
    'there';

  // ─── React Query: Dashboard Data ──────────────────────────────────────────
  const dashboardQuery = useQuery({
    queryKey: [...dashboardQueryKey, accessToken],  // Spread into new array: ['dashboard', token]
    enabled: Boolean(accessToken),                 // Don't fetch until we have a token
    queryFn: () => fetchDashboard(requireToken(accessToken)),  // requireToken asserts string
  });

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    // Entry animation wrapper
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Greeting header — responsive layout: stacked on mobile, row on desktop */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {getGreeting(displayName)}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{formatDate()}</p>
        </div>
      </div>

      {/* ── Loading State ──────────────────────────────────────────────────── */}
      {dashboardQuery.isLoading && <DashboardSkeleton />}

      {/* ── Error State ────────────────────────────────────────────────────── */}
      {dashboardQuery.isError && <ErrorMessage message={(dashboardQuery.error as Error).message} />}

      {/* ── Dashboard Content ──────────────────────────────────────────────── */}
      {dashboardQuery.data && (
        <div className="mt-8 space-y-5">
          {/* ── Stat Cards Row ─────────────────────────────────────────────── */}
          {/* Four cards: Total Projects, Total Tasks, Completed Tasks, Total Notes */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* `--stagger` is a CSS custom property used by stagger animation CSS */}
            <div style={{ '--stagger': 0 } as CSSProperties}><StatCard label="Total Projects"   value={dashboardQuery.data.stats.projects}       icon={<FolderKanban className="h-4 w-4" />} accent="sky"     /></div>
            <div style={{ '--stagger': 1 } as CSSProperties}><StatCard label="Total Tasks"      value={dashboardQuery.data.stats.tasks}           icon={<ListTodo className="h-4 w-4" />}     accent="amber"   /></div>
            <div style={{ '--stagger': 2 } as CSSProperties}><StatCard label="Completed Tasks"  value={dashboardQuery.data.stats.completedTasks}  icon={<CheckCircle2 className="h-4 w-4" />} accent="emerald" /></div>
            <div style={{ '--stagger': 3 } as CSSProperties}><StatCard label="Total Notes"      value={dashboardQuery.data.stats.notes}           icon={<NotebookText className="h-4 w-4" />} accent="violet"  /></div>
          </div>

          {/* ── AI Insights Panel ───────────────────────────────────────────── */}
          <AIInsightsPanel accessToken={accessToken} />

          {/* ── Data Panels: Recent Items ──────────────────────────────────── */}
          {/* Three panels side by side on desktop, stacked on mobile */}
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
                    href={project.githubUrl ?? undefined}  // `?? undefined` converts null → undefined
                  />
                ))}
              </ListEmpty>
            </DashboardPanel>
          </div>

          {/* ── Quick Actions ──────────────────────────────────────────────── */}
          <DashboardPanel title="Quick Actions">
            <div className="stagger-list grid gap-2.5 sm:grid-cols-3">
              <QuickAction to="/notes"    label="New Note"    />
              <QuickAction to="/tasks"    label="New Task"    />
              <QuickAction to="/projects" label="New Project" />
            </div>
          </DashboardPanel>

          {/* ── Activity Timeline ──────────────────────────────────────────── */}
          <DashboardPanel title="Activity Timeline">
            <ActivityTimeline activities={dashboardQuery.data.activities} />
          </DashboardPanel>
        </div>
      )}
    </motion.div>
  );
}

// ── AI Insights Panel ──────────────────────────────────────────────────────────
// A separate component (not exported) that fetches and displays AI-generated
// productivity insights. Uses `useMutation` instead of `useQuery` because it's
// triggered by a button click, not automatic.
function AIInsightsPanel({ accessToken }: { accessToken: string | undefined }) {
  // Local state to store the generated insights text (not in React Query cache)
  const [insights, setInsights] = useState<string | null>(null);

  // useMutation for on-demand API calls (triggered by user action)
  const insightsMutation = useMutation({
    mutationFn: () => fetchInsights(requireToken(accessToken)),
    onSuccess: (text) => setInsights(text),  // Store the result in local state
  });

  return (
    <section className="ai-surface card-highlight floating-card stagger-item rounded-xl border border-emerald-200/70 bg-[var(--surface-card)] shadow-[var(--shadow-card)] hover:border-emerald-300/60 hover:shadow-[var(--shadow-card-hover)] dark:border-emerald-500/20 dark:hover:border-emerald-500/35">
      {/* Header with AI icon and generate/regenerate button */}
      <div className="relative z-10 flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20">
            <Bot className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-emerald-700/70 dark:text-emerald-300/70">
            AI Insights
          </h2>
        </div>
        {/* Button triggers the mutation */}
        <button
          onClick={() => insightsMutation.mutate()}  // Fire the mutation
          disabled={insightsMutation.isPending}       // Disable while loading
          className="pressable inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_1px_2px_0_hsl(160_84%_20%/0.35)] hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          {insightsMutation.isPending ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />  {/* Spinning loader */}
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3" />
              {insights ? 'Regenerate' : 'Generate Insights'}  {/* Toggle button text */}
            </>
          )}
        </button>
      </div>

      {/* Body — shows different content based on state */}
      <div className="relative z-10 px-5 py-4">
        {/* Error state */}
        {insightsMutation.isError && (
          <p className="text-sm text-red-500 dark:text-red-400">
            {(insightsMutation.error as Error).message}  {/* `as Error` — we know it's an Error */}
          </p>
        )}
        {/* Empty state — prompt user to generate */}
        {!insights && !insightsMutation.isPending && !insightsMutation.isError && (
          <p className="text-sm text-[var(--text-muted)]">
            Click{' '}
            <span className="font-medium text-slate-600 dark:text-slate-400">Generate Insights</span>{' '}
            to get personalised productivity feedback based on your current workspace.
          </p>
        )}
        {/* Loading state */}
        {insightsMutation.isPending && (
          <div className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
            Analysing your workspace…
          </div>
        )}
        {/* Results state — show the generated insights */}
        {insights && !insightsMutation.isPending && (
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{insights}</p>
        )}
      </div>
    </section>
  );
}

// ── Helper Components ──────────────────────────────────────────────────────────

// Error banner shown when the dashboard API call fails
function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-500/8 dark:text-red-300">
      {/* Warning icon */}
      <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm-.75 3.5a.75.75 0 0 1 1.5 0v3.25a.75.75 0 0 1-1.5 0V4.5Zm.75 6.5a.875.875 0 1 1 0-1.75A.875.875 0 0 1 8 11Z" />
      </svg>
      <span className="font-medium">{message}</span>
    </div>
  );
}

// ── ListEmpty: Empty State or Children ─────────────────────────────────────────
// A conditional renderer — if the list is empty, shows a friendly empty state;
// otherwise renders the children (the actual list items).
type EmptyIcon = 'tasks' | 'notes' | 'projects';  // Union type for icon selection

// Icon map — each key maps to an inline SVG
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
  empty: boolean;    // True when there are no items
  text: string;      // Message to show when empty (e.g. "No tasks yet.")
  icon: EmptyIcon;   // Which icon to show
  children: ReactNode;  // The list items to render when NOT empty
}) {
  return empty ? (
    // Empty state — centered icon + message
    <div className="flex flex-col items-center gap-2 py-4 text-center">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
        {emptyIcons[icon]}
      </span>
      <p className="text-sm text-[var(--text-muted)]">{text}</p>
    </div>
  ) : (
    // Has items — render them in a vertical stack
    <div className="space-y-1.5">{children}</div>
  );
}

// ── ListItem: A single item in a dashboard panel ──────────────────────────────
// Renders a title, metadata line, and optional GitHub link.
function ListItem({ title, meta, href }: { title: string; meta: string; href?: string }) {
  return (
    <div className="group rounded-lg border border-[var(--border-subtle)] p-3 transition-all duration-150 hover:border-[var(--border-soft)] hover:bg-slate-50/60 hover:shadow-sm dark:hover:bg-slate-800/40">
      <p className="line-clamp-1 text-sm font-medium text-slate-900 dark:text-slate-100">{title}</p>
      <p className="mt-0.5 text-xs text-[var(--text-muted)]">{meta}</p>
      {/* Optional GitHub link — only shown if href is provided */}
      {href && (
        <a
          href={href}
          target="_blank"           // Open in new tab
          rel="noreferrer"           // Security: don't send referrer
          className="mt-2 inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 transition-colors duration-150 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-700/60 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
        >
          GitHub Repository
        </a>
      )}
    </div>
  );
}

// ── QuickAction: Navigation button ────────────────────────────────────────────
// A styled Link that navigates to a feature page (e.g. /notes, /tasks).
function QuickAction({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}  // React Router client-side navigation (no page reload)
      className="pressable inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-2.5 text-sm font-medium text-slate-700 shadow-[var(--shadow-card)] transition-all duration-150 hover:border-emerald-200/80 hover:bg-emerald-50/60 hover:text-emerald-800 hover:shadow-[var(--shadow-card-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-emerald-500/25 dark:hover:bg-emerald-500/8 dark:hover:text-emerald-200"
    >
      <Plus className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
      {label}
    </Link>
  );
}
