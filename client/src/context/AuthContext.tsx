// Import React hooks and types for context creation.
// useMemo — caches the computed context value to avoid unnecessary re-renders.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
// Import Supabase types — Session (contains the JWT + user) and User (the user object).
import type { Session, User } from '@supabase/supabase-js';
// Import the Supabase client configured for the browser (uses the anon key).
import { supabase } from '@/lib/supabase';

// Interface — defines the parameters for the signUp function.
// Using a named interface makes the function signature readable.
interface SignUpParams {
  email: string;
  password: string;
  displayName: string;  // The user's display name (stored in Supabase user metadata)
}

// Interface — defines the parameters for the updateProfile function.
interface UpdateProfileParams {
  displayName: string;
  avatarUrl: string;
}

/**
 * Interface — defines the shape of data provided by AuthContext.
 * Every component calling useAuth() gets these properties and methods:
 * - session/user: the current authentication state
 * - isLoading: whether the initial session check is still in progress
 * - signIn/signUp/signOut: authentication actions
 * - sendPasswordReset/updatePassword: password management
 * - updateProfile: user profile updates
 */
interface AuthContextValue {
  session: Session | null;    // The full Supabase session (contains user + JWT tokens)
  user: User | null;          // Shortcut to the user object (null if not logged in)
  isLoading: boolean;         // True while checking for an existing session on app load
  signUp: (params: SignUpParams) => Promise<{ needsEmailConfirmation: boolean }>;
  signIn: (params: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (params: UpdateProfileParams) => Promise<void>;
}

// Create the context with undefined as default (forces use of the hook pattern).
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * AuthProvider — the authentication context provider.
 *
 * This is the "brain" of authentication in the app. It:
 * 1. Checks for an existing session when the app first loads
 * 2. Listens for auth state changes (login, logout, token refresh)
 * 3. Exposes auth actions (sign in, sign up, sign out, etc.)
 * 4. Keeps React state in sync with Supabase's auth state
 *
 * Supabase is the source of truth for auth state — this provider
 * just mirrors it into React state so components can react to changes.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // 'session' holds the current Supabase session (JWT + user data).
  // Starts as null until we check for an existing session.
  const [session, setSession] = useState<Session | null>(null);

  // 'isLoading' prevents flashing the login page while checking for a session.
  // Starts as true — we don't know the auth state yet.
  const [isLoading, setIsLoading] = useState(true);

  // This effect runs once on mount (empty dependency array []).
  useEffect(() => {
    // STEP 1: Check if the user already has a valid session (from localStorage).
    // This handles the "persistent login" case — user refreshed the page or
    // opened the app in a new tab. Supabase stores the session in localStorage
    // by default (because we set persistSession: true in supabase.ts).
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);  // session is null if not logged in
      setIsLoading(false);        // We're done loading — either logged in or not
    });

    // STEP 2: Subscribe to future auth state changes.
    // 'onAuthStateChange' fires whenever:
    // - User logs in (SIGNED_IN event)
    // - User logs out (SIGNED_OUT event)
    // - JWT token is refreshed (TOKEN_REFRESHED event)
    // - User updates their profile (USER_UPDATED event)
    // - Initial session is loaded (INITIAL_SESSION event)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      // Update the session state whenever anything changes.
      // '_event' is prefixed with _ because we don't need the event type —
      // just the new session is enough.
      setSession(newSession);
    });

    // Cleanup function — runs when the AuthProvider unmounts (app closes).
    // Unsubscribes from auth changes to prevent memory leaks.
    return () => subscription.unsubscribe();
  }, []);  // Empty array = run once on mount, never re-run

  /**
   * useMemo — caches the context value object.
   * Without useMemo, a new object would be created on every render,
   * causing all consuming components to re-render unnecessarily.
   * The value only changes when 'session' or 'isLoading' changes.
   */
  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      // 'session?.user ?? null' — optional chaining + nullish coalescing:
      // If session exists, get session.user; if session is null, use null.
      user: session?.user ?? null,
      isLoading,

      /**
       * signUp — creates a new user account with Supabase Auth.
       * Returns whether email confirmation is required (depends on Supabase project settings).
       */
      async signUp({ email, password, displayName }) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          // 'options.data' stores custom fields in the user's metadata.
          // This is how we associate a display name with the account.
          options: { data: { display_name: displayName } },
        });
        if (error) throw error;  // Propagate errors to the calling component
        // If data.session is null, the project requires email confirmation.
        // The user must click a link in their email before they can log in.
        return { needsEmailConfirmation: !data.session };
      },

      /**
       * signIn — authenticates an existing user with email and password.
       * On success, Supabase stores the session in localStorage automatically,
       * and onAuthStateChange fires, updating our React state.
       */
      async signIn({ email, password }) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },

      /**
       * signOut — logs the user out.
       * Clears the session from localStorage and fires onAuthStateChange
       * with null, which sets our session state to null.
       */
      async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },

      /**
       * sendPasswordReset — sends a password reset email.
       * The link in the email points to /reset-password in our app,
       * which handles the actual password update.
       */
      async sendPasswordReset(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
      },

      /**
       * updatePassword — changes the user's password.
       * This is called from the ResetPasswordPage after the user
       * clicks the link in their email.
       */
      async updatePassword(newPassword) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
      },

      /**
       * updateProfile — saves display name and avatar URL to the user's metadata.
       * Supabase stores this in the user_metadata field of the auth.users table.
       * After the update, onAuthStateChange fires with a USER_UPDATED event,
       * which automatically refreshes our session state.
       */
      async updateProfile({ displayName, avatarUrl }) {
        const { error } = await supabase.auth.updateUser({
          // 'data' merges with existing user_metadata (doesn't overwrite other fields).
          data: { display_name: displayName, avatar_url: avatarUrl },
        });
        if (error) throw error;
      },
    }),
    [session, isLoading],  // Only recreate the value when session or isLoading changes
  );

  // Provide the auth state and actions to all descendant components.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth — custom hook to access the auth context.
 * Every component that needs user info or auth actions uses this hook.
 * Throws a clear error if used outside AuthProvider (development safety).
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
