'use client';

import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '@/stores/auth';
import { useAppStore } from '@/stores/app';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  disabled?: boolean;
}

export default function GoogleLoginButton({ 
  onSuccess, 
  onError, 
  disabled = false 
}: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithGoogle } = useAuthStore();
  const { addNotification } = useAppStore();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    
    try {
      // Decode the JWT token to get user info
      const credential = credentialResponse.credential;
      const payload = JSON.parse(atob(credential.split('.')[1]));
      
      // Call our Google login function
      await loginWithGoogle({
        token: credential,
        google_id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      });

      addNotification({
        type: 'success',
        title: 'Welcome!',
        message: `Successfully logged in with Google as ${payload.name}`,
      });

      onSuccess?.();
    } catch (error: any) {
      console.error('Google login failed:', error);
      
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

  const handleGoogleError = () => {
    addNotification({
      type: 'error',
      title: 'Login Error',
      message: 'Google sign-in was cancelled or failed.',
    });

    onError?.('Google sign-in cancelled');
  };

  if (disabled || isLoading) {
    return (
      <div className="flex justify-center">
        <div className="w-full max-w-sm">
          <button
            disabled
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg font-medium text-gray-400 cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={false}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        logo_alignment="left"
        width="384"
      />
    </div>
  );
}