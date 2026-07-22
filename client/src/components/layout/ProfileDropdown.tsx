import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export function ProfileDropdown() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ?? user?.email ?? 'User';
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const initials = displayName.trim().slice(0, 2).toUpperCase();

  const menuItemClass =
    'block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition-colors duration-100 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-slate-700/50';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center rounded-full outline-none transition-opacity duration-150 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="h-8 w-8 rounded-full object-cover ring-1 ring-[var(--border-subtle)]"
          />
        ) : (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/60 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/20">
            {initials}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="dropdown"
            role="menu"
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-1.5 shadow-[var(--shadow-overlay)]"
          >
            {/* User identity */}
            <div className="px-3 py-2.5">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {displayName}
              </p>
              <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">{user?.email}</p>
            </div>
            <div className="my-1 h-px bg-[var(--border-subtle)]" />
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className={menuItemClass}
              role="menuitem"
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
            <div className="my-1 h-px bg-[var(--border-subtle)]" />
            <button
              onClick={() => {
                setOpen(false);
                void signOut();
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
