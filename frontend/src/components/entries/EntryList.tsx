'use client';

import React, { useState, useEffect } from 'react';
import { Button, LoadingSpinner } from '../ui';
import { Plus } from 'lucide-react';

export const EntryList: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Lab Entries</h1>
        <Button onClick={() => alert('Create entry functionality coming soon!')}>
          <Plus className="w-4 h-4 mr-2" />
          New Entry
        </Button>
      </div>

      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <div className="max-w-md mx-auto">
          <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Lab Entries Yet</h3>
          <p className="text-gray-600 mb-6">
            Start documenting your research by creating your first lab entry.
          </p>
          <Button onClick={() => alert('Create entry functionality coming soon!')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Entry
          </Button>
        </div>
      </div>
    </div>
  );
};