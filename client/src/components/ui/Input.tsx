import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, icon, iconPosition = 'left', hint, id, className = '', ...props },
  ref,
) {
  const inputId = id;
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[13px] font-semibold tracking-tight text-slate-700 dark:text-slate-200"
        >
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && iconPosition === 'left' && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-150 group-focus-within:text-emerald-500 dark:text-slate-500 dark:group-focus-within:text-emerald-400">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`field-focus-ring h-11 w-full rounded-xl border bg-[var(--surface-card)] px-3.5 text-[13.5px] font-medium text-slate-900 shadow-[var(--shadow-sm)] outline-none transition-all duration-180 placeholder:text-slate-400/75 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:shadow-black/25 ${
            icon && iconPosition === 'left' ? 'pl-10' : ''
          } ${icon && iconPosition === 'right' ? 'pr-10' : ''} ${
            error
              ? 'border-red-400/70 focus:border-red-400 dark:border-red-400/60'
              : 'border-[var(--border-subtle)] hover:border-[var(--border-soft)] dark:border-[var(--border-subtle)] dark:hover:border-slate-600/80'
          } ${className}`}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-150 group-focus-within:text-emerald-500 dark:text-slate-500 dark:group-focus-within:text-emerald-400">
            {icon}
          </span>
        )}
        {/* Subtle gradient ring on focus */}
        <span className="pointer-events-none absolute inset-0 -z-10 rounded-xl opacity-0 ring-2 ring-emerald-400/20 blur transition-opacity duration-200 group-focus-within:opacity-100 dark:ring-emerald-500/20" />
      </div>
      {hint && !error && (
        <p className="flex items-center gap-1.5 text-[11.5px] text-[var(--text-muted)]">{hint}</p>
      )}
      {error && (
        <p className="flex items-center gap-1.5 text-[12px] font-semibold text-red-500 dark:text-red-400">
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm-.75 3.5a.75.75 0 0 1 1.5 0v3.25a.75.75 0 0 1-1.5 0V4.5Zm.75 6.5a.875.875 0 1 1 0-1.75A.875.875 0 0 1 8 11Z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});
