import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export function CTASection() {
  return (
    <section id="cta" className="bg-[var(--surface-bg)] py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="card-highlight card-sheen relative overflow-hidden rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-card)] px-8 py-16 text-center shadow-[var(--shadow-overlay)] sm:px-16"
        >
          {/* Top gradient accent */}
          <span className="absolute inset-x-0 top-0 h-[2px] rounded-t-3xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/70 to-sky-500/40" />

          {/* Layered glow accents */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-72 w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-500/7" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,hsl(160_84%_39%/0.07),transparent)]" />
            <div className="absolute bottom-0 right-0 h-64 w-96 translate-x-1/4 translate-y-1/3 rounded-full bg-sky-400/8 blur-3xl dark:bg-sky-500/5" />
          </div>

          {/* Dot grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'radial-gradient(hsl(222 47% 11%) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative z-10">
            {/* Badge */}
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50 px-3.5 py-1.5 dark:border-emerald-500/25 dark:bg-emerald-500/10"
            >
              <span className="pulse-dot h-1.5 w-1.5" />
              <span className="font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                Free to get started
              </span>
            </motion.span>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
              Ready to clear the clutter?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--text-secondary)]">
              Create your free account and bring your notes, tasks, and snippets together today. No credit card required.
            </p>

            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link to="/signup">
                <Button size="lg" className="gap-2 px-8">
                  Get started free
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                  </svg>
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg" className="px-8">
                  Log in
                </Button>
              </Link>
            </div>

            <p className="mt-5 font-mono text-xs text-[var(--text-muted)]">
              Trusted by 2,400+ developers · SOC 2 compliant · GDPR ready
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
