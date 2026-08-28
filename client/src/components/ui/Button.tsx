import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

const base =
  'relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold select-none ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'disabled:pointer-events-none disabled:opacity-55 disabled:shadow-none ' +
  'tracking-tight whitespace-nowrap';

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3.5 text-[12.5px] rounded-lg',
  md: 'h-10 px-4.5 text-[13.5px]',
  lg: 'h-12 px-6 text-[15px]',
};

const focus: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:   'focus-visible:ring-emerald-500/40 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
  secondary: 'focus-visible:ring-slate-400/30 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
  ghost: 'focus-visible:ring-slate-400/30 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
  outline: 'focus-visible:ring-slate-400/30 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
  danger: 'focus-visible:ring-red-500/40 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
};

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'btn-primary',
  secondary:
    'border border-[var(--border-subtle)] bg-[var(--surface-card)] text-slate-700 ' +
    'shadow-[var(--shadow-card)] hover:border-[var(--border-soft)] hover:bg-slate-50 ' +
    'hover:shadow-[var(--shadow-card-hover)] active:bg-slate-100 ' +
    'dark:text-slate-100 dark:hover:bg-slate-800/80 dark:hover:border-slate-600/70 ' +
    'transition-all duration-180 ease-out',
  ghost:
    'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 active:bg-slate-200/70 ' +
    'dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 ' +
    'transition-colors duration-150',
  outline:
    'border border-[var(--border-soft)] bg-transparent text-slate-700 hover:border-slate-300 hover:bg-slate-50 ' +
    'active:bg-slate-100 dark:text-slate-200 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800/80 ' +
    'transition-all duration-180 ease-out',
  danger:
    'bg-gradient-to-b from-red-500 to-red-600 text-white ' +
    'shadow-[0_1px_0_0_hsl(0_0%_100%/0.15)_inset,0_-1px_0_0_hsl(0_65%_25%/0.6)_inset,' +
    '0_2px_8px_-2px_hsl(0_70%_45%/0.4),0_1px_3px_-1px_hsl(0_70%_45%/0.25] ' +
    'hover:from-red-500 hover:to-red-700 hover:shadow-[0_1px_0_0_hsl(0_0%_100%/0.16)_inset,' +
    '0_-1px_0_0_hsl(0_65%_23%/0.6)_inset,' +
    '0_12px_28px_-6px_hsl(0_70%_45%/0.45),0_3px_8px_-2px_hsl(0_70%_45%/0.25] ' +
    'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] ' +
    'transition-all duration-180 ease-out',
};

const spinner = (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      className={`${base} ${sizes[size]} ${variants[variant]} ${focus[variant]} ${className}`}
      disabled={disabled || isLoading}
      whileTap={{ scale: 0.985 }}
      whileHover={{ y: variant === 'primary' || variant === 'danger' ? 0 : -0.5 }}
      transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
      {...(props as object)}
    >
      {isLoading ? (
        <>
          {spinner}
          <span>Saving…</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="opacity-90 -ml-0.5">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="opacity-90 -mr-0.5">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
}
