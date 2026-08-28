/**
 * ProjectStatus — the four lifecycle states of a project.
 * Projects typically flow: planning → active → completed → archived
 */
export type ProjectStatus = 'planning' | 'active' | 'completed' | 'archived';

/**
 * Project — represents a project object as returned by the API.
 */
export interface Project {
  id: string;                   // UUID primary key
  name: string;                 // Project name
  description: string;          // Project description (may contain HTML)
  status: ProjectStatus;        // Current lifecycle status
  githubUrl: string | null;     // Optional link to a GitHub repository
  sortOrder: number;            // Position for manual ordering
  createdAt: string;            // ISO timestamp
  updatedAt: string;            // ISO timestamp
}

/**
 * ProjectEditableFields — the fields users can create/update.
 * Excludes id, createdAt, updatedAt (read-only from API).
 */
export type ProjectEditableFields = Pick<
  Project,
  'name' | 'description' | 'status' | 'githubUrl' | 'sortOrder'
>;

/**
 * projectStatusLabels — maps status codes to human-readable display labels.
 */
export const projectStatusLabels: Record<ProjectStatus, string> = {
  planning: 'Planning',
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived',
};
