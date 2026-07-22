import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Shared centered card shell for every auth screen. */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <main className="premium-shell flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-base font-bold text-white shadow-[0_2px_12px_0_hsl(160_84%_39%/0.35)]">
            ◈
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">DevNest</span>
        </Link>

        {/* Card */}
        <div className="card-highlight rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 shadow-[var(--shadow-overlay)]">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-[var(--text-secondary)]">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {footer && (
          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">{footer}</p>
        )}
      </div>
    </main>
  );
}
