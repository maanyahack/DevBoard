import type { Task, TaskPriority, TaskStatus } from '@/features/tasks/types';

export type TaskView = 'list' | 'kanban' | 'calendar';
export type PriorityFilter = 'all' | TaskPriority;

export interface TaskFilters {
  search: string;
  projectId: string;
  priority: PriorityFilter;
}

export const taskStatusOrder: TaskStatus[] = ['todo', 'in_progress', 'done'];

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  const query = filters.search.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesSearch =
      !query ||
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query);
    const matchesProject = filters.projectId === 'all' || task.projectId === filters.projectId;
    const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;

    return matchesSearch && matchesProject && matchesPriority;
  });
}

export function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  return {
    todo: tasks.filter((task) => task.status === 'todo'),
    in_progress: tasks.filter((task) => task.status === 'in_progress'),
    done: tasks.filter((task) => task.status === 'done'),
  };
}

export function dueDateKey(value: string | null): string | null {
  if (!value) return null;
  return value.includes('T') ? value.slice(0, 10) : value;
}

export function formatCalendarKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
