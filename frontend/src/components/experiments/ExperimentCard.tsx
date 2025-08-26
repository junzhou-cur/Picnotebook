'use client';

import React from 'react';
import { Card, CardContent, StatusBadge, PriorityBadge } from '../ui';
import { Experiment } from '../../types/api';
import { format, formatDistanceToNow } from 'date-fns';

interface ExperimentCardProps {
  experiment: Experiment;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onStart?: () => void;
  onComplete?: () => void;
  className?: string;
}

export const ExperimentCard: React.FC<ExperimentCardProps> = ({
  experiment,
  onClick,
  onEdit,
  onDelete,
  onStart,
  onComplete,
  className,
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger onClick if clicking on action buttons
    if ((e.target as HTMLElement).closest('[data-action]')) {
      return;
    }
    onClick?.();
  };

  const getStatusActions = () => {
    switch (experiment.status) {
      case 'planned':
        return onStart ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStart();
            }}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
            title="Start experiment"
          >
            Start
          </button>
        ) : null;
      
      case 'in_progress':
        return onComplete ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete();
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            title="Complete experiment"
          >
            Complete
          </button>
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <Card 
      className={className}
      hoverable={!!onClick}
      onClick={handleCardClick}
    >
      <CardContent>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {experiment.title}
            </h3>
            {experiment.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {experiment.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 ml-4" data-action>
            {getStatusActions()}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Edit experiment"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              className="text-gray-400 hover:text-red-600 transition-colors"
              title="Delete experiment"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <StatusBadge status={experiment.status} />
            <PriorityBadge priority={experiment.priority} />
          </div>
          
          {experiment.duration_days !== null && experiment.duration_days > 0 && (
            <div className="text-sm text-gray-500">
              {experiment.duration_days} day{experiment.duration_days > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {experiment.protocol && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
              Protocol
            </div>
            <p className="text-sm text-gray-700 line-clamp-2">
              {experiment.protocol}
            </p>
          </div>
        )}

        {experiment.expected_outcomes && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
              Expected Outcomes
            </div>
            <p className="text-sm text-gray-700 line-clamp-2">
              {experiment.expected_outcomes}
            </p>
          </div>
        )}

        {experiment.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {experiment.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
              >
                {tag}
              </span>
            ))}
            {experiment.tags.length > 3 && (
              <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                +{experiment.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex flex-col space-y-1 text-sm text-gray-500">
            {experiment.started_at && (
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Started {format(new Date(experiment.started_at), 'MMM d, yyyy')}
              </div>
            )}
            
            {experiment.completed_at && (
              <div className="flex items-center text-green-600">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Completed {format(new Date(experiment.completed_at), 'MMM d, yyyy')}
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-400">
            Updated {formatDistanceToNow(new Date(experiment.updated_at), { addSuffix: true })}
          </div>
        </div>

        {/* Progress indicator for in-progress experiments */}
        {experiment.status === 'in_progress' && experiment.started_at && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>In progress</span>
              <span>
                {formatDistanceToNow(new Date(experiment.started_at), { addSuffix: true })}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full animate-pulse"
                style={{ width: '60%' }} // This could be calculated based on expected duration
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};