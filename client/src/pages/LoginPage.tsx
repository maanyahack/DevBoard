import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { loginSchema, type LoginValues } from '@/features/auth/schemas';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: signIn,
    onSuccess: () => navigate('/dashboard', { replace: true }),
  });

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to your DevBoard account"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-700">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4" noValidate>
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
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Forgot password?
          </Link>
        </div>
        {mutation.isError && (
          <p className="text-sm text-red-500">{(mutation.error as Error).message}</p>
        )}
        <Button type="submit" isLoading={mutation.isPending} className="w-full">
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
}
