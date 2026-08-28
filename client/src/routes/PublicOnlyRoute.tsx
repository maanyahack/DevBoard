// Import ReactNode type.
import type { ReactNode } from 'react';
// Import Navigate for redirects.
import { Navigate } from 'react-router-dom';
// Import useAuth to check if the user is already logged in.
import { useAuth } from '@/context/AuthContext';
// Import the loading spinner.
import { FullPageSpinner } from '@/components/ui/FullPageSpinner';

/**
 * PublicOnlyRoute — the opposite of ProtectedRoute.
 *
 * It keeps already-authenticated users OUT of public pages like login/signup.
 * If a logged-in user tries to visit /login, they get redirected to /dashboard.
 *
 * This prevents confusion: why would a logged-in user need to log in again?
 */
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  // While loading, show the spinner.
  if (isLoading) return <FullPageSpinner />;

  // If the user IS logged in, redirect them to the dashboard.
  // They don't need to see the login/signup pages.
  if (user) return <Navigate to="/dashboard" replace />;

  // User is NOT logged in — let them see the public page (login, signup, etc.).
  return <>{children}</>;
}
