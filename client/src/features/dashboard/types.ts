import type { ProjectStatus } from '@/features/projects/types';
import type { TaskPriority, TaskStatus } from '@/features/tasks/types';

export interface DashboardStats {
  projects: number;
  tasks: number;
  completedTasks: number;
  notes: number;
}

export type ActivityType =
  | 'project_created'
  | 'task_created'
  | 'task_completed'
  | 'note_created'
  | 'bookmark_added'
  | 'knowledge_entry_created'
  | 'ai_summary_generated'
  | 'ai_tasks_generated';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  title: string;
  metadata: Record<string, string | number | boolean | null>;
  createdAt: string;
}

export interface DashboardTask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string | null;
  updatedAt: string;
}

export interface DashboardNote {
  id: string;
  title: string;
  updatedAt: string;
}

export interface DashboardProject {
  id: string;
  name: string;
  status: ProjectStatus;
  githubUrl: string | null;
  updatedAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentTasks: DashboardTask[];
  recentNotes: DashboardNote[];
  activeProjects: DashboardProject[];
  activities: ActivityEvent[];
}
