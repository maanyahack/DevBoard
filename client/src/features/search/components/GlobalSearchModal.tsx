// ─── GlobalSearchModal.tsx ─────────────────────────────────────────────────────
// A Cmd+K / Ctrl+K command palette that searches across all workspace entities
// (projects, tasks, notes, bookmarks, knowledge) with keyboard navigation.
//
// TypeScript concepts used:
//   - `interface` for component props
//   - Union types via `SearchGroup` (imported type alias)
//   - `useMemo` to derive flat results only when underlying data changes
//   - `useRef<HTMLInputElement>` for direct DOM access to focus the input
//   - Optional chaining + non-null assertion (`accessToken!`) when we know it's safe

import { useEffect, useMemo, useRef, useState } from 'react';  // React hooks
import { useQuery } from '@tanstack/react-query';               // Server-state management
import { Search, X } from 'lucide-react';                       // Icon components
import { useNavigate } from 'react-router-dom';                 // Programmatic navigation
import { searchWorkspace } from '@/features/search/searchApi';   // API call to search endpoint
import {
  searchGroupLabels,    // Human-readable labels: { projects: "Projects", tasks: "Tasks", ... }
  type SearchGroup,     // Union type: 'projects' | 'tasks' | 'notes' | 'bookmarks' | 'knowledge'
  type SearchResult,    // { type, id, title, subtitle, href } — one search hit
  type SearchResults,   // { projects: SearchResult[], tasks: SearchResult[], ... }
} from '@/features/search/types';
import { useRecentSearches } from '@/features/search/useRecentSearches';  // localStorage-backed recent searches

// ─── Props ────────────────────────────────────────────────────────────────────
interface GlobalSearchModalProps {
  isOpen: boolean;                          // Controls visibility — when false, returns null
  accessToken: string | undefined;          // JWT for API calls; undefined when logged out
  onClose: () => void;                     // Callback to close the modal
}

// ─── Constants ────────────────────────────────────────────────────────────────
const groups: SearchGroup[] = ['projects', 'tasks', 'notes', 'bookmarks', 'knowledge'];

// Empty state — used as default when no search has been performed yet.
// TypeScript infers this as { projects: never[], tasks: never[], ... }
const emptyResults: SearchResults = {
  projects: [],
  tasks: [],
  notes: [],
  bookmarks: [],
  knowledge: [],
};

// ─── Helper: Flatten ──────────────────────────────────────────────────────────
// Takes the grouped results and flattens them into a single array for keyboard navigation.
// `flatMap` maps each group to its items, then flattens into one level.
function flattenResults(results: SearchResults): SearchResult[] {
  return groups.flatMap((group) => results[group]);
}

