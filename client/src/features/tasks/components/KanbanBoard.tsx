import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type Active,
  type Over,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarDays, GripVertical, Plus } from 'lucide-react';
import type { Task, TaskStatus } from '@/features/tasks/types';
import { taskStatusLabels, taskPriorityLabels } from '@/features/tasks/types';
import { groupTasksByStatus, taskStatusOrder, dueDateKey } from '@/features/tasks/utils';

// ── Shared priority styles ───────────────────────────────────────────────────

const priorityStyles = {
  low:    'bg-emerald-50 text-emerald-700 ring-emerald-500/15 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20',
  medium: 'bg-amber-50 text-amber-700 ring-amber-500/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25',
  high:   'bg-rose-50 text-rose-700 ring-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/25',
};

const priorityDots = {
  low:    'bg-emerald-500',
  medium: 'bg-amber-500',
  high:   'bg-rose-500',
};

// ── KanbanTaskCard ───────────────────────────────────────────────────────────

function KanbanTaskCard({ task, onEdit }: { task: Task; onEdit: (task: Task) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
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
      className={`floating-card stagger-item group flex items-start gap-1 rounded-xl border bg-[var(--surface-card)] p-3.5 text-left shadow-[var(--shadow-sm)] transition-colors duration-150 ${
        isDragging
          ? 'border-emerald-300 ring-2 ring-emerald-200/60 dark:border-emerald-500/50 dark:ring-emerald-500/20'
          : 'border-[var(--border-subtle)] hover:border-[var(--border-soft)] hover:shadow-[var(--shadow-card-hover)]'
      }`}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="mt-0.5 flex shrink-0 cursor-grab touch-none rounded p-0.5 text-slate-300 opacity-0 transition-all duration-150 hover:text-slate-500 active:cursor-grabbing group-hover:opacity-100 dark:text-slate-600 dark:hover:text-slate-400"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      {/* Body */}
      <button type="button" onClick={() => onEdit(task)} className="min-w-0 flex-1 text-left outline-none">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100">
            {task.title}
          </h3>
          <span className={`inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${priorityStyles[task.priority]}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${priorityDots[task.priority]}`} />
            {taskPriorityLabels[task.priority]}
          </span>
        </div>
        {task.description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
            {task.description}
          </p>
        )}
        {task.dueDate && (
          <p className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--text-muted)]">
            <CalendarDays className="h-3 w-3" />
            {dueDateKey(task.dueDate)}
          </p>
        )}
      </button>
    </div>
  );
}

// ── KanbanTaskCardOverlay (drag ghost) ───────────────────────────────────────

function KanbanTaskCardOverlay({ task }: { task: Task }) {
  return (
    <div className="w-72 rounded-lg border border-emerald-300 bg-white p-3 shadow-xl shadow-emerald-500/15 ring-2 ring-emerald-200/60 dark:border-emerald-500/50 dark:bg-slate-800 dark:shadow-emerald-500/10 dark:ring-emerald-500/20">
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          {task.title}
        </h3>
        <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${priorityStyles[task.priority]}`}>
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

// ── KanbanColumn ─────────────────────────────────────────────────────────────

const columnAccent: Record<TaskStatus, string> = {
  todo:        'border-slate-400/60 bg-slate-500 dark:border-slate-400/40 dark:bg-slate-400',
  in_progress: 'border-sky-400/60 bg-sky-500 dark:border-sky-400/40 dark:bg-sky-400',
  done:        'border-emerald-400/60 bg-emerald-500 dark:border-emerald-400/40 dark:bg-emerald-400',
};

const columnHoverBorder: Record<TaskStatus, string> = {
  todo:        'dark:hover:border-slate-600',
  in_progress: 'dark:hover:border-sky-600',
  done:        'dark:hover:border-emerald-600',
};

const columnOverRing: Record<TaskStatus, string> = {
  todo:        'border-slate-400 ring-2 ring-slate-200/70 dark:border-slate-500/50 dark:ring-slate-500/20',
  in_progress: 'border-sky-400 ring-2 ring-sky-200/70 dark:border-sky-500/50 dark:ring-sky-500/20',
  done:        'border-emerald-300 ring-2 ring-emerald-200/70 dark:border-emerald-500/50 dark:ring-emerald-500/20',
};

function KanbanColumn({
  status,
  tasks,
  onEdit,
  onCreateInStatus,
}: {
  status: TaskStatus;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onCreateInStatus: (status: TaskStatus) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status, data: { type: 'column', status } });

  return (
    <section
      ref={setNodeRef}
      className={`floating-card flex min-h-[22rem] flex-col rounded-xl border bg-[var(--surface-raised)] p-3.5 shadow-[var(--shadow-sm)] transition-all duration-150 ${
        isOver
          ? columnOverRing[status]
          : `border-[var(--border-subtle)] hover:border-[var(--border-soft)] ${columnHoverBorder[status]}`
      }`}
    >
      {/* Column header */}
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full border ${columnAccent[status]}`} />
          <h2 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
            {taskStatusLabels[status]}
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-[var(--surface-card)] px-2 py-0.5 text-xs font-semibold text-[var(--text-muted)] ring-1 ring-[var(--border-subtle)]">
            {tasks.length}
          </span>
          <button
            type="button"
            onClick={() => onCreateInStatus(status)}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-[var(--surface-card)] hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
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
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--surface-card)]/60 px-4 text-center text-sm text-[var(--text-muted)] transition-colors dark:bg-[var(--surface-card)]/40">
          {isOver ? (
            <span className="font-medium text-emerald-600 dark:text-emerald-400">Drop here</span>
          ) : (
            'No tasks here yet.'
          )}
        </div>
      )}
    </section>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function resolveColumn(id: string, tasks: Task[]): TaskStatus | null {
  if (taskStatusOrder.includes(id as TaskStatus)) return id as TaskStatus;
  const task = tasks.find((t) => t.id === id);
  return task?.status ?? null;
}

