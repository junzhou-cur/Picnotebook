'use client';

import React from 'react';
import { format } from 'date-fns';
import { Card, Badge } from '../ui';
import { FileEntity } from '../../types/api';
import { fileService } from '../../services';
import { 
  File, 
  Image, 
  FileText, 
  Download, 
  ExternalLink, 
  Trash2, 
  Calendar, 
  User, 
  Tag,
  Eye 
} from 'lucide-react';

interface FileCardProps {
  file: FileEntity;
  onView?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  onView,
  onDownload,
  onDelete,
  className = '',
}) => {
  const getFileIcon = () => {
    const mimeType = file.mime_type;
    
    if (mimeType.startsWith('image/')) {
      return <Image className="w-8 h-8 text-green-500" />;
    } else if (mimeType === 'application/pdf') {
      return (
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    } else if (mimeType.includes('text') || mimeType.includes('markdown')) {
      return <FileText className="w-8 h-8 text-blue-500" />;
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) {
      return (
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
        </svg>
      );
    } else if (mimeType.includes('document') || mimeType.includes('word')) {
      return (
        <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    } else {
      return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const getFileTypeLabel = () => {
    const mimeType = file.mime_type;
    
    if (mimeType.startsWith('image/')) {
      return 'Image';
    } else if (mimeType === 'application/pdf') {
      return 'PDF';
    } else if (mimeType.includes('text') || mimeType.includes('markdown')) {
      return 'Text';
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) {
      return 'Spreadsheet';
    } else if (mimeType.includes('document') || mimeType.includes('word')) {
      return 'Document';
    } else {
      return 'File';
    }
  };

  const getStatusVariant = (): 'default' | 'success' | 'warning' | 'error' => {
    switch (file.processing_status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'failed':
        return 'error';
      case 'pending':
      default:
        return 'default';
    }
  };

  const handleDownload = async () => {
    try {
      await fileService.downloadFile(file.id, file.filename);
      onDownload?.();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {getFileIcon()}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate" title={file.filename}>
                {file.filename}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={getStatusVariant()}>
                  {file.processing_status}
                </Badge>
                <span className="text-xs text-gray-500">
                  {getFileTypeLabel()}
                </span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-1 ml-2">
            {file.processing_status === 'completed' && onView && (
              <button
                onClick={onView}
                className="p-1 text-gray-400 hover:text-blue-600 rounded"
                title="View file"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleDownload}
              className="p-1 text-gray-400 hover:text-green-600 rounded"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </button>
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1 text-gray-400 hover:text-red-600 rounded"
                title="Delete file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* File Details */}
        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Size:</span>
            <span className="text-gray-900">{fileService.formatFileSize(file.file_size)}</span>
          </div>
          
          {file.description && (
            <div>
              <span className="text-sm text-gray-500">Description:</span>
              <p className="text-sm text-gray-900 mt-1 line-clamp-2">
                {file.description}
              </p>
            </div>
          )}
        </div>

        {/* Tags */}
        {file.tags && file.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {file.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
            {file.tags.length > 3 && (
              <span className="text-xs text-gray-400">
                +{file.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Processing Info */}
        {file.processing_status === 'processing' && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center">
              <svg className="animate-spin w-4 h-4 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm text-yellow-800">Processing file...</span>
            </div>
          </div>
        )}

        {file.processing_status === 'failed' && file.processing_error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              Processing failed: {file.processing_error}
            </p>
          </div>
        )}

        {/* OCR Results Preview */}
        {file.processing_status === 'completed' && file.extracted_text && (
          <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800">
                Extracted Text
              </span>
              {file.confidence_score && (
                <span className="text-xs text-green-600">
                  {Math.round(file.confidence_score * 100)}% confidence
                </span>
              )}
            </div>
            <p className="text-sm text-green-700 line-clamp-3">
              {file.extracted_text}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(file.created_at), 'MMM d, yyyy')}</span>
            </div>
            {file.uploaded_by && (
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{file.uploaded_by.first_name} {file.uploaded_by.last_name}</span>
              </div>
            )}
          </div>
          
          {/* Associated entities */}
          {(file.associated_type && file.associated_id) && (
            <div className="flex items-center space-x-1">
              <ExternalLink className="w-3 h-3" />
              <span className="capitalize">{file.associated_type}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};