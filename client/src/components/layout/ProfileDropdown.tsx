import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
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
    'block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 transition-colors duration-150 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center rounded-full outline-none transition-opacity duration-150 hover:opacity-85 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-600"
          />
        ) : (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/60 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/20">
            {initials}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-200/70 dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/30"
        >
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
              {displayName}
            </p>
            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
              {user?.email}
            </p>
          </div>
          <div className="my-1 h-px bg-slate-100 dark:bg-slate-700" />
          <Link to="/profile" onClick={() => setOpen(false)} className={menuItemClass} role="menuitem">
            Profile
          </Link>
          <div className="my-1 h-px bg-slate-100 dark:bg-slate-700" />
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
        </div>
      )}
    </div>
  );
}
