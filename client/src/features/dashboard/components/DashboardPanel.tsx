import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface DashboardPanelProps {
  title: string;
  children: ReactNode;
}

export function DashboardPanel({ title, children }: DashboardPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="card-highlight floating-card stagger-item rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-card)] hover:border-[var(--border-soft)] hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="border-b border-[var(--border-subtle)] px-5 py-3.5">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          {title}
        </h2>
      </div>
      <div className="p-5">{children}</div>
    </motion.section>
  );
}
