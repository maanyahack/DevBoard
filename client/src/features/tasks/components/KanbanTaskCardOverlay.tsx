import { CalendarDays } from 'lucide-react';
import type { Task } from '@/features/tasks/types';
import { taskPriorityLabels } from '@/features/tasks/types';
import { dueDateKey } from '@/features/tasks/utils';

interface KanbanTaskCardOverlayProps {
  task: Task;
}

const priorityStyles = {
  low: 'bg-emerald-50 text-emerald-700 ring-emerald-500/15 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20',
  medium: 'bg-amber-50 text-amber-700 ring-amber-500/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25',
  high: 'bg-rose-50 text-rose-700 ring-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/25',
};

/**
 * Renders a task card in a visually "lifted" state, used inside
 * <DragOverlay> so the user sees what they're dragging.
 */
export function KanbanTaskCardOverlay({ task }: KanbanTaskCardOverlayProps) {
  return (
    <div className="w-72 rounded-lg border border-emerald-300 bg-white p-3 shadow-xl shadow-emerald-500/15 ring-2 ring-emerald-200/60 dark:border-emerald-500/50 dark:bg-slate-800 dark:shadow-emerald-500/10 dark:ring-emerald-500/20">
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          {task.title}
        </h3>
        <span
          className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${priorityStyles[task.priority]}`}
        >
          {taskPriorityLabels[task.priority]}
        </span>
      </div>
      {task.description && (
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {task.description}
        </p>
      )}
      {task.dueDate && (
        <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <CalendarDays className="h-3 w-3" />
          {dueDateKey(task.dueDate)}
        </p>
      )}
    </div>
  );
}
