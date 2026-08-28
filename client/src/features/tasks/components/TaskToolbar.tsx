import type { FC } from 'react';
import { CalendarDays, Search } from 'lucide-react';
import type { Project } from '@/features/projects/types';
import type { PriorityFilter, TaskView } from '@/features/tasks/utils';

interface TaskToolbarProps {
  view: TaskView;
  search: string;
  projectId: string;
  priority: PriorityFilter;
  projects: Project[];
  onViewChange: (view: TaskView) => void;
  onSearchChange: (value: string) => void;
  onProjectChange: (value: string) => void;
  onPriorityChange: (value: PriorityFilter) => void;
}

const views: Array<{ value: TaskView; label: string; icon: FC<{ className?: string }> }> = [
  {
    value: 'list',
    label: 'List',
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <path d="M3 4h10M3 8h10M3 12h10" />
      </svg>
    ),
  },
  {
    value: 'kanban',
    label: 'Kanban',
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <rect x="1" y="2" width="4" height="12" rx="1" />
        <rect x="6" y="2" width="4" height="8" rx="1" />
        <rect x="11" y="2" width="4" height="10" rx="1" />
      </svg>
    ),
  },
  {
    value: 'calendar',
    label: 'Calendar',
    icon: CalendarDays,
  },
];

const selectClass =
  'h-10 cursor-pointer rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 text-[13px] font-medium text-slate-900 shadow-[var(--shadow-sm)] outline-none transition-all duration-150 hover:border-[var(--border-soft)] focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-300/40 dark:text-white dark:focus:border-emerald-500/40 dark:focus:ring-emerald-500/20 [&>option]:dark:bg-slate-800 [&>option]:dark:text-white';

export function TaskToolbar({
  view,
  search,
  projectId,
  priority,
  projects,
  onViewChange,
  onSearchChange,
  onProjectChange,
  onPriorityChange,
}: TaskToolbarProps) {
  return (
    <div className="mt-6 space-y-4">
      {/* View switcher */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="floating-card inline-flex rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-1 shadow-[var(--shadow-sm)]">
          {views.map((item) => {
            const Icon = item.icon;
            const active = view === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onViewChange(item.value)}
                className={`pressable cursor-pointer inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                  active
                    ? 'bg-emerald-500 text-white shadow-[0_1px_4px_0_hsl(160_84%_39%/0.3)]'
                    : 'text-slate-500 hover:bg-[var(--surface-raised)] hover:text-slate-900 dark:text-white dark:hover:bg-slate-700/70 dark:hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search + filters */}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
        {/* Search input */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors duration-150 group-focus-within:text-emerald-500 dark:text-white/70 dark:group-focus-within:text-emerald-400" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks…"
            className="field-focus-ring h-10 w-full cursor-text rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] pl-9 pr-3 text-[13px] font-medium text-slate-900 shadow-[var(--shadow-sm)] outline-none transition-all duration-150 hover:border-[var(--border-soft)] placeholder:text-slate-400/75 dark:text-white dark:placeholder:text-white/70"
          />
        </div>

        <select
          value={projectId}
          onChange={(e) => onProjectChange(e.target.value)}
          className={selectClass}
        >
          <option value="all">All projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value as PriorityFilter)}
          className={selectClass}
        >
          <option value="all">All priorities</option>
          <option value="high">High priority</option>
          <option value="medium">Medium priority</option>
          <option value="low">Low priority</option>
        </select>
      </div>
    </div>
  );
}
