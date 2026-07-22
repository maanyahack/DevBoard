import { apiRequest } from '@/lib/api';
import type { SearchResults } from '@/features/search/types';

export function searchWorkspace(accessToken: string, query: string): Promise<SearchResults> {
  return apiRequest<SearchResults>(`/api/search?q=${encodeURIComponent(query)}`, accessToken);
}
