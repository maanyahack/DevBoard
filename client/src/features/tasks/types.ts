export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  projectId: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type TaskEditableFields = Pick<
  Task,
  'title' | 'description' | 'status' | 'priority' | 'dueDate' | 'projectId' | 'sortOrder'
>;

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};
