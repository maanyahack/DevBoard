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
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-md"
    >
      {/* Multi-layer halo */}
      <div className="absolute -inset-6 rounded-[2.5rem] bg-emerald-400/8 blur-3xl dark:bg-emerald-500/6" />
      <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-emerald-400/10 via-sky-400/6 to-violet-400/8 blur-xl dark:from-emerald-500/8" />

      <div className="card-highlight card-sheen relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-overlay)]">
        {/* Top accent bar */}
        <span className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/60 to-emerald-500/0" />

        {/* Search row */}
        <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3.5">
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
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.32, delay: 0.38 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-100 ${i === 0 ? 'bg-emerald-50/60 dark:bg-emerald-500/8' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}
            >
              <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${r.tint}`}>
                {r.label}
              </span>
              <span className="text-slate-700 dark:text-slate-300">{r.title}</span>
              {i === 0 && (
                <span className="ml-auto rounded border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-1 py-px font-mono text-[9px] text-slate-400">↵</span>
              )}
            </motion.li>
          ))}
        </ul>

        {/* Footer */}
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
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Badge */}
          <motion.span
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.05, ease: [0.34, 1.56, 0.64, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3.5 py-1.5 shadow-sm"
          >
            <span className="pulse-dot h-1.5 w-1.5" />
            <span className="font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              Built for developers
            </span>
          </motion.span>

          <h1 className="mt-5 text-[2.75rem] font-bold leading-[1.1] tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl lg:text-[3.25rem]">
            Every note, task,{' '}
            <br className="hidden sm:block" />
            and snippet —{' '}
            <span className="text-gradient-accent">on one board.</span>
          </h1>

          <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-[var(--text-secondary)]">
            DevBoard pulls the scattered pieces of your workflow — notes, tasks, projects,
            bookmarks, files, and code snippets — into one fast workspace.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/signup">
              <Button size="lg" className="gap-2 px-7">
                Get started free
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                </svg>
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" className="px-7">
                Log in
              </Button>
            </Link>
          </div>

          <p className="mt-4 font-mono text-xs text-[var(--text-muted)]">
            No credit card required · Free forever on the Starter plan
          </p>

          {/* Social proof row */}
          <div className="mt-7 flex items-center gap-3">
            <div className="flex -space-x-2">
              {['🧑‍💻', '👩‍💻', '🧑‍🎨', '👨‍💻'].map((emoji, i) => (
                <span
                  key={i}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--surface-bg)] bg-[var(--surface-card)] text-sm ring-1 ring-[var(--border-subtle)]"
                >
                  {emoji}
                </span>
              ))}
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              <span className="font-semibold text-slate-700 dark:text-slate-300">2,400+</span> developers already on board
            </p>
          </div>
        </motion.div>

        <CommandPalettePreview />
      </div>
    </section>
  );
}
