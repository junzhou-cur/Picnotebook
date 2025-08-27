'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button, Modal, ModalFooter, Input } from '../ui';
import { fileService } from '../../services';
import { FileEntity } from '../../types/api';

interface FileUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: FileEntity[]) => void;
  associatedType?: string;
  associatedId?: string;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
}

export const FileUpload: React.FC<FileUploadProps> = ({
  isOpen,
  onClose,
  onUpload,
  associatedType,
  associatedId,
  maxFiles = 10,
  maxFileSize = 100,
  allowedTypes = ['image/*', 'application/pdf', 'text/*', '.csv', '.xlsx', '.docx'],
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles);
    const validFiles: File[] = [];
    const newErrors: Record<string, string> = {};

    // Check total file count
    if (files.length + newFiles.length > maxFiles) {
      newErrors.count = `Maximum ${maxFiles} files allowed`;
      setErrors(newErrors);
      return;
    }

    // Validate each file
    newFiles.forEach((file, index) => {
      const validation = fileService.validateFile(file, {
        maxSize: maxFileSize * 1024 * 1024,
        allowedTypes: allowedTypes.filter(type => !type.includes('*')),
      });

      if (validation.valid) {
        validFiles.push(file);
      } else {
        newErrors[`file_${index}`] = validation.error || 'Invalid file';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      setFiles(prev => [...prev, ...validFiles]);
    }
  }, [files.length, maxFiles, maxFileSize, allowedTypes]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`file_${index}`];
      return newErrors;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setErrors({});

    try {
      const uploadOptions = {
        description: description.trim() || undefined,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        associated_type: associatedType,
        associated_id: associatedId,
      };

      const uploadPromises = files.map(async (file, index) => {
        try {
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
          
          const uploadedFile = await fileService.uploadFile(file, uploadOptions);
          
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
          return uploadedFile;
        } catch (error: any) {
          setErrors(prev => ({ ...prev, [`upload_${index}`]: error.message }));
          throw error;
        }
      });

      const uploadedFiles = await Promise.allSettled(uploadPromises);
      const successfulUploads = uploadedFiles
        .filter((result): result is PromiseFulfilledResult<FileEntity> => result.status === 'fulfilled')
        .map(result => result.value);

      if (successfulUploads.length > 0) {
        onUpload(successfulUploads);
        
        // Reset form if all uploads succeeded
        if (successfulUploads.length === files.length) {
          setFiles([]);
          setDescription('');
          setTags('');
          setUploadProgress({});
          onClose();
        }
      }
    } catch (error: any) {
      setErrors(prev => ({ ...prev, upload: error.message || 'Upload failed' }));
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    return fileService.formatFileSize(bytes);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return (
        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    } else if (file.type === 'application/pdf') {
      return (
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Files" size="lg">
      <div className="space-y-6">
        {/* File Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drop files here or click to browse
          </p>
          <p className="text-sm text-gray-500">
            Maximum {maxFiles} files, up to {maxFileSize}MB each
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Supported: Images, PDFs, Documents, Spreadsheets
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {/* Error Messages */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Upload Errors</h3>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {Object.values(errors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Selected Files */}
        {files.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Selected Files ({files.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                  <div className="flex items-center flex-1 min-w-0">
                    {getFileIcon(file)}
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Upload Progress */}
                  {uploading && uploadProgress[file.name] !== undefined && (
                    <div className="w-20 mr-3">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress[file.name]}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        {uploadProgress[file.name]}%
                      </p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                    className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File Metadata */}
        {files.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe these files..."
              disabled={uploading}
            />
            
            <Input
              label="Tags (optional)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Enter tags separated by commas"
              helperText="e.g., experiment, data, results"
              disabled={uploading}
            />
          </div>
        )}
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={uploading}>
          Cancel
        </Button>
        <Button 
          onClick={handleUpload} 
          disabled={files.length === 0 || uploading}
          loading={uploading}
        >
          Upload {files.length > 0 ? `${files.length} File${files.length > 1 ? 's' : ''}` : 'Files'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};