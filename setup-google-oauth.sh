#!/bin/bash

# Google OAuth Setup Helper Script
# This script helps you configure Google OAuth for PicNotebook

echo "🔧 PicNotebook Google OAuth Setup"
echo "================================="
echo ""

# Check current configuration
CURRENT_CLIENT_ID=$(grep "NEXT_PUBLIC_GOOGLE_CLIENT_ID" frontend/.env.local 2>/dev/null | cut -d'=' -f2)

echo "Current configuration:"
echo "CLIENT_ID: $CURRENT_CLIENT_ID"

if [[ "$CURRENT_CLIENT_ID" == *"demo-client-id"* ]]; then
    echo "Status: 🔬 Mock OAuth (Development Mode)"
elif [[ "$CURRENT_CLIENT_ID" == *".apps.googleusercontent.com"* ]] && [[ "$CURRENT_CLIENT_ID" != *"demo"* ]]; then
    echo "Status: ✅ Real OAuth (Production Ready)"
else
    echo "Status: ❌ Not Configured"
fi

echo ""
echo "Choose an option:"
echo "1) Use Mock OAuth (for quick development)"
echo "2) Set up Real Google OAuth"
echo "3) Show current configuration"
echo "4) Open Google Cloud Console"
echo "5) Exit"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🔬 Setting up Mock OAuth..."
        sed -i '' 's/NEXT_PUBLIC_GOOGLE_CLIENT_ID=.*/NEXT_PUBLIC_GOOGLE_CLIENT_ID=demo-client-id.apps.googleusercontent.com/' frontend/.env.local
        echo "✅ Mock OAuth configured!"
        echo "   - Restart your dev server: npm run dev"
        echo "   - Go to: http://127.0.0.1:3002/login"
        echo "   - You'll see 'Continue with Google (Mock)' button"
        ;;
    2)
        echo "🌐 Setting up Real Google OAuth..."
        echo ""
        echo "Step 1: Get your Google Client ID"
        echo "1. Go to: https://console.cloud.google.com/"
        echo "2. Create/select project"
        echo "3. APIs & Services → Credentials"
        echo "4. Create OAuth 2.0 Client ID"
        echo "5. Add these origins: http://127.0.0.1:3002, http://localhost:3002"
        echo "6. Copy the Client ID"
        echo ""
        read -p "Enter your Google Client ID: " client_id
        
        if [[ "$client_id" == *".apps.googleusercontent.com"* ]]; then
            sed -i '' "s/NEXT_PUBLIC_GOOGLE_CLIENT_ID=.*/NEXT_PUBLIC_GOOGLE_CLIENT_ID=$client_id/" frontend/.env.local
            echo "✅ Real Google OAuth configured!"
            echo "   - Restart your dev server: npm run dev"
            echo "   - Go to: http://127.0.0.1:3002/login"
            echo "   - You'll see real 'Continue with Google' button"
        else
            echo "❌ Invalid Client ID format. Should end with .apps.googleusercontent.com"
        fi
        ;;
    3)
        echo "📋 Current Configuration:"
        echo "File: frontend/.env.local"
        if [ -f "frontend/.env.local" ]; then
            grep -E "(GOOGLE|API_URL)" frontend/.env.local
        else
            echo "❌ .env.local not found"
        fi
        ;;
    4)
        echo "🌐 Opening Google Cloud Console..."
        if command -v open >/dev/null 2>&1; then
            open "https://console.cloud.google.com/apis/credentials"
        else
            echo "Open this URL: https://console.cloud.google.com/apis/credentials"
        fi
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        ;;
esac

echo ""
echo "📖 For detailed instructions, see:"
echo "   - REAL_GOOGLE_OAUTH_SETUP.md (for real OAuth setup)"
echo "   - GOOGLE_OAUTH_DEVELOPMENT.md (for development mode)"
echo ""
echo "🧪 Test your setup at: http://127.0.0.1:3002/google-test"