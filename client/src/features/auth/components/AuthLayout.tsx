// Import ReactNode type for the children/footer props.
import type { ReactNode } from 'react';
// Import Link for the logo link back to the landing page.
import { Link } from 'react-router-dom';
// Import motion for the entrance animation.
import { motion } from 'framer-motion';

// Props interface — every auth page provides these to the shared layout.
interface AuthLayoutProps {
  title: string;        // Page heading (e.g., "Welcome back", "Create your account")
  subtitle?: string;    // Optional description below the heading
  children: ReactNode;  // The form content (login form, signup form, etc.)
  footer?: ReactNode;   // Optional footer text (e.g., "Don't have an account? Sign up")
}

/**
 * AuthLayout — shared centered card shell for every auth screen.
 *
 * Provides:
 * - Centered card with max width
 * - DevBoard logo at the top
 * - Title and subtitle
 * - Ambient gradient blobs in the background
 * - Smooth entrance animation
 * - Optional footer text below the card
 */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <main className="premium-shell relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Ambient gradient blobs — decorative background elements.
          'pointer-events-none' makes them non-interactive.
          '-z-10' puts them behind the card. */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Top-left green blob */}
        <div className="absolute left-1/4 top-[-10%] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px] dark:bg-emerald-500/6" />
        {/* Bottom-right purple blob */}
        <div className="absolute right-0 bottom-0 h-[500px] w-[500px] translate-x-1/3 rounded-full bg-violet-500/8 blur-[100px] dark:bg-violet-500/5" />
      </div>

      {/* Animated card container — fades in and slides up on mount. */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}  // Start invisible, shifted down, slightly smaller
        animate={{ opacity: 1, y: 0, scale: 1 }}        // End fully visible, centered, normal size
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}  // Smooth custom easing
        className="w-full max-w-sm"  // 384px max width
      >
        {/* Logo — links back to the landing page. */}
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-base font-bold text-white shadow-[0_2px_16px_0_hsl(160_84%_39%/0.40)]">
            ◈
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">DevBoard</span>
        </Link>

        {/* Card container — holds the form content. */}
        <div className="card-highlight relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 shadow-[var(--shadow-overlay)]">
          {/* Subtle green accent line at the top of the card. */}
          <span className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />

          {/* Page title and optional subtitle. */}
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-[var(--text-secondary)]">{subtitle}</p>}

          {/* Form content — passed in as children from the page component. */}
          <div className="mt-6">{children}</div>
        </div>

        {/* Optional footer — e.g., "Don't have an account? Sign up" */}
        {footer && (
          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">{footer}</p>
        )}
      </motion.div>
    </main>
  );
}
