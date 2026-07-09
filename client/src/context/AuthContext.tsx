import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface SignUpParams {
  email: string;
  password: string;
  displayName: string;
}

interface UpdateProfileParams {
  displayName: string;
  avatarUrl: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signUp: (params: SignUpParams) => Promise<{ needsEmailConfirmation: boolean }>;
  signIn: (params: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (params: UpdateProfileParams) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Owns global authentication state. Supabase is the source of truth; this
 * provider mirrors its session into React and exposes the auth actions.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1) Restore any existing session on first load -> persistent login.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    // 2) Stay in sync with every future change: login, logout, token refresh.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      async signUp({ email, password, displayName }) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName } },
        });
        if (error) throw error;
        // No session means the project requires email confirmation.
        return { needsEmailConfirmation: !data.session };
      },
      async signIn({ email, password }) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
      async sendPasswordReset(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
      },
      async updatePassword(newPassword) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
      },
      async updateProfile({ displayName, avatarUrl }) {
        // Persist profile fields into the auth user's metadata. Supabase
        // returns the updated user, and onAuthStateChange fires a USER_UPDATED
        // event, so our session state refreshes automatically.
        const { error } = await supabase.auth.updateUser({
          data: { display_name: displayName, avatar_url: avatarUrl },
        });
        if (error) throw error;
      },
    }),
    [session, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
