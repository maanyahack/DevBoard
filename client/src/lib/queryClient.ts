import { QueryClient } from '@tanstack/react-query';

/** One shared TanStack Query client for the whole app. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});
