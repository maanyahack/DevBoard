import { CalendarDays, CheckCircle2, Circle, Clock3, Pencil, Trash2 } from 'lucide-react';
import {
  taskPriorityLabels,
  taskStatusLabels,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from '@/features/tasks/types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const statusStyles: Record<TaskStatus, string> = {
  todo: 'bg-slate-100 text-slate-700 ring-slate-600/10 dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-400/20',
  in_progress: 'bg-sky-50 text-sky-700 ring-sky-600/10 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20',
  done: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20',
};

const priorityStyles: Record<TaskPriority, string> = {
  low: 'bg-teal-50 text-teal-700 ring-teal-600/10 dark:bg-teal-400/10 dark:text-teal-300 dark:ring-teal-400/20',
  medium: 'bg-amber-50 text-amber-700 ring-amber-600/10 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20',
  high: 'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/20',
};

const statusIcons = {
  todo: Circle,
  in_progress: Clock3,
  done: CheckCircle2,
};

function formatDueDate(value: string | null): string {
  if (!value) return 'No due date';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const StatusIcon = statusIcons[task.status];

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-150 hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[task.status]}`}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {taskStatusLabels[task.status]}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${priorityStyles[task.priority]}`}
            >
              {taskPriorityLabels[task.priority]}
            </span>
          </div>
          <h2 className="mt-3 line-clamp-2 text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {task.title}
          </h2>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="rounded-lg p-2 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:hover:bg-slate-700 dark:hover:text-slate-100 dark:focus-visible:ring-offset-slate-800"
            aria-label="Edit task"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="rounded-lg p-2 text-slate-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:hover:bg-red-500/10 dark:hover:text-red-300 dark:focus-visible:ring-offset-slate-800"
            aria-label="Delete task"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="mt-3 line-clamp-3 min-h-16 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {task.description || 'No description yet.'}
      </p>

      <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-700">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-700/50 dark:text-slate-300 dark:ring-slate-600">
          <CalendarDays className="h-3.5 w-3.5 text-slate-400 dark:text-slate-400" />
          {formatDueDate(task.dueDate)}
        </span>
      </div>
    </article>
  );
}
