'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload,
  FileImage,
  Eye,
  Edit3,
  Save,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Camera,
  Zap,
  FileText,
  AlertCircle,
  Info,
  RefreshCw,
  X
} from 'lucide-react';
import { useAppStore } from '@/stores/app';
import { EnhancedImageUpload } from './EnhancedImageUpload';
import { LabAutocomplete } from './LabAutocomplete';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  status: 'pending' | 'current' | 'completed' | 'error';
  canSkip?: boolean;
}

interface ProcessingResult {
  fileId: string;
  filename: string;
  ocrText: string;
  confidence: number;
  structuredData?: any;
  previewUrl: string;
}

interface GuidedWorkflowProps {
  onComplete?: (results: ProcessingResult[]) => void;
  onCancel?: () => void;
  projectId?: string;
  className?: string;
}

export function GuidedWorkflow({
  onComplete,
  onCancel,
  projectId,
  className = ''
}: GuidedWorkflowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [processingResults, setProcessingResults] = useState<ProcessingResult[]>([]);
  const [editingResults, setEditingResults] = useState<ProcessingResult[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTips, setShowTips] = useState(true);
  
  const { addNotification } = useAppStore();

  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: 'upload',
      title: 'Upload Images',
      description: 'Select your lab note images to process',
      icon: Upload,
      status: 'current'
    },
    {
      id: 'preview',
      title: 'Preview & Review',
      description: 'Review extracted text and confidence levels',
      icon: Eye,
      status: 'pending'
    },
    {
      id: 'edit',
      title: 'Edit & Correct',
      description: 'Correct any OCR errors and add tags',
      icon: Edit3,
      status: 'pending',
      canSkip: true
    },
    {
      id: 'save',
      title: 'Save & Structure',
      description: 'Save your processed lab notes',
      icon: Save,
      status: 'pending'
    }
  ]);

  const updateStepStatus = useCallback((stepIndex: number, status: WorkflowStep['status']) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, status } : step
    ));
  }, []);

  const handleUploadSuccess = useCallback((uploadResults: any[]) => {
    setIsProcessing(true);
    updateStepStatus(0, 'completed');
    
    // Simulate OCR processing (in real app, this would be actual API calls)
    const mockResults: ProcessingResult[] = uploadResults.map((result, index) => ({
      fileId: `file_${index}`,
      filename: result.filename || `image_${index}.jpg`,
      ocrText: `Sample extracted text from ${result.filename}. This would contain the actual OCR results with methods, observations, and measurements.`,
      confidence: 85 + Math.random() * 10, // Mock confidence between 85-95%
      previewUrl: `/api/preview/${result.filename}`, // Mock preview URL
      structuredData: {
        experiment_id: `EXP-2025-${String(index + 1).padStart(3, '0')}`,
        methods: 'Sample methods extracted from the note',
        results: 'Sample results with measurements',
        observations: 'Key observations noted'
      }
    }));

    // Simulate processing delay
    setTimeout(() => {
      setProcessingResults(mockResults);
      setEditingResults([...mockResults]);
      setIsProcessing(false);
      setCurrentStep(1);
      updateStepStatus(1, 'current');
      
      addNotification({
        type: 'success',
        title: 'Processing Complete',
        message: `${mockResults.length} file(s) processed successfully`,
      });
    }, 2000);
  }, [updateStepStatus, addNotification]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      updateStepStatus(currentStep, 'completed');
      setCurrentStep(currentStep + 1);
      updateStepStatus(currentStep + 1, 'current');
    }
  }, [currentStep, steps.length, updateStepStatus]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      updateStepStatus(currentStep, 'pending');
      setCurrentStep(currentStep - 1);
      updateStepStatus(currentStep - 1, 'current');
    }
  }, [currentStep, updateStepStatus]);

  const handleComplete = useCallback(() => {
    updateStepStatus(currentStep, 'completed');
    onComplete?.(editingResults);
    
    addNotification({
      type: 'success',
      title: 'Workflow Complete',
      message: 'Lab notes have been processed and saved successfully',
    });
  }, [currentStep, editingResults, onComplete, updateStepStatus, addNotification]);

  const handleEditResult = useCallback((index: number, field: string, value: string) => {
    setEditingResults(prev => prev.map((result, i) => 
      i === index 
        ? { 
            ...result, 
            [field]: value,
            structuredData: field.startsWith('structured') 
              ? { ...result.structuredData, [field.replace('structured.', '')]: value }
              : result.structuredData
          }
        : result
    ));
  }, []);

  const getStepIcon = (step: WorkflowStep) => {
    const IconComponent = step.icon;
    
    if (step.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (step.status === 'error') {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    } else {
      return <IconComponent className={`w-5 h-5 ${
        step.status === 'current' ? 'text-lab-primary' : 'text-gray-400'
      }`} />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const currentStepData = steps[currentStep];

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            Process Lab Notes
          </h2>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                step.status === 'current' 
                  ? 'bg-lab-primary/10 text-lab-primary' 
                  : step.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {getStepIcon(step)}
                <div>
                  <p className="font-medium text-sm">{step.title}</p>
                  <p className="text-xs opacity-75">{step.description}</p>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-gray-300 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="card p-6 mb-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Upload */}
          {currentStep === 0 && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <Camera className="w-12 h-12 text-lab-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Upload Your Lab Note Images
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Select clear, well-lit photos of your handwritten lab notes. 
                  Multiple images will be processed simultaneously.
                </p>
              </div>

              <EnhancedImageUpload
                onUploadSuccess={handleUploadSuccess}
                enableRealTimeOCR={true}
                enableStructuredParsing={true}
                projectId={projectId}
                maxFiles={3}
              />

              {showTips && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900 mb-2">Tips for Better Results</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Ensure good lighting and avoid shadows</li>
                        <li>• Keep text straight and avoid camera angles</li>
                        <li>• Include clear section headers like "Methods:" and "Results:"</li>
                        <li>• Make sure measurements include units (mL, °C, pH, etc.)</li>
                      </ul>
                    </div>
                    <button
                      onClick={() => setShowTips(false)}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Preview */}
          {currentStep === 1 && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {isProcessing ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-12 h-12 text-lab-primary mx-auto mb-4 animate-spin" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Processing Your Images
                  </h3>
                  <p className="text-gray-600">
                    Extracting text and analyzing structure...
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <Eye className="w-12 h-12 text-lab-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Review Extracted Text
                    </h3>
                    <p className="text-gray-600">
                      Check the OCR results and confidence levels before proceeding
                    </p>
                  </div>

                  <div className="space-y-4">
                    {processingResults.map((result, index) => (
                      <div key={result.fileId} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <FileImage className="w-5 h-5 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {result.filename}
                            </span>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(result.confidence)}`}>
                            {result.confidence.toFixed(1)}% confidence
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-700 max-h-32 overflow-y-auto">
                          {result.ocrText}
                        </div>
                        
                        {result.structuredData && (
                          <div className="mt-3 text-xs text-gray-500">
                            <strong>Detected:</strong> {result.structuredData.experiment_id}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Step 3: Edit */}
          {currentStep === 2 && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <Edit3 className="w-12 h-12 text-lab-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Edit & Correct Text
                </h3>
                <p className="text-gray-600">
                  Make any necessary corrections to improve accuracy
                </p>
              </div>

              {editingResults.length > 1 && (
                <div className="flex space-x-2 mb-4">
                  {editingResults.map((result, index) => (
                    <button
                      key={result.fileId}
                      onClick={() => setSelectedResultIndex(index)}
                      className={`px-3 py-2 text-sm rounded-md transition-colors ${
                        selectedResultIndex === index
                          ? 'bg-lab-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {result.filename}
                    </button>
                  ))}
                </div>
              )}

              {editingResults[selectedResultIndex] && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Extracted Text
                    </label>
                    <textarea
                      value={editingResults[selectedResultIndex].ocrText}
                      onChange={(e) => handleEditResult(selectedResultIndex, 'ocrText', e.target.value)}
                      className="w-full h-32 border border-gray-300 rounded-md p-3 focus:ring-lab-primary focus:border-lab-primary"
                      placeholder="Edit the extracted text..."
                    />
                  </div>

                  {editingResults[selectedResultIndex].structuredData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <LabAutocomplete
                        value={editingResults[selectedResultIndex].structuredData.experiment_id || ''}
                        onChange={(value) => handleEditResult(selectedResultIndex, 'structured.experiment_id', value)}
                        placeholder="Experiment ID..."
                      />
                      
                      <LabAutocomplete
                        value={editingResults[selectedResultIndex].structuredData.methods || ''}
                        onChange={(value) => handleEditResult(selectedResultIndex, 'structured.methods', value)}
                        placeholder="Methods..."
                      />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 4: Save */}
          {currentStep === 3 && (
            <motion.div
              key="save"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <Save className="w-12 h-12 text-lab-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Save Your Lab Notes
                </h3>
                <p className="text-gray-600">
                  Your processed notes will be saved with structured data
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-900">Ready to Save</h4>
                    <p className="text-sm text-green-700">
                      {editingResults.length} file(s) processed and ready to be saved to your lab records
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {editingResults.map((result, index) => (
                  <div key={result.fileId} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{result.filename}</span>
                      {result.structuredData?.experiment_id && (
                        <span className="text-xs text-lab-primary">
                          {result.structuredData.experiment_id}
                        </span>
                      )}
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="btn-outline flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center space-x-3">
          {currentStepData?.canSkip && (
            <button
              onClick={handleNext}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Skip this step
            </button>
          )}
          
          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={currentStep === 0 && processingResults.length === 0}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="btn-primary flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Complete & Save</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}