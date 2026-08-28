// Import React's StrictMode — enables extra development-time warnings
// and checks for deprecated APIs, unsafe side effects, etc.
// It only runs in development, not in production builds.
import { StrictMode } from 'react';

// Import createRoot — the React 18+ way to render an app into the DOM.
// React 18 replaced ReactDOM.render() with createRoot() for concurrent features.
import { createRoot } from 'react-dom/client';

// Import QueryClientProvider — the React Query context provider.
// It wraps the app so any component can use useQuery/useMutation hooks
// to fetch and cache server data automatically.
import { QueryClientProvider } from '@tanstack/react-query';

// Import BrowserRouter — React Router's context provider for client-side routing.
// It enables URL-based navigation (e.g., /dashboard, /notes, /login)
// without full page reloads — it's a Single Page Application (SPA).
import { BrowserRouter } from 'react-router-dom';

// Import the root App component — the main component that contains the router.
import App from './App.tsx';

// Import the AuthProvider — React context that manages authentication state.
// It wraps the app so any component can access the current user, login, logout, etc.
import { AuthProvider } from '@/context/AuthContext';

// Import the ThemeProvider — React context that manages light/dark theme.
import { ThemeProvider } from '@/context/ThemeContext';

// Import the shared QueryClient instance configured with app-wide defaults.
import { queryClient } from '@/lib/queryClient';

// Import global CSS styles (Tailwind CSS + custom styles).
import './index.css';

// Find the root DOM element where React will mount the app.
// This corresponds to <div id="root"> in index.html.
const rootElement = document.getElementById('root');
// Safety check — if the root element doesn't exist, the app can't render.
if (!rootElement) {
  throw new Error('Root element #root not found in index.html');
}

// Create the React root and render the app.
// The component tree (providers wrapping the app) determines what data
// and features are available throughout the app. Order matters:
//
// StrictMode (outermost) — dev-only checks for the entire tree
//   └─ QueryClientProvider — makes React Query available to all components
//       └─ BrowserRouter — makes routing available to all components
//           └─ ThemeProvider — makes theme state available to all components
//               └─ AuthProvider — makes auth state available to all components
//                   └─ App — the actual application with all pages/routes
//
// AuthProvider is innermost because it might need access to other providers.
createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
