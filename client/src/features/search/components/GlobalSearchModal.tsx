import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchWorkspace } from '@/features/search/searchApi';
import {
  searchGroupLabels,
  type SearchGroup,
  type SearchResult,
  type SearchResults,
} from '@/features/search/types';
import { useRecentSearches } from '@/features/search/useRecentSearches';

interface GlobalSearchModalProps {
  isOpen: boolean;
  accessToken: string | undefined;
  onClose: () => void;
}

const groups: SearchGroup[] = ['projects', 'tasks', 'notes', 'bookmarks', 'knowledge'];
const emptyResults: SearchResults = {
  projects: [],
  tasks: [],
  notes: [],
  bookmarks: [],
  knowledge: [],
};

function flattenResults(results: SearchResults): SearchResult[] {
  return groups.flatMap((group) => results[group]);
}

export default function GlobalSearchModal({ isOpen, accessToken, onClose }: GlobalSearchModalProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const { recentSearches, saveRecent } = useRecentSearches();

  const searchQuery = useQuery({
    queryKey: ['global-search', accessToken, query],
    enabled: isOpen && Boolean(accessToken) && query.trim().length >= 2,
    queryFn: () => searchWorkspace(accessToken!, query.trim()),
  });

  const results = searchQuery.data ?? emptyResults;
  const flatResults = useMemo(() => flattenResults(results), [results]);
  const visibleRecent = query.trim().length < 2 ? recentSearches : [];
  const navigableItems = flatResults.length > 0 ? flatResults : visibleRecent;

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setActiveIndex(0);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!isOpen) return null;

  function openResult(result: SearchResult) {
    saveRecent(result);
    navigate(result.href);
    onClose();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, Math.max(navigableItems.length - 1, 0)));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === 'Enter' && navigableItems[activeIndex]) {
      event.preventDefault();
      openResult(navigableItems[activeIndex]);
    }
  }

  let itemIndex = -1;

  function renderGroup(title: string, items: SearchResult[]) {
    if (items.length === 0) return null;

    return (
      <section className="mb-3 last:mb-0">
        <h2 className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {title}
        </h2>
        <div className="space-y-1">
          {items.map((result) => {
            itemIndex += 1;
            const selected = itemIndex === activeIndex;
            return (
              <button
                key={`${result.type}-${result.id}`}
                type="button"
                onClick={() => openResult(result)}
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

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className="fixed inset-0 z-50 bg-slate-950/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      {/* Stop propagation so clicks on the dialog content don't bubble up to the backdrop's onClick={onClose} */}
      <div
        className="page-enter mx-auto mt-20 max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects, tasks, notes..."
            className="h-9 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
          />
          <button
            type="button"
            onClick={onClose}
            className="pressable rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[28rem] overflow-y-auto p-3">
          {query.trim().length < 2 && (
            renderGroup('Recent Searches', visibleRecent)
          )}

          {query.trim().length >= 2 && searchQuery.isLoading && (
            <p className="px-3 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
              Searching...
            </p>
          )}

          {query.trim().length >= 2 && !searchQuery.isLoading && flatResults.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
              No results found.
            </p>
          )}

          {query.trim().length >= 2 &&
            groups.map((group) => (
              <div key={group}>{renderGroup(searchGroupLabels[group], results[group])}</div>
            ))}
        </div>
      </div>
    </div>
  );
}
