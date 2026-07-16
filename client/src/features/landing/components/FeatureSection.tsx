import type { ReactNode } from 'react';

interface Feature {
  title: string;
  description: string;
  icon: ReactNode;
}

const iconProps = {
  className: 'h-5 w-5',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const features: Feature[] = [
  {
    title: 'Notes',
    description: 'Capture ideas, meeting notes, and docs in clean markdown.',
    icon: (
      <svg {...iconProps}>
        <path d="M4 4h11l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
        <path d="M14 4v5h5M8 13h8M8 17h5" />
      </svg>
    ),
  },
  {
    title: 'Tasks',
    description: 'Track what is next with a fast, keyboard-friendly task list.',
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="m8 12 3 3 5-6" />
      </svg>
    ),
  },
  {
    title: 'Projects',
    description: 'Group related work into projects and see it all in context.',
    icon: (
      <svg {...iconProps}>
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      </svg>
    ),
  },
  {
    title: 'Bookmarks',
    description: 'Save links and references you will actually find again.',
    icon: (
      <svg {...iconProps}>
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-5-7 5V4a1 1 0 0 1 1-1Z" />
      </svg>
    ),
  },
  {
    title: 'Knowledge Vault',
    description: 'Keep files and documents searchable in one secure place.',
    icon: (
      <svg {...iconProps}>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
      </svg>
    ),
  },
  {
    title: 'Snippets',
    description: 'Store reusable code snippets and paste them in seconds.',
    icon: (
      <svg {...iconProps}>
        <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13 5l-2 14" />
      </svg>
    ),
  },
];

export function FeatureSection() {
  return (
    <section id="features" className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <span className="font-mono text-xs font-medium tracking-wide text-emerald-600">
            // what is inside
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            One board for everything you juggle.
          </h2>
          <p className="mt-3 text-slate-600">
            Stop context-switching between six different apps. DevNest keeps every part of your
            workflow a keystroke away.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                {feature.icon}
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-1.5 text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
