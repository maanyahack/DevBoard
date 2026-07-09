import { z } from 'zod';

/**
 * Avatar URL is optional. We accept an empty string (user clearing it) OR a
 * valid URL — z.union lets us allow "" without failing the .url() check.
 */
export const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  avatarUrl: z.union([z.literal(''), z.string().url('Enter a valid URL')]),
});

export type ProfileValues = z.infer<typeof profileSchema>;
