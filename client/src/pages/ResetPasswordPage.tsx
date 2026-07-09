import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { resetPasswordSchema, type ResetPasswordValues } from '@/features/auth/schemas';

/**
 * Reached via the emailed reset link. Supabase (detectSessionInUrl) establishes
 * a temporary recovery session, so the user can set a new password here.
 */
export default function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) });

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
