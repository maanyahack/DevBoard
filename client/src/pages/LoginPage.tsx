// Import React Hook Form — a library for managing form state, validation, and submission.
import { useForm } from 'react-hook-form';
// Import zodResolver — connects Zod schemas to React Hook Form for validation.
import { zodResolver } from '@hookform/resolvers/zod';
// Import useMutation — React Query hook for POST/PUT/DELETE operations (server state mutations).
import { useMutation } from '@tanstack/react-query';
// Import Link (navigation) and useNavigate (programmatic navigation).
import { Link, useNavigate } from 'react-router-dom';
// Import the auth context hook to access the signIn function.
import { useAuth } from '@/context/AuthContext';
// Import the auth layout component (centered card with brand logo).
import { AuthLayout } from '@/features/auth/components/AuthLayout';
// Import the reusable Button component.
import { Button } from '@/components/ui/Button';
// Import the reusable Input component with label/error support.
import { Input } from '@/components/ui/Input';
// Import the Zod schema for login validation and its inferred TypeScript type.
import { loginSchema, type LoginValues } from '@/features/auth/schemas';

/**
 * LoginPage — the login form page.
 *
 * Flow:
 * 1. User enters email and password
 * 2. Form validates against the Zod schema
 * 3. useMutation calls the signIn function from AuthContext
 * 4. On success, navigates to /dashboard
 * 5. On error, displays the error message
 */
export default function LoginPage() {
  // Get the signIn function from auth context — calls Supabase signInWithPassword.
  const { signIn } = useAuth();

  // useNavigate — programmatic navigation (e.g., redirect after login).
  const navigate = useNavigate();

  // Set up the form with React Hook Form.
  // 'resolver: zodResolver(loginSchema)' — use our Zod schema for validation.
  // 'register()' returns props to spread onto each input (onChange, onBlur, ref, etc.).
  // 'handleSubmit()' wraps the submit handler and validates before calling it.
  // 'errors' contains any validation error messages to display.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  // useMutation wraps the signIn call with loading/error/success states.
  // 'mutationFn: signIn' — the async function to call on form submit.
  // 'onSuccess' — runs after signIn completes successfully → navigate to dashboard.
  const mutation = useMutation({
    mutationFn: signIn,
    onSuccess: () => navigate('/dashboard', { replace: true }),  // 'replace' prevents back-button to login
  });

  return (
    // AuthLayout provides the centered card layout with logo and footer.
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to your DevBoard account"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-medium text-emerald-600 hover:text-emerald-700">
            Sign up
          </Link>
        </>
      }
    >
      {/* Form with validation and mutation submission.
        'noValidate' disables browser's built-in validation (we use Zod instead).
        'handleSubmit((values) => ...)' — validates first, then calls the callback with typed values. */}
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4" noValidate>
        <Input
          id="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}  // Show validation error if present
          {...register('email')}         // Register this input with React Hook Form
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
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Forgot password?
          </Link>
        </div>
        {/* Display server-side error (e.g., "Invalid email or password"). */}
        {mutation.isError && (
          <p className="text-sm text-red-500">{(mutation.error as Error).message}</p>
        )}
        {/* Submit button — shows spinner while mutation is in progress. */}
        <Button type="submit" isLoading={mutation.isPending} className="w-full">
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
}
