'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle,
  AlertCircle,
  Edit3,
  Save,
  X,
  Eye,
  Calendar,
  User,
  Hash,
  FileText,
  Beaker,
  BarChart3,
  Clock,
  Target,
  Activity,
  MessageSquare,
  Star,
  TrendingUp,
  RefreshCw,
  Download,
  Share2,
  Image as ImageIcon,
  ZoomIn,
  ExternalLink
} from 'lucide-react';

interface ExperimentMeasurement {
  type: string;
  value: string;
  unit: string;
  timestamp?: string;
  confidence: number;
  context?: string;
}

interface ExperimentRecord {
  record_id: string;
  experiment_id: string;
  title: string;
  date: string;
  researcher: string;
  project_code: string;
  project_name: string;
  project_category: string;
  confidence_score: number;
  objective: string;
  methods: string;
  results: string;
  observations: string;
  conclusions: string;
  measurements: ExperimentMeasurement[];
  tables_detected: number;
  charts_available: number;
  original_filename: string;
  saved_filename?: string;
  saved_image_path?: string;
  processing_timestamp: string;
  raw_text: string;
  ocr_confidence: number;
  needs_review: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
  review_status: 'pending' | 'approved' | 'needs_revision';
  corrections?: string[];
}

interface ExperimentRecordReviewProps {
  recordId: string;
  onSave?: (updates: Partial<ExperimentRecord>, reviewer: string) => void;
  onClose?: () => void;
  className?: string;
}

const EDITABLE_FIELDS = [
  { key: 'title', label: 'Title', type: 'text', icon: FileText },
  { key: 'experiment_id', label: 'Experiment ID', type: 'text', icon: Hash },
  { key: 'date', label: 'Date', type: 'date', icon: Calendar },
  { key: 'researcher', label: 'Researcher', type: 'text', icon: User },
  { key: 'objective', label: 'Objective', type: 'textarea', icon: Target },
  { key: 'methods', label: 'Methods', type: 'textarea', icon: Beaker },
  { key: 'results', label: 'Results', type: 'textarea', icon: BarChart3 },
  { key: 'observations', label: 'Observations', type: 'textarea', icon: Eye },
  { key: 'conclusions', label: 'Conclusions', type: 'textarea', icon: MessageSquare },
];

