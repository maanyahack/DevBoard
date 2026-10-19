// Import React Router components for defining routes.
// Routes — container for all route definitions (like a switch statement for URLs).
// Route — defines a single URL → component mapping.
// Navigate — component that triggers a redirect when rendered.
import { Routes, Route, Navigate } from 'react-router-dom';

// Import all page components — each represents a full page in the app.
import LandingPage from '@/pages/LandingPage';           // Public landing/marketing page
import LoginPage from '@/pages/LoginPage';               // User login
import SignupPage from '@/pages/SignupPage';             // User registration
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';  // Password reset request
import ResetPasswordPage from '@/pages/ResetPasswordPage';    // Password reset form
import DashboardPage from '@/pages/DashboardPage';       // Main dashboard (stats, recent items)
import NotesPage from '@/pages/NotesPage';               // Notes CRUD interface
import ProjectsPage from '@/pages/ProjectsPage';         // Projects CRUD interface
import TasksPage from '@/pages/TasksPage';               // Tasks Kanban board
import ProfilePage from '@/pages/ProfilePage';           // User profile editor
import SettingsPage from '@/pages/SettingsPage';         // App settings

// Import placeholder component for features not yet built.
import ModulePlaceholder from '@/pages/ModulePlaceholder';

// Import layout components.
import { DashboardLayout } from '@/components/layout/DashboardLayout';  // Sidebar + Navbar shell
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';          // Catches render errors

// Import route guards — control access based on auth state.
import { ProtectedRoute } from '@/routes/ProtectedRoute';    // Requires login
import { PublicOnlyRoute } from '@/routes/PublicOnlyRoute';  // Redirects if already logged in

/**
 * AppRouter — defines all page routes in the application.
 *
 * Route structure:
 * 1. Public routes (/, /login, /signup, /forgot-password) — anyone can access
 * 2. Reset password route — special case (authenticated session but unguarded)
 * 3. Protected routes (/dashboard, /notes, /tasks, etc.) — require login
 * 4. Fallback route (*) — redirects unknown URLs to the landing page
 */
export function AppRouter() {
  return (
    // <Routes> is the container — React Router picks the first matching <Route>.
    <Routes>
      {/* ============================================
          PUBLIC ROUTES — accessible by anyone
          ============================================ */}

      {/* "/" — the landing/marketing page. */}
      <Route
        path="/"
        element={
          // ErrorBoundary catches any rendering errors in the landing page
          // and shows a fallback UI instead of crashing the whole app.
          <ErrorBoundary label="Landing Page">
            <LandingPage />
          </ErrorBoundary>
        }
      />

      {/* "/login" — login page. Wrapped in PublicOnlyRoute so logged-in
          users get redirected to /dashboard instead. */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />

      {/* "/signup" — registration page. Also wrapped in PublicOnlyRoute. */}
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <SignupPage />
          </PublicOnlyRoute>
        }
      />

      {/* "/forgot-password" — password reset request form. */}
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        }
      />

      {/* "/reset-password" — the form users see after clicking the email link.
          This route is NOT guarded because the recovery session is technically
          "authenticated" but the user is in a special state (just reset link clicked). */}
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* ============================================
          PROTECTED ROUTES — require authentication
          ============================================ */}

      {/* This <Route> has no 'path' — it's a "layout route."
          Its 'element' wraps ALL child routes. Every child route
          renders inside the DashboardLayout (sidebar + navbar) AND
          is wrapped by ProtectedRoute (redirects to /login if not authenticated). */}
      <Route
        element={
          <ProtectedRoute>
            <ErrorBoundary label="App">
              <DashboardLayout />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      >
        {/* These are nested routes — they render INSIDE DashboardLayout's <Outlet>. */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/projects" element={<ProjectsPage />} />

        {/* Placeholder routes for features that aren't built yet.
            They show a "coming soon" message instead of real functionality. */}
        <Route path="/bookmarks" element={<ModulePlaceholder title="Bookmarks" />} />
        <Route path="/knowledge" element={<ModulePlaceholder title="Knowledge Vault" />} />
        <Route path="/snippets" element={<ModulePlaceholder title="Snippets" />} />

        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* ============================================
          FALLBACK — catch-all for unknown URLs
          ============================================ */}

      {/* If no route above matches, redirect to the landing page.
          'replace' prevents the 404 URL from appearing in browser history. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
