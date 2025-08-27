# Real Google OAuth Setup for Development

This guide will help you set up **real Google OAuth** for development instead of the mock system.

## Step 1: Create Google Cloud Console Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project:
   - Click "Select a project" → "New Project"
   - Project name: "PicNotebook Development"
   - Click "Create"

## Step 2: Enable Required APIs

1. In your project, go to "APIs & Services" → "Library"
2. Search for and enable these APIs:
   - **Google+ API** (for user profile info)
   - **Google OAuth2 API** (for authentication)
   - **Google Identity and Access Management (IAM) API**

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose **External** (for testing with any Google account)
3. Fill out the required fields:
   ```
   App name: PicNotebook Development
   User support email: your-email@example.com
   Developer contact information: your-email@example.com
   ```
4. **Scopes**: Add these scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`
5. **Test users** (if External): Add your email address
6. Click "Save and Continue"

## Step 4: Create OAuth 2.0 Client ID

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Application type: **Web application**
4. Name: "PicNotebook Dev Client"
5. **Authorized JavaScript origins**:
   ```
   http://localhost:3002
   http://127.0.0.1:3002
   ```
6. **Authorized redirect URIs**:
   ```
   http://localhost:3002/auth/google/callback
   http://127.0.0.1:3002/auth/google/callback
   http://localhost:3002
   http://127.0.0.1:3002
   ```
7. Click "Create"
8. **Copy the Client ID** - you'll need this!

## Step 5: Update Environment Configuration

Replace the demo client ID in `.env.local`:

```env
# Replace this line:
NEXT_PUBLIC_GOOGLE_CLIENT_ID=demo-client-id.apps.googleusercontent.com

# With your real Client ID:
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_REAL_CLIENT_ID.apps.googleusercontent.com
```

## Step 6: Test the Integration

1. Restart your development server: `npm run dev`
2. Go to: http://127.0.0.1:3002/login
3. You should now see the real "Continue with Google" button (without "Mock")
4. Click it to test with your Google account

## Troubleshooting Common Issues

### Issue 1: "redirect_uri_mismatch"
**Solution**: Make sure you added both `localhost` and `127.0.0.1` versions of the redirect URIs.

### Issue 2: "This app isn't verified"
**Solution**: This is normal for development. Click "Advanced" → "Go to PicNotebook Development (unsafe)"

### Issue 3: "Access blocked"
**Solution**: Make sure you added your email to "Test users" in the OAuth consent screen.

### Issue 4: Button doesn't appear
**Solution**: Check the browser console for errors, and verify the Client ID is properly set.

---

**Would you like me to help you get the real Google Client ID, or do you want to set it up yourself following this guide?**

If you get the Client ID, just share it with me and I'll update the configuration immediately!