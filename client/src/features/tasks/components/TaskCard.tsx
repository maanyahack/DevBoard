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
  isSelected: boolean;
  selectionMode: boolean;
  onSelect: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const statusStyles: Record<TaskStatus, string> = {
  todo:        'bg-slate-100 text-slate-700 ring-slate-500/15 dark:bg-slate-700/60 dark:text-slate-300 dark:ring-slate-400/20',
  in_progress: 'bg-sky-50 text-sky-700 ring-sky-500/20 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/25',
  done:        'bg-emerald-50 text-emerald-700 ring-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25',
};

const priorityStyles: Record<TaskPriority, string> = {
  low:    'bg-emerald-50 text-emerald-700 ring-emerald-500/15 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20',
  medium: 'bg-amber-50 text-amber-700 ring-amber-500/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25',
  high:   'bg-rose-50 text-rose-700 ring-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/25',
};

const priorityDots: Record<TaskPriority, string> = {
  low:    'bg-emerald-500',
  medium: 'bg-amber-500',
  high:   'bg-rose-500',
};

const cardPriorityBorder: Record<TaskPriority, string> = {
  low:    'hover:border-emerald-200/80 dark:hover:border-emerald-500/30',
  medium: 'hover:border-amber-200/80 dark:hover:border-amber-500/30',
  high:   'hover:border-rose-200/80 dark:hover:border-rose-500/35',
};

const statusIcons = {
  todo:        Circle,
  in_progress: Clock3,
  done:        CheckCircle2,
};

function formatDueDate(value: string | null): { label: string; overdue: boolean } {
  if (!value) return { label: 'No due date', overdue: false };
  const date = new Date(value.includes('T') ? value : `${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return { label: 'No due date', overdue: false };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return {
    label: new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date),
    overdue: date < today,
  };
}

export function TaskCard({ task, isSelected, selectionMode, onSelect, onEdit, onDelete }: TaskCardProps) {
  const StatusIcon = statusIcons[task.status];
  const due = formatDueDate(task.dueDate);

  return (
    <article
      className={`floating-card stagger-item group relative rounded-xl border bg-[var(--surface-card)] p-5 shadow-[var(--shadow-sm)] transition-all duration-200 ${
        isSelected
          ? 'border-emerald-400 bg-emerald-50/30 ring-2 ring-emerald-400 dark:border-emerald-500 dark:bg-emerald-500/5 dark:ring-emerald-500'
          : `border-[var(--border-subtle)] hover:shadow-[var(--shadow-card-hover)] dark:border-[var(--border-subtle)] ${cardPriorityBorder[task.priority]}`
      }`}
    >
      {/* Checkbox */}
      <label
        className={`absolute left-3 top-3 z-10 flex h-5 w-5 cursor-pointer items-center justify-center transition-opacity duration-150 ${
          selectionMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        aria-label={isSelected ? 'Deselect task' : 'Select task'}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(task.id)}
          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          onClick={(e) => e.stopPropagation()}
        />
      </label>

      {/* Header */}
      <div className={`flex items-start justify-between gap-4 ${selectionMode ? 'pl-7' : ''}`}>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Status badge */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${statusStyles[task.status]}`}
            >
              <StatusIcon className="h-3 w-3" />
              {taskStatusLabels[task.status]}
            </span>
            {/* Priority badge */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${priorityStyles[task.priority]}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${priorityDots[task.priority]}`} />
              {taskPriorityLabels[task.priority]}
            </span>
          </div>
          <h2 className="mt-2.5 line-clamp-2 text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {task.title}
          </h2>
        </div>

        {/* Actions — visible on hover */}
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="pressable cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:bg-sky-500/10 dark:hover:text-sky-300"
            aria-label="Edit task"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="pressable cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
            aria-label="Delete task"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="mt-3 line-clamp-3 min-h-[3.5rem] text-sm leading-relaxed text-[var(--text-secondary)]">
        {task.description || 'No description yet.'}
      </p>

      {/* Footer */}
      <div className="mt-4 border-t border-[var(--border-subtle)] pt-3.5">
        <span
          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
            due.overdue && task.status !== 'done'
              ? 'bg-rose-50 text-rose-700 ring-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/25'
              : 'bg-[var(--surface-raised)] text-[var(--text-muted)] ring-[var(--border-subtle)]'
          }`}
        >
          <CalendarDays className="h-3 w-3" />
          {due.overdue && task.status !== 'done' ? `Overdue · ${due.label}` : due.label}
        </span>
      </div>
    </article>
  );
}
