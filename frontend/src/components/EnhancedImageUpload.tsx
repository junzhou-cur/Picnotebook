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
  Camera,
  FileText,
  Edit3,
  Save,
  Eye,
  EyeOff,
  Zap
} from 'lucide-react';
import { useAppStore } from '@/stores/app';
import { api } from '@/lib/api';
import type { UploadResponse } from '@/types';

interface UploadedFile {
  file: File;
  previewUrl: string;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  uploadResult?: UploadResponse;
  ocrText?: string;
  structuredData?: any;
  isProcessing?: boolean;
  error?: string;
}

interface EnhancedImageUploadProps {
  onUploadSuccess?: (results: UploadResponse[]) => void;
  onUploadError?: (error: string) => void;
  onOCRComplete?: (fileId: string, text: string, structured?: any) => void;
  disabled?: boolean;
  className?: string;
  maxFiles?: number;
  enableRealTimeOCR?: boolean;
  enableStructuredParsing?: boolean;
  projectId?: string;
}

export function EnhancedImageUpload({ 
  onUploadSuccess, 
  onUploadError, 
  onOCRComplete,
  disabled = false,
  className = '',
  maxFiles = 5,
  enableRealTimeOCR = true,
  enableStructuredParsing = false,
  projectId
}: EnhancedImageUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showPreviews, setShowPreviews] = useState(true);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNotification, apiKey } = useAppStore();

  const processOCR = useCallback(async (uploadedFile: UploadedFile, index: number) => {
    if (!enableRealTimeOCR || !apiKey) return;

    try {
      // Update status to processing
      setUploadedFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, isProcessing: true } : f
      ));

      let ocrResult;
      
      if (enableStructuredParsing) {
        // Use structured lab note processing
        const formData = new FormData();
        if (projectId) formData.append('project_id', projectId);
        
        const response = await api.post('/process_lab_note', formData);
        ocrResult = await response.json();
      } else {
        // Use enhanced OCR
        const formData = new FormData();
        if (projectId) formData.append('project_id', projectId);
        
        const response = await api.post('/enhanced_ocr', formData);
        ocrResult = await response.json();
      }

      if (ocrResult.success) {
        const extractedText = enableStructuredParsing 
          ? ocrResult.result?.ocr_results?.extracted_text || ''
          : ocrResult.ocr_result?.text || '';
        
        const structuredData = enableStructuredParsing 
          ? ocrResult.result?.structured_data 
          : undefined;

        setUploadedFiles(prev => prev.map((f, i) => 
          i === index ? { 
            ...f, 
            ocrText: extractedText,
            structuredData,
            isProcessing: false 
          } : f
        ));

        onOCRComplete?.(uploadedFile.file.name, extractedText, structuredData);
        
        addNotification({
          type: 'success',
          title: 'OCR Complete',
          message: `Text extracted from ${uploadedFile.file.name}`,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'OCR processing failed';
      
      setUploadedFiles(prev => prev.map((f, i) => 
        i === index ? { 
          ...f, 
          isProcessing: false,
          error: errorMessage 
        } : f
      ));
      
      addNotification({
        type: 'error',  
        title: 'OCR Failed',
        message: errorMessage,
      });
    }
  }, [enableRealTimeOCR, enableStructuredParsing, apiKey, projectId, onOCRComplete, addNotification, api]);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    
    // Check file limits
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      const error = `Maximum ${maxFiles} files allowed`;
      onUploadError?.(error);
      addNotification({
        type: 'error',
        title: 'Too Many Files',
        message: error,
      });
      return;
    }

    // Check if API key is set for OCR processing
    if (!apiKey && enableRealTimeOCR) {
      addNotification({
        type: 'warning',
        title: 'API Key Required',
        message: 'Please set your xAI API key in Settings to enable real-time OCR processing.',
      });
    }

    const newFiles: UploadedFile[] = [];
    
    for (const file of fileArray) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        addNotification({
          type: 'error',
          title: 'Invalid File Type',
          message: `${file.name} is not an image file`,
        });
        continue;
      }

      // Validate file size (16MB max)
      const maxSize = 16 * 1024 * 1024;
      if (file.size > maxSize) {
        addNotification({
          type: 'error',
          title: 'File Too Large',
          message: `${file.name} must be less than 16MB`,
        });
        continue;
      }

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      
      const uploadedFile: UploadedFile = {
        file,
        previewUrl,
        uploadStatus: 'idle'
      };
      
      newFiles.push(uploadedFile);
    }

    if (newFiles.length === 0) return;

    // Add files to state
    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Upload files sequentially
    const results: UploadResponse[] = [];
    
    for (let i = 0; i < newFiles.length; i++) {
      const fileIndex = uploadedFiles.length + i;
      const uploadedFile = newFiles[i];
      
      try {
        // Update status to uploading
        setUploadedFiles(prev => prev.map((f, idx) => 
          idx === fileIndex ? { ...f, uploadStatus: 'uploading' } : f
        ));

        const result = await api.uploadImage(uploadedFile.file);
        
        if (result.success) {
          setUploadedFiles(prev => prev.map((f, idx) => 
            idx === fileIndex ? { 
              ...f, 
              uploadStatus: 'success',
              uploadResult: result 
            } : f
          ));
          
          results.push(result);
          
          // Process OCR if enabled and successful upload
          if (enableRealTimeOCR && apiKey) {
            await processOCR(uploadedFile, fileIndex);
          }
          
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        
        setUploadedFiles(prev => prev.map((f, idx) => 
          idx === fileIndex ? { 
            ...f, 
            uploadStatus: 'error',
            error: errorMessage 
          } : f
        ));
      }
    }

    if (results.length > 0) {
      onUploadSuccess?.(results);
      addNotification({
        type: 'success',
        title: 'Upload Complete',
        message: `${results.length} file(s) uploaded successfully`,
      });
    }
  }, [uploadedFiles.length, maxFiles, apiKey, enableRealTimeOCR, processOCR, onUploadSuccess, onUploadError, addNotification]);

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

  const handleRemoveFile = useCallback((index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      // Clean up preview URL
      URL.revokeObjectURL(newFiles[index].previewUrl);
      newFiles.splice(index, 1);
      return newFiles;
    });
  }, []);

  const handleEditText = useCallback((index: number) => {
    const file = uploadedFiles[index];
    if (file.ocrText) {
      setEditingTextId(file.file.name);
      setEditedText(file.ocrText);
    }
  }, [uploadedFiles]);

  const handleSaveText = useCallback((index: number) => {
    setUploadedFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, ocrText: editedText } : f
    ));
    setEditingTextId(null);
    setEditedText('');
    
    addNotification({
      type: 'success',
      title: 'Text Updated',
      message: 'OCR text has been corrected',
    });
  }, [editedText, addNotification]);

  const getStatusIcon = (file: UploadedFile) => {
    if (file.uploadStatus === 'uploading' || file.isProcessing) 
      return <Loader2 className="w-4 h-4 animate-spin text-lab-primary" />;
    if (file.uploadStatus === 'success') 
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (file.uploadStatus === 'error') 
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    return <ImageIcon className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className={`w-full space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Zone */}
      <motion.div
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
              <Upload className="w-8 h-8 text-gray-400" />
            )}
          </motion.div>
          
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload Lab Note Images
            </h3>
            <p className="text-gray-600 mb-2">
              {isDragActive ? 'Drop your images here' : `Click to upload or drag and drop up to ${maxFiles} images`}
            </p>
            <p className="text-sm text-gray-500">
              Supports JPG, PNG up to 16MB each
            </p>
            {enableRealTimeOCR && !apiKey && (
              <p className="text-xs text-orange-600 mt-2 bg-orange-50 px-3 py-1 rounded-lg">
                ⚠️ Set API key in Settings for real-time OCR
              </p>
            )}
            {enableStructuredParsing && (
              <p className="text-xs text-blue-600 mt-1 bg-blue-50 px-3 py-1 rounded-lg">
                <Zap className="w-3 h-3 inline mr-1" />
                Structured lab note parsing enabled
              </p>
            )}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-outline"
            disabled={disabled}
          >
            Choose Images
          </motion.button>
        </div>
      </motion.div>

      {/* Preview Toggle */}
      {uploadedFiles.length > 0 && (
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">
            Uploaded Files ({uploadedFiles.length}/{maxFiles})
          </h4>
          <button
            onClick={() => setShowPreviews(!showPreviews)}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
          >
            {showPreviews ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showPreviews ? 'Hide' : 'Show'} Previews</span>
          </button>
        </div>
      )}

      {/* File Previews */}
      <AnimatePresence>
        {showPreviews && uploadedFiles.map((uploadedFile, index) => (
          <motion.div
            key={uploadedFile.file.name}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card p-4"
          >
            <div className="flex space-x-4">
              {/* Image Preview */}
              <div className="flex-shrink-0">
                <div className="relative group">
                  <img
                    src={uploadedFile.previewUrl}
                    alt={uploadedFile.file.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="bg-white/20 backdrop-blur-sm text-white p-1 rounded-full hover:bg-white/30 transition-colors"
                      disabled={disabled}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* File Info and OCR Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(uploadedFile)}
                    <span className={`text-xs font-medium ${
                      uploadedFile.uploadStatus === 'success' ? 'text-green-600' :
                      uploadedFile.uploadStatus === 'error' ? 'text-red-600' :
                      uploadedFile.uploadStatus === 'uploading' || uploadedFile.isProcessing ? 'text-lab-primary' : 'text-gray-500'
                    }`}>
                      {uploadedFile.uploadStatus === 'uploading' ? 'Uploading...' :
                       uploadedFile.isProcessing ? 'Processing OCR...' :
                       uploadedFile.uploadStatus === 'success' ? 'Ready' :
                       uploadedFile.uploadStatus === 'error' ? 'Failed' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* OCR Text Display */}
                {uploadedFile.ocrText && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-medium text-gray-700">
                          {enableStructuredParsing ? 'Extracted & Structured Text' : 'Extracted Text'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleEditText(index)}
                        className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                    
                    {editingTextId === uploadedFile.file.name ? (
                      <div className="space-y-2">
                        <textarea
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                          className="w-full h-32 text-xs border border-gray-300 rounded-md p-2 focus:ring-lab-primary focus:border-lab-primary"
                          placeholder="Edit extracted text..."
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setEditingTextId(null)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveText(index)}
                            className="text-xs text-lab-primary hover:text-lab-primary/80 flex items-center space-x-1"
                          >
                            <Save className="w-3 h-3" />
                            <span>Save</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-md p-3 max-h-32 overflow-y-auto">
                        <p className="text-xs text-gray-700 whitespace-pre-wrap">
                          {uploadedFile.ocrText}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Structured Data Preview */}
                {uploadedFile.structuredData && enableStructuredParsing && (
                  <div className="mt-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-medium text-gray-700">Structured Data</span>
                    </div>
                    <div className="bg-blue-50 rounded-md p-3 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        {uploadedFile.structuredData.experiment_id && (
                          <div>
                            <span className="font-medium">ID:</span> {uploadedFile.structuredData.experiment_id}
                          </div>
                        )}
                        {uploadedFile.structuredData.researcher && (
                          <div>
                            <span className="font-medium">Researcher:</span> {uploadedFile.structuredData.researcher}
                          </div>
                        )}
                        {uploadedFile.structuredData.date && (
                          <div>
                            <span className="font-medium">Date:</span> {uploadedFile.structuredData.date}
                          </div>
                        )}
                        {uploadedFile.structuredData.measurements && uploadedFile.structuredData.measurements.length > 0 && (
                          <div>
                            <span className="font-medium">Measurements:</span> {uploadedFile.structuredData.measurements.length} found
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {uploadedFile.error && (
                  <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                    {uploadedFile.error}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}