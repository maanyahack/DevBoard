// Import the 'dotenv/config' package which automatically loads environment
// variables from a .env file into process.env when this module is imported.
// This must be the very first import so other modules see the env vars.
import 'dotenv/config';

// Import the 'z' object from Zod — a TypeScript-first schema validation library.
// Zod lets you define the shape of data and validate it at runtime, while also
// inferring TypeScript types from those schemas (no duplicate type definitions).
import { z } from 'zod';

/**
 * Validate environment variables ONCE at startup.
 * If a required variable is missing or malformed we crash immediately with a
 * clear message, instead of failing mysteriously deep inside a request later.
 */

// Define a Zod schema that describes every env var the server needs.
// 'z.object()' creates a schema that validates a plain JS object.
const envSchema = z.object({
  // NODE_ENV can only be one of three string literals.
  // '.default()' means if it's not set, use 'development'.
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // PORT is read as a string from process.env, so 'z.coerce.number()'
  // converts it to a number (like parseInt). Defaults to 4000 if missing.
  PORT: z.coerce.number().default(4000),

  // CLIENT_URL must be a valid URL string (starts with http/https).
  // Defaults to the Vite dev server address.
  CLIENT_URL: z.string().url().default('http://localhost:5173'),

  // SUPABASE_URL is required — no default — so the server won't start
  // without it. '.url()' ensures it's a valid URL format.
  SUPABASE_URL: z.string().url(),

  // SUPABASE_ANON_KEY must be a non-empty string (at least 1 character).
  // This is the public Supabase key used by the client; the server also
  // needs it for some operations.
  SUPABASE_ANON_KEY: z.string().min(1),

  // SUPABASE_SERVICE_ROLE_KEY is the admin-level key that bypasses
  // Row Level Security. Must be non-empty.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // GEMINI_API_KEY is the Google Gemini API key for AI features.
  // Must be non-empty.
  GEMINI_API_KEY: z.string().min(1),
});

// 'safeParse' validates process.env against the schema.
// Unlike 'parse', it doesn't throw — instead it returns an object with
// either a 'success: true' and 'data' property, or 'success: false'
// and an 'error' property containing validation details.
const parsed = envSchema.safeParse(process.env);

// If validation failed, log the specific field errors and exit the process
// with code 1 (non-zero = failure). This crashes the server immediately
// rather than letting it run with broken config.
if (!parsed.success) {
  console.error('Invalid environment variables:');
  // '.flatten()' turns Zod errors into a simpler { fieldErrors: { KEY: [...] } } shape.
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

// Export the validated (and typed!) env object.
// TypeScript now knows exactly what types each property has —
// e.g., env.PORT is a number, env.NODE_ENV is a string literal union.
// This object is imported everywhere else as the single source of truth
// for environment configuration.
export const env = parsed.data;
