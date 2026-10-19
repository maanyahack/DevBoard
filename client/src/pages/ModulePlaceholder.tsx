import { motion } from 'framer-motion';

/**
 * Reusable placeholder for modules whose functionality lands in later
 * milestones. Keeps sidebar navigation fully working (active states, no dead
 * links) without implementing any feature logic yet.
 */
export default function ModulePlaceholder({ title }: { title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>

      <div className="mt-6 flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[var(--border-soft)] bg-[var(--surface-card)] py-16 text-center shadow-[var(--shadow-card)]">
        {/* Module icon */}
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 shadow-sm dark:bg-slate-800 dark:text-slate-500">
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Z" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </span>
        <div className="max-w-xs space-y-1.5">
          <p className="font-semibold text-slate-700 dark:text-slate-300">{title} is coming soon</p>
          <p className="text-sm text-[var(--text-muted)]">
            The navigation and layout are ready. This module arrives in a future milestone.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-3 py-1 font-mono text-[11px] text-[var(--text-muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          Coming in a future milestone
        </span>
      </div>
    </motion.div>
  );
}
