import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  accent?: 'emerald' | 'sky' | 'amber' | 'violet';
}

const accentStyles: Record<
  NonNullable<StatCardProps['accent']>,
  { hover: string; icon: string; label: string; bar: string }
> = {
  emerald: {
    hover: 'hover:border-emerald-200/70 dark:hover:border-emerald-500/35',
    icon:  'bg-emerald-50 text-emerald-600 ring-emerald-100/80 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20',
    label: 'text-emerald-700/65 dark:text-emerald-300/65',
    bar:   'bg-emerald-500',
  },
  sky: {
    hover: 'hover:border-sky-200/70 dark:hover:border-sky-500/35',
    icon:  'bg-sky-50 text-sky-600 ring-sky-100/80 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20',
    label: 'text-sky-700/65 dark:text-sky-300/65',
    bar:   'bg-sky-500',
  },
  amber: {
    hover: 'hover:border-amber-200/70 dark:hover:border-amber-500/35',
    icon:  'bg-amber-50 text-amber-600 ring-amber-100/80 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20',
    label: 'text-amber-700/70 dark:text-amber-300/65',
    bar:   'bg-amber-500',
  },
  violet: {
    hover: 'hover:border-violet-200/70 dark:hover:border-violet-500/35',
    icon:  'bg-violet-50 text-violet-600 ring-violet-100/80 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20',
    label: 'text-violet-700/65 dark:text-violet-300/65',
    bar:   'bg-violet-500',
  },
};

/** Animated counter that springs to the target value. */
function AnimatedNumber({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 90, damping: 18, mass: 0.8 });
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (v) => {
      if (ref.current) {
        ref.current.textContent = Math.round(v).toString();
      }
    });
    return unsubscribe;
  }, [spring]);

  return (
    <p
      ref={ref}
      className="mt-2.5 font-mono text-[2rem] font-bold leading-none tracking-tight text-slate-950 dark:text-slate-50"
    >
      0
    </p>
  );
}

export function StatCard({ label, value, icon, accent = 'emerald' }: StatCardProps) {
  const styles = accentStyles[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.18 } }}
      className={`card-highlight group relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] ${styles.hover}`}
    >
      {/* Accent top bar */}
      <span className={`absolute inset-x-0 top-0 h-[2px] rounded-t-xl ${styles.bar} opacity-60`} />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={`text-[10.5px] font-semibold uppercase tracking-widest ${styles.label}`}>
            {label}
          </p>
          <AnimatedNumber value={value} />
        </div>
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 transition-transform duration-150 group-hover:scale-105 ${styles.icon}`}
        >
          {icon}
        </span>
      </div>
    </motion.div>
  );
}
