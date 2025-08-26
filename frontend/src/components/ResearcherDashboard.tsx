'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus,
  Upload,
  FileText,
  Search,
  Zap,
  Camera,
  Clock,
  TrendingUp,
  Calendar,
  User,
  Hash,
  ChevronRight,
  MoreVertical,
  Edit,
  Eye,
  Archive,
  Star,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useAppStore } from '@/stores/app';
import { api } from '@/lib/api';
import { EnhancedImageUpload } from './EnhancedImageUpload';
import { LabRecordSearch } from './LabRecordSearch';

interface RecentNote {
  id: string;
  title: string;
  experiment_id: string;
  researcher?: string;
  date: string;
  preview_text: string;
  confidence?: number;
  created_at: string;
  processing_status: 'completed' | 'processing' | 'failed';
  has_structured_data: boolean;
  measurement_count?: number;
}

interface QuickStats {
  total_notes: number;
  notes_this_week: number;
  avg_confidence: number;
  processing_jobs: number;
  total_experiments: number;
  total_measurements: number;
}

export function ResearcherDashboard() {
  const [recentNotes, setRecentNotes] = useState<RecentNote[]>([]);
  const [quickStats, setQuickStats] = useState<QuickStats>({
    total_notes: 0,
    notes_this_week: 0,
    avg_confidence: 0,
    processing_jobs: 0,
    total_experiments: 0,
    total_measurements: 0
  });
  
  const [showQuickUpload, setShowQuickUpload] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>('');
  
  const { user, projects, addNotification } = useAppStore();

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load recent notes (would come from your API)
      const mockRecentNotes: RecentNote[] = [
        {
          id: '1',
          title: 'Protein Crystallization - Run 3',
          experiment_id: 'PROT-2025-003',
          researcher: user?.name || 'Current User',
          date: '2025-08-04',
          preview_text: 'Mixed 10ml protein solution with crystallization buffer at pH 7.4. Observed crystal formation after 24hr incubation at 4°C...',
          confidence: 92,
          created_at: '2025-08-04T10:30:00Z',
          processing_status: 'completed',
          has_structured_data: true,
          measurement_count: 8
        },
        {
          id: '2',
          title: 'Enzyme Activity Assay',
          experiment_id: 'ENZ-2025-012',
          researcher: user?.name || 'Current User',
          date: '2025-08-03',
          preview_text: 'Measured enzyme activity at different pH levels. Optimal activity observed at pH 7.4 with rate of 45 μmol/min...',
          confidence: 87,
          created_at: '2025-08-03T15:45:00Z',
          processing_status: 'completed',
          has_structured_data: true,
          measurement_count: 12
        },
        {
          id: '3',
          title: 'Buffer Preparation Notes',
          experiment_id: 'PREP-2025-008',
          date: '2025-08-02',
          preview_text: 'Prepared 1L of Tris-HCl buffer at pH 8.0. Added 12.1g Tris base to 800ml distilled water...',
          confidence: 95,
          created_at: '2025-08-02T09:15:00Z',
          processing_status: 'completed',
          has_structured_data: false,
          measurement_count: 4
        }
      ];

      // Load quick stats (would come from your API)
      const mockStats: QuickStats = {
        total_notes: 47,
        notes_this_week: 8,
        avg_confidence: 91,
        processing_jobs: 0,
        total_experiments: 23,
        total_measurements: 156
      };

      setRecentNotes(mockRecentNotes);
      setQuickStats(mockStats);
      
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Dashboard Load Failed',
        message: 'Failed to load dashboard data',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, addNotification]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleQuickUpload = useCallback(() => {
    setShowQuickUpload(true);
  }, []);

  const handleUploadSuccess = useCallback((results: any[]) => {
    addNotification({
      type: 'success',
      title: 'Upload Complete',
      message: `${results.length} file(s) uploaded successfully`,
    });
    
    // Refresh dashboard data
    loadDashboardData();
    setShowQuickUpload(false);
  }, [addNotification, loadDashboardData]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-400';
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBg = (confidence?: number) => {
    if (!confidence) return 'bg-gray-100';
    if (confidence >= 90) return 'bg-green-100';
    if (confidence >= 75) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Lab Dashboard</h1>
              <p className="text-sm text-gray-500">
                Welcome back, {user?.name || 'Researcher'}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="btn-outline flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
              </button>
              
              <button
                onClick={handleQuickUpload}
                className="btn-primary flex items-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>Quick Upload</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="w-8 h-8 text-lab-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Notes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoading ? '...' : quickStats.total_notes}
                </p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {quickStats.notes_this_week} this week
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Confidence</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoading ? '...' : `${quickStats.avg_confidence}%`}
                </p>
                <p className="text-xs text-gray-500">OCR accuracy</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Hash className="w-8 h-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Experiments</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoading ? '...' : quickStats.total_experiments}
                </p>
                <p className="text-xs text-gray-500">Structured records</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Measurements</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoading ? '...' : quickStats.total_measurements}
                </p>
                <p className="text-xs text-gray-500">Data points</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search Interface */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <LabRecordSearch className="max-w-none" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Upload Modal */}
        <AnimatePresence>
          {showQuickUpload && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowQuickUpload(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Quick Upload Lab Notes
                    </h2>
                    <button
                      onClick={() => setShowQuickUpload(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Upload and process your handwritten lab notes with AI
                  </p>
                </div>
                
                <div className="p-6">
                  {projects.length > 0 && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Save to Project (Optional)
                      </label>
                      <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
                      >
                        <option value="">No project (standalone note)</option>
                        {projects.map(project => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <EnhancedImageUpload
                    onUploadSuccess={handleUploadSuccess}
                    enableRealTimeOCR={true}
                    enableStructuredParsing={true}
                    projectId={selectedProject}
                    maxFiles={3}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Notes */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Notes</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={loadDashboardData}
                      className="text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {isLoading ? (
                  <div className="p-6 text-center text-gray-500">
                    <div className="animate-pulse">Loading recent notes...</div>
                  </div>
                ) : (
                  <AnimatePresence>
                    {recentNotes.map((note, index) => (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 hover:bg-gray-50 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium text-gray-900 group-hover:text-lab-primary transition-colors">
                                {note.title}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-lab-primary/10 text-lab-primary">
                                  {note.experiment_id}
                                </span>
                                {note.has_structured_data && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <Zap className="w-3 h-3 mr-1" />
                                    Structured
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                              {note.preview_text}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{formatDate(note.created_at)}</span>
                                </div>
                                {note.researcher && (
                                  <div className="flex items-center space-x-1">
                                    <User className="w-3 h-3" />
                                    <span>{note.researcher}</span>
                                  </div>
                                )}
                                {note.measurement_count && note.measurement_count > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <TrendingUp className="w-3 h-3" />
                                    <span>{note.measurement_count} measurements</span>
                                  </div>
                                )}
                              </div>
                              
                              {note.confidence && (
                                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getConfidenceBg(note.confidence)} ${getConfidenceColor(note.confidence)}`}>
                                  <Zap className="w-3 h-3" />
                                  <span>{note.confidence}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 text-gray-400 hover:text-lab-primary">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-lab-primary">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-gray-600">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                
                {!isLoading && recentNotes.length === 0 && (
                  <div className="p-12 text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
                    <p className="text-gray-500 mb-4">
                      Start by uploading your first lab note image
                    </p>
                    <button
                      onClick={handleQuickUpload}
                      className="btn-primary"
                    >
                      Upload First Note
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Tips */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleQuickUpload}
                  className="w-full flex items-center space-x-3 p-3 text-left bg-lab-primary/5 hover:bg-lab-primary/10 rounded-lg transition-colors group"
                >
                  <Camera className="w-5 h-5 text-lab-primary" />
                  <div>
                    <p className="font-medium text-gray-900">Upload Notes</p>
                    <p className="text-xs text-gray-500">Process lab note images</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-lab-primary ml-auto" />
                </button>
                
                <button
                  onClick={() => setShowSearch(true)}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <Search className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Search Records</p>
                    <p className="text-xs text-gray-500">Find experiments & data</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 ml-auto" />
                </button>
                
                <a 
                  href="/analysis"
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Table & Chart Analysis</p>
                    <p className="text-xs text-gray-500">Extract tables & generate charts</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 ml-auto" />
                </a>
                
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors group">
                  <Archive className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Export Data</p>
                    <p className="text-xs text-gray-500">Download structured data</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 ml-auto" />
                </button>
              </div>
            </div>

            {/* Tips & Help */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Pro Tips</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-lab-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Better OCR Quality</p>
                    <p className="text-gray-600">Take photos in good lighting with clear, readable handwriting</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Structure Your Notes</p>
                    <p className="text-gray-600">Use clear section headers like "Methods:", "Results:", "Observations:"</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Include Key Data</p>
                    <p className="text-gray-600">Always note experiment IDs, dates, and measurement units</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}