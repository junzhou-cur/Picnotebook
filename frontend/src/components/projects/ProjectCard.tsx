'use client';

import React from 'react';
import { Card, CardContent, StatusBadge, PriorityBadge } from '../ui';
import { Project } from '../../types/api';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onClick,
  onEdit,
  onDelete,
  className,
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger onClick if clicking on action buttons
    if ((e.target as HTMLElement).closest('[data-action]')) {
      return;
    }
    onClick?.();
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
              {project.title}
            </h3>
            {project.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 ml-4" data-action>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Edit project"
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
              title="Delete project"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <StatusBadge status={project.status} />
            <PriorityBadge priority={project.priority} />
          </div>
          
          <div className="text-sm text-gray-500">
            {project.start_date && (
              <span>
                {format(new Date(project.start_date), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </div>

        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                +{project.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {project.is_public && (
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Public
              </div>
            )}
            
            {project.collaborators.length > 0 && (
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {project.collaborators.length} collaborator{project.collaborators.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-400">
            Updated {format(new Date(project.updated_at), 'MMM d')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};