import type { ProjectStatus } from '@/features/projects/types';
import type { TaskPriority, TaskStatus } from '@/features/tasks/types';

export interface DashboardStats {
  projects: number;
  tasks: number;
  completedTasks: number;
  notes: number;
}

export interface DashboardTask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
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
}
