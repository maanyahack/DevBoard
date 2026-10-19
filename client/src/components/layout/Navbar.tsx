// Import Moon and Sun icons from lucide-react — a popular icon library.
import { Moon, Sun } from 'lucide-react';
// Import the theme context hook to toggle light/dark mode.
import { useTheme } from '@/context/ThemeContext';
// Import the profile dropdown component (avatar menu in the top-right).
import { ProfileDropdown } from './ProfileDropdown';

// Props interface — the Navbar needs callback functions for menu and search actions.
interface NavbarProps {
  onMenuClick: () => void;    // Opens the mobile sidebar
  onSearchOpen: () => void;   // Opens the global search modal
}

/**
 * Navbar — the top navigation bar.
 * Contains: mobile menu toggle, search bar, theme toggle, notifications, profile dropdown.
 */
export function Navbar({ onMenuClick, onSearchOpen }: NavbarProps) {
  // Get the current theme and toggle function from context.
  const { theme, toggleTheme } = useTheme();

  return (
    // Sticky header — stays at the top when scrolling.
    // 'backdrop-blur-md' creates a frosted glass effect over content behind it.
    <header className="sticky top-0 z-20 border-b border-[var(--border-subtle)] bg-[var(--surface-overlay)] backdrop-blur-md">
      {/* Subtle gradient accent line under the header — decorative only. */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent dark:via-emerald-500/15" />

      <div className="flex h-14 items-center gap-3 px-4 sm:gap-4 sm:px-5">
        {/* Mobile hamburger menu button — only visible on small screens (hidden on lg+). */}
        <button
          onClick={onMenuClick}  // Calls the parent's handler to open the sidebar
          className="pressable rounded-lg border border-transparent p-1.5 text-slate-500 hover:border-[var(--border-subtle)] hover:bg-slate-100/80 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 lg:hidden dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          aria-label="Open sidebar"  // Accessibility label for screen readers
        >
          {/* Hamburger icon — three horizontal lines. */}
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Search bar — a button that looks like an input field.
            Hidden on very small screens (hidden sm:block). */}
        <button
          type="button"
          onClick={onSearchOpen}  // Opens the GlobalSearchModal
          className="relative hidden h-8 max-w-xs flex-1 rounded-md text-left transition-all duration-150 sm:block hover:scale-[1.01]"
          aria-label="Open global search"
        >
          {/* Search magnifying glass icon. */}
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          {/* The search field UI — shows placeholder text and ⌘K shortcut badge. */}
          <span className="flex h-8 w-full items-center justify-between rounded-md border border-[var(--border-subtle)] bg-[var(--surface-raised)] py-1.5 pl-8 pr-2.5 text-sm text-slate-400 shadow-[var(--shadow-card)] transition-all duration-150 hover:border-emerald-300/60 hover:bg-white hover:ring-2 hover:ring-emerald-200/50 dark:border-slate-700/70 dark:bg-slate-800/60 dark:hover:border-emerald-500/40 dark:hover:bg-slate-800 dark:hover:ring-emerald-500/15">
            <span className="text-[13px]">Search…</span>
            {/* Keyboard shortcut badge — shows ⌘K on Mac. */}
            <kbd className="hidden items-center gap-0.5 rounded border border-[var(--border-subtle)] bg-[var(--surface-card)] px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-400 shadow-sm sm:flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500">
              <span>⌘</span><span>K</span>
            </kbd>
          </span>
        </button>

        {/* Right-side controls — pushed to the right with 'ml-auto'. */}
        <div className="ml-auto flex items-center gap-0.5">
          {/* Theme toggle button — switches between light and dark mode. */}
          <button
            onClick={toggleTheme}
            className="pressable rounded-lg border border-transparent p-1.5 text-slate-500 hover:border-[var(--border-subtle)] hover:bg-slate-100/80 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {/* Show Sun icon in dark mode (click to go light), Moon in light mode (click to go dark). */}
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Notifications bell icon — with a yellow dot indicator. */}
          <button
            className="pressable relative rounded-lg border border-transparent p-1.5 text-slate-500 hover:border-[var(--border-subtle)] hover:bg-slate-100/80 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label="Notifications"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
            {/* Yellow notification dot — indicates unread notifications. */}
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 ring-2 ring-white dark:bg-amber-400 dark:ring-slate-900" />
          </button>

          {/* Profile dropdown — avatar + menu. */}
          <div className="ml-1">
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
