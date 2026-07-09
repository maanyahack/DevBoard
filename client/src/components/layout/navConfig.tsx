import type { ReactNode } from 'react';

export interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
}

const p = {
  className: 'h-5 w-5',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** Sidebar navigation. Order matters — it is the primary app map. */
export const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: (
      <svg {...p}>
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Notes',
    to: '/notes',
    icon: (
      <svg {...p}>
        <path d="M4 4h11l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
        <path d="M14 4v5h5M8 13h8M8 17h5" />
      </svg>
    ),
  },
  {
    label: 'Tasks',
    to: '/tasks',
    icon: (
      <svg {...p}>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="m8 12 3 3 5-6" />
      </svg>
    ),
  },
  {
    label: 'Projects',
    to: '/projects',
    icon: (
      <svg {...p}>
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      </svg>
    ),
  },
  {
    label: 'Bookmarks',
    to: '/bookmarks',
    icon: (
      <svg {...p}>
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-5-7 5V4a1 1 0 0 1 1-1Z" />
      </svg>
    ),
  },
  {
    label: 'Knowledge Vault',
    to: '/knowledge',
    icon: (
      <svg {...p}>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
      </svg>
    ),
  },
  {
    label: 'Snippets',
    to: '/snippets',
    icon: (
      <svg {...p}>
        <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13 5l-2 14" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    to: '/settings',
    icon: (
      <svg {...p}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
      </svg>
    ),
  },
];
