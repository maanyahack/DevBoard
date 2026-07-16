import { NavLink } from 'react-router-dom';
import { navItems } from './navConfig';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-out lg:translate-x-0 dark:border-slate-700/80 dark:bg-slate-900 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 px-5 dark:border-slate-700/80">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-[15px] font-bold tracking-tight text-white shadow-sm shadow-emerald-500/30">
            ◈
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            DevNest
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 pt-2">
          <p className="mb-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Menu
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`inline-flex shrink-0 items-center justify-center transition-colors duration-150 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
