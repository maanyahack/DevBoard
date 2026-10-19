// Import React hooks for managing the dropdown state.
// useRef — creates a reference to a DOM element (used for click-outside detection).
import { useEffect, useRef, useState } from 'react';
// Import Link — React Router's client-side navigation link.
import { Link } from 'react-router-dom';
// Import animation components from Framer Motion.
import { AnimatePresence, motion } from 'framer-motion';
// Import auth hook to get the current user and signOut function.
import { useAuth } from '@/context/AuthContext';

/**
 * ProfileDropdown — the avatar menu in the top-right of the navbar.
 *
 * When clicked, it shows a dropdown with:
 * - User's name and email
 * - Links to Profile and Settings
 * - A "Log out" button
 */
export function ProfileDropdown() {
  const { user, signOut } = useAuth();

  // State: is the dropdown menu currently open?
  const [open, setOpen] = useState(false);

  // Ref — a reference to the dropdown container DOM element.
  // Used to detect clicks outside the dropdown (to close it).
  const ref = useRef<HTMLDivElement>(null);

  // Click-outside detection — close the dropdown when clicking anywhere else.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // 'ref.current' is the dropdown container element.
      // '.contains()' checks if the click target is inside the dropdown.
      // If the click is OUTSIDE, close the dropdown.
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    // Listen for clicks anywhere on the document.
    document.addEventListener('mousedown', handleClickOutside);
    // Cleanup: remove listener when component unmounts.
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get the user's display name from Supabase user metadata.
  // Falls back to email, then to 'User' if nothing is available.
  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ?? user?.email ?? 'User';

  // Get the avatar URL from user metadata (if the user uploaded a profile picture).
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  // Generate initials from the display name (first 2 characters, uppercase).
  const initials = displayName.trim().slice(0, 2).toUpperCase();

  // Reusable CSS class for dropdown menu items (links and buttons).
  const menuItemClass =
    'block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition-colors duration-100 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-slate-700/50';

  return (
    // Container — 'relative' positions the dropdown menu relative to this element.
    <div className="relative" ref={ref}>
      {/* Avatar button — clicking toggles the dropdown. */}
      <button
        onClick={() => setOpen((prev) => !prev)}  // Toggle open/close
        className="flex items-center rounded-full outline-none transition-opacity duration-150 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
        aria-haspopup="menu"     // Accessibility: tells screen readers this opens a menu
        aria-expanded={open}     // Accessibility: tells screen readers if the menu is open
      >
        {avatarUrl ? (
          // User has an avatar image — show it.
          <img
            src={avatarUrl}
            alt={displayName}
            className="h-8 w-8 rounded-full object-cover ring-1 ring-[var(--border-subtle)]"
          />
        ) : (
          // No avatar — show initials in a colored circle.
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/60 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/20">
            {initials}
          </span>
        )}
      </button>

      {/* Animated dropdown menu — appears/disappears with a smooth animation. */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="dropdown"
            role="menu"  // Accessibility: identifies this as a menu
            // Animation: starts small and invisible, grows to full size
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
            // Positioned below the avatar, aligned to the right.
            className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-1.5 shadow-[var(--shadow-overlay)]"
          >
            {/* User info section — name and email. */}
            <div className="px-3 py-2.5">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {displayName}
              </p>
              <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">{user?.email}</p>
            </div>

            {/* Divider line */}
            <div className="my-1 h-px bg-[var(--border-subtle)]" />

            {/* Menu items — links to profile and settings. */}
            <Link
              to="/profile"
              onClick={() => setOpen(false)}  // Close menu after clicking
              className={menuItemClass}
              role="menuitem"  // Accessibility: identifies this as a menu item
            >
              Profile
            </Link>
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className={menuItemClass}
              role="menuitem"
            >
              Settings
            </Link>

            {/* Divider line */}
            <div className="my-1 h-px bg-[var(--border-subtle)]" />

            {/* Logout button — styled in red to indicate a destructive action. */}
            <button
              onClick={() => {
                setOpen(false);      // Close the menu first
                void signOut();      // Then sign out. 'void' tells TypeScript we intentionally
                                     // don't await the promise (fire and forget).
              }}
              className={`${menuItemClass} text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10`}
              role="menuitem"
            >
              Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
