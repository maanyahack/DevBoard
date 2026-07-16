import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-150 hover:-translate-y-px hover:border-slate-300 hover:shadow-md dark:border-slate-700/80 dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {label}
          </p>
          <p className="mt-2.5 text-[2rem] font-bold leading-none tracking-tight text-slate-900 dark:text-slate-100">
            {value}
          </p>
        </div>
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
          {icon}
        </span>
      </div>
    </div>
  );
}
