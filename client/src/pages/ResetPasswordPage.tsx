// Import React Hook Form + Zod for form validation.
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
// Import reset password schema (validates password + confirmPassword matching).
import { resetPasswordSchema, type ResetPasswordValues } from '@/features/auth/schemas';

/**
 * ResetPasswordPage — the page users land on after clicking the password reset email link.
 *
 * Supabase handles the token verification automatically (detectSessionInUrl: true in supabase.ts).
 * The user is in a temporary "recovery session" and can set a new password here.
 *
 * Flow:
 * 1. User clicks the reset link in their email → Supabase parses the token from the URL
 * 2. User enters a new password (and confirms it)
 * 3. Zod validates the passwords match and meet requirements
 * 4. useMutation calls updatePassword from AuthContext
 * 5. On success, navigates to /dashboard (user is now fully authenticated)
 */
export default function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  // Set up form with the reset-password Zod schema.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) });

  // Mutation wraps the updatePassword call.
  const mutation = useMutation({
    mutationFn: (values: ResetPasswordValues) => updatePassword(values.password),
    onSuccess: () => navigate('/dashboard', { replace: true }),
  });

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a strong password you'll remember">
      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="space-y-4"
        noValidate
      >
        <Input
          id="password"
          type="password"
          label="New password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          id="confirmPassword"
          type="password"
          label="Confirm new password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        {mutation.isError && (
          <p className="text-sm text-red-500">{(mutation.error as Error).message}</p>
        )}
        <Button type="submit" isLoading={mutation.isPending} className="w-full">
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
}
