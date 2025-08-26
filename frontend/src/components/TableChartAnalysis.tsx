'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileImage,
  Table,
  BarChart3,
  Eye,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  Zap,
  Grid3X3,
  TrendingUp,
  Camera,
  X
} from 'lucide-react';
import { ChartGenerator } from './ChartGenerator';
import { ImageTextPreview } from './ImageTextPreview';
import { useAppStore } from '@/stores/app';
import { chartApi } from '@/lib/api/chartApi';

interface TableData {
  table_id: string;
  type: string;
  confidence: number;
  dimensions: { rows: number; cols: number };
  position: { x: number; y: number; width: number; height: number };
  headers: string[];
  data: string[][];
  numerical_data?: {
    columns: Array<{
      column: number;
      header: string;
      values: number[];
      data_type: string;
    }>;
    chart_suggestions: string[];
  };
}

interface ProcessingResult {
  success: boolean;
  image_processing: {
    ocr_results: any;
    tables_detected: number;
    charts_available: number;
  };
  tables: TableData[];
  chart_data: any[];
  processing_timestamp: string;
}

export function TableChartAnalysis() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'tables' | 'charts'>('upload');
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useAppStore();

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Create preview URL
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    
    // Reset previous results
    setProcessingResult(null);
    setError(null);
    setProcessing(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('image', file);

      // Send to table detection API
      const result = await chartApi.detectTablesWithCharts(file);
      
      setProcessingResult(result);
      
      if (result.tables.length > 0) {
        setSelectedTable(result.tables[0]);
        setActiveTab('tables');
        
        addNotification({
          type: 'success',
          title: 'Analysis Complete',
          message: `Detected ${result.tables.length} tables with ${result.chart_data.length} chart options`,
        });
      } else {
        addNotification({
          type: 'info',
          title: 'No Tables Found',
          message: 'No tables were detected in the uploaded image',
        });
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Processing failed';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Processing Failed',
        message: errorMessage,
      });
    } finally {
      setProcessing(false);
    }
  }, [addNotification]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const clearAll = useCallback(() => {
    setUploadedImage(null);
    setProcessingResult(null);
    setSelectedTable(null);
    setError(null);
    setActiveTab('upload');
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const renderUploadSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-lab-primary hover:bg-lab-primary/5 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-lab-primary/10 rounded-full">
              <FileImage className="w-8 h-8 text-lab-primary" />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Lab Note Image
            </h3>
            <p className="text-gray-600 mb-4">
              Drop an image here or click to browse. We'll detect tables and generate charts automatically.
            </p>
            
            <div className="flex justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Table className="w-4 h-4" />
                <span>Table Detection</span>
              </div>
              <div className="flex items-center space-x-1">
                <BarChart3 className="w-4 h-4" />
                <span>Chart Generation</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>OCR Analysis</span>
              </div>
            </div>
          </div>
          
          <button className="btn-primary">
            <Upload className="w-4 h-4 mr-2" />
            Choose Image
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-4 border border-gray-200 rounded-lg">
          <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
            <Grid3X3 className="w-6 h-6 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Smart Table Detection</h4>
          <p className="text-sm text-gray-600">
            Automatically detects hand-drawn tables and structured data using advanced computer vision.
          </p>
        </div>
        
        <div className="text-center p-4 border border-gray-200 rounded-lg">
          <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Instant Chart Generation</h4>
          <p className="text-sm text-gray-600">
            Converts numerical data into interactive charts with customizable templates and styling.
          </p>
        </div>
        
        <div className="text-center p-4 border border-gray-200 rounded-lg">
          <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-3">
            <Zap className="w-6 h-6 text-purple-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Lab-Optimized</h4>
          <p className="text-sm text-gray-600">
            Specialized for scientific data types like pH, temperature, concentration, and time series.
          </p>
        </div>
      </div>
    </motion.div>
  );

  const renderTablesSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {processingResult && processingResult.tables.length > 0 && (
        <>
          {/* Tables Overview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Table className="w-5 h-5" />
                <span>Detected Tables ({processingResult.tables.length})</span>
              </h3>
              
              <div className="text-sm text-gray-500">
                {processingResult.image_processing.charts_available} chart options available
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {processingResult.tables.map((table, index) => (
                <div
                  key={table.table_id}
                  onClick={() => setSelectedTable(table)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedTable?.table_id === table.table_id
                      ? 'border-lab-primary bg-lab-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      Table {index + 1}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      table.confidence >= 80 
                        ? 'bg-green-100 text-green-800'
                        : table.confidence >= 60
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {table.confidence.toFixed(0)}%
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Type: {table.type}</div>
                    <div>Size: {table.dimensions.rows}×{table.dimensions.cols}</div>
                    {table.numerical_data && (
                      <div className="text-lab-primary font-medium">
                        {table.numerical_data.columns.length} numerical columns
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Table Details */}
          {selectedTable && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  {selectedTable.table_id} Details
                </h4>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    selectedTable.confidence >= 80 
                      ? 'bg-green-100 text-green-800'
                      : selectedTable.confidence >= 60
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedTable.confidence.toFixed(1)}% confidence
                  </span>
                </div>
              </div>
              
              {/* Table Preview */}
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      {selectedTable.headers.map((header, index) => (
                        <th
                          key={index}
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                        >
                          {header || `Column ${index + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedTable.data.slice(0, 5).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-3 py-2 text-sm text-gray-900 border-b border-gray-200"
                          >
                            {cell || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {selectedTable.data.length > 5 && (
                  <div className="text-center py-2 text-sm text-gray-500">
                    ... and {selectedTable.data.length - 5} more rows
                  </div>
                )}
              </div>
              
              {/* Numerical Data Info */}
              {selectedTable.numerical_data && (
                <div className="bg-lab-primary/5 rounded-lg p-4">
                  <h5 className="font-medium text-lab-primary mb-2">Numerical Data Available</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedTable.numerical_data.columns.map((col, index) => (
                      <div key={index} className="bg-white rounded p-3 border">
                        <div className="font-medium text-sm text-gray-900">
                          {col.header}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {col.data_type} • {col.values.length} values
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Range: {Math.min(...col.values).toFixed(1)} - {Math.max(...col.values).toFixed(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Chart suggestions: {selectedTable.numerical_data.chart_suggestions.join(', ')}
                    </div>
                    <button
                      onClick={() => setActiveTab('charts')}
                      className="btn-primary text-sm"
                    >
                      Generate Charts
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </motion.div>
  );

  const renderChartsSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {processingResult && processingResult.tables.length > 0 ? (
        <ChartGenerator 
          tableData={processingResult.tables}
          onChartSave={(config, data) => {
            addNotification({
              type: 'success',
              title: 'Chart Saved',
              message: `${config.title} has been saved successfully`,
            });
          }}
        />
      ) : (
        <div className="text-center py-12 text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No Chart Data Available</h3>
          <p className="text-sm">
            Upload an image with tables to generate charts from numerical data.
          </p>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Table & Chart Analysis
            </h1>
            <p className="text-gray-600">
              Upload lab note images to automatically detect tables and generate interactive charts
            </p>
          </div>
          
          {uploadedImage && (
            <button
              onClick={clearAll}
              className="btn-outline flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      {processing && (
        <div className="mb-6 bg-lab-primary/5 border border-lab-primary/20 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-5 h-5 text-lab-primary animate-spin" />
            <div>
              <div className="font-medium text-lab-primary">Processing Image...</div>
              <div className="text-sm text-gray-600">
                Detecting tables and analyzing numerical data
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <div className="font-medium text-red-800">Processing Error</div>
              <div className="text-sm text-red-600">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      {uploadedImage && (
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'upload', label: 'Upload', icon: Upload },
                { id: 'tables', label: 'Tables', icon: Table, count: processingResult?.tables.length },
                { id: 'charts', label: 'Charts', icon: BarChart3, count: processingResult?.chart_data.length }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-lab-primary text-lab-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-6">
        {/* Image Preview */}
        {uploadedImage && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <ImageTextPreview
              imageUrl={uploadedImage}
              extractedText={processingResult?.image_processing.ocr_results?.text || ''}
              confidence={processingResult?.image_processing.ocr_results?.confidence || 0}
              showConfidenceColors={true}
              enableRegionHighlight={true}
            />
          </div>
        )}

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'upload' && renderUploadSection()}
          {activeTab === 'tables' && renderTablesSection()}
          {activeTab === 'charts' && renderChartsSection()}
        </AnimatePresence>
      </div>
    </div>
  );
}