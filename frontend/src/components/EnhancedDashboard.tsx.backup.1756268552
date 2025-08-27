'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus,
  Search,
  Bell,
  Settings,
  User,
  TrendingUp,
  FileText,
  BarChart3,
  Target,
  Calendar,
  Clock,
  Activity,
  Zap,
  ChevronRight,
  Dna,
  BookOpen,
  LogOut
} from 'lucide-react';
import { ProjectQuickFilters } from './ProjectQuickFilters';
import { EnhancedDragDropUpload } from './EnhancedDragDropUpload';
import { RealTimeImagePreview } from './RealTimeImagePreview';
import { ProgressTracker } from './ProgressTracker';
import { AccessibilityFeatures } from './AccessibilityTooltip';
import { NotesListModal } from './NotesListModal';
import { TablesListModal } from './TablesListModal';
import { ChartsListModal } from './ChartsListModal';
import EnhancedNGSAnalysis from './EnhancedNGSAnalysis';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalNotes: number;
  totalProjects: number;
  processingJobs: number;
  tablesDetected: number;
  chartsGenerated: number;
  weeklyProgress: number;
}

interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  progress: number;
  priority: 'high' | 'medium' | 'low';
  note_count: number;
  member_count: number;
  last_activity: string;
  category: 'gene_editing' | 'protein' | 'therapy' | 'analysis';
}

