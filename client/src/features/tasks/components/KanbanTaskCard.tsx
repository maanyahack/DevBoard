import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarDays, GripVertical } from 'lucide-react';
import type { Task } from '@/features/tasks/types';
import { taskPriorityLabels } from '@/features/tasks/types';
import { dueDateKey } from '@/features/tasks/utils';

interface KanbanTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const priorityStyles = {
  low: 'bg-emerald-50 text-emerald-700 ring-emerald-500/15 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20',
  medium: 'bg-amber-50 text-amber-700 ring-amber-500/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25',
  high: 'bg-rose-50 text-rose-700 ring-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/25',
};

export function KanbanTaskCard({ task, onEdit }: KanbanTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 1 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`floating-card stagger-item flex items-start gap-1 rounded-lg border bg-white p-3 text-left shadow-sm shadow-slate-200/50 transition-colors duration-100 dark:bg-slate-800 dark:shadow-black/10 ${
        isDragging
          ? 'border-emerald-300 ring-2 ring-emerald-200/60 dark:border-emerald-500/50 dark:ring-emerald-500/20'
          : 'border-slate-200 hover:border-slate-300 dark:border-slate-700/80 dark:hover:border-slate-600'
      }`}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="mt-0.5 flex shrink-0 cursor-grab touch-none rounded p-0.5 text-slate-300 transition-colors hover:text-slate-500 active:cursor-grabbing dark:text-slate-600 dark:hover:text-slate-400"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      {/* Body */}
      <button
        type="button"
        onClick={() => onEdit(task)}
        className="min-w-0 flex-1 text-left outline-none"
      >
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
      </button>
    </div>
  );
}
