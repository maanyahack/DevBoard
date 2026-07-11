export type ProjectStatus = 'planning' | 'active' | 'completed' | 'archived';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  githubUrl: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectEditableFields = Pick<
  Project,
  'name' | 'description' | 'status' | 'githubUrl' | 'sortOrder'
>;

export const projectStatusLabels: Record<ProjectStatus, string> = {
  planning: 'Planning',
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived',
};
