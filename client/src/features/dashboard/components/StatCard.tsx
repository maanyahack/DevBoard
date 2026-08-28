// ─── StatCard.tsx ──────────────────────────────────────────────────────────────
// A dashboard stat card with an animated counter and themed accent colors.
//
// TypeScript concepts used:
//   - `interface` for component props
//   - `Record<K, V>` utility type to map accent names → style objects
//   - `NonNullable<T>` to strip null/undefined from a union type
//   - `ReactNode` generic type for renderable children (icon prop)
//   - Framer Motion's `useMotionValue` + `useSpring` for physics-based animation

import type { ReactNode } from 'react';           // Type-only import (stripped at compile time)
import { useEffect, useRef } from 'react';         // Runtime imports (hooks stay in JS)
import { motion, useMotionValue, useSpring } from 'framer-motion';  // Animation library

// ─── Props Interface ──────────────────────────────────────────────────────────
// Defines what data StatCard needs. Every prop is mandatory except `accent`.
// `ReactNode` means "anything React can render: string, number, JSX, null".
interface StatCardProps {
  label: string;              // e.g. "Total Tasks"
  value: number;              // e.g. 42
  icon: ReactNode;            // A Lucide icon component like <ListTodo />
  accent?: 'emerald' | 'sky' | 'amber' | 'violet';  // Optional color theme (defaults to 'emerald')
}

// ─── Accent Color Map ─────────────────────────────────────────────────────────
// `Record<NonNullable<StatCardProps['accent']>, { ... }>` means:
//   - Take the `accent` property from StatCardProps
//   - Remove `undefined` with NonNullable (since accent is optional)
//   - That leaves: 'emerald' | 'sky' | 'amber' | 'violet'
//   - Map each to an object with Tailwind class strings
//
// This is safer than a plain object because TypeScript will error if you
// misspell an accent name or forget to style a variant.
const accentStyles: Record<
  NonNullable<StatCardProps['accent']>,
  { hover: string; icon: string; label: string; bar: string }
> = {
  emerald: {
    hover: 'hover:border-emerald-200/70 dark:hover:border-emerald-500/35',        // Border color on hover
    icon:  'bg-emerald-50 text-emerald-600 ring-emerald-100/80 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20',
    label: 'text-emerald-700/65 dark:text-emerald-300/65',                          // Label text color
    bar:   'bg-emerald-500',                                                        // Top accent bar
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

// ─── AnimatedNumber ───────────────────────────────────────────────────────────
// An internal sub-component that animates from 0 → `value` using spring physics.
//
// TypeScript concept: `{ value: number }` is an inline type for props.
// No `interface` needed because this is a private helper, not exported.
function AnimatedNumber({ value }: { value: number }) {
  // useMotionValue creates a value that can be animated without causing re-renders
  const motionValue = useMotionValue(0);

  // useSpring wraps the motion value with spring physics (stiffness, damping, mass)
  const spring = useSpring(motionValue, { stiffness: 90, damping: 18, mass: 0.8 });

  // useRef gives us a stable reference to the DOM <p> element
  const ref = useRef<HTMLParagraphElement>(null);  // Generic: tells TS it's a <p> element

  // When `value` prop changes, tell the spring to animate to the new target
  useEffect(() => {
    motionValue.set(value);  // Update the animation target
  }, [value, motionValue]);  // Re-run only when value or motionValue changes

  // Subscribe to spring changes and update the DOM text directly (no re-render needed)
  useEffect(() => {
    // spring.on('change', callback) returns an unsubscribe function
    const unsubscribe = spring.on('change', (v) => {
      if (ref.current) {                                // Guard: element might not be mounted yet
        ref.current.textContent = Math.round(v).toString();  // Write directly to DOM for performance
      }
    });
    return unsubscribe;  // Cleanup: stop listening when component unmounts
  }, [spring]);

  return (
    // The `ref` connects this JSX element to our useRef, so we can read its DOM node
    <p
      ref={ref}
      className="mt-2.5 font-mono text-[2rem] font-bold leading-none tracking-tight text-slate-950 dark:text-slate-50"
    >
      0  {/* Initial text; the useEffect replaces it with the animated value */}
    </p>
  );
}

// ─── StatCard (exported) ──────────────────────────────────────────────────────
// The main component that wraps AnimatedNumber with a card UI.
//
// TypeScript: Default parameter `accent = 'emerald'` — if caller omits it, emerald is used.
export function StatCard({ label, value, icon, accent = 'emerald' }: StatCardProps) {
  // Look up the Tailwind classes for the chosen accent color
  const styles = accentStyles[accent];

  return (
    // motion.div adds entry + hover animations via Framer Motion
    <motion.div
      initial={{ opacity: 0, y: 10 }}      // Start invisible and 10px below
      animate={{ opacity: 1, y: 0 }}        // Animate to visible and in-place
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}  // Custom cubic-bezier ease-out
      whileHover={{ y: -2, transition: { duration: 0.18 } }}      // Lift up 2px on hover
      className={`card-highlight group relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] ${styles.hover}`}
    >
      {/* Accent top bar — a thin colored line at the top of the card */}
      <span className={`absolute inset-x-0 top-0 h-[2px] rounded-t-xl ${styles.bar} opacity-60`} />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {/* Label — uppercase, tiny, wide-tracked text */}
          <p className={`text-[10.5px] font-semibold uppercase tracking-widest ${styles.label}`}>
            {label}
          </p>
          {/* Animated counter — springs from 0 to `value` */}
          <AnimatedNumber value={value} />
        </div>
        {/* Icon badge — sits top-right, scales up slightly on card hover */}
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 transition-transform duration-150 group-hover:scale-105 ${styles.icon}`}
        >
          {icon}
        </span>
      </div>
    </motion.div>
  );
}
