import { useMemo, useRef, useState } from 'react';
import type { Task, TaskStatus } from '@/features/tasks/types';
import { KanbanColumn } from '@/features/tasks/components/KanbanColumn';
import { groupTasksByStatus, taskStatusOrder } from '@/features/tasks/utils';

interface KanbanBoardProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

export default function KanbanBoard({ tasks, onEdit, onStatusChange }: KanbanBoardProps) {
  const groupedTasks = useMemo(() => groupTasksByStatus(tasks), [tasks]);
  // Use a ref for draggedTaskId so event handlers always read the latest value
  // without stale-closure issues (the drop event can fire before React re-renders
  // after the dragstart state update).
  const draggedTaskIdRef = useRef<string | null>(null);
  const [draggingOverStatus, setDraggingOverStatus] = useState<TaskStatus | null>(null);

  function handleDragStart(taskId: string) {
    draggedTaskIdRef.current = taskId;
  }

  function handleDragEnd() {
    draggedTaskIdRef.current = null;
    setDraggingOverStatus(null);
  }

  function handleDrop(status: TaskStatus) {
    const task = tasks.find((item) => item.id === draggedTaskIdRef.current);
    draggedTaskIdRef.current = null;
    setDraggingOverStatus(null);

    if (!task || task.status === status) return;
    onStatusChange(task, status);
  }

  return (
    <div className="stagger-list mt-5 grid gap-4 xl:grid-cols-3">
      {taskStatusOrder.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={groupedTasks[status]}
          draggingOver={draggingOverStatus === status}
          onEdit={onEdit}
          onDragStart={handleDragStart}
          onDropTask={handleDrop}
          onDragOverStatus={setDraggingOverStatus}
          onDragEnd={handleDragEnd}
        />
      ))}
    </div>
  );
}
