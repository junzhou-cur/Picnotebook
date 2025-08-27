'use client';

import TerminalInterface from '@/components/TerminalInterface';

export default function TerminalPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terminal Interface</h1>
        <p className="text-gray-600">
          Execute bash commands on the server with security restrictions. Only safe commands are allowed.
        </p>
      </div>
      
      <div className="max-w-4xl">
        <TerminalInterface />
      </div>
      
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-semibold text-amber-800 mb-2">Security Notice</h3>
        <p className="text-sm text-amber-700">
          This terminal interface has security restrictions in place. Only whitelisted commands are allowed, 
          and dangerous operations like file deletion, system modification, and privileged access are blocked.
        </p>
      </div>
    </div>
  );
}