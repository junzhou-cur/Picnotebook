#!/usr/bin/env node

// OAuth Mode Testing Script
console.log('🔧 PicNotebook OAuth Mode Test');
console.log('================================');

// Read current environment
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(__dirname, 'frontend', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const clientIdMatch = envContent.match(/NEXT_PUBLIC_GOOGLE_CLIENT_ID=(.+)/);
  const currentClientId = clientIdMatch ? clientIdMatch[1].trim() : 'not set';
  
  console.log(`\nCurrent Client ID: ${currentClientId}`);
  
  // Determine mode
  if (currentClientId.includes('demo-client-id')) {
    console.log('Mode: 🔬 Mock OAuth (Development)');
    console.log('✅ Perfect for quick development and testing');
    console.log('📝 To switch to real OAuth:');
    console.log('   1. Get Client ID from https://console.cloud.google.com/');
    console.log('   2. Run: ./setup-google-oauth.sh');
    console.log('   3. Choose option 2 and enter your real Client ID');
  } else if (currentClientId.endsWith('.apps.googleusercontent.com')) {
    console.log('Mode: 🌐 Real Google OAuth (Production Ready)');
    console.log('✅ Using real Google authentication');
    console.log('🔄 Users will see actual Google login popup');
  } else {
    console.log('Mode: ❌ Not Configured');
    console.log('🛠️  Run: ./setup-google-oauth.sh to configure');
  }
  
  console.log('\n🧪 Test your current setup:');
  console.log('   Login page: http://127.0.0.1:3002/login');
  console.log('   Test page:  http://127.0.0.1:3002/google-test');
  
  console.log('\n📊 OAuth Status Check:');
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Client ID length: ${currentClientId.length} chars`);
  console.log(`   Valid format: ${currentClientId.endsWith('.apps.googleusercontent.com') ? '✅' : '❌'}`);
  
} catch (error) {
  console.error('❌ Error reading environment:', error.message);
  console.log('\n💡 Make sure you have frontend/.env.local file');
}