// ─── GlobalSearchModal Component ──────────────────────────────────────────────
export default function GlobalSearchModal({ isOpen, accessToken, onClose }: GlobalSearchModalProps) {
  const navigate = useNavigate();               // Hook for programmatic route navigation
  const inputRef = useRef<HTMLInputElement>(null);  // Ref to focus the search input on open
  const [query, setQuery] = useState('');        // Current search text
  const [activeIndex, setActiveIndex] = useState(0);  // Keyboard-highlighted item index

  // Pull recent searches from localStorage + a function to save new ones
  const { recentSearches, saveRecent } = useRecentSearches();

  // ─── React Query: Server Search ───────────────────────────────────────────
  // Fires the API call only when:
  //   1. Modal is open
  //   2. User is authenticated (accessToken exists)
  //   3. Query is at least 2 characters
  const searchQuery = useQuery({
    queryKey: ['global-search', accessToken, query],  // Unique key for caching/deduplication
    enabled: isOpen && Boolean(accessToken) && query.trim().length >= 2,
    queryFn: () => searchWorkspace(accessToken!, query.trim()),  // `!` asserts accessToken is defined (safe because `enabled` guards it)
  });

  // ─── Derived State ────────────────────────────────────────────────────────
  const results = searchQuery.data ?? emptyResults;           // Fallback to empty if no data yet
  const flatResults = useMemo(() => flattenResults(results), [results]);  // Memoize: only recalculate when results change

  // Show recent searches only when the query is short (user hasn't typed enough)
  const visibleRecent = query.trim().length < 2 ? recentSearches : [];

  // For keyboard nav: use search results if available, otherwise fall back to recent searches
  const navigableItems = flatResults.length > 0 ? flatResults : visibleRecent;

  // ─── Effects ──────────────────────────────────────────────────────────────
  // When modal opens/closes: reset state and auto-focus the input
  useEffect(() => {
    if (!isOpen) return;         // Don't do anything when closing
    setQuery('');                // Clear previous search
    setActiveIndex(0);           // Reset keyboard selection
    // setTimeout gives the DOM a frame to render the input before focusing
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [isOpen]);  // Re-run whenever isOpen changes

  // Reset keyboard selection whenever the query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Don't render anything when closed (early return pattern)
  if (!isOpen) return null;

  // ─── Handlers ─────────────────────────────────────────────────────────────
  function openResult(result: SearchResult) {
    saveRecent(result);     // Save to localStorage for "Recent Searches"
    navigate(result.href);  // Navigate to the result's page (e.g. /tasks/abc123)
    onClose();              // Close the modal
  }

  // Keyboard navigation: Escape closes, Arrow keys move selection, Enter opens result
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      // Move selection down, but don't exceed the last item
      setActiveIndex((current) => Math.min(current + 1, Math.max(navigableItems.length - 1, 0)));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      // Move selection up, but don't go below 0
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    // Enter: open the currently highlighted result
    if (event.key === 'Enter' && navigableItems[activeIndex]) {
      event.preventDefault();
      openResult(navigableItems[activeIndex]);
    }
  }

  // Running counter for item index across all groups (used for keyboard highlighting)
  let itemIndex = -1;

  // ─── Render: Group Section ────────────────────────────────────────────────
  // Renders one group header + its results. Returns null if the group is empty.
  function renderGroup(title: string, items: SearchResult[]) {
    if (items.length === 0) return null;  // Skip empty groups

    return (
      <section className="mb-3 last:mb-0">
        {/* Group header — e.g. "Projects", "Tasks" */}
        <h2 className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {title}
        </h2>
        <div className="space-y-1">
          {items.map((result) => {
            itemIndex += 1;  // Increment global item counter
            const selected = itemIndex === activeIndex;  // Is this item highlighted?
            return (
              <button
                key={`${result.type}-${result.id}`}  // Composite key to avoid collisions
                type="button"
                onClick={() => openResult(result)}
                // Highlighted item gets green background; others get neutral hover
                className={`pressable w-full rounded-lg px-3 py-2 text-left ${
                  selected
                    ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-100'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <p className="line-clamp-1 text-sm font-semibold">{result.title}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {result.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  // ─── Render: Full Modal ───────────────────────────────────────────────────
  return (
    // Backdrop — clicking anywhere closes the modal
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className="fixed inset-0 z-50 bg-slate-950/50 p-4"  // Semi-transparent dark overlay
      role="dialog"                                         // Accessibility: tells screen readers this is a dialog
      aria-modal="true"                                     // Accessibility: traps focus inside
      onClick={onClose}                                     // Click backdrop → close
      onKeyDown={handleKeyDown}                             // Keyboard nav on the entire modal
    >
      {/* Dialog content — stops click propagation so clicking inside doesn't close it */}
      <div
        className="page-enter mx-auto mt-20 max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40"
        onClick={(event) => event.stopPropagation()}  // Prevent click from bubbling to backdrop
      >
        {/* Search input bar */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <Search className="h-4 w-4 text-slate-400" />  {/* Search icon */}
          <input
            ref={inputRef}               // Ref for auto-focus on open
            value={query}                // Controlled input — React owns the value
            onChange={(event) => setQuery(event.target.value)}  // Update state on every keystroke
            placeholder="Search projects, tasks, notes..."
            className="h-9 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
          />
          <button
            type="button"
            onClick={onClose}
            className="pressable rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />  {/* Close icon */}
          </button>
        </div>

        {/* Results area — scrollable, max height */}
        <div className="max-h-[28rem] overflow-y-auto p-3">
          {/* Show recent searches when query is too short for a server search */}
          {query.trim().length < 2 && (
            renderGroup('Recent Searches', visibleRecent)
          )}

          {/* Loading indicator while search is in flight */}
          {query.trim().length >= 2 && searchQuery.isLoading && (
            <p className="px-3 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
              Searching...
            </p>
          )}

          {/* No results found */}
          {query.trim().length >= 2 && !searchQuery.isLoading && flatResults.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
              No results found.
            </p>
          )}

          {/* Render each group (Projects, Tasks, Notes, Bookmarks, Knowledge) */}
          {query.trim().length >= 2 &&
            groups.map((group) => (
              <div key={group}>{renderGroup(searchGroupLabels[group], results[group])}</div>
            ))}
        </div>
      </div>
    </div>
  );
}
