// Import React Hook Form + Zod for form validation.
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
// Import forgot password schema (validates email format).
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/features/auth/schemas';

/**
 * ForgotPasswordPage — lets the user request a password reset email.
 *
 * Flow:
 * 1. User enters their email address
 * 2. Zod validates the email format
 * 3. useMutation calls sendPasswordReset from AuthContext
 * 4. Shows a generic success message (never reveals whether the email exists — security best practice)
 */
export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();

  // Set up form with the forgot-password Zod schema.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) });

  // Mutation wraps the sendPasswordReset call.
  const mutation = useMutation({
    mutationFn: (values: ForgotPasswordValues) => sendPasswordReset(values.email),
  });

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll email you a link to set a new password"
      footer={
        <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-700">
          Back to login
        </Link>
      }
    >
      {mutation.isSuccess ? (
        // Success message — always shown regardless of whether the email exists.
        // This prevents attackers from enumerating valid email addresses.
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          If an account exists for that email, a reset link is on its way.
        </div>
      ) : (
        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="space-y-4"
          noValidate
        >
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          {mutation.isError && (
            <p className="text-sm text-red-500">{(mutation.error as Error).message}</p>
          )}
          <Button type="submit" isLoading={mutation.isPending} className="w-full">
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
