// Import the AppRouter component — it defines all page routes in the app.
// '@/routes/AppRouter' uses a path alias (configured in tsconfig/vite)
// that resolves to 'src/routes/AppRouter'.
import { AppRouter } from '@/routes/AppRouter';

/**
 * App — the root component of the application.
 *
 * This is the simplest possible component — it just renders the router.
 * All the actual UI is defined in the page components referenced by AppRouter.
 *
 * This pattern is common in React apps: the root component is a thin shell,
 * and the router handles which page to display based on the current URL.
 */
export default function App() {
  return <AppRouter />;
}
