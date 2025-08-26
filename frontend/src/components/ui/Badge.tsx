'use client';

import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  onClick,
  removable = false,
  onRemove,
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-600',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-cyan-100 text-cyan-800',
  };
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base',
  };
  
  const isClickable = onClick || removable;
  
  return (
    <span
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        isClickable && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      onClick={onClick}
    >
      {children}
      {removable && (
        <button
          type="button"
          className="ml-1 -mr-1 inline-flex items-center justify-center h-4 w-4 rounded-full hover:bg-black hover:bg-opacity-10 focus:outline-none focus:bg-black focus:bg-opacity-10"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
        >
          <svg className="h-2 w-2" fill="currentColor" viewBox="0 0 8 8">
            <path d="M1.5 1.5l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </span>
  );
};

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'on_hold' | 'planned' | 'in_progress' | 'archived';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const statusConfig = {
    active: { variant: 'success' as const, label: 'Active' },
    inactive: { variant: 'secondary' as const, label: 'Inactive' },
    pending: { variant: 'warning' as const, label: 'Pending' },
    completed: { variant: 'success' as const, label: 'Completed' },
    cancelled: { variant: 'danger' as const, label: 'Cancelled' },
    on_hold: { variant: 'warning' as const, label: 'On Hold' },
    planned: { variant: 'info' as const, label: 'planned' },
    in_progress: { variant: 'primary' as const, label: 'In Progress' },
    archived: { variant: 'secondary' as const, label: 'Archived' },
  };
  
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className }) => {
  const priorityConfig = {
    low: { variant: 'secondary' as const, label: 'Low' },
    medium: { variant: 'info' as const, label: 'Medium' },
    high: { variant: 'warning' as const, label: 'High' },
    urgent: { variant: 'danger' as const, label: 'Urgent' },
  };
  
  const config = priorityConfig[priority];
  
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};