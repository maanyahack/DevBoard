import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { FullPageSpinner } from '@/components/ui/FullPageSpinner';

/** Renders children only for authenticated users; otherwise redirects to login. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  // Wait for the session check so we don't flash the login page on refresh.
  if (isLoading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
