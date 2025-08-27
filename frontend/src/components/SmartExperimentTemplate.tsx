'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Lightbulb, 
  Tag, 
  Calendar,
  Clock,
  User,
  FileText,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { 
  ExperimentType, 
  TemplateField, 
  detectExperimentType, 
  getSuggestedTags,
  EXPERIMENT_TEMPLATES 
} from '@/utils/experimentDetection';

interface SmartExperimentTemplateProps {
  imageFile?: File;
  ocrText?: string;
  projectContext?: {
    id: string;
    name: string;
    code: string;
    tags?: string[];
  };
  onFormSubmit?: (data: ExperimentFormData) => void;
  className?: string;
}

interface ExperimentFormData {
  experimentType: string;
  title: string;
  fields: Record<string, any>;
  tags: string[];
  date: string;
  time: string;
  notes: string;
}

interface FormFieldProps {
  field: TemplateField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

function FormField({ field, value, onChange, error }: FormFieldProps) {
  const baseClasses = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-lab-primary focus:border-lab-primary transition-colors";
  const errorClasses = error ? "border-red-300 bg-red-50" : "border-gray-300";

  const renderInput = () => {
    switch (field.type) {
      case 'select':
        return (
          <select
            value={value || field.defaultValue || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`${baseClasses} ${errorClasses}`}
          >
            <option value="">Select...</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={value?.includes(option) || false}
                  onChange={(e) => {
                    const currentValues = value || [];
                    if (e.target.checked) {
                      onChange([...currentValues, option]);
                    } else {
                      onChange(currentValues.filter((v: string) => v !== option));
                    }
                  }}
                  className="rounded border-gray-300 text-lab-primary focus:ring-lab-primary"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className={`${baseClasses} ${errorClasses} resize-none`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            className={`${baseClasses} ${errorClasses}`}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`${baseClasses} ${errorClasses}`}
          />
        );

      case 'time':
        return (
          <input
            type="time"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`${baseClasses} ${errorClasses}`}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={`${baseClasses} ${errorClasses}`}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <label className="block">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-sm font-medium text-gray-700">
            {field.label}
          </span>
          {field.required && (
            <span className="text-red-500 text-xs">*required</span>
          )}
        </div>
        {renderInput()}
      </label>
      {error && (
        <p className="text-red-600 text-xs flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export function SmartExperimentTemplate({
  imageFile,
  ocrText,
  projectContext,
  onFormSubmit,
  className = ''
}: SmartExperimentTemplateProps) {
  const [detectedTypes, setDetectedTypes] = useState<ExperimentType[]>([]);
  const [selectedType, setSelectedType] = useState<ExperimentType | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Analyze image when component mounts or image changes
  useEffect(() => {
    if (imageFile || ocrText) {
      setIsAnalyzing(true);
      
      // Simulate analysis delay for user feedback
      setTimeout(() => {
        const detected = detectExperimentType(
          imageFile || '',
          ocrText,
          imageFile?.name
        );
        
        setDetectedTypes(detected);
        
        // Auto-select the highest confidence type
        if (detected.length > 0) {
          setSelectedType(detected[0]);
          
          // Pre-populate suggested tags
          const suggestedTags = getSuggestedTags(
            detected[0].id,
            ocrText,
            projectContext
          );
          setSelectedTags(suggestedTags.slice(0, 5)); // Limit to 5 tags
        }
        
        setIsAnalyzing(false);
      }, 1500);
    }
  }, [imageFile, ocrText, projectContext]);

  // Handle form field changes
  const updateFormField = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!selectedType) return false;
    
    const newErrors: Record<string, string> = {};
    
    selectedType.template.essentialFields.forEach(field => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = `${field.label} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    const submitData: ExperimentFormData = {
      experimentType: selectedType!.id,
      title: formData.experiment_title || `${selectedType!.name} - ${new Date().toLocaleDateString()}`,
      fields: formData,
      tags: selectedTags,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      notes: formData.additional_notes || ''
    };
    
    onFormSubmit?.(submitData);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Analysis Status */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Smart Template</h3>
              <p className="text-sm text-gray-500">
                AI-powered experiment detection and form generation
              </p>
            </div>
          </div>
          
          {isAnalyzing && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Analyzing image...</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Detected Experiment Types */}
        {detectedTypes.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Detected Experiment Types</span>
            </h4>
            
            <div className="grid gap-2">
              {detectedTypes.map((type) => (
                <motion.button
                  key={type.id}
                  onClick={() => setSelectedType(type)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedType?.id === type.id
                      ? 'border-lab-primary bg-lab-primary/5 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{type.name}</span>
                        <div className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                          {Math.round(type.confidence)}% confidence
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{type.template.description}</p>
                      {type.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {type.keywords.slice(0, 3).map(keyword => (
                            <span key={keyword} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedType?.id === type.id && (
                      <CheckCircle className="w-5 h-5 text-lab-primary" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Form Fields */}
        <AnimatePresence>
          {selectedType && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6"
            >
              {/* Essential Fields */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Essential Information</span>
                </h4>
                
                <div className="grid gap-4">
                  {selectedType.template.essentialFields.map((field) => (
                    <FormField
                      key={field.id}
                      field={field}
                      value={formData[field.id]}
                      onChange={(value) => updateFormField(field.id, value)}
                      error={errors[field.id]}
                    />
                  ))}
                </div>
              </div>

              {/* Optional Fields */}
              {selectedType.template.optionalFields.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span>Additional Details (Optional)</span>
                  </h4>
                  
                  <div className="grid gap-4">
                    {selectedType.template.optionalFields.map((field) => (
                      <FormField
                        key={field.id}
                        field={field}
                        value={formData[field.id]}
                        onChange={(value) => updateFormField(field.id, value)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Tags Selection */}
              {selectedTags.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-purple-600" />
                    <span>Suggested Tags</span>
                  </h4>
                  
                  <div className="flex flex-wrap gap-2">
                    {getSuggestedTags(selectedType.id, ocrText, projectContext).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          if (selectedTags.includes(tag)) {
                            setSelectedTags(prev => prev.filter(t => t !== tag));
                          } else {
                            setSelectedTags(prev => [...prev, tag]);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                          selectedTags.includes(tag)
                            ? 'border-lab-primary bg-lab-primary text-white'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              <div className="space-y-2">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Additional Notes</span>
                  <textarea
                    value={formData.additional_notes || ''}
                    onChange={(e) => updateFormField('additional_notes', e.target.value)}
                    placeholder="Any additional observations, thoughts, or context..."
                    rows={3}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lab-primary focus:border-lab-primary transition-colors resize-none"
                  />
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSubmit}
                  className="flex items-center space-x-2 px-6 py-2 bg-lab-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <span>Save Experiment</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fallback Message */}
        {!isAnalyzing && detectedTypes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Upload an image to get smart template suggestions</p>
          </div>
        )}
      </div>
    </div>
  );
}