import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function LandingNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border-subtle)] bg-[var(--surface-overlay)] backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 transition-opacity duration-150 hover:opacity-80">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-base font-bold text-white shadow-[0_1px_8px_0_hsl(160_84%_39%/0.35)]">
            ◈
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">DevNest</span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          <a href="#features" className="text-sm font-medium text-[var(--text-secondary)] transition-colors duration-150 hover:text-slate-900 dark:hover:text-slate-100">
            Features
          </a>
          <a href="#cta" className="text-sm font-medium text-[var(--text-secondary)] transition-colors duration-150 hover:text-slate-900 dark:hover:text-slate-100">
            Get started
          </a>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link to="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
