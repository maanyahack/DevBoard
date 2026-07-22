import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional label for the error context e.g. "Notes", "Dashboard" */
  label?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches unhandled render errors in its subtree and shows a polished
 * fallback instead of letting the whole app white-screen.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[ErrorBoundary${this.props.label ? `:${this.props.label}` : ''}]`, error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 p-6 dark:from-slate-950 dark:to-slate-900">
          {/* Decorative gradient orbs */}
          <div
            className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full opacity-[0.08] blur-3xl dark:opacity-[0.12]"
            style={{ background: 'radial-gradient(circle, rgb(16 185 129), transparent 70%)' }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full opacity-[0.07] blur-3xl dark:opacity-[0.10]"
            style={{ background: 'radial-gradient(circle, rgb(56 189 248), transparent 70%)' }}
            aria-hidden="true"
          />

          {/* Subtle grid overlay */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgb(15 23 42 / 0.04) 1px, transparent 1px), linear-gradient(90deg, rgb(15 23 42 / 0.04) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              maskImage: 'linear-gradient(to bottom, black, transparent 80%)',
            }}
            aria-hidden="true"
          />

          {/* Card */}
          <div className="page-enter relative max-w-md rounded-2xl border border-slate-200/70 bg-white/90 p-8 shadow-xl shadow-slate-200/60 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/90 dark:shadow-black/30" role="alert">
            {/* Icon with soft glow */}
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 shadow-sm shadow-rose-200/60 ring-1 ring-rose-200 dark:bg-rose-500/10 dark:shadow-rose-500/10 dark:ring-rose-500/25">
              <svg
                className="h-7 w-7 text-rose-600 dark:text-rose-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </span>

            <div className="mt-5 text-center">
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Something went wrong
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {this.props.label
                  ? `An error occurred while rendering ${this.props.label}.`
                  : 'An unexpected error occurred.'}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-400 dark:text-slate-500">
                Try refreshing the page to get back on track.
              </p>
            </div>

            {/* Error details (collapsible) */}
            {this.state.error && (
              <details className="group mt-6 rounded-xl border border-slate-100 bg-slate-50/70 transition-colors duration-150 hover:border-slate-200 dark:border-slate-700/60 dark:bg-slate-800/50 dark:hover:border-slate-600">
                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                  <span>Error details</span>
                  <svg
                    className="h-3.5 w-3.5 transition-transform duration-150 group-open:rotate-180"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>
                <pre className="max-h-40 overflow-auto border-t border-slate-100 px-4 py-3 font-mono text-xs leading-relaxed text-slate-600 dark:border-slate-700/60 dark:text-slate-300">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            {/* Reload button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="pressable mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-500/25 transition-all duration-150 hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-500/25 active:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
            >
              <RefreshCw className="h-4 w-4" />
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
