# 🚀 Quick Google OAuth Setup for PicNotebook

## Current Status
- ✅ Real Google OAuth code is implemented 
- ✅ Mock OAuth works for development
- ⏳ Need real Google Client ID to activate real OAuth

## Get Real Google Client ID (2 minutes)

### Step 1: Go to Google Cloud Console
Open: https://console.cloud.google.com/apis/credentials

### Step 2: Create OAuth 2.0 Client ID
1. Click **"+ CREATE CREDENTIALS"** → **"OAuth 2.0 Client ID"**
2. If prompted, configure consent screen first (internal use is fine)
3. Choose **"Web application"**
4. Set these **Authorized JavaScript origins**:
   ```
   http://127.0.0.1:3002
   http://localhost:3002
   ```
5. Set these **Authorized redirect URIs**:
   ```
   http://127.0.0.1:3002/auth/google/callback
   http://localhost:3002/auth/google/callback
   ```

### Step 3: Copy Your Client ID
- Copy the Client ID (looks like: `123456789-abc123.apps.googleusercontent.com`)

### Step 4: Update Configuration
Replace `demo-client-id.apps.googleusercontent.com` with your real Client ID in:
```bash
# In frontend/.env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_REAL_CLIENT_ID_HERE
```

### Step 5: Restart and Test
```bash
# The app will automatically detect real OAuth and switch modes
# Visit: http://127.0.0.1:3002/google-test
```

## Quick Test Commands
```bash
# Use the setup helper
./setup-google-oauth.sh

# Or manually check status
curl http://127.0.0.1:3002/api/oauth/status
```

## What Changes When You Add Real OAuth:
- ✅ Mock button becomes real Google button
- ✅ Actual Google login popup appears  
- ✅ Real user data from Google
- ✅ Production-ready authentication

## Current Configuration
The app intelligently switches between:
- **Mock OAuth**: `demo-client-id.apps.googleusercontent.com` → Development mode
- **Real OAuth**: `YOUR_ID.apps.googleusercontent.com` → Production mode

Test page: http://127.0.0.1:3002/google-test