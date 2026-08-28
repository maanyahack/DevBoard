/// <reference types="vite/client" />
// This triple-slash directive imports Vite's built-in type definitions.
// It provides types for import.meta.env, import.meta.hot (HMR), and
// other Vite-specific features. Without this, TypeScript wouldn't know
// about import.meta.env.

/**
 * ImportMetaEnv — defines the shape of our environment variables.
 * By declaring this interface, TypeScript provides autocomplete and
 * type-checking for all VITE_* environment variables throughout the app.
 *
 * If you add a new VITE_ env var to .env, add it here too so TypeScript
 * knows about it.
 */
interface ImportMetaEnv {
  // The Supabase project URL — required.
  readonly VITE_SUPABASE_URL: string;
  // The Supabase anonymous (public) key — required.
  readonly VITE_SUPABASE_ANON_KEY: string;
  // The backend API URL — optional (has a default of http://localhost:4000 in api.ts).
  readonly VITE_API_URL?: string;
}

/**
 * ImportMeta — extends Vite's ImportMeta to include our custom env shape.
 * This tells TypeScript that import.meta.env has our ImportMetaEnv shape.
 */
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
