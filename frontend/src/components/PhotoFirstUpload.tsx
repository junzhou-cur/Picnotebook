'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  X, 
  ZoomIn, 
  RotateCw, 
  Download,
  Eye,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { SmartExperimentTemplate } from './SmartExperimentTemplate';

interface PhotoFirstUploadProps {
  projectContext?: {
    id: string;
    name: string;
    code: string;
    tags?: string[];
  };
  onExperimentSaved?: (data: any) => void;
  onClose?: () => void;
  className?: string;
}

interface UploadStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
}

export function PhotoFirstUpload({
  projectContext,
  onExperimentSaved,
  onClose,
  className = ''
}: PhotoFirstUploadProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [ocrText, setOcrText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps: UploadStep[] = [
    {
      id: 'upload',
      title: 'Upload Photo',
      description: 'Take or select your experiment photo',
      icon: Camera,
      completed: !!uploadedImage
    },
    {
      id: 'analyze',
      title: 'AI Analysis',
      description: 'Detect experiment type and extract text',
      icon: Sparkles,
      completed: !!ocrText && !isProcessing
    },
    {
      id: 'template',
      title: 'Smart Form',
      description: 'Fill in experiment details',
      icon: Eye,
      completed: false
    }
  ];

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploadedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Start processing
    setIsProcessing(true);
    setCurrentStep(1);

    // Simulate OCR processing
    try {
      // In real implementation, you'd call your OCR API here
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock OCR results based on filename for demo
      const mockOcrText = generateMockOcrText(file.name);
      setOcrText(mockOcrText);
      
      setCurrentStep(2);
    } catch (error) {
      console.error('OCR processing failed:', error);
      setOcrText('OCR processing failed, but you can still use the smart template');
      setCurrentStep(2);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle experiment save
  const handleExperimentSave = useCallback((data: any) => {
    onExperimentSaved?.({
      ...data,
      imageFile: uploadedImage,
      ocrText,
      projectContext
    });
  }, [uploadedImage, ocrText, projectContext, onExperimentSaved]);

  // Reset upload
  const handleReset = useCallback(() => {
    setUploadedImage(null);
    setImagePreview('');
    setOcrText('');
    setCurrentStep(0);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className={`bg-white rounded-lg shadow-xl ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Camera className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Photo-First Lab Recording</h2>
              <p className="text-sm text-gray-500">
                {projectContext ? `Recording for ${projectContext.code}` : 'Quick experiment documentation'}
              </p>
            </div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="mt-6">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = step.completed;
              const isPast = index < currentStep;

              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center space-x-3 ${
                    isActive ? 'text-purple-600' : 
                    isCompleted || isPast ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      isActive ? 'border-purple-600 bg-purple-50' :
                      isCompleted || isPast ? 'border-green-600 bg-green-50' : 'border-gray-300'
                    }`}>
                      {isCompleted || isPast ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{step.title}</p>
                      <p className="text-xs opacity-75">{step.description}</p>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-300 mx-4" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Step 1: Upload */}
        {currentStep === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Camera className="w-8 h-8 text-purple-600" />
                </div>
                
                <div>
                  <p className="text-lg font-semibold text-gray-900">Upload Your Experiment Photo</p>
                  <p className="text-gray-500 mt-2">
                    Drag and drop your experiment image, or click to browse
                  </p>
                </div>
                
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <span>📸 6-well plates</span>
                  <span>🧬 PCR gels</span>
                  <span>🔬 Western blots</span>
                  <span>📊 Any lab results</span>
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Quick Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">📝 Quick Tips for Better Results</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Include any handwritten labels or annotations in the photo</li>
                <li>• Ensure good lighting and focus for text recognition</li>
                <li>• Capture the entire experimental setup when possible</li>
                <li>• Multiple angles? Upload them one by one for complete records</li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* Step 2: Processing */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Image Preview */}
            {imagePreview && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Uploaded Image</h4>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowImageModal(true)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View full size"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleReset}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Upload different image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Uploaded experiment"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              </div>
            )}

            {/* Processing Status */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <div>
                  <p className="font-medium text-purple-900">Analyzing your experiment...</p>
                  <p className="text-sm text-purple-700 mt-1">
                    🔍 Detecting experiment type • 📝 Extracting text • 🧠 Generating smart template
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Smart Template */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Image Summary */}
            {imagePreview && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={imagePreview}
                    alt="Experiment"
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{uploadedImage?.name}</p>
                    <p className="text-sm text-gray-500">
                      {uploadedImage ? (uploadedImage.size / 1024 / 1024).toFixed(1) : '0'} MB • 
                      Uploaded {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowImageModal(true)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Smart Template */}
            <SmartExperimentTemplate
              imageFile={uploadedImage || undefined}
              ocrText={ocrText}
              projectContext={projectContext}
              onFormSubmit={handleExperimentSave}
            />
          </motion.div>
        )}
      </div>

      {/* Full Size Image Modal */}
      <AnimatePresence>
        {showImageModal && imagePreview && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl max-h-full"
            >
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute -top-10 right-0 p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <img
                src={imagePreview}
                alt="Full size experiment"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Mock OCR text generation for demo purposes
function generateMockOcrText(filename: string): string {
  const name = filename.toLowerCase();
  
  if (name.includes('well') || name.includes('plate')) {
    return "6-well plate\nTreatment: DMSO control, Compound A 10μM, Compound B 50μM\nDay 3 post-treatment\nCells: HEK293\nPassage 5";
  }
  
  if (name.includes('pcr') || name.includes('gel')) {
    return "1% Agarose Gel\nLane 1: 1kb ladder\nLane 2: Control PCR\nLane 3: Sample A (expected 500bp)\nLane 4: Sample B (expected 500bp)\nPrimers: Forward F1, Reverse R1";
  }
  
  if (name.includes('western') || name.includes('blot')) {
    return "Western Blot - Anti-β-actin\n30μg protein per lane\nLane 1: Control lysate\nLane 2: Treatment 1\nLane 3: Treatment 2\nSecondary: HRP-anti-mouse\nExposure: 2 minutes";
  }
  
  if (name.includes('microscope') || name.includes('fluor')) {
    return "Fluorescence microscopy\n20x objective\nDAPI (nuclei) + GFP (protein)\nSample: Transfected HeLa cells\n48h post-transfection";
  }
  
  return "Lab experiment image\nSample analysis\nDate: " + new Date().toLocaleDateString() + "\nProject notes and observations";
}