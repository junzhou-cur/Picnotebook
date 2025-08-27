# Google OAuth Setup for PicNotebook

This guide explains how to set up Google OAuth authentication for the PicNotebook application.

## 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen:
   - Application name: "PicNotebook"
   - User support email: Your email
   - Developer contact information: Your email
6. Create OAuth 2.0 Client ID:
   - Application type: "Web application"
   - Name: "PicNotebook Web Client"
   - Authorized JavaScript origins: 
     - `http://localhost:3002` (for development)
     - `http://127.0.0.1:3002` (for development)
     - Your production domain (when deployed)
   - Authorized redirect URIs:
     - `http://localhost:3002/auth/google/callback` (for development)
     - `http://127.0.0.1:3002/auth/google/callback` (for development)
     - Your production callback URL (when deployed)

## 2. Configure Environment Variables

Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

Replace `your-google-oauth-client-id.apps.googleusercontent.com` with the actual Client ID from Google Cloud Console.

## 3. Test the Integration

1. Start the development server: `npm run dev`
2. Go to the login page: `http://127.0.0.1:3002/login`
3. You should see a "Continue with Google" button
4. Click it to test the Google OAuth flow

## 4. Files Added/Modified

### New Files:
- `frontend/src/config/google-oauth.ts` - Google OAuth configuration
- `frontend/src/components/auth/GoogleLoginButton.tsx` - Google login button component
- `frontend/src/providers/GoogleOAuthProvider.tsx` - OAuth provider wrapper

### Modified Files:
- `frontend/src/stores/auth.ts` - Added `loginWithGoogle` function
- `frontend/src/app/login/page.tsx` - Added Google login button to UI
- `frontend/.env.local` - Added Google OAuth environment variable
- `mock_experiment_api.py` - Added Google OAuth endpoints for testing

### API Endpoints:
- `POST /auth/google/login` - Handle Google OAuth login
- `GET/POST /auth/google/callback` - Handle OAuth callback

## 5. Production Deployment

When deploying to production:

1. Update the authorized JavaScript origins and redirect URIs in Google Cloud Console
2. Set the production `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in your deployment environment
3. Ensure your backend validates Google OAuth tokens properly (the mock API is for development only)

## 6. Security Notes

- Never commit your Google Client ID if it contains sensitive information
- The current implementation uses a mock API for development - implement proper Google token validation in production
- Consider implementing additional security measures like CSRF protection
- Store user sessions securely

## 7. Testing Credentials

For development testing, you can use any Google account. The mock API will accept any valid Google OAuth response and create a user session.

## 8. Troubleshooting

Common issues:
- **"Invalid client"**: Check that your Client ID is correctly set in `.env.local`
- **"Unauthorized JavaScript origin"**: Ensure `http://127.0.0.1:3002` is added to authorized origins
- **"redirect_uri_mismatch"**: Verify the callback URL is properly configured
- **Button not showing**: Check that `isGoogleOAuthConfigured()` returns true

For more help, check the browser console for error messages.