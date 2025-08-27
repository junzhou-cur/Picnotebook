'use client';

import React, { useState, useEffect } from 'react';
import { Button, LoadingSpinner } from '../ui';
import { Upload } from 'lucide-react';

export const FileList: React.FC = () => {
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
        <h1 className="text-3xl font-bold text-gray-900">Files</h1>
        <Button onClick={() => alert('File upload functionality coming soon!')}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Files
        </Button>
      </div>

      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <div className="max-w-md mx-auto">
          <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Files Yet</h3>
          <p className="text-gray-600 mb-6">
            Upload images, documents, and other files to get started with your research documentation.
          </p>
          <Button onClick={() => alert('File upload functionality coming soon!')}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Your First File
          </Button>
        </div>
      </div>
    </div>
  );
};