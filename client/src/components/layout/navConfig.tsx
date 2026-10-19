// Import ReactNode type — represents anything React can render.
import type { ReactNode } from 'react';

// TypeScript interface — defines the shape of a navigation item.
export interface NavItem {
  label: string;      // Display text (e.g., "Dashboard", "Notes")
  to: string;         // URL path (e.g., "/dashboard", "/notes")
  icon: ReactNode;    // The SVG icon element to render next to the label
}

// Shared SVG attributes for consistent icon styling across all nav items.
// 'as const' tells TypeScript these are literal values, not general strings.
const p = {
  className: 'h-[18px] w-[18px]',   // 18x18 pixel icons
  viewBox: '0 0 24 24',             // Standard SVG viewBox
  fill: 'none',                      // No fill — stroke-only icons
  stroke: 'currentColor',            // Uses the parent's text color
  strokeWidth: 1.75,                 // Thin, elegant strokes
  strokeLinecap: 'round' as const,   // Rounded line caps
  strokeLinejoin: 'round' as const,  // Rounded line joins
};

/** Sidebar navigation. Order matters — it is the primary app map. */
// The navItems array defines the sidebar menu. The order here determines
// the order in the sidebar. Each item has a label, URL, and SVG icon.
export const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    // Dashboard icon — a grid of rectangles (dashboard layout).
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
    // Notes icon — a document with lines of text.
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
    // Tasks icon — a checkbox with a checkmark.
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
    // Projects icon — a folder shape.
    icon: (
      <svg {...p}>
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      </svg>
    ),
  },
  {
    label: 'Bookmarks',
    to: '/bookmarks',
    // Bookmarks icon — a bookmark/ribbon shape.
    icon: (
      <svg {...p}>
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-5-7 5V4a1 1 0 0 1 1-1Z" />
      </svg>
    ),
  },
  {
    label: 'Knowledge Vault',
    to: '/knowledge',
    // Knowledge Vault icon — an open book/database shape.
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
    // Snippets icon — code angle brackets (< >).
    icon: (
      <svg {...p}>
        <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13 5l-2 14" />
      </svg>
    ),
  },
];
