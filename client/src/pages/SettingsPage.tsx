import type { ReactNode } from 'react';
import { useTheme, type Theme } from '@/context/ThemeContext';

interface ThemeOption {
  value: Theme;
  label: string;
  description: string;
  icon: ReactNode;
}

const options: ThemeOption[] = [
  {
    value: 'light',
    label: 'Light',
    description: 'Bright and clean',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Easy on the eyes',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
    ),
  },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Settings</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Customize how DevNest looks and feels.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Appearance</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Choose a theme. Your preference is saved on this device.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {options.map((option) => {
            const isActive = theme === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-500/10'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                }`}
                aria-pressed={isActive}
              >
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {option.icon}
                </span>
                <span>
                  <span className="block text-sm font-medium text-slate-900 dark:text-slate-100">
                    {option.label}
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    {option.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
