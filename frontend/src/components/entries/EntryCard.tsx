'use client';

import React from 'react';
import { format } from 'date-fns';
import { Card, Badge } from '../ui';
import { Entry } from '../../types/api';
import { FileText, Image, Calendar, User, Tag, ExternalLink } from 'lucide-react';

interface EntryCardProps {
  entry: Entry;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const EntryCard: React.FC<EntryCardProps> = ({
  entry,
  onClick,
  onEdit,
  onDelete,
  className = '',
}) => {
  const getEntryTypeIcon = () => {
    switch (entry.entry_type) {
      case 'observation':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'procedure':
        return <Image className="w-5 h-5 text-green-600" />;
      case 'result':
        return <ExternalLink className="w-5 h-5 text-purple-600" />;
      case 'note':
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeVariant = (): 'default' | 'success' | 'warning' | 'danger' => {
    switch (entry.entry_type) {
      case 'observation':
        return 'default';
      case 'procedure':
        return 'success';
      case 'result':
        return 'warning';
      case 'note':
      default:
        return 'default';
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div 
      className={`cursor-pointer hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
    >
      <Card>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {getEntryTypeIcon()}
            <div>
              <h3 className="font-semibold text-gray-900 line-clamp-1">
                {entry.title}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={getTypeVariant()}>
                  {entry.entry_type}
                </Badge>
                {entry.experiment_id && (
                  <span className="text-xs text-gray-500">
                    Exp: {entry.experiment_id.substring(0, 8)}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-1">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1 text-gray-400 hover:text-blue-600 rounded"
                title="Edit entry"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 text-gray-400 hover:text-red-600 rounded"
                title="Delete entry"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content Preview */}
        {entry.content && (
          <div className="mb-3">
            <p className="text-sm text-gray-600 line-clamp-3">
              {truncateContent(entry.content)}
            </p>
          </div>
        )}

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {entry.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
            {entry.tags.length > 3 && (
              <span className="text-xs text-gray-400">
                +{entry.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(entry.created_at), 'MMM d, yyyy')}</span>
            </div>
            {entry.created_by && (
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{entry.created_by}</span>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </Card>
    </div>
  );
};