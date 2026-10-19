import {
  Bot,
  Bookmark,
  CheckCircle2,
  FileText,
  FolderKanban,
  Lightbulb,
  ListPlus,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { ActivityEvent, ActivityType } from '@/features/dashboard/types';

interface ActivityTimelineProps {
  activities: ActivityEvent[];
}

const activityConfig: Record<
  ActivityType,
  { Icon: typeof FolderKanban; bg: string; icon: string; ring: string }
> = {
  project_created:         { Icon: FolderKanban, bg: 'bg-sky-50 dark:bg-sky-500/10',     icon: 'text-sky-600 dark:text-sky-300',     ring: 'ring-sky-100 dark:ring-sky-500/20'     },
  task_created:            { Icon: ListPlus,     bg: 'bg-amber-50 dark:bg-amber-500/10', icon: 'text-amber-600 dark:text-amber-300', ring: 'ring-amber-100 dark:ring-amber-500/20' },
  task_completed:          { Icon: CheckCircle2, bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: 'text-emerald-600 dark:text-emerald-300', ring: 'ring-emerald-100 dark:ring-emerald-500/20' },
  note_created:            { Icon: FileText,     bg: 'bg-slate-50 dark:bg-slate-700/40',  icon: 'text-slate-600 dark:text-slate-300',  ring: 'ring-slate-200 dark:ring-slate-600'    },
  bookmark_added:          { Icon: Bookmark,     bg: 'bg-rose-50 dark:bg-rose-500/10',    icon: 'text-rose-600 dark:text-rose-300',    ring: 'ring-rose-100 dark:ring-rose-500/20'   },
  knowledge_entry_created: { Icon: Lightbulb,   bg: 'bg-amber-50 dark:bg-amber-500/10', icon: 'text-amber-600 dark:text-amber-300', ring: 'ring-amber-100 dark:ring-amber-500/20' },
  ai_summary_generated:    { Icon: Bot,         bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: 'text-emerald-600 dark:text-emerald-300', ring: 'ring-emerald-100 dark:ring-emerald-500/20' },
  ai_tasks_generated:      { Icon: Sparkles,    bg: 'bg-violet-50 dark:bg-violet-500/10', icon: 'text-violet-600 dark:text-violet-300', ring: 'ring-violet-100 dark:ring-violet-500/20' },
};

function dayGroup(value: string): 'Today' | 'Yesterday' | 'Older' {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const key = date.toDateString();
  if (key === today.toDateString()) return 'Today';
  if (key === yesterday.toDateString()) return 'Yesterday';
  return 'Older';
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const groups = {
    Today:     activities.filter((a) => dayGroup(a.createdAt) === 'Today'),
    Yesterday: activities.filter((a) => dayGroup(a.createdAt) === 'Yesterday'),
    Older:     activities.filter((a) => dayGroup(a.createdAt) === 'Older'),
  };

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" />
          </svg>
        </span>
        <p className="text-sm text-[var(--text-muted)]">No activity yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {(['Today', 'Yesterday', 'Older'] as const).map((group) => {
        const items = groups[group];
        if (items.length === 0) return null;

        return (
          <section key={group}>
            <h3 className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              {group}
            </h3>
            <div className="space-y-1.5">
              {items.map((activity, i) => {
                const cfg = activityConfig[activity.type];
                const { Icon } = cfg;
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-start gap-3 rounded-lg border border-[var(--border-subtle)] p-3 transition-all duration-150 hover:border-[var(--border-soft)] hover:bg-slate-50/60 hover:shadow-sm dark:hover:bg-slate-800/40"
                  >
                    <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${cfg.bg} ${cfg.icon} ${cfg.ring}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                        {activity.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                        {formatTime(activity.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
