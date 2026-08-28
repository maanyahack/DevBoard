// Import types from other features — the dashboard aggregates data from all modules.
import type { ProjectStatus } from '@/features/projects/types';
import type { TaskPriority, TaskStatus } from '@/features/tasks/types';

/**
 * DashboardStats — the four summary counts shown as stat cards on the dashboard.
 */
export interface DashboardStats {
  projects: number;       // Total number of projects
  tasks: number;          // Total number of tasks
  completedTasks: number; // Tasks with status 'done'
  notes: number;          // Total number of notes
}

/**
 * ActivityType — string literal union of all possible activity event types.
 * Each type corresponds to a specific user action that was logged.
 */
export type ActivityType =
  | 'project_created'
  | 'task_created'
  | 'task_completed'
  | 'note_created'
  | 'bookmark_added'
  | 'knowledge_entry_created'
  | 'ai_summary_generated'
  | 'ai_tasks_generated';

/**
 * ActivityEvent — a single entry in the activity timeline.
 */
export interface ActivityEvent {
  id: string;                                              // UUID
  type: ActivityType;                                      // What kind of action occurred
  title: string;                                           // Human-readable description
  metadata: Record<string, string | number | boolean | null>;  // Extra data (e.g., { noteId: "..." })
  createdAt: string;                                       // ISO timestamp
}

/**
 * DashboardTask — simplified task shape for the dashboard's "Recent Tasks" panel.
 * Only includes the fields needed for display (not the full Task type).
 */
export interface DashboardTask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string | null;
  updatedAt: string;
}

/**
 * DashboardNote — simplified note shape for the "Recent Notes" panel.
 */
export interface DashboardNote {
  id: string;
  title: string;
  updatedAt: string;
}

/**
 * DashboardProject — simplified project shape for the "Active Projects" panel.
 */
export interface DashboardProject {
  id: string;
  name: string;
  status: ProjectStatus;
  githubUrl: string | null;
  updatedAt: string;
}

/**
 * DashboardData — the complete response shape from the GET /api/dashboard endpoint.
 * This is what the dashboard page receives and renders.
 */
export interface DashboardData {
  stats: DashboardStats;            // Summary counts
  recentTasks: DashboardTask[];     // 5 most recent tasks
  recentNotes: DashboardNote[];     // 5 most recent notes
  activeProjects: DashboardProject[]; // Up to 5 active projects
  activities: ActivityEvent[];      // Last 30 activity events
}
