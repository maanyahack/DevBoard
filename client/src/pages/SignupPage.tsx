// Import React Hook Form + Zod resolver for form validation.
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// Import useMutation for the signup API call.
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
// Import signup schema (validates email, password, confirmPassword, displayName).
import { signupSchema, type SignupValues } from '@/features/auth/schemas';

/**
 * SignupPage — the registration form page.
 *
 * Flow:
 * 1. User fills in display name, email, password, confirm password
 * 2. Zod validates the form (passwords must match, min length, etc.)
 * 3. useMutation calls signUp from AuthContext (which calls Supabase auth.signUp)
 * 4. If email confirmation is required → shows a "check your email" message
 * 5. If auto-confirm → navigates directly to /dashboard
 */
export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Set up the form with the signup Zod schema for validation.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  // Mutation wraps the signUp call.
  // The mutationFn transforms the form values to match AuthContext's signUp params.
  const mutation = useMutation({
    mutationFn: (values: SignupValues) =>
      signUp({ email: values.email, password: values.password, displayName: values.displayName }),
    onSuccess: (result) => {
      // If no email confirmation needed, go straight to dashboard.
      if (!result.needsEmailConfirmation) {
        navigate('/dashboard', { replace: true });
      }
    },
  });

  // Determine if we should show the "check your email" confirmation message.
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
        // Success message — user needs to confirm their email before logging in.
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
