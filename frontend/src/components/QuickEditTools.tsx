'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tag,
  Zap,
  Calendar,
  User,
  Hash,
  Beaker,
  Thermometer,
  Droplets,
  Clock,
  Plus,
  X,
  Save,
  Wand2,
  ChevronDown,
  Type,
  Edit3,
  CheckCircle
} from 'lucide-react';
import { LabAutocomplete } from './LabAutocomplete';

interface QuickTag {
  id: string;
  label: string;
  color: string;
  icon: any;
  category: 'section' | 'data' | 'meta';
}

interface ExtractedData {
  experiment_id?: string;
  date?: string;
  researcher?: string;
  methods?: string;
  results?: string;
  observations?: string;
  measurements?: Array<{
    type: string;
    value: string;
    unit: string;
  }>;
}

interface QuickEditToolsProps {
  extractedText: string;
  extractedData?: ExtractedData;
  onDataUpdate?: (data: ExtractedData) => void;
  onTextUpdate?: (text: string) => void;
  onTagAdd?: (tag: QuickTag, selectedText: string) => void;
  className?: string;
}

const QUICK_TAGS: QuickTag[] = [
  { id: 'methods', label: 'Methods', color: 'blue', icon: Beaker, category: 'section' },
  { id: 'results', label: 'Results', color: 'green', icon: CheckCircle, category: 'section' },
  { id: 'observations', label: 'Observations', color: 'purple', icon: Type, category: 'section' },
  { id: 'temperature', label: 'Temperature', color: 'red', icon: Thermometer, category: 'data' },
  { id: 'volume', label: 'Volume', color: 'cyan', icon: Droplets, category: 'data' },
  { id: 'time', label: 'Time', color: 'orange', icon: Clock, category: 'data' },
  { id: 'date', label: 'Date', color: 'indigo', icon: Calendar, category: 'meta' },
  { id: 'researcher', label: 'Researcher', color: 'pink', icon: User, category: 'meta' },
  { id: 'exp_id', label: 'Experiment ID', color: 'gray', icon: Hash, category: 'meta' },
];

