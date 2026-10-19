// Import AnimatePresence and motion from Framer Motion — a React animation library.
// AnimatePresence enables exit animations (fading out when a component unmounts).
// motion provides animated versions of HTML elements.
import { AnimatePresence, motion } from 'framer-motion';
// Import NavLink — React Router's link component that knows if the current URL matches.
import { NavLink } from 'react-router-dom';
// Import the navigation items configuration (labels, URLs, icons).
import { navItems } from './navConfig';

// TypeScript interface — defines the props the Sidebar component accepts.
interface SidebarProps {
  isOpen: boolean;      // Whether the sidebar is visible (mobile: slides in/out)
  onClose: () => void;  // Function to call when the user wants to close the sidebar
}

/**
 * Sidebar — the left navigation panel.
 *
 * On desktop (lg+): always visible, fixed to the left.
 * On mobile: slides in/out as an overlay with a backdrop.
 */
export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop — a semi-transparent overlay behind the sidebar.
          Clicking it closes the sidebar. Only shown on mobile when isOpen=true. */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            // Animation states:
            initial={{ opacity: 0 }}      // Start invisible
            animate={{ opacity: 1 }}       // Fade in to visible
            exit={{ opacity: 0 }}          // Fade out when unmounting
            transition={{ duration: 0.18 }} // Animation speed (180ms)
            // Fixed full-screen overlay with blur effect.
            // 'lg:hidden' — only visible on screens smaller than lg breakpoint.
            className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
            onClick={onClose}  // Click backdrop to close sidebar
            aria-hidden="true" // Decorative element — screen readers ignore it
          />
        )}
      </AnimatePresence>

      {/* The sidebar panel itself — fixed to the left side of the screen.
          'z-40' puts it above the backdrop (z-30).
          On desktop: always visible (lg:translate-x-0).
          On mobile: slides in/out based on 'isOpen' state. */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200/70 bg-[hsl(226_22%_96%)] shadow-[1px_0_0_0_hsl(220_13%_89%)] backdrop-blur-xl transition-transform duration-200 ease-out lg:translate-x-0 dark:border-white/[0.055] dark:bg-[hsl(226_26%_10%)] dark:shadow-[2px_0_28px_0_hsl(226_40%_4%/0.5)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'  // Slide in/out on mobile
        }`}
      >
        {/* Brand section at the top — shows the DevBoard logo and name. */}
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200/70 px-4 dark:border-white/[0.06]">
          {/* Green gradient icon with the DevBoard symbol. */}
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-[15px] font-bold tracking-tight text-white shadow-[0_1px_10px_0_hsl(160_84%_39%/0.45)]">
            ◈
          </span>
          <span className="text-[15px] font-bold tracking-tight text-slate-800 dark:text-white/90">
            DevBoard
          </span>
        </div>

        {/* Navigation links section — scrollable if content overflows. */}
        <nav className="flex-1 overflow-y-auto p-2 pt-3">
          {/* Section header — "Workspace" */}
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-white/25">
            Workspace
          </p>

          {/* Render each navigation item as a NavLink.
              NavLink automatically adds an 'isActive' class when the current
              URL matches the link's 'to' prop. */}
          {navItems.map((item) => (
            <NavLink
              key={item.to}           // React key for efficient list rendering
              to={item.to}            // The URL to navigate to
              onClick={onClose}       // Close sidebar on mobile after clicking
              // 'end' prop for dashboard: only match exactly '/dashboard', not '/dashboard/anything'
              end={item.to === '/dashboard'}
              // 'className' as a function — receives { isActive } and returns CSS classes
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors duration-150 ${
                  isActive
                    ? 'text-slate-900 dark:text-white'           // Active: bold dark text
                    : 'text-slate-500 hover:text-slate-800 dark:text-white/50 dark:hover:text-white/80'
                }`
              }
            >
              {/* Render props pattern — NavLink passes { isActive } to children.
                  This allows conditional rendering based on active state. */}
              {({ isActive }) => (
                <>
                  {/* Active pill background — animated sliding background for the active link. */}
                  {isActive && (
                    <motion.span
                      // 'layoutId' — Framer Motion creates a shared layout animation.
                      // When you navigate between pages, this background smoothly
                      // slides from one link to the next instead of jumping.
                      layoutId="sidebar-active-bg"
                      className="absolute inset-0 rounded-lg border border-slate-300/60 bg-white shadow-[var(--shadow-sm)] dark:border-white/10 dark:bg-white/10 dark:shadow-none"
                      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                    />
                  )}

                  {/* Hover background — subtle highlight on mouse hover (non-active links only). */}
                  <span className="absolute inset-0 rounded-lg bg-transparent transition-colors duration-150 group-hover:bg-slate-900/[0.04] dark:group-hover:bg-white/[0.05]" />

                  {/* Active left indicator — the green bar on the left side of the active link. */}
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active-bar"
                      className="absolute -left-0.5 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 dark:from-emerald-300 dark:to-emerald-500"
                      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                    />
                  )}

                  {/* Icon container — colored based on active state. */}
                  <span
                    className={`relative z-10 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors duration-150 ${
                      isActive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400 group-hover:text-slate-600 dark:text-white/40 dark:group-hover:text-white/65'
                    }`}
                  >
                    {item.icon}
                  </span>

                  {/* Link label text — truncated if too long. */}
                  <span className="relative z-10 truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer section — version info and status indicator. */}
        <div className="shrink-0 border-t border-slate-200/70 px-4 py-3.5 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            {/* Green dot with glow ring — indicates the system is operational. */}
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/25 dark:bg-emerald-400 dark:ring-emerald-400/25" />
            <p className="font-mono text-[10px] text-slate-400 dark:text-white/25">
              DevBoard v0.2 · All systems operational
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
