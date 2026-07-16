import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function LandingNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-base font-bold text-white">
            ◈
          </span>
          <span className="text-base font-semibold text-slate-900">DevNest</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
            Features
          </a>
          <a href="#cta" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
            Get started
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden sm:block">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link to="/signup">
            <Button>Get started</Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
