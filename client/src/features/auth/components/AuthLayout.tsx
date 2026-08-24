import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Shared centered card shell for every auth screen. */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <main className="premium-shell relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-[-10%] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px] dark:bg-emerald-500/6" />
        <div className="absolute right-0 bottom-0 h-[500px] w-[500px] translate-x-1/3 rounded-full bg-violet-500/8 blur-[100px] dark:bg-violet-500/5" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-base font-bold text-white shadow-[0_2px_16px_0_hsl(160_84%_39%/0.40)]">
            ◈
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">DevBoard</span>
        </Link>

        {/* Card */}
        <div className="card-highlight relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 shadow-[var(--shadow-overlay)]">
          {/* Subtle top accent */}
          <span className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />

          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-[var(--text-secondary)]">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {footer && (
          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">{footer}</p>
        )}
      </motion.div>
    </main>
  );
}
