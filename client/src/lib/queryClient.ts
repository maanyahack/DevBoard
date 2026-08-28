// Import QueryClient — the core class of TanStack React Query.
// It manages the cache, retries, and refetching behavior for all queries in the app.
import { QueryClient } from '@tanstack/react-query';

// Create and export a shared QueryClient instance.
// This singleton is provided to the entire app via QueryClientProvider in main.tsx.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 'retry: 1' — if a query fails (network error, 5xx), retry once before showing error.
      // Prevents transient network glitches from immediately showing error states.
      retry: 1,

      // 'refetchOnWindowFocus: false' — don't automatically refetch data when the user
      // switches back to the browser tab. Some apps want this (real-time data), but
      // for DevBoard it would cause unnecessary API calls.
      refetchOnWindowFocus: false,

      // 'staleTime: 30_000' (30 seconds) — cached data is considered "fresh" for 30 seconds.
      // During this window, React Query returns cached data without refetching.
      // After 30 seconds, the next time the component using this query renders,
      // React Query will refetch in the background while showing cached data.
      // This prevents rapid re-fetching when navigating between pages.
      staleTime: 30_000,
    },
  },
});
