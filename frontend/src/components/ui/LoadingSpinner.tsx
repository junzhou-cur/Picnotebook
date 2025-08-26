'use client';

import React from 'react';
import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'primary' | 'secondary' | 'white';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  color = 'primary',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
  };

  return (
    <svg
      className={clsx(
        'animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

interface LoadingStateProps {
  loading: boolean;
  error?: string | null;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  loading,
  error,
  children,
  loadingComponent,
  errorComponent,
  className,
}) => {
  if (loading) {
    return (
      <div className={clsx('flex items-center justify-center py-8', className)}>
        {loadingComponent || (
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx('flex items-center justify-center py-8', className)}>
        {errorComponent || (
          <div className="text-center">
            <svg className="h-12 w-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

interface SkeletonProps {
  className?: string;
  height?: string;
  width?: string;
  rounded?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  height = 'h-4',
  width = 'w-full',
  rounded = true,
}) => (
  <div
    className={clsx(
      'animate-pulse bg-gray-200',
      height,
      width,
      rounded && 'rounded',
      className
    )}
  />
);

interface SkeletonCardProps {
  lines?: number;
  showAvatar?: boolean;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  lines = 3,
  showAvatar = false,
  className,
}) => (
  <div className={clsx('bg-white p-6 rounded-lg border border-gray-200', className)}>
    <div className="animate-pulse">
      {showAvatar && (
        <div className="flex items-center space-x-4 mb-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton height="h-4" width="w-1/4" />
            <Skeleton height="h-3" width="w-1/6" className="mt-2" />
          </div>
        </div>
      )}
      
      <Skeleton height="h-6" width="w-3/4" className="mb-4" />
      
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          height="h-4"
          width={i === lines - 1 ? 'w-2/3' : 'w-full'}
          className="mb-2"
        />
      ))}
    </div>
  </div>
);