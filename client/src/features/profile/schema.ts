// Import Zod for validation.
import { z } from 'zod';

/**
 * Profile form schema — validates the profile update form.
 *
 * 'displayName' is required (min 2 characters).
 * 'avatarUrl' is special: it accepts either an empty string (user clearing it)
 * OR a valid URL. We use 'z.union' to allow both cases.
 */
export const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  // 'z.union' — the value must match ONE of the following schemas:
  // 1. z.literal('') — exactly an empty string (user removed their avatar)
  // 2. z.string().url() — a valid URL string
  avatarUrl: z.union([z.literal(''), z.string().url('Enter a valid URL')]),
});

// Infer the TypeScript type: { displayName: string; avatarUrl: string }
export type ProfileValues = z.infer<typeof profileSchema>;
