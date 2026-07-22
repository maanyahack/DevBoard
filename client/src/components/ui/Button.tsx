import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  isLoading?: boolean;
  children: ReactNode;
}

const base =
  'relative inline-flex items-center justify-center gap-2 rounded-lg font-medium select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-offset-slate-900 transition-colors duration-150';

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-7 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
};

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-emerald-600 text-white shadow-[0_1px_2px_0_hsl(160_84%_20%/0.35),inset_0_1px_0_0_hsl(0_0%_100%/0.12)] hover:bg-emerald-700 active:bg-emerald-800 active:shadow-none',
  secondary:
    'border border-[var(--border-subtle)] bg-[var(--surface-card)] text-slate-700 shadow-[var(--shadow-card)] hover:border-[var(--border-soft)] hover:bg-slate-50 hover:shadow-[var(--shadow-card-hover)] dark:text-slate-200 dark:hover:bg-slate-800/70',
  ghost:
    'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100',
  danger:
    'bg-red-600 text-white shadow-[0_1px_2px_0_hsl(0_72%_20%/0.30),inset_0_1px_0_0_hsl(0_0%_100%/0.1)] hover:bg-red-700 active:bg-red-800',
};

const spinner = (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.12 }}
      {...(props as object)}
    >
      {isLoading ? (
        <>
          {spinner}
          <span>Saving…</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
