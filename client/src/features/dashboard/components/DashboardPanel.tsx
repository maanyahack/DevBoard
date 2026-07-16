import type { ReactNode } from 'react';

interface DashboardPanelProps {
  title: string;
  children: ReactNode;
}

export function DashboardPanel({ title, children }: DashboardPanelProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-800">
      <div className="border-b border-slate-100 px-5 py-3.5 dark:border-slate-700/60">
        <h2 className="text-[13px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {title}
        </h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
