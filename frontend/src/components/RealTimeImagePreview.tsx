'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye,
  Edit3,
  Save,
  X,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Check,
  AlertCircle,
  FileText,
  Table,
  BarChart3,
  Loader2,
  Wand2,
  Copy,
  Download
} from 'lucide-react';
import { ImageTextPreview } from './ImageTextPreview';
import { QuickEditTools } from './QuickEditTools';

interface ProcessingResult {
  text: string;
  confidence: number;
  tables_detected: number;
  charts_available: number;
  structured_data?: any;
  processing_time: number;
}

interface RealTimeImagePreviewProps {
  file: File;
  projectId?: string;
  projectName?: string;
  onSave?: (data: any) => void;
  onClose?: () => void;
  className?: string;
}

export function RealTimeImagePreview({
  file,
  projectId,
  projectName,
  onSave,
  onClose,
  className = ''
}: RealTimeImagePreviewProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'edit' | 'analysis'>('preview');
  const [editedText, setEditedText] = useState('');
  const [saving, setSaving] = useState(false);

  // Create image preview URL
  useEffect(() => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      
      // Auto-start processing
      processImage();
      
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  // Process image with OCR and analysis
  const processImage = useCallback(async () => {
    setProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      if (projectId) {
        formData.append('project_id', projectId);
      }

      // Call the enhanced OCR endpoint
      const response = await fetch('/api/detect_tables_with_charts', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Processing failed');
      }

      const result = await response.json();
      
      setProcessingResult({
        text: result.image_processing.ocr_results.text || '',
        confidence: result.image_processing.ocr_results.confidence || 0,
        tables_detected: result.image_processing.tables_detected,
        charts_available: result.image_processing.charts_available,
        structured_data: result.tables,
        processing_time: Date.now() - startTime
      });

      setEditedText(result.image_processing.ocr_results.text || '');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
    } finally {
      setProcessing(false);
    }

    const startTime = Date.now();
  }, [file, projectId]);

  // Save processed data
  const handleSave = useCallback(async () => {
    if (!processingResult) return;

    setSaving(true);
    try {
      const saveData = {
        filename: file.name,
        original_text: processingResult.text,
        edited_text: editedText,
        confidence: processingResult.confidence,
        tables_detected: processingResult.tables_detected,
        structured_data: processingResult.structured_data,
        project_id: projectId,
        project_name: projectName
      };

      // Call save endpoint
      const response = await fetch('/api/save_processed_note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData)
      });

      if (!response.ok) {
        throw new Error('Save failed');
      }

      const result = await response.json();
      onSave?.(result);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [processingResult, editedText, file, projectId, projectName, onSave]);

  // Copy text to clipboard
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(editedText);
      // Show success notification
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  }, [editedText]);

  // Download as text file
  const downloadAsText = useCallback(() => {
    const blob = new Blob([editedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${file.name.split('.')[0]}_extracted.txt`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [editedText, file.name]);

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {file.name}
              </h2>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                {projectName && (
                  <>
                    <span>•</span>
                    <span>Project: {projectName}</span>
                  </>
                )}
                {processingResult && (
                  <>
                    <span>•</span>
                    <span className="text-green-600 flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Processed in {(processingResult.processing_time / 1000).toFixed(1)}s</span>
                    </span>
                  </>
                )}
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-4">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'preview'
                  ? 'bg-lab-primary text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-1" />
              Preview
            </button>
            
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'edit'
                  ? 'bg-lab-primary text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              disabled={!processingResult}
            >
              <Edit3 className="w-4 h-4 inline mr-1" />
              Edit Text
            </button>
            
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'analysis'
                  ? 'bg-lab-primary text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              disabled={!processingResult}
            >
              <BarChart3 className="w-4 h-4 inline mr-1" />
              Analysis
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Processing State */}
          {processing && (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-lab-primary animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Processing Image...
                </h3>
                <p className="text-sm text-gray-500">
                  Extracting text, detecting tables, and analyzing data
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-800 mb-2">
                  Processing Error
                </h3>
                <p className="text-sm text-red-600 mb-4">{error}</p>
                <button
                  onClick={processImage}
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Retry</span>
                </button>
              </div>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && !processing && !error && (
            <div className="p-4">
              {processingResult ? (
                <ImageTextPreview
                  imageUrl={imageUrl}
                  extractedText={processingResult.text}
                  confidence={processingResult.confidence}
                  onTextEdit={(text) => setEditedText(text)}
                  showConfidenceColors={true}
                  enableRegionHighlight={true}
                />
              ) : (
                <div className="flex justify-center p-8">
                  <img
                    src={imageUrl}
                    alt={file.name}
                    className="max-w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>
          )}

          {/* Edit Tab */}
          {activeTab === 'edit' && processingResult && (
            <div className="p-4 space-y-4">
              <QuickEditTools
                extractedText={editedText}
                onTextUpdate={(text) => setEditedText(text)}
                className="mb-4"
              />
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Extracted Text
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={copyToClipboard}
                      className="btn-outline text-xs flex items-center space-x-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={downloadAsText}
                      className="btn-outline text-xs flex items-center space-x-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
                
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full h-64 border border-gray-300 rounded-lg p-3 font-mono text-sm focus:ring-lab-primary focus:border-lab-primary"
                  placeholder="Extracted text will appear here..."
                />
                
                <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                  <span>{editedText.length} characters</span>
                  <span className={`flex items-center space-x-1 ${
                    processingResult.confidence >= 90 ? 'text-green-600' :
                    processingResult.confidence >= 75 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    <span>{processingResult.confidence.toFixed(1)}% confidence</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Tab */}
          {activeTab === 'analysis' && processingResult && (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold text-blue-900">
                        {processingResult.text.split(/\s+/).length}
                      </p>
                      <p className="text-sm text-blue-700">Words Extracted</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Table className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold text-green-900">
                        {processingResult.tables_detected}
                      </p>
                      <p className="text-sm text-green-700">Tables Detected</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-8 h-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold text-purple-900">
                        {processingResult.charts_available}
                      </p>
                      <p className="text-sm text-purple-700">Charts Available</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detected Tables */}
              {processingResult.structured_data && processingResult.structured_data.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Detected Tables
                  </h3>
                  <div className="space-y-4">
                    {processingResult.structured_data.map((table: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            Table {index + 1} ({table.dimensions.rows}×{table.dimensions.cols})
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            table.confidence >= 80 
                              ? 'bg-green-100 text-green-800'
                              : table.confidence >= 60
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {table.confidence.toFixed(0)}% confidence
                          </span>
                        </div>
                        
                        {table.numerical_data && (
                          <div className="text-sm text-gray-600">
                            <p>{table.numerical_data.columns.length} numerical columns detected</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Suggested charts: {table.numerical_data.chart_suggestions.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {processingResult && (
                <span>
                  Ready to save • {processingResult.tables_detected} tables • 
                  {processingResult.charts_available} chart options
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="btn-outline"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSave}
                disabled={!processingResult || saving}
                className="btn-primary flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save to {projectName || 'Project'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}