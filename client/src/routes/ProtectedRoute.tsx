// Import ReactNode type — represents anything React can render.
import type { ReactNode } from 'react';
// Import Navigate — a React Router component that redirects to a different URL.
import { Navigate } from 'react-router-dom';
// Import the useAuth hook to access the current user and loading state.
import { useAuth } from '@/context/AuthContext';
// Import a full-page loading spinner shown while checking the session.
import { FullPageSpinner } from '@/components/ui/FullPageSpinner';

/**
 * ProtectedRoute — a route guard that wraps authenticated-only pages.
 *
 * It has three states:
 * 1. Loading: shows a spinner while checking if the user is logged in
 * 2. Not authenticated: redirects to /login
 * 3. Authenticated: renders the children (the actual page)
 *
 * This prevents unauthenticated users from accessing dashboard pages.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  // Get the current user and loading state from the auth context.
  const { user, isLoading } = useAuth();

  // While loading, show a spinner. This prevents a flash of the login page
  // when the app first loads and is checking for an existing session.
  if (isLoading) return <FullPageSpinner />;

  // If no user is logged in, redirect to the login page.
  // 'replace' replaces the current history entry (so the user can't
  // click "back" to get to the protected page).
  if (!user) return <Navigate to="/login" replace />;

  // User is authenticated — render the protected content.
  return <>{children}</>;
}