export function EnhancedDashboard() {
  const { logout, user } = useAuthStore();
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showTablesModal, setShowTablesModal] = useState(false);
  const [showChartsModal, setShowChartsModal] = useState(false);
  const [showNGSModal, setShowNGSModal] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalNotes: 0,
    totalProjects: 3,
    processingJobs: 0,
    tablesDetected: 0,
    chartsGenerated: 0,
    weeklyProgress: 23
  });

  // Fetch actual counts on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch notes count
        const notesResponse = await fetch('http://localhost:5005/lab_records');
        if (notesResponse.ok) {
          const notes = await notesResponse.json();
          setDashboardStats(prev => ({
            ...prev,
            totalNotes: notes.length
          }));
        }

        // Fetch tables count
        const tablesResponse = await fetch('http://localhost:5005/detected_tables');
        if (tablesResponse.ok) {
          const tables = await tablesResponse.json();
          setDashboardStats(prev => ({
            ...prev,
            tablesDetected: tables.length
          }));
        }

        // Fetch charts count
        const chartsResponse = await fetch('http://localhost:5005/generated_charts');
        if (chartsResponse.ok) {
          const charts = await chartsResponse.json();
          setDashboardStats(prev => ({
            ...prev,
            chartsGenerated: charts.length
          }));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set default values if fetch fails
        setDashboardStats(prev => ({
          ...prev,
          totalNotes: 4,
          tablesDetected: 3,
          chartsGenerated: 3
        }));
      }
    };
    fetchDashboardData();
  }, []);

  // Handle quick upload
  const handleQuickUpload = useCallback(() => {
    setShowUploadModal(true);
  }, []);

  // Handle file selection for preview
  const handleFilePreview = useCallback((file: File) => {
    setUploadingFile(file);
    setShowUploadModal(false);
  }, []);

  // Close preview
  const closePreview = useCallback(() => {
    setUploadingFile(null);
  }, []);

  // Handle save from preview
  const handleSaveFromPreview = useCallback((data: any) => {
    console.log('Saved data:', data);
    setUploadingFile(null);
    // Update dashboard stats or refresh data
  }, []);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout anyway
      localStorage.clear();
      sessionStorage.clear();
      router.push('/login');
    }
  }, [logout, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-lab-primary rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PicNotebook</h1>
                <p className="text-sm text-gray-500">Lab Research Dashboard</p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleQuickUpload}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Note</span>
              </button>
              
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-8 h-8 bg-lab-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {user?.full_name || user?.first_name || user?.username || 'User'}
                  </p>
                  <p className="text-gray-500">{user?.is_admin ? 'Admin' : 'User'}</p>
                </div>
              </div>
              
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Project Filters */}
          <div className="lg:col-span-1">
            <ProjectQuickFilters
              onProjectSelect={setSelectedProject}
              className="sticky top-24"
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-lab-primary to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Welcome back, {user?.full_name || user?.first_name || user?.username || 'User'}! 👋
                  </h2>
                  <p className="text-blue-100 mb-4">
                    {selectedProject 
                      ? `Working on ${selectedProject.code} - ${selectedProject.description}`
                      : 'Ready to analyze your lab notes and generate insights?'
                    }
                  </p>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4" />
                      <span>{dashboardStats.weeklyProgress}% weekly progress</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>{dashboardStats.chartsGenerated} charts generated</span>
                    </div>
                  </div>
                </div>
                
                <div className="hidden sm:block">
                  <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div 
                onClick={() => setShowNotesModal(true)}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalNotes}</p>
                    <p className="text-sm text-gray-500">Total Notes</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalProjects}</p>
                    <p className="text-sm text-gray-500">Active Projects</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setShowTablesModal(true)}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:border-purple-500 hover:shadow-md transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.tablesDetected}</p>
                    <p className="text-sm text-gray-500">Tables Detected</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setShowChartsModal(true)}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:border-orange-500 hover:shadow-md transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.chartsGenerated}</p>
                    <p className="text-sm text-gray-500">Charts Generated</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Progress */}
            {selectedProject && (
              <ProgressTracker
                projectId={selectedProject.id}
                projectName={selectedProject.name}
                projectCode={selectedProject.code}
                initialProgress={selectedProject.progress}
              />
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <button
                  onClick={handleQuickUpload}
                  className="p-4 text-left border border-gray-200 rounded-lg hover:border-lab-primary hover:bg-lab-primary/5 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-lab-primary/10 rounded-lg group-hover:bg-lab-primary/20">
                      <Plus className="w-5 h-5 text-lab-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Upload & Process</p>
                      <p className="text-sm text-gray-500">Add new lab notes</p>
                    </div>
                  </div>
                </button>

                <a
                  href="/analysis"
                  className="p-4 text-left border border-gray-200 rounded-lg hover:border-lab-primary hover:bg-lab-primary/5 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200">
                      <BarChart3 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Table Analysis</p>
                      <p className="text-sm text-gray-500">Extract tables & charts</p>
                    </div>
                  </div>
                </a>

                <button 
                  onClick={() => setShowNGSModal(true)}
                  className="p-4 text-left border border-gray-200 rounded-lg hover:border-lab-primary hover:bg-lab-primary/5 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg group-hover:from-green-200 group-hover:to-blue-200">
                      <Dna className="w-5 h-5 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">NGS Analysis</p>
                      <p className="text-sm text-gray-500">Analyze FASTQ files</p>
                    </div>
                  </div>
                </button>

                <a
                  href="/protocols"
                  className="p-4 text-left border border-gray-200 rounded-lg hover:border-lab-primary hover:bg-lab-primary/5 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Organized Protocol</p>
                      <p className="text-sm text-gray-500">Manage lab protocols</p>
                    </div>
                  </div>
                </a>

                <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-lab-primary hover:bg-lab-primary/5 transition-colors group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200">
                      <Search className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Search Records</p>
                      <p className="text-sm text-gray-500">Find experiments</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <button className="text-sm text-lab-primary hover:text-lab-primary/80">
                  View all
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-blue-100 rounded">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">MizCGBE</span> experiment note uploaded
                    </p>
                    <p className="text-xs text-gray-500">2 hours ago • 3 tables detected</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-green-100 rounded">
                    <BarChart3 className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      pH monitoring chart generated for <span className="font-medium">CF1282</span>
                    </p>
                    <p className="text-xs text-gray-500">1 day ago • Line chart with 12 data points</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-purple-100 rounded">
                    <Target className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">APOC3</span> project milestone completed
                    </p>
                    <p className="text-xs text-gray-500">2 days ago • Literature review finished</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Upload Lab Notes</h2>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <span className="sr-only">Close</span>
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
                <EnhancedDragDropUpload
                  projectId={selectedProject?.id}
                  projectName={selectedProject?.name}
                  acceptedFileTypes={['images', 'sequences']}
                  maxFiles={5}
                  maxFileSize={50}
                  onUploadComplete={(results) => {
                    console.log('Upload complete:', results);
                    setShowUploadModal(false);
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {uploadingFile && (
          <RealTimeImagePreview
            file={uploadingFile}
            projectId={selectedProject?.id}
            projectName={selectedProject?.name}
            onSave={handleSaveFromPreview}
            onClose={closePreview}
          />
        )}
      </AnimatePresence>

      {/* Notes List Modal */}
      <NotesListModal 
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        onNoteSelect={(note) => {
          console.log('Note selected:', note);
          // You can add navigation or other actions here
        }}
      />

      {/* Tables List Modal */}
      <TablesListModal 
        isOpen={showTablesModal}
        onClose={() => setShowTablesModal(false)}
        onTableSelect={(table) => {
          console.log('Table selected:', table);
          // You can add navigation or other actions here
        }}
      />

      {/* Charts List Modal */}
      <ChartsListModal 
        isOpen={showChartsModal}
        onClose={() => setShowChartsModal(false)}
        onChartSelect={(chart) => {
          console.log('Chart selected:', chart);
          // You can add navigation or other actions here
        }}
      />

      {/* Enhanced NGS Analysis Modal */}
      <EnhancedNGSAnalysis 
        isOpen={showNGSModal}
        onClose={() => setShowNGSModal(false)}
      />

      {/* Accessibility Features */}
      <AccessibilityFeatures />

      {/* Notification for Processing Status */}
      {dashboardStats.processingJobs === 0 && (
        <div className="fixed bottom-4 left-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-sm text-green-800">All processing jobs completed</p>
          </div>
        </div>
      )}
    </div>
  );
}