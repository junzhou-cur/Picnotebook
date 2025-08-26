'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Camera
} from 'lucide-react';
import { useAppStore } from '@/stores/app';
import { api } from '@/lib/api';
import type { UploadResponse } from '@/types';

interface ImageUploadProps {
  onUploadSuccess?: (result: UploadResponse) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({ 
  onUploadSuccess, 
  onUploadError, 
  disabled = false,
  className = '' 
}: ImageUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNotification, apiKey } = useAppStore();

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check if API key is set for image processing
    if (!apiKey && file.type.startsWith('image/')) {
      addNotification({
        type: 'warning',
        title: 'API Key Required',
        message: 'Please set your xAI API key in Settings to enable AI processing of images.',
      });
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      const error = 'Please select an image file (JPG, PNG, etc.)';
      setUploadStatus('error');
      onUploadError?.(error);
      addNotification({
        type: 'error',
        title: 'Invalid File Type',
        message: error,
      });
      return;
    }

    // Validate file size (16MB max)
    const maxSize = 16 * 1024 * 1024;
    if (file.size > maxSize) {
      const error = 'File size must be less than 16MB';
      setUploadStatus('error');
      onUploadError?.(error);
      addNotification({
        type: 'error',
        title: 'File Too Large',
        message: error,
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setUploadedFile(file);
    setIsUploading(true);
    setUploadStatus('idle');

    try {
      const result = await api.uploadImage(file);
      
      if (result.success) {
        setUploadStatus('success');
        onUploadSuccess?.(result);
        
        // If it's an image that needs processing, show processing message
        if (result.file_type === 'image' && result.needs_processing) {
          addNotification({
            type: 'success',
            title: 'Upload Successful',
            message: `${file.name} uploaded successfully. Ready for AI processing.`,
          });
        } else {
          addNotification({
            type: 'success',
            title: 'Upload Successful',
            message: `${file.name} uploaded successfully`,
          });
        }
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadStatus('error');
      onUploadError?.(errorMessage);
      addNotification({
        type: 'error',
        title: 'Upload Failed',
        message: errorMessage,
      });
    } finally {
      setIsUploading(false);
    }
  }, [onUploadSuccess, onUploadError, addNotification]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragActive(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (!disabled) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, handleFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleRemove = useCallback(() => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setUploadStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const getStatusIcon = () => {
    if (isUploading) return <Loader2 className="w-6 h-6 animate-spin text-lab-primary" />;
    if (uploadStatus === 'success') return <CheckCircle className="w-6 h-6 text-green-600" />;
    if (uploadStatus === 'error') return <AlertCircle className="w-6 h-6 text-red-600" />;
    return <Upload className="w-6 h-6 text-gray-400" />;
  };

  const getStatusText = () => {
    if (isUploading) return 'Uploading...';
    if (uploadStatus === 'success') return 'Upload successful!';
    if (uploadStatus === 'error') return 'Upload failed';
    return isDragActive ? 'Drop your image here' : 'Click to upload or drag and drop';
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      <AnimatePresence mode="wait">
        {previewUrl ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative"
          >
            <div className="card p-4">
              <div className="relative group">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                  <button
                    onClick={handleRemove}
                    className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
                    disabled={disabled}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon()}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {uploadedFile?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {uploadedFile ? `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB` : ''}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`text-xs font-medium ${
                    uploadStatus === 'success' ? 'text-green-600' :
                    uploadStatus === 'error' ? 'text-red-600' :
                    isUploading ? 'text-lab-primary' : 'text-gray-500'
                  }`}>
                    {getStatusText()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`upload-zone ${isDragActive ? 'upload-zone-active' : ''} ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <div className="flex flex-col items-center space-y-4">
              <motion.div
                animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isDragActive ? 'bg-lab-primary/20' : 'bg-gray-100'
                }`}
              >
                {isDragActive ? (
                  <Camera className="w-8 h-8 text-lab-primary" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
              </motion.div>
              
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload Lab Note Image
                </h3>
                <p className="text-gray-600 mb-2">
                  {getStatusText()}
                </p>
                <p className="text-sm text-gray-500">
                  Supports JPG, PNG up to 16MB
                </p>
                {!apiKey && (
                  <p className="text-xs text-orange-600 mt-2 bg-orange-50 px-3 py-1 rounded-lg">
                    ⚠️ Set API key in Settings for AI processing
                  </p>
                )}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-outline"
                disabled={disabled}
              >
                Choose Image
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}