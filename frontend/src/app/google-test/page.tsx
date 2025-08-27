'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { shouldUseMockOAuth, shouldUseRealGoogleOAuth, isGoogleOAuthConfigured, getOAuthStatus } from '@/config/google-oauth';
import MockGoogleLoginButton from '@/components/auth/MockGoogleLoginButton';

export default function GoogleTestPage() {
  const { user, isAuthenticated, loginWithGoogle } = useAuthStore();
  const [testResult, setTestResult] = useState<string>('');
  const [oauthStatus, setOauthStatus] = useState<any>(null);

  // Get OAuth status on component mount
  useState(() => {
    setOauthStatus(getOAuthStatus());
  });

  const testDirectGoogleLogin = async () => {
    try {
      const mockData = {
        token: 'test_token_123',
        google_id: 'test_google_id',
        email: 'junzhou@umich.edu',
        name: 'Jun Zhou (Test)',
        picture: 'https://example.com/avatar.jpg',
      };

      await loginWithGoogle(mockData);
      setTestResult('✅ Direct Google login successful!');
    } catch (error: any) {
      setTestResult(`❌ Direct Google login failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Google OAuth Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Configuration Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Configuration Status</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Environment:</span>
                <span className="font-mono">{process.env.NODE_ENV}</span>
              </div>
              <div className="flex justify-between">
                <span>Client ID:</span>
                <span className="font-mono text-xs">{process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span>OAuth Configured:</span>
                <span className={isGoogleOAuthConfigured() ? 'text-green-600' : 'text-red-600'}>
                  {isGoogleOAuthConfigured() ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Should Use Mock:</span>
                <span className={shouldUseMockOAuth() ? 'text-blue-600' : 'text-gray-600'}>
                  {shouldUseMockOAuth() ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Should Use Real:</span>
                <span className={shouldUseRealGoogleOAuth() ? 'text-green-600' : 'text-gray-600'}>
                  {shouldUseRealGoogleOAuth() ? '✅ Yes' : '❌ No'}
                </span>
              </div>
            </div>
          </div>

          {/* User Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Current User Status</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Authenticated:</span>
                <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                  {isAuthenticated ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              {user && (
                <>
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <span>{user.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span>{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Provider:</span>
                    <span>{(user as any).provider || 'standard'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Test Google OAuth</h2>
          
          <div className="space-y-4">
            {/* Mock Google Login Button */}
            <div>
              <h3 className="text-lg font-medium mb-2">Mock Google Login Button</h3>
              <MockGoogleLoginButton 
                onSuccess={() => setTestResult('✅ Mock Google login successful!')}
                onError={(error) => setTestResult(`❌ Mock Google login failed: ${error}`)}
              />
            </div>

            {/* Direct API Test */}
            <div>
              <h3 className="text-lg font-medium mb-2">Direct API Test</h3>
              <button
                onClick={testDirectGoogleLogin}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Test Direct Google Login API
              </button>
            </div>

            {/* Test Result */}
            {testResult && (
              <div className="p-4 bg-gray-100 rounded-lg">
                <h4 className="font-medium mb-2">Test Result:</h4>
                <p className="text-sm font-mono">{testResult}</p>
              </div>
            )}
          </div>
        </div>

        {/* API Test */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">API Endpoints</h2>
          <div className="space-y-2 text-sm font-mono">
            <div>POST /auth/google/login - Google OAuth login</div>
            <div>GET /auth/google/callback - OAuth callback</div>
          </div>
        </div>
      </div>
    </div>
  );
}