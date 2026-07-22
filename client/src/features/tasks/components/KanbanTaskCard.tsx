import { CalendarDays } from 'lucide-react';
import type { Task } from '@/features/tasks/types';
import { taskPriorityLabels } from '@/features/tasks/types';
import { dueDateKey } from '@/features/tasks/utils';

interface KanbanTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
}

const priorityStyles = {
  low: 'bg-emerald-50 text-emerald-700 ring-emerald-500/15 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20',
  medium: 'bg-amber-50 text-amber-700 ring-amber-500/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25',
  high: 'bg-rose-50 text-rose-700 ring-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/25',
};

export function KanbanTaskCard({ task, onEdit, onDragStart, onDragEnd }: KanbanTaskCardProps) {
  return (
    <button
      type="button"
      draggable
      onDragStart={() => onDragStart(task.id)}
      onDragEnd={onDragEnd}
      onClick={() => onEdit(task)}
      className="floating-card stagger-item w-full rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm shadow-slate-200/50 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/70 active:scale-[0.99] dark:border-slate-700/80 dark:bg-slate-800 dark:shadow-black/10 dark:hover:border-slate-600 dark:hover:shadow-black/25"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          {task.title}
        </h3>
        <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${priorityStyles[task.priority]}`}>
          {taskPriorityLabels[task.priority]}
        </span>
      </div>
      {task.description && (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {task.description}
        </p>
      )}
      {task.dueDate && (
        <p className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <CalendarDays className="h-3 w-3" />
          {dueDateKey(task.dueDate)}
        </p>
      )}
    </button>
  );
}
