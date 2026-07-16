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
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={`h-9 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition-all duration-150 placeholder:text-slate-400/80 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200/60 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-500/60 dark:focus:ring-emerald-500/20 ${
          error
            ? 'border-red-400 focus:border-red-400 focus:ring-red-200/70 dark:border-red-400/60 dark:focus:ring-red-500/25'
            : 'border-slate-200 dark:border-slate-700'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs font-medium text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
});
