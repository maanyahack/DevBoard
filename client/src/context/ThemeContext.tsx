// Import React hooks and types needed for creating a context.
// createContext — creates a React context object (a way to pass data down the component tree).
// useContext — hook to consume the context in child components.
// useEffect — hook for side effects (running code after render).
// useState — hook for state management.
// type ReactNode — TypeScript type for anything React can render (JSX, strings, numbers, etc.).
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

// TypeScript union type — Theme can only be 'light' or 'dark'.
// Using a type alias makes the code more readable and provides autocomplete.
export type Theme = 'light' | 'dark';

// Interface — defines the shape of data provided by this context.
// Any component calling useTheme() will get these three properties.
interface ThemeContextValue {
  theme: Theme;                        // Current theme
  setTheme: (theme: Theme) => void;    // Setter to change the theme
  toggleTheme: () => void;             // Convenience function to flip between light/dark
}

// Create the context with undefined as default value.
// 'undefined' means the context has no value until a Provider wraps it.
// This forces components to use the useTheme() hook (which throws if no Provider).
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// localStorage key for persisting the user's theme preference.
const STORAGE_KEY = 'devboard-theme';

/**
 * getInitialTheme — determines the starting theme.
 * Priority: 1) Saved preference in localStorage, 2) OS preference via media query.
 */
function getInitialTheme(): Theme {
  // Try to read the saved theme from localStorage.
  const stored = localStorage.getItem(STORAGE_KEY);
  // Validate the stored value — only accept 'light' or 'dark' (ignore corrupted values).
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  // No saved preference — check the OS/browser dark mode setting.
  // 'window.matchMedia' returns a MediaQueryList that tells us if the user
  // prefers dark mode (based on their OS settings).
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * ThemeProvider — wraps the app and provides theme state to all descendants.
 * It manages:
 * - The current theme state (light or dark)
 * - Persisting the preference to localStorage
 * - Applying the 'dark' CSS class to the HTML root element
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  // 'useState<Theme>' — TypeScript generic: tells useState that the state is a Theme.
  // 'getInitialTheme' is passed as the initializer — it runs once on mount.
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // This effect runs every time 'theme' changes.
  // It performs two side effects:
  // 1. Adds/removes the 'dark' class on <html> for Tailwind's dark mode
  // 2. Saves the preference to localStorage for persistence
  useEffect(() => {
    const root = document.documentElement;  // The <html> element
    // '.classList.toggle()' adds the class if it's not there, removes it if it is.
    // This is how Tailwind CSS v4 knows to apply dark mode styles.
    root.classList.toggle('dark', theme === 'dark');
    // Save the preference so it persists across page reloads.
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);  // Re-run this effect whenever 'theme' changes

  // Build the context value object.
  const value: ThemeContextValue = {
    theme,
    setTheme: setThemeState,
    // toggleTheme uses a functional state update — 'prev' is the current theme.
    // This is the React-safe way to update state based on the previous value.
    toggleTheme: () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark')),
  };

  // Provide the theme state to all descendant components.
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * useTheme — custom hook to access the theme context.
 * All components that need to read or change the theme use this hook.
 * It throws an error if used outside a ThemeProvider (a common React pattern).
 */
// eslint-disable-next-line react-refresh/only-export-components
// ^ The ESLint comment above suppresses a Vite-specific warning about exporting
// components from non-component modules (this is fine for custom hooks).
export function useTheme(): ThemeContextValue {
  // useContext returns the current context value — the object we provided in ThemeProvider.
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // This should never happen if the component tree is set up correctly.
    // It's a development-time safety net to catch misuse.
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
