import { CalendarDays, Columns3, List, Search } from 'lucide-react';
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

const views: Array<{ value: TaskView; label: string; icon: typeof List }> = [
  { value: 'list', label: 'List', icon: List },
  { value: 'kanban', label: 'Kanban', icon: Columns3 },
  { value: 'calendar', label: 'Calendar', icon: CalendarDays },
];

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
      <div className="flex flex-wrap items-center gap-2">
        <div className="floating-card inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/10">
          {views.map((item) => {
            const Icon = item.icon;
            const active = view === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onViewChange(item.value)}
                className={`pressable inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${
                  active
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/70 dark:hover:text-slate-100'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search tasks"
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-sm shadow-slate-200/40 outline-none transition focus:ring-2 focus:ring-emerald-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:shadow-black/10"
          />
        </div>
        <select
          value={projectId}
          onChange={(event) => onProjectChange(event.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm shadow-slate-200/40 outline-none transition focus:ring-2 focus:ring-emerald-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:shadow-black/10"
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
          onChange={(event) => onPriorityChange(event.target.value as PriorityFilter)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm shadow-slate-200/40 outline-none transition focus:ring-2 focus:ring-emerald-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:shadow-black/10"
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
