'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useAppStore } from '@/stores/app';

interface MockGoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  disabled?: boolean;
}

export default function MockGoogleLoginButton({ 
  onSuccess, 
  onError, 
  disabled = false 
}: MockGoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithGoogle } = useAuthStore();
  const { addNotification } = useAppStore();

  const handleMockGoogleLogin = async () => {
    setIsLoading(true);
    
    try {
      // Simulate Google OAuth response with mock data
      const mockGoogleData = {
        token: `mock_google_token_${Date.now()}`,
        google_id: `mock_${Math.random().toString(36).substr(2, 9)}`,
        email: 'junzhou@umich.edu', // Use the email from the error
        name: 'Jun Zhou',
        picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c', // Mock avatar
      };
      
      console.log('Mock Google login with:', mockGoogleData);
      
      // Call our Google login function with mock data
      await loginWithGoogle(mockGoogleData);

      addNotification({
        type: 'success',
        title: 'Welcome!',
        message: `Successfully logged in with Google as ${mockGoogleData.name} (Mock Mode)`,
      });

      onSuccess?.();
    } catch (error: any) {
      console.error('Mock Google login failed:', error);
      
      addNotification({
        type: 'error',
        title: 'Login Failed',
        message: error.message || 'Failed to sign in with Google. Please try again.',
      });

      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-sm">
        <button
          onClick={handleMockGoogleLogin}
          disabled={disabled || isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {isLoading ? 'Signing in...' : 'Continue with Google (Mock)'}
        </button>
        
        {/* Development Notice */}
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500">
            🔬 Development Mode: Mock Google OAuth
          </p>
        </div>
      </div>
    </div>
  );
}