import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { ProfileDropdown } from './ProfileDropdown';

interface NavbarProps {
  onMenuClick: () => void;
  onSearchOpen: () => void;
}

export function Navbar({ onMenuClick, onSearchOpen }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border-subtle)] bg-[var(--surface-overlay)] backdrop-blur-md">
      {/* Hairline bottom separator with color */}
      <div className="flex h-14 items-center gap-3 px-4 sm:gap-4 sm:px-5">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuClick}
          className="pressable rounded-lg border border-transparent p-1.5 text-slate-500 hover:border-[var(--border-subtle)] hover:bg-slate-100/80 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 lg:hidden dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          aria-label="Open sidebar"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Search bar */}
        <button
          type="button"
          onClick={onSearchOpen}
          className="relative hidden h-8 max-w-xs flex-1 rounded-md text-left transition-all duration-150 sm:block hover:scale-[1.01]"
          aria-label="Open global search"
        >
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span className="flex h-8 w-full items-center justify-between rounded-md border border-[var(--border-subtle)] bg-[var(--surface-raised)] py-1.5 pl-8 pr-2.5 text-sm text-slate-400 shadow-[var(--shadow-card)] transition-all duration-150 hover:border-emerald-300/60 hover:bg-white hover:ring-2 hover:ring-emerald-200/50 dark:border-slate-700/70 dark:bg-slate-800/60 dark:hover:border-emerald-500/40 dark:hover:bg-slate-800 dark:hover:ring-emerald-500/15">
            <span className="text-[13px]">Search…</span>
            <kbd className="hidden items-center gap-0.5 rounded border border-[var(--border-subtle)] bg-[var(--surface-card)] px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-400 shadow-sm sm:flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500">
              <span>⌘</span><span>K</span>
            </kbd>
          </span>
        </button>

        {/* Right controls */}
        <div className="ml-auto flex items-center gap-0.5">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="pressable rounded-lg border border-transparent p-1.5 text-slate-500 hover:border-[var(--border-subtle)] hover:bg-slate-100/80 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Notifications (UI placeholder) */}
          <button
            className="pressable relative rounded-lg border border-transparent p-1.5 text-slate-500 hover:border-[var(--border-subtle)] hover:bg-slate-100/80 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label="Notifications"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 ring-2 ring-white dark:bg-amber-400 dark:ring-slate-900" />
          </button>

          <div className="ml-1">
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
