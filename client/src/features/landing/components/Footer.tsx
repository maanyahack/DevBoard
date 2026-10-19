import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--surface-raised)]">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-base font-bold text-white shadow-[0_1px_8px_0_hsl(160_84%_39%/0.30)]">
              ◈
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">DevNest</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-[var(--text-muted)]">
            Your AI-powered developer workspace.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <a href="#features" className="text-[var(--text-secondary)] transition-colors duration-150 hover:text-slate-900 dark:hover:text-slate-100">
            Features
          </a>
          <Link to="/login" className="text-[var(--text-secondary)] transition-colors duration-150 hover:text-slate-900 dark:hover:text-slate-100">
            Log in
          </Link>
          <Link to="/signup" className="text-[var(--text-secondary)] transition-colors duration-150 hover:text-slate-900 dark:hover:text-slate-100">
            Sign up
          </Link>
        </nav>
      </div>
      <div className="border-t border-[var(--border-subtle)] py-5">
        <p className="mx-auto max-w-6xl px-4 font-mono text-xs text-[var(--text-muted)] sm:px-6">
          © {new Date().getFullYear()} DevNest. Built as a portfolio project.
        </p>
      </div>
    </footer>
  );
}
