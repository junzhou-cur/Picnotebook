'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Immediate redirect on component mount
  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
    
    if (token && isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router, isAuthenticated]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lab-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}