// Google OAuth Configuration for PicNotebook

export const GOOGLE_OAUTH_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/auth/google/callback` : '',
  scopes: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ],
  responseType: 'code',
  prompt: 'select_account',
};

export const GOOGLE_OAUTH_ENDPOINTS = {
  auth: 'https://accounts.google.com/o/oauth2/v2/auth',
  token: 'https://oauth2.googleapis.com/token',
  userInfo: 'https://www.googleapis.com/oauth2/v2/userinfo',
};

// Helper function to generate Google OAuth URL
export function getGoogleOAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CONFIG.clientId,
    redirect_uri: GOOGLE_OAUTH_CONFIG.redirectUri,
    scope: GOOGLE_OAUTH_CONFIG.scopes.join(' '),
    response_type: GOOGLE_OAUTH_CONFIG.responseType,
    prompt: GOOGLE_OAUTH_CONFIG.prompt,
    access_type: 'offline',
  });

  return `${GOOGLE_OAUTH_ENDPOINTS.auth}?${params.toString()}`;
}

// Validate Google OAuth configuration
export function isGoogleOAuthConfigured(): boolean {
  return Boolean(GOOGLE_OAUTH_CONFIG.clientId && 
    GOOGLE_OAUTH_CONFIG.clientId !== 'your-google-oauth-client-id.apps.googleusercontent.com' &&
    GOOGLE_OAUTH_CONFIG.clientId.trim() !== '');
}

// Check if using demo/mock client ID
export function isUsingDemoClientId(): boolean {
  return GOOGLE_OAUTH_CONFIG.clientId.includes('demo-client-id') || 
         GOOGLE_OAUTH_CONFIG.clientId === 'your-google-oauth-client-id.apps.googleusercontent.com';
}

// Check if using real Google client ID
export function isUsingRealClientId(): boolean {
  return GOOGLE_OAUTH_CONFIG.clientId.endsWith('.apps.googleusercontent.com') && 
         !isUsingDemoClientId() &&
         GOOGLE_OAUTH_CONFIG.clientId.length > 50; // Real client IDs are long
}

// Check if we're in development mode and should use mock OAuth
export function shouldUseMockOAuth(): boolean {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  return isDevelopment && isLocalhost && isUsingDemoClientId();
}

// Check if real Google OAuth should be used
export function shouldUseRealGoogleOAuth(): boolean {
  return isGoogleOAuthConfigured() && isUsingRealClientId() && !shouldUseMockOAuth();
}

// Get configuration status for debugging
export function getOAuthStatus() {
  return {
    clientId: GOOGLE_OAUTH_CONFIG.clientId,
    isConfigured: isGoogleOAuthConfigured(),
    isDemoId: isUsingDemoClientId(),
    isRealId: isUsingRealClientId(),
    shouldUseMock: shouldUseMockOAuth(),
    shouldUseReal: shouldUseRealGoogleOAuth(),
    environment: process.env.NODE_ENV,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'server'
  };
}