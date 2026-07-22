import { lazy, Suspense, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

const GlobalSearchModal = lazy(() => import('@/features/search/components/GlobalSearchModal'));

/**
 * The shell every protected page renders inside.
 * Owns the mobile sidebar open/close state; the page itself renders via <Outlet />.
 */
export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cursorInteractive, setCursorInteractive] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Don't hijack Ctrl+K when the user is typing in a form field.
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, [contenteditable]')) return;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reducedMotion) return;

    document.documentElement.classList.add('premium-cursor');

    function handlePointerMove(event: PointerEvent) {
      document.documentElement.style.setProperty('--cursor-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${event.clientY}px`);
      setCursorInteractive(Boolean((event.target as Element | null)?.closest('button,a,input,select,textarea,[data-cursor="interactive"]')));
    }

    window.addEventListener('pointermove', handlePointerMove);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.documentElement.classList.remove('premium-cursor', 'cursor-interactive');
      document.documentElement.style.removeProperty('--cursor-x');
      document.documentElement.style.removeProperty('--cursor-y');
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('cursor-interactive', cursorInteractive);
  }, [cursorInteractive]);

  return (
    <div className="premium-shell min-h-screen">
      <span className="premium-cursor-dot" aria-hidden="true" />
      <span className="premium-cursor-ring" aria-hidden="true" />
      <span className="premium-cursor-trail" aria-hidden="true" />
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
