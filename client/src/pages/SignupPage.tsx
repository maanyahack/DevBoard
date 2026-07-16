import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { signupSchema, type SignupValues } from '@/features/auth/schemas';

export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  const mutation = useMutation({
    mutationFn: (values: SignupValues) =>
      signUp({ email: values.email, password: values.password, displayName: values.displayName }),
    onSuccess: (result) => {
      if (!result.needsEmailConfirmation) {
        navigate('/dashboard', { replace: true });
      }
    },
  });

  const awaitingConfirmation = mutation.isSuccess && mutation.data?.needsEmailConfirmation;

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start organizing your developer workflow"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-700">
            Log in
          </Link>
        </>
      }
    >
      {awaitingConfirmation ? (
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Account created. Check your email to confirm your address, then log in.
        </div>
      ) : (
        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="space-y-4"
          noValidate
        >
          <Input
            id="displayName"
            label="Display name"
            placeholder="Ada Lovelace"
            autoComplete="name"
            error={errors.displayName?.message}
            {...register('displayName')}
          />
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            id="confirmPassword"
            type="password"
            label="Confirm password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          {mutation.isError && (
            <p className="text-sm text-red-500">{(mutation.error as Error).message}</p>
          )}
          <Button type="submit" isLoading={mutation.isPending} className="w-full">
            Create account
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
