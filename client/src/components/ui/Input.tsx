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
        className={`w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 dark:bg-slate-700/50 dark:text-slate-100 ${
          error
            ? 'border-red-400 focus:ring-red-300'
            : 'border-slate-200 focus:ring-indigo-300 dark:border-slate-600'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
});
