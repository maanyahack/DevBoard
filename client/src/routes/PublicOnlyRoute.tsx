import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { FullPageSpinner } from '@/components/ui/FullPageSpinner';

/** Keeps already-authenticated users out of login/signup, sending them to the app. */
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <FullPageSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
