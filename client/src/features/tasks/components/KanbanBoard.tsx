import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Active,
  type Over,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import type { Task, TaskStatus } from '@/features/tasks/types';
import { groupTasksByStatus, taskStatusOrder } from '@/features/tasks/utils';
import { KanbanColumn } from '@/features/tasks/components/KanbanColumn';
import { KanbanTaskCardOverlay } from '@/features/tasks/components/KanbanTaskCardOverlay';

interface KanbanBoardProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onReorder: (
    operations: Array<{ id: string; status: TaskStatus; sortOrder: number }>,
  ) => void;
  onCreateTask: (status: TaskStatus) => void;
}

/**
 * Find the column (status) that the given droppable id belongs to.
 * The id can be a column id (status string) or a task id.
 */
function resolveColumn(
  id: string,
  tasks: Task[],
): TaskStatus | null {
  if (taskStatusOrder.includes(id as TaskStatus)) return id as TaskStatus;
  const task = tasks.find((t) => t.id === id);
  return task?.status ?? null;
}

/**
 * Rebuild a flat task array into a re-ordered version after a drag operation.
 * Returns the new sort orders for every affected task.
 */
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

  // Nothing changed
  if (activeTask.status === targetStatus && activeId === overId) return [];

  // Group all tasks by status
  const grouped = groupTasksByStatus(tasks);

  if (activeTask.status === targetStatus && overTask && activeId !== overId) {
    // Same-column reorder
    const col = [...grouped[targetStatus]];
    const oldIdx = col.findIndex((t) => t.id === activeId);
    const newIdx = col.findIndex((t) => t.id === overId);
    if (oldIdx === -1 || newIdx === -1) return [];

    const reordered = arrayMove(col, oldIdx, newIdx);
    return reordered.map((t, i) => ({
      id: t.id,
      status: targetStatus,
      sortOrder: i,
    }));
  }

  // Cross-column move
  const sourceCol = [...(grouped[activeTask.status] ?? [])];
  const destCol = [...(grouped[targetStatus] ?? [])];

  const sourceIdx = sourceCol.findIndex((t) => t.id === activeId);
  if (sourceIdx !== -1) sourceCol.splice(sourceIdx, 1);

  const operations: Array<{ id: string; status: TaskStatus; sortOrder: number }> = [];

  // Source column gets re-indexed
  sourceCol.forEach((t, i) => {
    operations.push({ id: t.id, status: activeTask.status, sortOrder: i });
  });

  // Insert into destination
  if (overTask && overTask.status === targetStatus) {
    const insertIdx = destCol.findIndex((t) => t.id === overId);
    if (insertIdx !== -1) {
      destCol.splice(insertIdx, 0, activeTask);
    } else {
      destCol.push(activeTask);
    }
  } else {
    destCol.push(activeTask);
  }

  destCol.forEach((t, i) => {
    operations.push({ id: t.id, status: targetStatus, sortOrder: i });
  });

  return operations;
}

export default function KanbanBoard({
  tasks,
  onEdit,
  onReorder,
  onCreateTask,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>(tasks);
  const isDraggingRef = useRef(false);
  const tasksRef = useRef(tasks);
  const onReorderRef = useRef(onReorder);

  // Keep refs in sync
  tasksRef.current = tasks;
  onReorderRef.current = onReorder;

  // Keep optimistic state in sync with prop changes when not dragging
  useEffect(() => {
    if (!isDraggingRef.current) {
      setOptimisticTasks(tasks);
    }
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback(
    (event: { active: Active }) => {
      const task = tasksRef.current.find((t) => t.id === event.active.id);
      setActiveTask(task ?? null);
      isDraggingRef.current = true;
    },
    [],
  );

  const handleDragEnd = useCallback(
    (event: { active: Active; over: Over | null }) => {
      const { active, over } = event;
      isDraggingRef.current = false;
      setActiveTask(null);

      if (!over) return;

      const currentTasks = tasksRef.current;
      const operations = computeReorder(currentTasks, active.id as string, over.id as string);
      if (operations.length === 0) return;

      // Optimistically apply the reorder locally
      const ordered = [...currentTasks];
      for (const op of operations) {
        const idx = ordered.findIndex((t) => t.id === op.id);
        if (idx !== -1) {
          ordered[idx] = { ...ordered[idx], status: op.status, sortOrder: op.sortOrder };
        }
      }
      setOptimisticTasks(ordered);

      // Sync to server
      onReorderRef.current(operations);
    },
    [],
  );

  const handleDragCancel = useCallback(() => {
    isDraggingRef.current = false;
    setActiveTask(null);
  }, []);

  const groupedTasks = useMemo(
    () => groupTasksByStatus(optimisticTasks),
    [optimisticTasks],
  );

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
