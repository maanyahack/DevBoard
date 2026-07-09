import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

/**
 * The shell every protected page renders inside.
 * Owns the mobile sidebar open/close state; the page itself renders via <Outlet />.
 */
export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
