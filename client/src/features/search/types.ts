export type SearchGroup = 'projects' | 'tasks' | 'notes' | 'bookmarks' | 'knowledge';

export interface SearchResult {
  id: string;
  type: SearchGroup;
  title: string;
  subtitle: string;
  href: string;
  updatedAt: string | null;
}

export type SearchResults = Record<SearchGroup, SearchResult[]>;

export const searchGroupLabels: Record<SearchGroup, string> = {
  projects: 'Projects',
  tasks: 'Tasks',
  notes: 'Notes',
  bookmarks: 'Bookmarks',
  knowledge: 'Knowledge Vault',
};
