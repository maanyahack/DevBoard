import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Feature {
  title: string;
  description: string;
  icon: ReactNode;
  accent: string;
  accentBorder: string;
}

const features: Feature[] = [
  {
    title: 'Notes',
    description: 'Capture ideas, meeting notes, and docs in clean markdown. Rich editor with instant preview.',
    accent: 'text-emerald-600 bg-emerald-50 ring-emerald-100 dark:text-emerald-300 dark:bg-emerald-500/10 dark:ring-emerald-500/20',
    accentBorder: 'group-hover:border-emerald-200/80 dark:group-hover:border-emerald-500/30',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h11l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
        <path d="M14 4v5h5M8 13h8M8 17h5" />
      </svg>
    ),
  },
  {
    title: 'Tasks',
    description: 'Track what is next with a fast, keyboard-friendly task list. List, Kanban, and Calendar views.',
    accent: 'text-amber-600 bg-amber-50 ring-amber-100 dark:text-amber-300 dark:bg-amber-500/10 dark:ring-amber-500/20',
    accentBorder: 'group-hover:border-amber-200/80 dark:group-hover:border-amber-500/30',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="m8 12 3 3 5-6" />
      </svg>
    ),
  },
  {
    title: 'Projects',
    description: 'Group related work into projects and see it all in context. GitHub integration included.',
    accent: 'text-sky-600 bg-sky-50 ring-sky-100 dark:text-sky-300 dark:bg-sky-500/10 dark:ring-sky-500/20',
    accentBorder: 'group-hover:border-sky-200/80 dark:group-hover:border-sky-500/30',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      </svg>
    ),
  },
  {
    title: 'Bookmarks',
    description: 'Save links and references you will actually find again. Tag, search, and resurface them fast.',
    accent: 'text-rose-600 bg-rose-50 ring-rose-100 dark:text-rose-300 dark:bg-rose-500/10 dark:ring-rose-500/20',
    accentBorder: 'group-hover:border-rose-200/80 dark:group-hover:border-rose-500/30',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-5-7 5V4a1 1 0 0 1 1-1Z" />
      </svg>
    ),
  },
  {
    title: 'Knowledge Vault',
    description: 'Keep files and documents searchable in one secure place. Full-text search across everything.',
    accent: 'text-violet-600 bg-violet-50 ring-violet-100 dark:text-violet-300 dark:bg-violet-500/10 dark:ring-violet-500/20',
    accentBorder: 'group-hover:border-violet-200/80 dark:group-hover:border-violet-500/30',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
      </svg>
    ),
  },
  {
    title: 'Snippets',
    description: 'Store reusable code snippets and paste them in seconds. Syntax highlighting for 50+ languages.',
    accent: 'text-slate-600 bg-slate-100 ring-slate-200 dark:text-slate-300 dark:bg-slate-700/40 dark:ring-slate-600',
    accentBorder: 'group-hover:border-slate-300 dark:group-hover:border-slate-600',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13 5l-2 14" />
      </svg>
    ),
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.075 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as number[] } },
};

export function FeatureSection() {
  return (
    <section id="features" className="bg-[var(--surface-raised)] py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3.5 py-1.5 shadow-sm">
            <span className="font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              // what is inside
            </span>
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
            One board for everything<br className="hidden sm:block" /> you juggle.
          </h2>
          <p className="mt-3 text-lg text-[var(--text-secondary)]">
            Stop context-switching between six different apps. DevBoard keeps every part of your
            workflow a keystroke away.
          </p>
        </motion.div>

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
              className={`card-highlight floating-card group relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] ${feature.accentBorder}`}
            >
              {/* Icon */}
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ring-1 transition-transform duration-200 group-hover:scale-105 ${feature.accent}`}>
                {feature.icon}
              </div>
              <h3 className="mt-4 text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">{feature.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">{feature.description}</p>

              {/* Subtle corner glow on hover */}
              <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0 ring-1 ring-inset ring-white/20 transition-opacity duration-200 group-hover:opacity-100 dark:ring-white/10" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
