// frontend/src/lib/react-query.ts
import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global default options
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false, // Optional: disable refetch on window focus
      retry: 1, // Retry failed requests once
    },
  },
});