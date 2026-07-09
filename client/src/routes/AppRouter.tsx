import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import DashboardPage from '@/pages/DashboardPage';
import NotesPage from '@/pages/NotesPage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import ModulePlaceholder from '@/pages/ModulePlaceholder';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { PublicOnlyRoute } from '@/routes/PublicOnlyRoute';

export function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <SignupPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        }
      />
      {/* Recovery session is "authenticated", so this stays unguarded. */}
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected app — everything renders inside the dashboard shell */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/tasks" element={<ModulePlaceholder title="Tasks" />} />
        <Route path="/projects" element={<ModulePlaceholder title="Projects" />} />
        <Route path="/bookmarks" element={<ModulePlaceholder title="Bookmarks" />} />
        <Route path="/knowledge" element={<ModulePlaceholder title="Knowledge Vault" />} />
        <Route path="/snippets" element={<ModulePlaceholder title="Snippets" />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
