// ─── useRecentSearches.ts ──────────────────────────────────────────────────────
// A custom React hook that persists the user's recent search history in localStorage.
// Used by GlobalSearchModal to show "Recent Searches" when the user opens Cmd+K.
//
// TypeScript concepts used:
//   - Generic type parameter in `useState<SearchResult[]>`
//   - `useCallback` with dependency array for stable function references
//   - `useMemo` to memoize the returned object (avoids re-renders in consumers)
//   - `try/catch` with type narrowing for safe JSON parsing
//   - Arrow function with implicit return in useState initializer

import { useCallback, useEffect, useMemo, useState } from 'react';  // React hooks
import type { SearchResult } from '@/features/search/types';         // Type-only import

// ─── Constants ────────────────────────────────────────────────────────────────
const storageKey = 'devnest:recent-searches';  // localStorage key — namespaced to avoid collisions
const maxRecent = 6;                            // Only keep the last 6 searches

// ─── Helper: Read from localStorage ───────────────────────────────────────────
// Parses the stored JSON safely. Returns an empty array on any error (corrupt data,
// missing key, private browsing mode that blocks localStorage).
function readRecentSearches(): SearchResult[] {
  try {
    const raw = window.localStorage.getItem(storageKey);  // Returns string | null
    if (!raw) return [];  // No stored data
    const parsed = JSON.parse(raw) as SearchResult[];     // `as SearchResult[]` — type assertion
    // Runtime check: ensure the parsed value is actually an array
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // JSON.parse threw (corrupt data) or localStorage threw (private browsing)
    return [];
  }
}

// ─── Custom Hook ──────────────────────────────────────────────────────────────
export function useRecentSearches() {
  // useState with a function initializer — readRecentSearches() runs only once (lazy init).
  // TypeScript infers the type as SearchResult[] from the function's return type.
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>(() => readRecentSearches());

  // useCallback memoizes `saveRecent` so it has a stable reference across renders.
  // Without it, every render creates a new function, which would trigger downstream effects.
  const saveRecent = useCallback((result: SearchResult) => {
    // Use the functional form of setState to safely reference the previous value.
    setRecentSearches((current) => {
      // Deduplicate: remove any existing entry with the same id+type
      // Then prepend the new result (most recent first)
      // Slice to maxRecent to cap the list size
      const next = [result, ...current.filter((item) => item.id !== result.id || item.type !== result.type)].slice(0, maxRecent);
      return next;
    });
  }, []);  // Empty deps: this function never changes

  // Sync to localStorage whenever recentSearches changes.
  // This is a side effect, so it goes in useEffect.
  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(recentSearches));
  }, [recentSearches]);  // Re-run only when the array changes

  // useMemo wraps the returned object so React doesn't think it changed on every render.
  // Without this, every consumer would re-render even if recentSearches didn't change.
  return useMemo(() => ({ recentSearches, saveRecent }), [recentSearches, saveRecent]);
}