export function QuickEditTools({
  extractedText,
  extractedData = {},
  onDataUpdate,
  onTextUpdate,
  onTagAdd,
  className = ''
}: QuickEditToolsProps) {
  const [activeTab, setActiveTab] = useState<'quick' | 'structured' | 'tags'>('quick');
  const [selectedText, setSelectedText] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<ExtractedData>(extractedData);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
      setShowTagDropdown(true);
    }
  }, []);

  const handleQuickTag = useCallback((tag: QuickTag) => {
    if (selectedText) {
      onTagAdd?.(tag, selectedText);
      
      // Auto-populate field if it matches
      if (tag.id in fieldValues) {
        setFieldValues(prev => ({
          ...prev,
          [tag.id]: selectedText
        }));
      }
      
      setShowTagDropdown(false);
      setSelectedText('');
    }
  }, [selectedText, onTagAdd, fieldValues]);

  const handleFieldUpdate = useCallback((field: string, value: string) => {
    const updatedData = { ...fieldValues, [field]: value };
    setFieldValues(updatedData);
    onDataUpdate?.(updatedData);
  }, [fieldValues, onDataUpdate]);

  const handleAutoExtract = useCallback(() => {
    // Simulate auto-extraction logic
    const autoExtracted: ExtractedData = {
      experiment_id: extractedText.match(/(?:Experiment|Exp)\s*(?:ID|#)?:?\s*([A-Z0-9-]+)/i)?.[1] || '',
      date: extractedText.match(/Date:?\s*(\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i)?.[1] || '',
      researcher: extractedText.match(/(?:Researcher|By|Author):?\s*((?:Dr\.?\s*)?[\w\s.]+?)(?=\n|$)/i)?.[1] || '',
      methods: extractText(extractedText, ['methods', 'procedure', 'protocol']),
      results: extractText(extractedText, ['results', 'findings', 'data']),
      observations: extractText(extractedText, ['observations', 'notes', 'comments']),
      measurements: extractMeasurements(extractedText)
    };

    setFieldValues(autoExtracted);
    onDataUpdate?.(autoExtracted);
  }, [extractedText, onDataUpdate]);

  const extractText = (text: string, keywords: string[]): string => {
    for (const keyword of keywords) {
      const regex = new RegExp(`${keyword}:?\\s*([\\s\\S]*?)(?=(${keywords.join('|')}|$))`, 'i');
      const match = text.match(regex);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return '';
  };

  const extractMeasurements = (text: string) => {
    const measurements = [];
    const patterns = [
      { type: 'temperature', regex: /(\d+(?:\.\d+)?)\s*(?:°C|C|degrees?\s*(?:C|Celsius))/gi, unit: '°C' },
      { type: 'pH', regex: /pH:?\s*(\d+(?:\.\d+)?)/gi, unit: '' },
      { type: 'volume', regex: /(\d+(?:\.\d+)?)\s*(?:ml|mL|milliliters?)/gi, unit: 'mL' },
      { type: 'time', regex: /(\d+(?:\.\d+)?)\s*(?:min|minutes?)/gi, unit: 'min' },
    ];

    patterns.forEach(({ type, regex, unit }) => {
      let match;
      while ((match = regex.exec(text)) !== null) {
        measurements.push({
          type,
          value: match[1],
          unit
        });
      }
    });

    return measurements;
  };

  const addCustomTag = useCallback(() => {
    if (newTagInput.trim() && !customTags.includes(newTagInput.trim())) {
      setCustomTags(prev => [...prev, newTagInput.trim()]);
      setNewTagInput('');
    }
  }, [newTagInput, customTags]);

  const getTagColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      cyan: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      pink: 'bg-pink-100 text-pink-800 border-pink-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header with Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('quick')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'quick'
                  ? 'bg-lab-primary text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Zap className="w-4 h-4 inline mr-1" />
              Quick Actions
            </button>
            <button
              onClick={() => setActiveTab('structured')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'structured'
                  ? 'bg-lab-primary text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Edit3 className="w-4 h-4 inline mr-1" />
              Structured Data
            </button>
            <button
              onClick={() => setActiveTab('tags')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'tags'
                  ? 'bg-lab-primary text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Tag className="w-4 h-4 inline mr-1" />
              Tags
            </button>
          </div>
          
          <button
            onClick={handleAutoExtract}
            className="btn-outline text-sm flex items-center space-x-1"
          >
            <Wand2 className="w-4 h-4" />
            <span>Auto Extract</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {/* Quick Actions Tab */}
          {activeTab === 'quick' && (
            <motion.div
              key="quick"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Select text in the document, then click a tag to categorize:
                </h4>
                
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_TAGS.map((tag) => {
                    const IconComponent = tag.icon;
                    return (
                      <button
                        key={tag.id}
                        onClick={() => handleQuickTag(tag)}
                        disabled={!selectedText}
                        className={`p-3 border rounded-lg text-left transition-all hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                          getTagColor(tag.color)
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <IconComponent className="w-4 h-4" />
                          <span className="text-sm font-medium">{tag.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedText && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-lab-primary/5 border border-lab-primary/20 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-lab-primary mb-1">
                        Selected Text:
                      </p>
                      <p className="text-sm text-gray-700 bg-white rounded px-2 py-1">
                        "{selectedText}"
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedText('');
                        setShowTagDropdown(false);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Structured Data Tab */}
          {activeTab === 'structured' && (
            <motion.div
              key="structured"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Experiment ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experiment ID
                  </label>
                  <LabAutocomplete
                    value={fieldValues.experiment_id || ''}
                    onChange={(value) => handleFieldUpdate('experiment_id', value)}
                    placeholder="EXP-2025-001"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={fieldValues.date || ''}
                    onChange={(e) => handleFieldUpdate('date', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
                  />
                </div>

                {/* Researcher */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Researcher
                  </label>
                  <LabAutocomplete
                    value={fieldValues.researcher || ''}
                    onChange={(value) => handleFieldUpdate('researcher', value)}
                    placeholder="Dr. Jane Smith"
                  />
                </div>
              </div>

              {/* Methods */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Methods
                </label>
                <textarea
                  value={fieldValues.methods || ''}
                  onChange={(e) => handleFieldUpdate('methods', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
                  placeholder="Describe the experimental methods..."
                />
              </div>

              {/* Results */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Results
                </label>
                <textarea
                  value={fieldValues.results || ''}
                  onChange={(e) => handleFieldUpdate('results', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
                  placeholder="Record the experimental results..."
                />
              </div>

              {/* Observations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observations
                </label>
                <textarea
                  value={fieldValues.observations || ''}
                  onChange={(e) => handleFieldUpdate('observations', e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
                  placeholder="Any additional observations..."
                />
              </div>

              {/* Measurements */}
              {fieldValues.measurements && fieldValues.measurements.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extracted Measurements
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {fieldValues.measurements.map((measurement, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-md border"
                      >
                        <div className="flex items-center space-x-2">
                          <Thermometer className="w-4 h-4 text-gray-400" />
                          <span className="text-sm capitalize">{measurement.type}:</span>
                        </div>
                        <span className="text-sm font-medium">
                          {measurement.value} {measurement.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Tags Tab */}
          {activeTab === 'tags' && (
            <motion.div
              key="tags"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Custom Tags
                </h4>
                
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                    placeholder="Add custom tag..."
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-lab-primary focus:border-lab-primary"
                  />
                  <button
                    onClick={addCustomTag}
                    className="btn-primary text-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {customTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {customTags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
                      >
                        {tag}
                        <button
                          onClick={() => setCustomTags(prev => prev.filter((_, i) => i !== index))}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Available Quick Tags
                </h4>
                
                <div className="space-y-2">
                  {['section', 'data', 'meta'].map(category => (
                    <div key={category}>
                      <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        {category}
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {QUICK_TAGS.filter(tag => tag.category === category).map(tag => {
                          const IconComponent = tag.icon;
                          return (
                            <span
                              key={tag.id}
                              className={`inline-flex items-center px-2 py-1 text-xs border rounded-full ${
                                getTagColor(tag.color)
                              }`}
                            >
                              <IconComponent className="w-3 h-3 mr-1" />
                              {tag.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            {selectedText ? (
              <span className="text-lab-primary">Text selected - click a tag to categorize</span>
            ) : (
              <span>Select text in the document to enable quick tagging</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="text-gray-400 hover:text-gray-600 text-xs">
              Help
            </button>
            <button
              onClick={() => onDataUpdate?.(fieldValues)}
              className="btn-primary text-xs"
            >
              <Save className="w-3 h-3 mr-1" />
              Save All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}