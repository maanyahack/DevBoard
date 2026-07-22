import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SearchResult } from '@/features/search/types';

const storageKey = 'devnest:recent-searches';
const maxRecent = 6;

function readRecentSearches(): SearchResult[] {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SearchResult[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>(() => readRecentSearches());

  const saveRecent = useCallback((result: SearchResult) => {
    setRecentSearches((current) => {
      const next = [result, ...current.filter((item) => item.id !== result.id || item.type !== result.type)].slice(0, maxRecent);
      return next;
    });
  }, []);

  // Persist to localStorage whenever recentSearches changes.
  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(recentSearches));
  }, [recentSearches]);

  return useMemo(() => ({ recentSearches, saveRecent }), [recentSearches, saveRecent]);
}
