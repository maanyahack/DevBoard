import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/features/auth/schemas';

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) });

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
