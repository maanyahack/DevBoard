/**
 * SearchGroup — the categories of items that can appear in search results.
 * Each group corresponds to a different module in the app.
 */
export type SearchGroup = 'projects' | 'tasks' | 'notes' | 'bookmarks' | 'knowledge';

/**
 * SearchResult — a single search result item.
 * All items share the same shape regardless of which module they come from,
 * so the search UI can render them uniformly.
 */
export interface SearchResult {
  id: string;                 // UUID of the matched item
  type: SearchGroup;          // Which module it belongs to (for filtering/grouping)
  title: string;              // Main display text (project name, task title, etc.)
  subtitle: string;           // Secondary text (description preview, URL, etc.)
  href: string;               // URL to navigate to when clicked (e.g., '/projects')
  updatedAt: string | null;   // When it was last modified
}

/**
 * SearchResults — search results grouped by module.
 * The API returns all groups at once; the UI shows tabs/filters for each.
 */
export type SearchResults = Record<SearchGroup, SearchResult[]>;

/**
 * searchGroupLabels — maps search group codes to human-readable display labels.
 * Used in the search modal to show section headers.
 */
export const searchGroupLabels: Record<SearchGroup, string> = {
  projects: 'Projects',
  tasks: 'Tasks',
  notes: 'Notes',
  bookmarks: 'Bookmarks',
  knowledge: 'Knowledge Vault',
};
