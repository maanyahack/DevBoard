// Import React types for the button component.
// ButtonHTMLAttributes — all standard HTML button attributes (onClick, disabled, etc.)
// ReactNode — anything React can render (text, JSX, null, etc.)
import type { ButtonHTMLAttributes, ReactNode } from 'react';
// Import motion from Framer Motion — adds animation capabilities to the button.
import { motion } from 'framer-motion';

// Interface — extends the standard HTML button attributes with custom props.
// 'extends ButtonHTMLAttributes<HTMLButtonElement>' means the Button component
// accepts ALL standard button props (onClick, disabled, type, etc.) PLUS our custom ones.
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';  // Visual style
  size?: 'sm' | 'md' | 'lg';        // Button size
  isLoading?: boolean;                // Shows a loading spinner instead of children
  leftIcon?: ReactNode;              // Icon to show before the text
  rightIcon?: ReactNode;             // Icon to show after the text
  children: ReactNode;               // The button text/content
}

// Base CSS classes applied to ALL button variants (shared foundation).
const base =
  'relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold select-none ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +  // Keyboard focus styles
  'disabled:pointer-events-none disabled:opacity-55 disabled:shadow-none ' + // Disabled state
  'tracking-tight whitespace-nowrap';  // Text styling

// Size variants — different heights and padding for different contexts.
// 'Record<NonNullable<ButtonProps['size']>, string>' is a TypeScript utility type:
// it creates an object type where keys are the possible size values and values are strings.
const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3.5 text-[12.5px] rounded-lg',   // Small: 32px height, smaller text
  md: 'h-10 px-4.5 text-[13.5px]',               // Medium: 40px height (default)
  lg: 'h-12 px-6 text-[15px]',                    // Large: 48px height, larger text
};

// Focus ring colors for each variant — matches the variant's accent color.
const focus: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:   'focus-visible:ring-emerald-500/40 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
  secondary: 'focus-visible:ring-slate-400/30 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
  ghost: 'focus-visible:ring-slate-400/30 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
  outline: 'focus-visible:ring-slate-400/30 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
  danger: 'focus-visible:ring-red-500/40 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
};

// Visual style for each variant — the main color, background, border, and shadow.
const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'btn-primary',  // Defined in CSS — gradient green button
  secondary:
    'border border-[var(--border-subtle)] bg-[var(--surface-card)] text-slate-700 ' +
    'shadow-[var(--shadow-card)] hover:border-[var(--border-soft)] hover:bg-slate-50 ' +  // Subtle hover effect
    'hover:shadow-[var(--shadow-card-hover)] active:bg-slate-100 ' +                     // Press effect
    'dark:text-slate-100 dark:hover:bg-slate-800/80 dark:hover:border-slate-600/70 ' +
    'transition-all duration-180 ease-out',
  ghost:
    'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 active:bg-slate-200/70 ' +  // Transparent background
    'dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 ' +
    'transition-colors duration-150',
  outline:
    'border border-[var(--border-soft)] bg-transparent text-slate-700 hover:border-slate-300 hover:bg-slate-50 ' +
    'active:bg-slate-100 dark:text-slate-200 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800/80 ' +
    'transition-all duration-180 ease-out',
  danger:
    // Red gradient with inset shadows for a 3D button effect.
    'bg-gradient-to-b from-red-500 to-red-600 text-white ' +
    'shadow-[0_1px_0_0_hsl(0_0%_100%/0.15)_inset,0_-1px_0_0_hsl(0_65%_25%/0.6)_inset,' +
    '0_2px_8px_-2px_hsl(0_70%_45%/0.4),0_1px_3px_-1px_hsl(0_70%_45%/0.25)] ' +
    'hover:from-red-500 hover:to-red-700 hover:shadow-[0_1px_0_0_hsl(0_0%_100%/0.16)_inset,' +
    '0_-1px_0_0_hsl(0_65%_23%/0.6)_inset,' +
    '0_12px_28px_-6px_hsl(0_70%_45%/0.45),0_3px_8px_-2px_hsl(0_70%_45%/0.25)] ' +
    'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] ' +  // Lift on hover, press on click
    'transition-all duration-180 ease-out',
};

// Loading spinner SVG — shown when isLoading is true.
const spinner = (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

/**
 * Button — the primary button component used throughout the app.
 * Supports 5 visual variants, 3 sizes, loading state, and icon slots.
 */
export function Button({
  variant = 'primary',      // Default: green primary button
  size = 'md',              // Default: medium size
  isLoading = false,        // Default: not loading
  leftIcon,                 // Optional icon before text
  rightIcon,                // Optional icon after text
  className = '',           // Additional CSS classes from the parent
  children,                 // Button text or content
  disabled,                 // Whether the button is disabled
  ...props                  // All other button props (onClick, type, etc.)
}: ButtonProps) {
  return (
    // 'motion.button' — an animated button from Framer Motion.
    // 'whileTap' — scales down slightly when pressed (feel of physical button).
    // 'whileHover' — lifts non-primary buttons slightly on hover.
    <motion.button
      className={`${base} ${sizes[size]} ${variants[variant]} ${focus[variant]} ${className}`}
      disabled={disabled || isLoading}  // Disable during loading too
      whileTap={{ scale: 0.985 }}       // Subtle press animation
      whileHover={{ y: variant === 'primary' || variant === 'danger' ? 0 : -0.5 }}  // Lift effect
      transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
      {...(props as object)}  // Spread remaining props onto the button element
    >
      {isLoading ? (
        // Show spinner + "Saving…" text when loading.
        <>
          {spinner}
          <span>Saving…</span>
        </>
      ) : (
        // Normal state: optional left icon, children, optional right icon.
        <>
          {leftIcon && <span className="opacity-90 -ml-0.5">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="opacity-90 -mr-0.5">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
}
