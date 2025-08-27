'use client';

import { useState, useEffect } from 'react';
import GoogleAuthProvider from '@/providers/GoogleOAuthProvider';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import MockGoogleLoginButton from '@/components/auth/MockGoogleLoginButton';
import { isGoogleOAuthConfigured, shouldUseMockOAuth, shouldUseRealGoogleOAuth } from '@/config/google-oauth';

interface GoogleOAuthManagerProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  disabled?: boolean;
}

export default function GoogleOAuthManager({ 
  onSuccess, 
  onError, 
  disabled = false 
}: GoogleOAuthManagerProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [oauthMode, setOauthMode] = useState<'real' | 'mock' | 'none'>('none');

  useEffect(() => {
    // Determine OAuth mode on client side
    if (shouldUseRealGoogleOAuth()) {
      setOauthMode('real');
    } else if (shouldUseMockOAuth()) {
      setOauthMode('mock');
    } else {
      setOauthMode('none');
    }
  }, []);

  if (!isGoogleOAuthConfigured()) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500 mb-2">
          Google OAuth not configured
        </p>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Show setup instructions
        </button>
        {showConfig && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg text-left">
            <h4 className="font-medium text-sm mb-2">Quick Setup:</h4>
            <ol className="text-xs text-gray-700 space-y-1">
              <li>1. Go to <a href="https://console.cloud.google.com/" target="_blank" className="text-blue-600">Google Cloud Console</a></li>
              <li>2. Create OAuth 2.0 Client ID</li>
              <li>3. Add these origins: http://127.0.0.1:3002</li>
              <li>4. Copy Client ID to .env.local</li>
              <li>5. See REAL_GOOGLE_OAUTH_SETUP.md for details</li>
            </ol>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {oauthMode === 'real' && (
        <GoogleAuthProvider>
          <div className="space-y-2">
            <GoogleLoginButton 
              onSuccess={onSuccess}
              onError={onError}
              disabled={disabled}
            />
            <div className="text-center">
              <p className="text-xs text-green-600">
                ✅ Real Google OAuth Active
              </p>
            </div>
          </div>
        </GoogleAuthProvider>
      )}

      {oauthMode === 'mock' && (
        <div className="space-y-2">
          <MockGoogleLoginButton 
            onSuccess={onSuccess}
            onError={onError}
            disabled={disabled}
          />
          <div className="text-center">
            <p className="text-xs text-blue-600">
              🔬 Development Mock OAuth
            </p>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Switch to real OAuth?
            </button>
          </div>
          {showConfig && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg text-left">
              <h4 className="font-medium text-sm mb-2">Switch to Real OAuth:</h4>
              <p className="text-xs text-gray-700 mb-2">
                Follow the setup guide in <code>REAL_GOOGLE_OAUTH_SETUP.md</code>
              </p>
              <p className="text-xs text-gray-600">
                Current: <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}</code>
              </p>
            </div>
          )}
        </div>
      )}

      {oauthMode === 'none' && (
        <div className="text-center py-4">
          <p className="text-sm text-red-600">
            Google OAuth configuration error
          </p>
        </div>
      )}
    </div>
  );
}