function computeReorder(
  tasks: Task[],
  activeId: string,
  overId: string,
): Array<{ id: string; status: TaskStatus; sortOrder: number }> {
  const activeTask = tasks.find((t) => t.id === activeId);
  const overTask = tasks.find((t) => t.id === overId);
  if (!activeTask) return [];

  const isOverColumn = taskStatusOrder.includes(overId as TaskStatus);
  const targetStatus = isOverColumn
    ? (overId as TaskStatus)
    : overTask
      ? overTask.status
      : activeTask.status;

  if (activeTask.status === targetStatus && activeId === overId) return [];

  const grouped = groupTasksByStatus(tasks);

  if (activeTask.status === targetStatus && overTask && activeId !== overId) {
    const col = [...grouped[targetStatus]];
    const oldIdx = col.findIndex((t) => t.id === activeId);
    const newIdx = col.findIndex((t) => t.id === overId);
    if (oldIdx === -1 || newIdx === -1) return [];
    const reordered = arrayMove(col, oldIdx, newIdx);
    return reordered.map((t, i) => ({ id: t.id, status: targetStatus, sortOrder: i }));
  }

  const sourceCol = [...(grouped[activeTask.status] ?? [])];
  const destCol = [...(grouped[targetStatus] ?? [])];
  const sourceIdx = sourceCol.findIndex((t) => t.id === activeId);
  if (sourceIdx !== -1) sourceCol.splice(sourceIdx, 1);

  const operations: Array<{ id: string; status: TaskStatus; sortOrder: number }> = [];
  sourceCol.forEach((t, i) => operations.push({ id: t.id, status: activeTask.status, sortOrder: i }));

  if (overTask && overTask.status === targetStatus) {
    const insertIdx = destCol.findIndex((t) => t.id === overId);
    if (insertIdx !== -1) destCol.splice(insertIdx, 0, activeTask);
    else destCol.push(activeTask);
  } else {
    destCol.push(activeTask);
  }

  destCol.forEach((t, i) => operations.push({ id: t.id, status: targetStatus, sortOrder: i }));
  return operations;
}

// ── KanbanBoard (default export) ─────────────────────────────────────────────

interface KanbanBoardProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onReorder: (operations: Array<{ id: string; status: TaskStatus; sortOrder: number }>) => void;
  onCreateTask: (status: TaskStatus) => void;
}

export default function KanbanBoard({ tasks, onEdit, onReorder, onCreateTask }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>(tasks);
  const isDraggingRef = useRef(false);
  const tasksRef = useRef(tasks);
  const onReorderRef = useRef(onReorder);

  tasksRef.current = tasks;
  onReorderRef.current = onReorder;

  useEffect(() => {
    if (!isDraggingRef.current) setOptimisticTasks(tasks);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = useCallback((event: { active: Active }) => {
    const task = tasksRef.current.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
    isDraggingRef.current = true;
  }, []);

  const handleDragEnd = useCallback((event: { active: Active; over: Over | null }) => {
    const { active, over } = event;
    isDraggingRef.current = false;
    setActiveTask(null);
    if (!over) return;

    const currentTasks = tasksRef.current;
    const operations = computeReorder(currentTasks, active.id as string, over.id as string);
    if (operations.length === 0) return;

    const ordered = [...currentTasks];
    for (const op of operations) {
      const idx = ordered.findIndex((t) => t.id === op.id);
      if (idx !== -1) ordered[idx] = { ...ordered[idx], status: op.status, sortOrder: op.sortOrder };
    }
    setOptimisticTasks(ordered);
    onReorderRef.current(operations);
  }, []);

  const handleDragCancel = useCallback(() => {
    isDraggingRef.current = false;
    setActiveTask(null);
  }, []);

  const groupedTasks = useMemo(() => groupTasksByStatus(optimisticTasks), [optimisticTasks]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="stagger-list mt-5 grid gap-4 xl:grid-cols-3">
        {taskStatusOrder.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={groupedTasks[status]}
            onEdit={onEdit}
            onCreateInStatus={onCreateTask}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? <KanbanTaskCardOverlay task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
