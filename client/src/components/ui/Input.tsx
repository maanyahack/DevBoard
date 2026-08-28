// Import React utilities.
// forwardRef — a React hook that lets a parent component access the input's DOM element.
// This is important for form libraries (like React Hook Form) that need to focus/measure inputs.
// InputHTMLAttributes — all standard HTML input attributes (type, placeholder, value, etc.)
// ReactNode — anything React can render (used for the icon prop).
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

// Interface — extends standard input attributes with custom props.
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;           // Optional label text displayed above the input
  error?: string;           // Error message displayed below the input (if any)
  icon?: ReactNode;         // Optional icon inside the input
  iconPosition?: 'left' | 'right';  // Which side to place the icon (default: left)
  hint?: string;            // Optional hint text displayed below the input (when no error)
}

/**
 * Input — a styled text input component with label, icon, error, and hint support.
 *
 * Uses forwardRef so parent components (like React Hook Form) can access
 * the underlying DOM input element for programmatic focus, validation, etc.
 *
 * The 'function Input()' syntax (named function expression) is required by
 * forwardRef — it gives the component a name in React DevTools.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  // Destructure props with defaults. The ref is passed as the second argument.
  { label, error, icon, iconPosition = 'left', hint, id, className = '', ...props },
  ref,  // This ref gets attached to the actual <input> element
) {
  const inputId = id;  // The ID links the label to the input (accessibility)
  return (
    // Outer container — vertical spacing between label, input, and error/hint.
    <div className="space-y-1.5">
      {/* Label — only rendered if provided. */}
      {label && (
        <label
          htmlFor={inputId}  // Links the label to the input by ID (accessibility)
          className="block text-[13px] font-semibold tracking-tight text-slate-700 dark:text-slate-200"
        >
          {label}
        </label>
      )}

      {/* Input container — 'relative' positions the icon and focus ring absolutely. */}
      <div className="relative group">
        {/* Left icon — only rendered if icon is provided and position is 'left'. */}
        {icon && iconPosition === 'left' && (
          // The icon changes color when the input is focused (via group-focus-within).
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-150 group-focus-within:text-emerald-500 dark:text-slate-500 dark:group-focus-within:text-emerald-400">
            {icon}
          </span>
        )}

        {/* The actual <input> element — styled with Tailwind CSS classes. */}
        <input
          id={inputId}
          ref={ref}  // Attach the forwarded ref here
          className={`field-focus-ring h-11 w-full rounded-xl border bg-[var(--surface-card)] px-3.5 text-[13.5px] font-medium text-slate-900 shadow-[var(--shadow-sm)] outline-none transition-all duration-180 placeholder:text-slate-400/75 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:shadow-black/25 ${
            // Add extra left padding if there's a left icon (to avoid overlapping text).
            icon && iconPosition === 'left' ? 'pl-10' : ''
          } ${
            // Add extra right padding if there's a right icon.
            icon && iconPosition === 'right' ? 'pr-10' : ''
          } ${
            // Show red border if there's an error, normal border otherwise.
            error
              ? 'border-red-400/70 focus:border-red-400 dark:border-red-400/60'
              : 'border-[var(--border-subtle)] hover:border-[var(--border-soft)] dark:border-[var(--border-subtle)] dark:hover:border-slate-600/80'
          } ${className}`}
          {...props}  // Spread remaining input props (type, placeholder, onChange, etc.)
        />

        {/* Right icon — only rendered if icon is provided and position is 'right'. */}
        {icon && iconPosition === 'right' && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-150 group-focus-within:text-emerald-500 dark:text-slate-500 dark:group-focus-within:text-emerald-400">
            {icon}
          </span>
        )}

        {/* Focus ring — a decorative glowing ring that appears when the input is focused.
            'pointer-events-none' makes it non-interactive (clicks pass through to the input).
            '-z-10' puts it behind the input.
            'group-focus-within:opacity-100' makes it visible only when the input has focus. */}
        <span className="pointer-events-none absolute inset-0 -z-10 rounded-xl opacity-0 ring-2 ring-emerald-400/20 blur transition-opacity duration-200 group-focus-within:opacity-100 dark:ring-emerald-500/20" />
      </div>

      {/* Hint text — shown below the input when there's no error. */}
      {hint && !error && (
        <p className="flex items-center gap-1.5 text-[11.5px] text-[var(--text-muted)]">{hint}</p>
      )}

      {/* Error message — shown below the input when validation fails.
          Includes a red warning icon next to the text. */}
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
