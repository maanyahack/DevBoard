import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

const previewResults = [
  { label: 'Note',    title: 'Sprint planning notes',  tint: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/10' },
  { label: 'Task',    title: 'Fix auth redirect bug',  tint: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-500/10'         },
  { label: 'Snippet', title: 'useDebounce.ts',         tint: 'text-violet-700 bg-violet-50 dark:text-violet-300 dark:bg-violet-500/10'     },
];

function CommandPalettePreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-md"
    >
      {/* Subtle halo behind the card */}
      <div className="absolute -inset-4 rounded-3xl bg-emerald-400/10 blur-2xl dark:bg-emerald-500/8" />
      <div className="card-highlight relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-overlay)]">
        {/* Search row */}
        <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3">
          <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span className="flex-1 text-sm text-slate-400">Search everything…</span>
          <kbd className="rounded border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500">
            ⌘K
          </kbd>
        </div>
        {/* Results */}
        <ul className="p-2">
          {previewResults.map((r, i) => (
            <motion.li
              key={r.title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.35 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-100 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${r.tint}`}>
                {r.label}
              </span>
              <span className="text-slate-700 dark:text-slate-300">{r.title}</span>
            </motion.li>
          ))}
        </ul>
        {/* Cursor blink indicator */}
        <div className="border-t border-[var(--border-subtle)] px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-3.5 w-px animate-pulse bg-emerald-500" />
            <span className="text-[11px] text-[var(--text-muted)]">Type to search across all your workspace…</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function Hero() {
  return (
    <section className="premium-shell relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-1 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="font-mono text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              Built for developers
            </span>
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
            Every note, task, and snippet —{' '}
            <span className="text-emerald-600 dark:text-emerald-400">on one board.</span>
          </h1>
          <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-[var(--text-secondary)]">
            DevNest pulls the scattered pieces of your workflow — notes, tasks, projects,
            bookmarks, files, and code snippets — into one fast workspace.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup">
              <Button className="px-6 py-3 text-[15px]">Get started free</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" className="px-6 py-3 text-[15px]">
                Log in
              </Button>
            </Link>
          </div>
          <p className="mt-4 font-mono text-xs text-[var(--text-muted)]">No credit card required.</p>
        </motion.div>
        <CommandPalettePreview />
      </div>
    </section>
  );
}
