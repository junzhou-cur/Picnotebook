'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Require both token AND authentication state
    const token = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
    
    if (!token || !isAuthenticated) {
      router.replace('/login');
      return;
    }
    
    setIsLoading(false);
  }, [isAuthenticated, router]);

  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-lab-primary" />
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Only render children if properly authenticated
  const token = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
  
  if (!token || !isAuthenticated) {
    router.replace('/login');
    return null;
  }

  return <>{children}</>;
}