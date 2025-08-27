'use client';

import { useState } from 'react';

export default function ApiTestPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('Testing...');
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5005';
    
    try {
      console.log('Testing login with API URL:', apiUrl);
      
      const response = await fetch(`${apiUrl}/auth/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Configuration</h2>
          <div className="space-y-2 font-mono text-sm">
            <p>NEXT_PUBLIC_API_URL: {process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}</p>
            <p>NEXT_PUBLIC_AUTH_SERVICE_URL: {process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'NOT SET'}</p>
            <p>Window Location: {typeof window !== 'undefined' ? window.location.origin : 'SSR'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Login Test</h2>
          <button
            onClick={testLogin}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Login'}
          </button>
          
          {result && (
            <pre className="mt-4 p-4 bg-gray-100 rounded overflow-x-auto text-sm">
              {result}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}