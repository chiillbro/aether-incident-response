// frontend/src/app/providers.tsx
'use client'; // This must be a Client Component

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
// Import React Query Provider if you set it up separately
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// const queryClient = new QueryClient(); // Or instantiate where appropriate

interface ProvidersProps {
  children: ReactNode;
  // You might pass the session from the root layout if using SSR session fetching
  // session?: Session | null;
}

export function Providers({ children }: ProvidersProps) {
  return (
    // <QueryClientProvider client={queryClient}>
      <SessionProvider>
        {/* SessionProvider requires session prop if you pre-fetch session on server */}
        {children}
      </SessionProvider>
    // </QueryClientProvider>
  );
}