export function ExperimentRecordReview({
  recordId,
  onSave,
  onClose,
  className = ''
}: ExperimentRecordReviewProps) {
  const [record, setRecord] = useState<ExperimentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<ExperimentRecord>>({});
  const [reviewer, setReviewer] = useState('Dr. Reviewer');

  // Load experiment record
  useEffect(() => {
    const loadRecord = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:5005/experiment_record/${recordId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load record: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (data.success) {
          setRecord(data.record);
          setEditedValues(data.record);
        } else {
          throw new Error(data.error || 'Failed to load record');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load record');
      } finally {
        setLoading(false);
      }
    };

    loadRecord();
  }, [recordId]);

  const handleFieldEdit = useCallback((field: string, value: string) => {
    setEditedValues(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!record) return;

    try {
      setSaving(true);
      
      // Find changed fields
      const updates: Partial<ExperimentRecord> = {};
      for (const [key, value] of Object.entries(editedValues)) {
        if (record[key as keyof ExperimentRecord] !== value) {
          updates[key as keyof ExperimentRecord] = value as any;
        }
      }

      if (Object.keys(updates).length === 0) {
        setError('No changes to save');
        return;
      }

      const response = await fetch(`http://127.0.0.1:5005/experiment_record/${recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updates,
          reviewer
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setRecord(data.record);
        setEditedValues(data.record);
        setEditingField(null);
        onSave?.(updates, reviewer);
      } else {
        throw new Error(data.error || 'Failed to save changes');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  }, [record, editedValues, reviewer, recordId, onSave]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getFieldIcon = (field: string) => {
    const fieldConfig = EDITABLE_FIELDS.find(f => f.key === field);
    if (fieldConfig) {
      const IconComponent = fieldConfig.icon;
      return <IconComponent className="w-4 h-4" />;
    }
    return <Edit3 className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center space-x-3 text-red-600">
          <AlertCircle className="w-6 h-6" />
          <div>
            <h3 className="font-medium">Error Loading Record</h3>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 btn-primary"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  if (!record) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Record not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Experiment Record Review
              </h2>
              {record.needs_review && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Needs Review
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Hash className="w-4 h-4" />
                <span>{record.record_id}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{new Date(record.processing_timestamp).toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4" />
                <span className={`px-2 py-1 rounded text-xs ${getConfidenceColor(record.confidence_score)}`}>
                  {Math.round(record.confidence_score * 100)}% confidence
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center space-x-2"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="btn-outline"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Project Classification */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-5 h-5 text-lab-primary" />
              <h3 className="font-medium text-gray-900">Project</h3>
            </div>
            <p className="text-lg font-semibold text-lab-primary">{record.project_code}</p>
            <p className="text-sm text-gray-600">{record.project_name}</p>
            <p className="text-xs text-gray-500 mt-1">{record.project_category}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-gray-900">Quality</h3>
            </div>
            <p className="text-lg font-semibold text-green-600">{record.ocr_confidence}%</p>
            <p className="text-sm text-gray-600">OCR Confidence</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Data</h3>
            </div>
            <div className="flex space-x-4 text-sm">
              <div>
                <span className="font-medium">{record.tables_detected}</span>
                <span className="text-gray-500 ml-1">tables</span>
              </div>
              <div>
                <span className="font-medium">{record.measurements.length}</span>
                <span className="text-gray-500 ml-1">measurements</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviewer Input */}
      <div className="p-6 border-b border-gray-200">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reviewer Name
          </label>
          <input
            type="text"
            value={reviewer}
            onChange={(e) => setReviewer(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
            placeholder="Enter your name"
          />
        </div>
      </div>

      {/* Editable Fields */}
      <div className="p-6 space-y-6">
        {EDITABLE_FIELDS.map((field) => {
          const isEditing = editingField === field.key;
          const value = editedValues[field.key as keyof ExperimentRecord] as string || '';
          const originalValue = record[field.key as keyof ExperimentRecord] as string || '';
          const hasChanges = value !== originalValue;
          
          return (
            <div key={field.key} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getFieldIcon(field.key)}
                  <label className="text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  {hasChanges && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Modified
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => setEditingField(isEditing ? null : field.key)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
                >
                  {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                </button>
              </div>
              
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div
                    key="editing"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {field.type === 'textarea' ? (
                      <textarea
                        value={value}
                        onChange={(e) => handleFieldEdit(field.key, e.target.value)}
                        rows={4}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={value}
                        onChange={(e) => handleFieldEdit(field.key, e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                      />
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="display"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-3 rounded-lg border-2 border-dashed border-gray-200 ${
                      hasChanges ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                    }`}
                  >
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {value || <span className="text-gray-400 italic">No {field.label.toLowerCase()} provided</span>}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Original Image Section */}
      {record.saved_filename && (
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
            <ImageIcon className="w-5 h-5" />
            <span>Original Lab Note</span>
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={`http://127.0.0.1:5005/images/${record.saved_filename}`}
                  alt="Original lab note"
                  className="w-48 h-48 object-contain rounded-lg border border-gray-200 bg-white"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NCA5NkgxMTZWMTA0SDg0Vjk2WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNODQgMTEySDE0NFYxMjBIODRWMTEyWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                  }}
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    {record.original_filename}
                  </h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(`http://127.0.0.1:5005/images/${record.saved_filename}`, '_blank')}
                      className="text-sm text-lab-primary hover:text-lab-primary/80 flex items-center space-x-1"
                    >
                      <ZoomIn className="w-4 h-4" />
                      <span>View Full Size</span>
                    </button>
                    <button
                      onClick={() => window.open(`http://127.0.0.1:5005/experiment_image/${record.record_id}`, '_blank')}
                      className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Direct Link</span>
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">File:</span> {record.saved_filename}
                  </div>
                  <div>
                    <span className="font-medium">Processed:</span> {new Date(record.processing_timestamp).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">OCR Quality:</span>
                    <span className={`ml-1 px-2 py-1 rounded text-xs ${getConfidenceColor(record.ocr_confidence / 100)}`}>
                      {record.ocr_confidence}%
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <span className="ml-1 capitalize">{record.review_status}</span>
                  </div>
                </div>
                
                {record.raw_text && (
                  <div className="mt-4">
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                        View Extracted Text ({record.raw_text.length} characters)
                      </summary>
                      <div className="mt-2 p-3 bg-white rounded border max-h-32 overflow-y-auto">
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                          {record.raw_text}
                        </pre>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Measurements Section */}
      {record.measurements.length > 0 && (
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Extracted Measurements</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {record.measurements.map((measurement, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {measurement.type}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${getConfidenceColor(measurement.confidence)}`}>
                    {Math.round(measurement.confidence * 100)}%
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {measurement.value} {measurement.unit}
                </p>
                {measurement.context && (
                  <p className="text-xs text-gray-500 mt-1">{measurement.context}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Original file: {record.original_filename}</span>
            <span>•</span>
            <span>Status: {record.review_status}</span>
          </div>
          
          <div className="flex space-x-2">
            <button className="text-gray-400 hover:text-gray-600">
              <Download className="w-4 h-4 mr-1 inline" />
              Export
            </button>
            <button className="text-gray-400 hover:text-gray-600">
              <Share2 className="w-4 h-4 mr-1 inline" />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}