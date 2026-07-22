import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Feature {
  title: string;
  description: string;
  icon: ReactNode;
  accent: string;
}

const features: Feature[] = [
  {
    title: 'Notes',
    description: 'Capture ideas, meeting notes, and docs in clean markdown.',
    accent: 'text-emerald-600 bg-emerald-50 ring-emerald-100 dark:text-emerald-300 dark:bg-emerald-500/10 dark:ring-emerald-500/20',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h11l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
        <path d="M14 4v5h5M8 13h8M8 17h5" />
      </svg>
    ),
  },
  {
    title: 'Tasks',
    description: 'Track what is next with a fast, keyboard-friendly task list.',
    accent: 'text-amber-600 bg-amber-50 ring-amber-100 dark:text-amber-300 dark:bg-amber-500/10 dark:ring-amber-500/20',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="m8 12 3 3 5-6" />
      </svg>
    ),
  },
  {
    title: 'Projects',
    description: 'Group related work into projects and see it all in context.',
    accent: 'text-sky-600 bg-sky-50 ring-sky-100 dark:text-sky-300 dark:bg-sky-500/10 dark:ring-sky-500/20',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      </svg>
    ),
  },
  {
    title: 'Bookmarks',
    description: 'Save links and references you will actually find again.',
    accent: 'text-rose-600 bg-rose-50 ring-rose-100 dark:text-rose-300 dark:bg-rose-500/10 dark:ring-rose-500/20',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-5-7 5V4a1 1 0 0 1 1-1Z" />
      </svg>
    ),
  },
  {
    title: 'Knowledge Vault',
    description: 'Keep files and documents searchable in one secure place.',
    accent: 'text-violet-600 bg-violet-50 ring-violet-100 dark:text-violet-300 dark:bg-violet-500/10 dark:ring-violet-500/20',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
      </svg>
    ),
  },
  {
    title: 'Snippets',
    description: 'Store reusable code snippets and paste them in seconds.',
    accent: 'text-slate-600 bg-slate-100 ring-slate-200 dark:text-slate-300 dark:bg-slate-700/40 dark:ring-slate-600',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13 5l-2 14" />
      </svg>
    ),
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export function FeatureSection() {
  return (
    <section id="features" className="bg-[var(--surface-raised)] py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <span className="font-mono text-xs font-semibold tracking-widest text-emerald-600 dark:text-emerald-400">
            // what is inside
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            One board for everything you juggle.
          </h2>
          <p className="mt-3 text-[var(--text-secondary)]">
            Stop context-switching between six different apps. DevNest keeps every part of your
            workflow a keystroke away.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="card-highlight floating-card group rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)] hover:border-[var(--border-soft)] hover:shadow-[var(--shadow-card-hover)]"
            >
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${feature.accent}`}>
                {feature.icon}
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">{feature.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
