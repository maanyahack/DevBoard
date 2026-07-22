import type { Task, TaskStatus } from '@/features/tasks/types';
import { taskStatusLabels } from '@/features/tasks/types';
import { KanbanTaskCard } from '@/features/tasks/components/KanbanTaskCard';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  draggingOver: boolean;
  onEdit: (task: Task) => void;
  onDragStart: (taskId: string) => void;
  onDropTask: (status: TaskStatus) => void;
  onDragOverStatus: (status: TaskStatus) => void;
  onDragEnd: () => void;
}

export function KanbanColumn({
  status,
  tasks,
  draggingOver,
  onEdit,
  onDragStart,
  onDropTask,
  onDragOverStatus,
  onDragEnd,
}: KanbanColumnProps) {
  return (
    <section
      onDragOver={(event) => {
        event.preventDefault();
        onDragOverStatus(status);
      }}
      onDrop={() => onDropTask(status)}
      className={`floating-card min-h-[22rem] rounded-xl border bg-slate-50/70 p-3 shadow-sm shadow-slate-200/40 dark:bg-slate-900/30 dark:shadow-black/10 ${
        draggingOver
          ? 'border-emerald-300 ring-2 ring-emerald-200/70 dark:border-emerald-500/50 dark:ring-emerald-500/20'
          : 'border-slate-200 dark:border-slate-700/80'
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {taskStatusLabels[status]}
        </h2>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700">
          {tasks.length}
        </span>
      </div>
      {tasks.length > 0 ? (
        <div className="stagger-list space-y-3">
          {tasks.map((task) => (
            <KanbanTaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/70 px-4 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-500">
          No tasks here.
        </div>
      )}
    </section>
  );
}
