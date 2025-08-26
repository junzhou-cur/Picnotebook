'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload,
  FileImage,
  FileText,
  File,
  X,
  Check,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Dna,
  Plus,
  FolderOpen
} from 'lucide-react';
import { useAppStore } from '@/stores/app';

interface FileWithPreview {
  file: File;
  id: string;
  preview?: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  result?: any;
}

interface EnhancedDragDropUploadProps {
  projectId?: string;
  projectName?: string;
  onUploadComplete?: (results: any[]) => void;
  acceptedFileTypes?: string[];
  maxFiles?: number;
  maxFileSize?: number; // in MB
  className?: string;
}

const FILE_TYPE_CONFIG = {
  images: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'],
    icon: ImageIcon,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    description: 'Lab note images'
  },
  sequences: {
    extensions: ['.fastq', '.fq', '.fastq.gz', '.fq.gz', '.fasta', '.fa'],
    mimeTypes: ['text/plain', 'application/gzip', 'application/x-gzip'],
    icon: Dna,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    description: 'Sequence files'
  },
  documents: {
    extensions: ['.pdf', '.doc', '.docx', '.txt'],
    mimeTypes: ['application/pdf', 'application/msword', 'text/plain'],
    icon: FileText,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    description: 'Documents'
  }
};

export function EnhancedDragDropUpload({
  projectId,
  projectName,
  onUploadComplete,
  acceptedFileTypes = ['images', 'sequences'],
  maxFiles = 10,
  maxFileSize = 50, // 50MB default
  className = ''
}: EnhancedDragDropUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useAppStore();

  // Get accepted file extensions
  const getAcceptedExtensions = useCallback(() => {
    const extensions: string[] = [];
    acceptedFileTypes.forEach(type => {
      if (FILE_TYPE_CONFIG[type as keyof typeof FILE_TYPE_CONFIG]) {
        extensions.push(...FILE_TYPE_CONFIG[type as keyof typeof FILE_TYPE_CONFIG].extensions);
      }
    });
    return extensions;
  }, [acceptedFileTypes]);

  // Get accepted MIME types
  const getAcceptedMimeTypes = useCallback(() => {
    const mimeTypes: string[] = [];
    acceptedFileTypes.forEach(type => {
      if (FILE_TYPE_CONFIG[type as keyof typeof FILE_TYPE_CONFIG]) {
        mimeTypes.push(...FILE_TYPE_CONFIG[type as keyof typeof FILE_TYPE_CONFIG].mimeTypes);
      }
    });
    return mimeTypes.join(',');
  }, [acceptedFileTypes]);

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size exceeds ${maxFileSize}MB limit`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const acceptedExts = getAcceptedExtensions();
    
    if (!acceptedExts.some(ext => fileExtension.endsWith(ext))) {
      return `File type not supported. Accepted: ${acceptedExts.join(', ')}`;
    }

    return null;
  }, [maxFileSize, getAcceptedExtensions]);

  // Get file type category
  const getFileTypeCategory = useCallback((file: File): keyof typeof FILE_TYPE_CONFIG => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    for (const [category, config] of Object.entries(FILE_TYPE_CONFIG)) {
      if (config.extensions.some(ext => fileExtension.endsWith(ext))) {
        return category as keyof typeof FILE_TYPE_CONFIG;
      }
    }
    
    return 'documents'; // default
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback((selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);
    const currentFileCount = files.length;
    
    if (currentFileCount + fileArray.length > maxFiles) {
      addNotification({
        type: 'error',
        title: 'Too many files',
        message: `Maximum ${maxFiles} files allowed. You have ${currentFileCount} files already.`
      });
      return;
    }

    const newFiles: FileWithPreview[] = [];
    const errors: string[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        const fileWithPreview: FileWithPreview = {
          file,
          id: Math.random().toString(36).substr(2, 9),
          status: 'pending',
          progress: 0
        };

        // Create preview for images
        if (file.type.startsWith('image/')) {
          fileWithPreview.preview = URL.createObjectURL(file);
        }

        newFiles.push(fileWithPreview);
      }
    });

    if (errors.length > 0) {
      addNotification({
        type: 'error',
        title: 'Some files were rejected',
        message: errors.join('\n')
      });
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      
      // Auto-start upload
      newFiles.forEach(file => uploadFile(file));
    }
  }, [files.length, maxFiles, validateFile, addNotification]);

  // Upload file
  const uploadFile = useCallback(async (fileWithPreview: FileWithPreview) => {
    setFiles(prev => prev.map(f => 
      f.id === fileWithPreview.id 
        ? { ...f, status: 'uploading', progress: 10 }
        : f
    ));

    try {
      const formData = new FormData();
      const fileCategory = getFileTypeCategory(fileWithPreview.file);
      
      if (fileCategory === 'images') {
        // Use experiment record generation API for lab note images
        formData.append('image', fileWithPreview.file);
        if (projectId) {
          formData.append('project_hint', projectId);
        }
        formData.append('researcher', 'Current User'); // Get from auth context

        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map(f => {
            if (f.id === fileWithPreview.id && f.progress < 80) {
              return { ...f, progress: f.progress + 10 };
            }
            return f;
          }));
        }, 300);

        // Update status to processing
        setFiles(prev => prev.map(f => 
          f.id === fileWithPreview.id 
            ? { ...f, status: 'processing', progress: 85 }
            : f
        ));

        const response = await fetch('http://127.0.0.1:5005/generate_experiment_record', {
          method: 'POST',
          body: formData
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          throw new Error(`Processing failed: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
          setFiles(prev => prev.map(f => 
            f.id === fileWithPreview.id 
              ? { ...f, status: 'completed', progress: 100, result }
              : f
          ));

          addNotification({
            type: 'success',
            title: 'Lab Note Processed',
            message: `Generated experiment record for ${result.processing_summary.project_classification.name}. Click to review.`
          });
        } else {
          throw new Error(result.error || 'Processing failed');
        }
      } else {
        // Use original upload endpoint for sequence files
        formData.append('file', fileWithPreview.file);
        if (projectId) {
          formData.append('project_id', projectId);
        }

        const endpoint = '/api/upload_sequence';
        
        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map(f => {
            if (f.id === fileWithPreview.id && f.progress < 90) {
              return { ...f, progress: f.progress + 10 };
            }
            return f;
          }));
        }, 200);

        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const result = await response.json();

        setFiles(prev => prev.map(f => 
          f.id === fileWithPreview.id 
            ? { ...f, status: 'completed', progress: 100, result }
            : f
        ));

        addNotification({
          type: 'success',
          title: 'File uploaded',
          message: `${fileWithPreview.file.name} uploaded successfully`
        });
      }

    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === fileWithPreview.id 
          ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
          : f
      ));

      addNotification({
        type: 'error',
        title: 'Processing failed',
        message: `Failed to process ${fileWithPreview.file.name}`
      });
    }
  }, [projectId, getFileTypeCategory, addNotification]);

  // Remove file
  const removeFile = useCallback((id: string) => {
    const file = files.find(f => f.id === id);
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    setFiles(prev => prev.filter(f => f.id !== id));
  }, [files]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter - 1 === 0) {
      setIsDragging(false);
    }
  }, [dragCounter]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  // Get upload zone message
  const getUploadMessage = () => {
    if (projectName) {
      return `Drop files here for ${projectName}`;
    }
    
    const fileTypes = acceptedFileTypes.map(type => 
      FILE_TYPE_CONFIG[type as keyof typeof FILE_TYPE_CONFIG]?.description || type
    ).join(', ');
    
    return `Drop ${fileTypes} here`;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
          ${isDragging 
            ? 'border-lab-primary bg-lab-primary/5 scale-105' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={getAcceptedMimeTypes()}
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className="space-y-4">
          {/* Icon Display */}
          <div className="flex justify-center space-x-4">
            {acceptedFileTypes.map(type => {
              const config = FILE_TYPE_CONFIG[type as keyof typeof FILE_TYPE_CONFIG];
              if (!config) return null;
              const Icon = config.icon;
              return (
                <div
                  key={type}
                  className={`p-3 rounded-full ${config.bgColor}`}
                >
                  <Icon className={`w-8 h-8 ${config.color}`} />
                </div>
              );
            })}
          </div>

          {/* Text */}
          <div>
            <p className="text-lg font-medium text-gray-900">
              {getUploadMessage()}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to browse files
            </p>
          </div>

          {/* File Info */}
          <div className="text-xs text-gray-400 space-y-1">
            <p>Accepted: {getAcceptedExtensions().join(', ')}</p>
            <p>Max {maxFiles} files • Max {maxFileSize}MB per file</p>
          </div>

          {/* Upload Button */}
          <button className="btn-primary inline-flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Select Files</span>
          </button>
        </div>

        {/* Drag Overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-lab-primary/10 rounded-lg flex items-center justify-center"
            >
              <div className="bg-white rounded-lg shadow-lg p-6">
                <Upload className="w-12 h-12 text-lab-primary mx-auto mb-2" />
                <p className="text-lab-primary font-medium">Drop files here</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900">
              Files ({files.length}/{maxFiles})
            </h3>
            {files.length > 0 && (
              <button
                onClick={() => setFiles([])}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            )}
          </div>

          <AnimatePresence>
            {files.map(fileWithPreview => {
              const fileCategory = getFileTypeCategory(fileWithPreview.file);
              const config = FILE_TYPE_CONFIG[fileCategory];
              const Icon = config.icon;

              return (
                <motion.div
                  key={fileWithPreview.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-4">
                    {/* File Icon/Preview */}
                    <div className="flex-shrink-0">
                      {fileWithPreview.preview ? (
                        <img
                          src={fileWithPreview.preview}
                          alt={fileWithPreview.file.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : (
                        <div className={`p-2 rounded ${config.bgColor}`}>
                          <Icon className={`w-8 h-8 ${config.color}`} />
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {fileWithPreview.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(fileWithPreview.file.size / 1024 / 1024).toFixed(2)} MB
                        {projectName && ` • ${projectName}`}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center space-x-2">
                      {fileWithPreview.status === 'pending' && (
                        <span className="text-xs text-gray-500">Waiting...</span>
                      )}
                      
                      {fileWithPreview.status === 'uploading' && (
                        <>
                          <Loader2 className="w-4 h-4 text-lab-primary animate-spin" />
                          <span className="text-xs text-lab-primary">
                            {fileWithPreview.progress}%
                          </span>
                        </>
                      )}
                      
                      {fileWithPreview.status === 'processing' && (
                        <>
                          <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
                          <span className="text-xs text-yellow-600">Processing...</span>
                        </>
                      )}
                      
                      {fileWithPreview.status === 'completed' && (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-green-600">Complete</span>
                        </>
                      )}
                      
                      {fileWithPreview.status === 'error' && (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <span className="text-xs text-red-600">Error</span>
                        </>
                      )}

                      <button
                        onClick={() => removeFile(fileWithPreview.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {fileWithPreview.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="bg-gray-200 rounded-full h-1 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${fileWithPreview.progress}%` }}
                          className="bg-lab-primary h-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {fileWithPreview.error && (
                    <p className="mt-2 text-xs text-red-600">
                      {fileWithPreview.error}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Quick Tips */}
      {files.length === 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Quick Tips
          </h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• For best OCR results, use high-resolution scans (300 DPI+)</li>
            <li>• Tables and charts in images will be automatically detected</li>
            <li>• FASTQ files will be parsed for sequence quality analysis</li>
            <li>• Files are organized by project for easy access</li>
          </ul>
        </div>
      )}
    </div>
  );
}