import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * Label + input + error message in one accessible unit.
 * forwardRef lets React Hook Form's register() attach its ref transparently.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className = '', ...props },
  ref,
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="block text-[13px] font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={`h-10 w-full rounded-lg border bg-[var(--surface-card)] px-3 text-sm text-slate-900 shadow-[var(--shadow-card)] outline-none transition-all duration-150 placeholder:text-slate-400/70 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200/60 focus:shadow-none dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-500/60 dark:focus:ring-emerald-500/20 ${
          error
            ? 'border-red-400 focus:border-red-400 focus:ring-red-200/70 dark:border-red-400/60 dark:focus:ring-red-500/25'
            : 'border-[var(--border-subtle)] dark:border-[var(--border-subtle)]'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-500 dark:text-red-400">
          <svg className="h-3 w-3 shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm-.75 3.5a.75.75 0 0 1 1.5 0v3.25a.75.75 0 0 1-1.5 0V4.5Zm.75 6.5a.875.875 0 1 1 0-1.75A.875.875 0 0 1 8 11Z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});
