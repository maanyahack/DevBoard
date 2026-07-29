import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import type { Task, TaskStatus } from '@/features/tasks/types';
import { taskStatusLabels } from '@/features/tasks/types';
import { KanbanTaskCard } from '@/features/tasks/components/KanbanTaskCard';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onCreateInStatus: (status: TaskStatus) => void;
}

export function KanbanColumn({
  status,
  tasks,
  onEdit,
  onCreateInStatus,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'column', status },
  });

  return (
    <section
      ref={setNodeRef}
      className={`floating-card flex min-h-[22rem] flex-col rounded-xl border bg-slate-50/70 p-3 shadow-sm shadow-slate-200/40 transition-all duration-150 dark:bg-slate-900/30 dark:shadow-black/10 ${
        isOver
          ? 'border-emerald-300 ring-2 ring-emerald-200/70 dark:border-emerald-500/50 dark:ring-emerald-500/20'
          : 'border-slate-200 dark:border-slate-700/80'
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {taskStatusLabels[status]}
        </h2>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700">
            {tasks.length}
          </span>
          <button
            type="button"
            onClick={() => onCreateInStatus(status)}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-white hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            aria-label={`Add task to ${taskStatusLabels[status]}`}
            title={`Add task to ${taskStatusLabels[status]}`}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {tasks.length > 0 ? (
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <KanbanTaskCard key={task.id} task={task} onEdit={onEdit} />
            ))}
          </div>
        </SortableContext>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/70 px-4 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-500">
          {isOver ? (
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              Drop here
            </span>
          ) : (
            'No tasks here.'
          )}
        </div>
      )}
    </section>
  );
}
