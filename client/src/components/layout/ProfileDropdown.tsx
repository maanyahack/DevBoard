import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function ProfileDropdown() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking anywhere outside the dropdown.
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
    'block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
            {initials}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{displayName}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
          <div className="my-1 h-px bg-slate-100 dark:bg-slate-700" />
          <Link to="/profile" onClick={() => setOpen(false)} className={menuItemClass} role="menuitem">
            Profile
          </Link>
          <Link to="/settings" onClick={() => setOpen(false)} className={menuItemClass} role="menuitem">
            Settings
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
