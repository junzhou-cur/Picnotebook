'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: (failureCount, error: any) => {
              // Don't retry on 401/403 errors
              if (error?.status === 401 || error?.status === 403) {
                return false;
              }
              return failureCount < 2;
            },
          },
        },
      })
  );

  // Hydrate Zustand store on client side
  useEffect(() => {
    useAuthStore.persist.rehydrate();
    
    // Force auth check after hydration
    const checkAuth = () => {
      const token = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('currentUser');
      
      if (token && storedUser) {
        try {
          const user = JSON.parse(storedUser);
          useAuthStore.getState().setUser(user);
        } catch (e) {
          console.error('Error parsing stored user:', e);
          localStorage.removeItem('currentUser');
        }
      }
    };
    
    checkAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}