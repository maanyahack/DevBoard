/**
 * TaskStatus — a string literal union representing the three possible states of a task.
 * Tasks flow through: todo → in_progress → done
 */
export type TaskStatus = 'todo' | 'in_progress' | 'done';

/**
 * TaskPriority — a string literal union representing priority levels.
 */
export type TaskPriority = 'low' | 'medium' | 'high';

/**
 * Task — represents a task object as returned by the API.
 */
export interface Task {
  id: string;                      // UUID primary key
  title: string;                   // Task title
  description: string;             // Task description (may contain HTML)
  status: TaskStatus;              // Current status (todo, in_progress, done)
  priority: TaskPriority;          // Priority level (low, medium, high)
  dueDate: string | null;          // Optional ISO date string (null if no deadline)
  projectId: string | null;        // Optional link to a project (null if unlinked)
  sortOrder: number;               // Position for drag-and-drop reordering
  createdAt: string;               // ISO timestamp
  updatedAt: string;               // ISO timestamp
}

/**
 * TaskEditableFields — the fields users can create/update.
 * 'Pick' extracts all fields except id, createdAt, updatedAt (read-only from API).
 */
export type TaskEditableFields = Pick<
  Task,
  'title' | 'description' | 'status' | 'priority' | 'dueDate' | 'projectId' | 'sortOrder'
>;

/**
 * taskStatusLabels — maps status codes to human-readable display labels.
 * E.g., 'in_progress' → 'In Progress'
 * Used in UI components to show readable text instead of internal codes.
 */
export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
};

/**
 * taskPriorityLabels — maps priority codes to human-readable display labels.
 */
export const taskPriorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};
