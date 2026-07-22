import { AnimatePresence, motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { navItems } from './navConfig';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/*
  Sidebar palette — slate-blue:
  Light: hsl(226 32% 18%)  — deep blue-slate panel
  Dark:  hsl(226 28% 12%)  — deeper, near-navy

  Nav item states are tuned for legibility on this dark surface.
  Active pill: translucent indigo/white tint.
  Hover: slightly lighter panel tint.
*/

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200/70 bg-[hsl(226_22%_95%)] shadow-[1px_0_0_0_hsl(220_13%_88%)] backdrop-blur-xl transition-transform duration-200 ease-out lg:translate-x-0 dark:border-white/[0.06] dark:bg-[hsl(226_24%_12%)] dark:shadow-[2px_0_20px_0_hsl(226_40%_4%/0.4)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200/70 px-4 dark:border-white/[0.07]">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-[15px] font-bold tracking-tight text-white shadow-[0_1px_8px_0_hsl(160_84%_39%/0.40)]">
            ◈
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-slate-800 dark:text-white/90">
            DevNest
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2 pt-3">
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-white/25">
            Menu
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors duration-150 ${
                  isActive
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-white/50 dark:hover:text-white/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active pill background */}
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active-bg"
                      className="absolute inset-0 rounded-lg border border-slate-300/60 bg-white shadow-sm dark:border-white/10 dark:bg-white/10 dark:shadow-none"
                      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                    />
                  )}
                  {/* Hover background (non-active) */}
                  <span className="absolute inset-0 rounded-lg bg-transparent transition-colors duration-150 group-hover:bg-slate-900/[0.04] dark:group-hover:bg-white/[0.05]" />
                  {/* Active left indicator */}
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active-bar"
                      className="absolute -left-0.5 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-emerald-500 dark:bg-emerald-400"
                      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                    />
                  )}
                  <span
                    className={`relative z-10 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors duration-150 ${
                      isActive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400 group-hover:text-slate-600 dark:text-white/40 dark:group-hover:text-white/65'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="relative z-10 truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-200/70 px-4 py-3 dark:border-white/[0.07]">
          <p className="font-mono text-[10px] text-slate-400 dark:text-white/25">
            DevNest v0.2 · Milestone 2
          </p>
        </div>
      </aside>
    </>
  );
}
