import { lazy, Suspense, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

// lazy is used to load component only when needed
const GlobalSearchModal = lazy(() => import('@/features/search/components/GlobalSearchModal'));

/**
 * The shell every protected page renders inside.
 * Owns the mobile sidebar open/close state; the page itself renders via <Outlet />.
 */
export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Don't hijack Ctrl+K when the user is typing in a form field.
      const target = event.target as HTMLElement | null;
      // if user is inside the input area dont activate global search
      // ?. prevents null error
      if (target?.closest('input, textarea, [contenteditable]')) return;
      // if cmd or control key is pressed
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="premium-shell min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Navbar onMenuClick={() => setSidebarOpen(true)} onSearchOpen={() => setSearchOpen(true)} />
        <main className="page-enter mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Outlet />
        </main>
      </div>
      <Suspense fallback={null}>
        <GlobalSearchModal
          isOpen={searchOpen}
          accessToken={session?.access_token}
          onClose={() => setSearchOpen(false)}
        />
      </Suspense>
    </div>
  );
}
