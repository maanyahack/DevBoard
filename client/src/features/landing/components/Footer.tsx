import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
              DB
            </span>
            <span className="text-base font-semibold text-slate-900">DevBoard</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-slate-500">
            The developer productivity platform. One board for your whole workflow.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <a href="#features" className="text-slate-600 transition hover:text-slate-900">
            Features
          </a>
          <Link to="/login" className="text-slate-600 transition hover:text-slate-900">
            Log in
          </Link>
          <Link to="/signup" className="text-slate-600 transition hover:text-slate-900">
            Sign up
          </Link>
        </nav>
      </div>
      <div className="border-t border-slate-200 py-6">
        <p className="mx-auto max-w-6xl px-4 font-mono text-xs text-slate-400 sm:px-6">
          © 2026 DevBoard. Built as a portfolio project.
        </p>
      </div>
    </footer>
  );
}
