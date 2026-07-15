import type { ReactNode } from 'react';

interface DashboardPanelProps {
  title: string;
  children: ReactNode;
}

export function DashboardPanel({ title, children }: DashboardPanelProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
