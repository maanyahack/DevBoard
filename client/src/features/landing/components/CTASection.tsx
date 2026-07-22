import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export function CTASection() {
  return (
    <section id="cta" className="bg-[var(--surface-bg)] py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="card-highlight relative overflow-hidden rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-card)] px-8 py-14 text-center shadow-[var(--shadow-overlay)] sm:px-16"
        >
          {/* Subtle glow accents */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-500/8" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(160_84%_39%/0.06),transparent)]" />
          </div>

          {/* Grid texture overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'linear-gradient(hsl(222 47% 11%) 1px, transparent 1px), linear-gradient(90deg, hsl(222 47% 11%) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          <div className="relative z-10">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1 dark:border-emerald-500/25 dark:bg-emerald-500/10">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                Free to get started
              </span>
            </span>

            <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Ready to clear the clutter?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[var(--text-secondary)]">
              Create your free account and bring your notes, tasks, and snippets together today.
            </p>
            <div className="mt-8 flex justify-center">
              <Link to="/signup">
                <Button className="px-6 py-3 text-[15px]">Get started free</Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
