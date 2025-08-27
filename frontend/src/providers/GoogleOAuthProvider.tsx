'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { isGoogleOAuthConfigured } from '@/config/google-oauth';

interface GoogleAuthProviderProps {
  children: React.ReactNode;
}

export default function GoogleAuthProvider({ children }: GoogleAuthProviderProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Only render the provider if Google OAuth is properly configured
  if (!isGoogleOAuthConfigured() || !clientId) {
    console.warn('Google OAuth not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in environment variables.');
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}