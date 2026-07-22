import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-2xl"
    >
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Settings</h1>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Customize how DevNest looks and feels.
      </p>

      <div className="mt-8 card-highlight rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)] sm:p-8">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Appearance</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Choose a theme. Your preference is saved on this device.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {options.map((option) => {
            const isActive = theme === option.value;
            return (
              <motion.button
                key={option.value}
                onClick={() => setTheme(option.value)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.12 }}
                className={`flex items-center gap-3.5 rounded-xl border p-4 text-left transition-all duration-150 ${
                  isActive
                    ? 'border-emerald-400/80 bg-emerald-50 shadow-[0_0_0_3px_hsl(160_84%_39%/0.12)] dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:shadow-[0_0_0_3px_hsl(160_72%_50%/0.15)]'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-soft)] hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                }`}
                aria-pressed={isActive}
              >
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-150 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-[0_2px_8px_0_hsl(160_84%_39%/0.35)]'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {option.icon}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {option.label}
                  </span>
                  <span className="block text-xs text-[var(--text-secondary)]">{option.description}</span>
                </span>
                {isActive && (
                  <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M10 3 5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
