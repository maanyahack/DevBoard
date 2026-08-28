import { QueryClient } from '@tanstack/react-query';

// this is a shared query client for the whole app
// this is used to make requests to the backend
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, //retry only once if the request fails
      refetchOnWindowFocus: false, //do not refetch when the window regains focus
      staleTime: 30_000, //refetch after 30 seconds
    },
  },
});
