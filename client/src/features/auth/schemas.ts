// Import Zod — the validation library used for form validation.
import { z } from 'zod';

// ── Login Schema ──────────────────────────────────────────────────────────────
// Validates the login form: email format + non-empty password.
export const loginSchema = z.object({
  // '.email()' validates the string is a valid email format.
  email: z.string().email('Enter a valid email'),
  // '.min(1)' ensures the password field isn't empty.
  password: z.string().min(1, 'Password is required'),
});

// Infer the TypeScript type from the Zod schema.
// LoginValues = { email: string; password: string }
// This ensures the type always matches the schema — single source of truth.
export type LoginValues = z.infer<typeof loginSchema>;

// ── Signup Schema ─────────────────────────────────────────────────────────────
// Validates the registration form with password confirmation.
export const signupSchema = z
  .object({
    displayName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),  // We validate this matches password below
  })
  // '.refine()' adds a cross-field validation rule.
  // It runs AFTER the individual field validations.
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    // 'path: ['confirmPassword']' — attaches the error to the confirmPassword field
    // so the error message shows under the right input.
    path: ['confirmPassword'],
  });

// SignupValues = { displayName: string; email: string; password: string; confirmPassword: string }
export type SignupValues = z.infer<typeof signupSchema>;

// ── Forgot Password Schema ────────────────────────────────────────────────────
// Only needs an email — validates the email format.
export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

// ── Reset Password Schema ─────────────────────────────────────────────────────
// Validates the new password + confirmation, with cross-field matching.
export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
