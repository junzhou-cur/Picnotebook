'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from './Navigation';
import { LoadingSpinner } from '../ui';
import { authService } from '../../services';
import { User } from '../../types/api';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  requireAuth = false 
}) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
    
    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Auth check timeout, forcing redirect to login');
        setLoading(false);
        router.push('/login');
      }
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [requireAuth, loading, router]);

  const checkAuthStatus = async () => {
    if (!requireAuth) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if we have stored user from login first (simplest check)
      const storedUser = localStorage.getItem('currentUser');
      const storedToken = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      
      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('Found stored user:', parsedUser.first_name, parsedUser.last_name);
          setUser(parsedUser);
          setLoading(false);
          return;
        } catch (parseErr) {
          console.log('Failed to parse stored user data, clearing...');
          localStorage.removeItem('currentUser');
          localStorage.removeItem('authToken');
        }
      }
      
      // If no stored user/token, redirect to login
      console.log('No valid authentication found, redirecting to login');
      setLoading(false);
      router.push('/login');
      
    } catch (err: any) {
      console.error('Auth check failed:', err);
      setError(err.message);
      setLoading(false);
      router.push('/login');
    }
  };

  // Show loading spinner while checking authentication
  if (loading && requireAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && requireAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="h-12 w-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {requireAuth && (
        <Navigation 
          currentUser={user ? {
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
          } : undefined}
        />
      )}
      
      <main className={requireAuth ? 'pb-8' : ''}>
        {requireAuth ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        ) : (
          children
        )}
      </main>

      {/* Footer for non-authenticated pages */}
      {!requireAuth && (
        <footer className="bg-gray-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="ml-2 text-xl font-bold">PicNotebook</span>
                </div>
                <p className="text-gray-300 mb-4">
                  The modern laboratory notebook for researchers. Organize projects, track experiments, and document your scientific journey with advanced OCR and collaboration features.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Features</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>Advanced OCR</li>
                  <li>Project Management</li>
                  <li>Experiment Tracking</li>
                  <li>File Management</li>
                  <li>Team Collaboration</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-gray-300">
                  <li><a href="/docs" className="hover:text-white">Documentation</a></li>
                  <li><a href="/help" className="hover:text-white">Help Center</a></li>
                  <li><a href="/contact" className="hover:text-white">Contact Us</a></li>
                  <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 PicNotebook. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};