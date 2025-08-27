'use client';

import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  className,
  id,
  disabled,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = 'block w-full rounded-md shadow-sm transition-colors focus:outline-none';
  
  const variantClasses = {
    default: clsx(
      'border border-gray-300 bg-white',
      error 
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
        : 'focus:border-blue-500 focus:ring-blue-500',
      disabled && 'bg-gray-50 text-gray-500'
    ),
    filled: clsx(
      'border-0 bg-gray-100',
      error 
        ? 'bg-red-50 focus:bg-red-50 focus:ring-red-500' 
        : 'focus:bg-white focus:ring-blue-500',
      disabled && 'bg-gray-100 text-gray-500'
    ),
  };
  
  const paddingClasses = clsx(
    leftIcon && rightIcon ? 'pl-10 pr-10' : 
    leftIcon ? 'pl-10 pr-3' :
    rightIcon ? 'pl-3 pr-10' : 'px-3',
    'py-2'
  );

  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={inputId}
          className={clsx(
            'block text-sm font-medium',
            error ? 'text-red-700' : 'text-gray-700'
          )}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className={clsx('h-5 w-5', error ? 'text-red-400' : 'text-gray-400')}>
              {leftIcon}
            </div>
          </div>
        )}
        
        <input
          id={inputId}
          className={clsx(
            baseClasses,
            variantClasses[variant],
            paddingClasses,
            className
          )}
          disabled={disabled}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className={clsx('h-5 w-5', error ? 'text-red-400' : 'text-gray-400')}>
              {rightIcon}
            </div>
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={clsx(
          'text-sm',
          error ? 'text-red-600' : 'text-gray-500'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  className,
  id,
  disabled,
  ...props
}) => {
  const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = clsx(
    'block w-full rounded-md shadow-sm transition-colors focus:outline-none',
    'border border-gray-300 bg-white px-3 py-2',
    error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
      : 'focus:border-blue-500 focus:ring-blue-500',
    disabled && 'bg-gray-50 text-gray-500'
  );

  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={inputId}
          className={clsx(
            'block text-sm font-medium',
            error ? 'text-red-700' : 'text-gray-700'
          )}
        >
          {label}
        </label>
      )}
      
      <textarea
        id={inputId}
        className={clsx(baseClasses, className)}
        disabled={disabled}
        rows={4}
        {...props}
      />
      
      {(error || helperText) && (
        <p className={clsx(
          'text-sm',
          error ? 'text-red-600' : 'text-gray-500'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};