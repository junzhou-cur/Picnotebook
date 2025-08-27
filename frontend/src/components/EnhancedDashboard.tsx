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
  LogOut,
  Star,
  Microscope,
  ChevronDown,
  Folder,
  FlaskConical,
  Package
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
import { PhotoFirstUpload } from './PhotoFirstUpload';
import { MaterialsManager } from './MaterialsManager';
import { StorageBoxManager } from './StorageBoxGrid';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Material, SAMPLE_MATERIALS, MaterialType } from '@/types/materials';
import { StorageBox, SAMPLE_STORAGE_BOXES } from '@/types/storage';

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
  tags?: string[];
}

// Sample projects from ProjectQuickFilters
const SAMPLE_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'CF1282',
    code: 'CF1282',
    description: 'CFTR W1282X nonsense mutation correction using prime editing',
    status: 'active',
    progress: 0,
    priority: 'high',
    note_count: 0,
    member_count: 3,
    last_activity: '2025-08-04T10:00:00Z',
    category: 'gene_editing',
    tags: ['CFTR', 'prime-editing', 'nonsense-mutation', 'W1282X']
  },
  {
    id: '2',
    name: 'MizCGBE',
    code: 'MizCGBE',
    description: 'Cytosine base editing with miniaturized CGBE1 system',
    status: 'active',
    progress: 50,
    priority: 'high',
    note_count: 2,
    member_count: 2,
    last_activity: '2025-08-03T16:30:00Z',
    category: 'gene_editing',
    tags: ['base-editing', 'CGBE1', 'cytosine', 'miniaturized']
  },
  {
    id: '3',
    name: 'APOC3',
    code: 'APOC3',
    description: 'APOC3 gene silencing for triglyceride reduction therapy',
    status: 'active',
    progress: 0,
    priority: 'medium',
    note_count: 0,
    member_count: 1,
    last_activity: '2025-08-02T14:15:00Z',
    category: 'therapy',
    tags: ['APOC3', 'gene-silencing', 'triglycerides', 'therapy']
  }
];

export function EnhancedDashboard() {
  const { logout, user } = useAuthStore();
  const router = useRouter();
  const [projects] = useState<Project[]>(SAMPLE_PROJECTS);
  const [materials] = useState<Material[]>(SAMPLE_MATERIALS);
  const [storageBoxes, setStorageBoxes] = useState<StorageBox[]>(SAMPLE_STORAGE_BOXES);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjects, setShowProjects] = useState(false);
  const [showMaterials, setShowMaterials] = useState(false);
  const [showStorageBoxes, setShowStorageBoxes] = useState(false);
  const [showLabDropdown, setShowLabDropdown] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showTablesModal, setShowTablesModal] = useState(false);
  const [showChartsModal, setShowChartsModal] = useState(false);
  const [showNGSModal, setShowNGSModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [showStorageBoxModal, setShowStorageBoxModal] = useState(false);
  const [selectedStorageBox, setSelectedStorageBox] = useState<string>();
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalNotes: 0,
    totalProjects: 3,
    processingJobs: 0,
    tablesDetected: 0,
    chartsGenerated: 0,
    weeklyProgress: 23
  });
  const [storageUsage, setStorageUsage] = useState({ used: 0, total: 5 * 1024 * 1024 * 1024 });

  // Fetch actual counts on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch notes count and calculate storage
        const notesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005'}/lab_records`);
        if (notesResponse.ok) {
          const notes = await notesResponse.json();
          
          // Calculate storage usage
          let totalUsed = 0;
          notes.forEach((record: any) => {
            const imageSize = record.image_path ? 2.5 * 1024 * 1024 : 0; // ~2.5MB per image
            const textSize = (record.ocr_text?.length || 0) * 2; // ~2 bytes per character
            const metadataSize = JSON.stringify(record).length * 2;
            totalUsed += imageSize + textSize + metadataSize;
          });
          
          setStorageUsage({ used: totalUsed, total: 5 * 1024 * 1024 * 1024 });
          setDashboardStats(prev => ({
            ...prev,
            totalNotes: notes.length
          }));
        }

        // Fetch tables count
        const tablesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005'}/detected_tables`);
        if (tablesResponse.ok) {
          const tables = await tablesResponse.json();
          setDashboardStats(prev => ({
            ...prev,
            tablesDetected: tables.length
          }));
        }

        // Fetch charts count
        const chartsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005'}/generated_charts`);
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
        setStorageUsage({ used: 2.4 * 1024 * 1024 * 1024, total: 5 * 1024 * 1024 * 1024 });
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation - Arxiv Stone Style */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-lab-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">PicNotebook</span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-4 space-y-6">
          {/* Dashboard */}
          <div>
            <div 
              onClick={() => setSelectedProject(null)}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                selectedProject === null 
                  ? 'text-gray-900 bg-gray-100' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </div>
          </div>

          {/* Lab Notebooks Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 px-3">
              Lab Management
            </h3>
            <div className="space-y-1">
              {/* My Research Lab - Main Dropdown */}
              <div 
                onClick={() => setShowLabDropdown(!showLabDropdown)}
                className="flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <Microscope className="w-5 h-5 text-lab-primary" />
                  <span>My Research Lab</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {projects.filter(p => p.status === 'active').length + materials.length + storageBoxes.length}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showLabDropdown ? 'rotate-180' : ''}`} />
                </div>
              </div>
              
              {/* Lab Dropdown Content */}
              <AnimatePresence>
                {showLabDropdown && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-4 space-y-1 border-l-2 border-gray-100 pl-4"
                  >
                    {/* Projects Subsection */}
                    <div 
                      onClick={() => setShowProjects(!showProjects)}
                      className="flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer group"
                    >
                      <div className="flex items-center space-x-3">
                        <Folder className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">Projects</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {projects.filter(p => p.status === 'active').length}
                        </span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${showProjects ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    
                    {/* Project List */}
                    <AnimatePresence>
                      {showProjects && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-4 space-y-1 border-l-2 border-blue-100 pl-3"
                        >
                          {projects.filter(p => p.status === 'active').map(project => {
                            const isSelected = selectedProject?.id === project.id;
                            return (
                              <motion.div
                                key={project.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => setSelectedProject(isSelected ? null : project)}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                  isSelected 
                                    ? 'bg-lab-primary text-white' 
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    isSelected ? 'bg-white' : 'bg-lab-primary'
                                  }`}></div>
                                  <div>
                                    <div className="font-medium text-xs">{project.code}</div>
                                    <div className={`text-xs ${
                                      isSelected ? 'text-blue-100' : 'text-gray-500'
                                    }`}>
                                      {project.progress}% done
                                    </div>
                                  </div>
                                </div>
                                {project.priority === 'high' && (
                                  <Star className={`w-3 h-3 ${
                                    isSelected ? 'text-yellow-200' : 'text-yellow-500'
                                  } fill-current`} />
                                )}
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Materials Subsection */}
                    <div className="flex items-center">
                      <div 
                        onClick={() => setShowMaterials(!showMaterials)}
                        className="flex-1 flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer group"
                      >
                        <div className="flex items-center space-x-3">
                          <FlaskConical className="w-4 h-4 text-green-600" />
                          <span className="text-sm">Materials</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {materials.length}
                          </span>
                          <ChevronDown className={`w-3 h-3 transition-transform ${showMaterials ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                      <button
                        onClick={() => setShowMaterialsModal(true)}
                        className="ml-2 p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Open Materials Manager"
                      >
                        <Package className="w-3 h-3" />
                      </button>
                    </div>
                    
                    {/* Hierarchical Materials Overview */}
                    <AnimatePresence>
                      {showMaterials && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-4 space-y-2 border-l-2 border-green-100 pl-3"
                        >
                          {/* Material Categories Summary */}
                          <div className="space-y-1">
                            {(() => {
                              const materialCounts = materials.reduce((acc, material) => {
                                acc[material.type] = (acc[material.type] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>);

                              return Object.entries(materialCounts).map(([type, count]) => {
                                const getTypeIcon = (type: string) => {
                                  switch (type) {
                                    case 'plasmid': return '🧬';
                                    case 'cell_line': return '🦠';
                                    case 'antibody': return '🔬';
                                    case 'enzyme': return '⚗️';
                                    case 'media': return '🧪';
                                    case 'chemical': return '⚗️';
                                    case 'buffer': return '🧪';
                                    case 'primer': return '🧬';
                                    case 'kit': return '📦';
                                    default: return '📦';
                                  }
                                };

                                return (
                                  <div key={type} className="flex items-center justify-between px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 rounded cursor-pointer">
                                    <div className="flex items-center space-x-2">
                                      <span>{getTypeIcon(type)}</span>
                                      <span className="capitalize">{type.replace('_', ' ')}</span>
                                    </div>
                                    <span className="text-gray-400 font-medium">{count}</span>
                                  </div>
                                );
                              });
                            })()}
                          </div>

                          {/* Low Stock Alert */}
                          {(() => {
                            const lowStockMaterials = materials.filter(
                              m => m.stockInfo.currentAmount <= m.stockInfo.minimumAmount
                            );
                            
                            if (lowStockMaterials.length > 0) {
                              return (
                                <div className="px-2 py-1.5 bg-red-50 border border-red-200 rounded text-xs">
                                  <div className="flex items-center space-x-1 text-red-700">
                                    <span>⚠️</span>
                                    <span className="font-medium">{lowStockMaterials.length} low stock</span>
                                  </div>
                                  <div className="mt-1 text-red-600">
                                    {lowStockMaterials.slice(0, 2).map(m => m.name).join(', ')}
                                    {lowStockMaterials.length > 2 && ` +${lowStockMaterials.length - 2} more`}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}

                          {/* Quick Actions */}
                          <div className="space-y-1 pt-2 border-t border-gray-100">
                            <button 
                              onClick={() => setShowMaterialsModal(true)}
                              className="flex items-center space-x-2 px-2 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded w-full"
                            >
                              <Search className="w-3 h-3" />
                              <span>Browse All Materials</span>
                            </button>
                            <button 
                              onClick={() => setShowStorageBoxModal(true)}
                              className="flex items-center space-x-2 px-2 py-1.5 text-xs text-purple-600 hover:bg-purple-50 rounded w-full"
                            >
                              <Package className="w-3 h-3" />
                              <span>Storage Boxes ({storageBoxes.length})</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Storage Boxes Subsection */}
                    <div className="flex items-center">
                      <div 
                        onClick={() => setShowStorageBoxes(!showStorageBoxes)}
                        className="flex-1 flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer group"
                      >
                        <div className="flex items-center space-x-3">
                          <Package className="w-4 h-4 text-purple-600" />
                          <span className="text-sm">Storage Boxes</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {storageBoxes.length}
                          </span>
                          <ChevronDown className={`w-3 h-3 transition-transform ${showStorageBoxes ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                      <button
                        onClick={() => setShowStorageBoxModal(true)}
                        className="ml-2 p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="Open Storage Box Manager"
                      >
                        <Package className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Storage Boxes List */}
                    <AnimatePresence>
                      {showStorageBoxes && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-4 space-y-1 border-l-2 border-purple-100 pl-3"
                        >
                          {storageBoxes.map(box => {
                            const totalSlots = box.layout.rows * box.layout.columns;
                            const occupiedSlots = Object.keys(box.materials).length;
                            const occupancyRate = (occupiedSlots / totalSlots) * 100;
                            
                            return (
                              <div 
                                key={box.id} 
                                onClick={() => {
                                  setSelectedStorageBox(box.id);
                                  setShowStorageBoxModal(true);
                                }}
                                className="flex items-center justify-between px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded cursor-pointer"
                              >
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    occupancyRate > 90 ? 'bg-red-500' : 
                                    occupancyRate > 70 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`} />
                                  <div className="flex-1 truncate">
                                    <div className="font-medium">{box.name}</div>
                                    <div className="text-gray-400">{box.location.freezer}</div>
                                  </div>
                                </div>
                                <div className="text-gray-400">
                                  {occupiedSlots}/{totalSlots}
                                </div>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Resources Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 px-3">
              Resources
            </h3>
            <div className="space-y-1">
              <div 
                onClick={() => setShowSettingsModal(true)}
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg cursor-pointer w-full text-left transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header - Arxiv Stone Style */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Project Context */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-lab-primary rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {selectedProject?.name || 'My Research Lab'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {selectedProject?.description || 'Advanced molecular biology research'}
                  </p>
                </div>
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                RESEARCH Plan
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
          
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2" />
            Created {selectedProject?.last_activity || 'March 15, 2024'}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          <div className="space-y-6">
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

            {/* Quick Actions - Arxiv Stone Style */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Experiments */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  onClick={handleQuickUpload}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Plus className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{dashboardStats.totalNotes}</span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">Lab Notes</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    📸 Photo-first recording with smart templates
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600">Take Photo</span>
                    <span className="text-gray-400">→</span>
                  </div>
                </motion.div>

                {/* Team/Analysis */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => window.open('/analysis', '_blank')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{dashboardStats.tablesDetected}</span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">Table Analysis</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Extract and analyze data tables from images
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-600">View Analysis</span>
                    <span className="text-gray-400">→</span>
                  </div>
                </motion.div>

                {/* NGS Analysis */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  onClick={() => setShowNGSModal(true)}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Dna className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">0</span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">NGS Analysis</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Process and analyze FASTQ sequence files
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-600">Start Analysis</span>
                    <span className="text-gray-400">→</span>
                  </div>
                </motion.div>

                {/* Protocols */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => window.open('/protocols', '_blank')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-orange-600" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{dashboardStats.totalProjects}</span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">Protocols</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Manage and organize lab protocols
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-orange-600">View Protocols</span>
                    <span className="text-gray-400">→</span>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Bottom Row: Storage & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Storage Section - Arxiv Stone Style */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Storage</h2>
                
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <div className="text-2xl">💾</div>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">
                      {storageUsage.used >= 1024 * 1024 * 1024 
                        ? `${(storageUsage.used / (1024 * 1024 * 1024)).toFixed(1)}GB`
                        : storageUsage.used >= 1024 * 1024 
                        ? `${(storageUsage.used / (1024 * 1024)).toFixed(1)}MB`
                        : `${(storageUsage.used / 1024).toFixed(1)}KB`
                      }
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">Files and Documentation</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Images, datasets, and experimental results
                  </p>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min((storageUsage.used / storageUsage.total) * 100, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {storageUsage.used >= 1024 * 1024 * 1024 
                        ? `${(storageUsage.used / (1024 * 1024 * 1024)).toFixed(1)}GB`
                        : storageUsage.used >= 1024 * 1024 
                        ? `${(storageUsage.used / (1024 * 1024)).toFixed(1)}MB`
                        : `${(storageUsage.used / 1024).toFixed(1)}KB`
                      } of {(storageUsage.total / (1024 * 1024 * 1024)).toFixed(0)}GB used
                    </span>
                    <Link 
                      href="/storage"
                      className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
                    >
                      View Storage →
                    </Link>
                  </div>
                </div>
              </section>

              {/* Recent Activity */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Plus className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Uploaded experiment photos</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <div className="text-sm">🧪</div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Started new PCR experiment</p>
                        <p className="text-xs text-gray-500">5 hours ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Generated analysis chart</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <Link 
                      href="/activity"
                      className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
                    >
                      View All Activity →
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Photo-First Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              <PhotoFirstUpload
                projectContext={selectedProject ? {
                  id: selectedProject.id,
                  name: selectedProject.name,
                  code: selectedProject.code,
                  tags: selectedProject.tags
                } : undefined}
                onExperimentSaved={(data) => {
                  console.log('Experiment saved:', data);
                  setShowUploadModal(false);
                  // Update dashboard stats or refresh data
                  setDashboardStats(prev => ({
                    ...prev,
                    totalNotes: prev.totalNotes + 1
                  }));
                }}
                onClose={() => setShowUploadModal(false)}
              />
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

      {/* Materials Manager Modal */}
      <MaterialsManager 
        isOpen={showMaterialsModal}
        onClose={() => setShowMaterialsModal(false)}
      />

      {/* Storage Box Manager Modal */}
      <AnimatePresence>
        {showStorageBoxModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] overflow-hidden"
            >
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Storage Box Manager</h2>
                  <button
                    onClick={() => setShowStorageBoxModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="sr-only">Close</span>
                    ×
                  </button>
                </div>
              </div>
              
              <div className="h-full overflow-y-auto p-6">
                <StorageBoxManager
                  storageBoxes={storageBoxes}
                  onUpdateBoxes={setStorageBoxes}
                  selectedBoxId={selectedStorageBox}
                  onSelectBox={setSelectedStorageBox}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <span className="sr-only">Close</span>
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-6" style={{ maxHeight: 'calc(90vh - 120px)' }}>
                {/* User Profile */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Profile</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-lab-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user?.full_name || user?.first_name || user?.username || 'User'}
                        </p>
                        <p className="text-sm text-gray-500">{user?.email || 'No email set'}</p>
                        <p className="text-sm text-gray-500">Role: {user?.is_admin ? 'Admin' : 'User'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Current Project</h3>
                  {selectedProject ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{selectedProject.code}</h4>
                        <span className="text-sm text-gray-500">{selectedProject.progress}% complete</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{selectedProject.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Team: {selectedProject.member_count} members</span>
                        <span>Notes: {selectedProject.note_count}</span>
                        <span>Priority: {selectedProject.priority}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No project selected. Select a project from the sidebar.</p>
                  )}
                </div>

                {/* System Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">System</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Auto-save notes</span>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-lab-primary">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Email notifications</span>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Dark mode</span>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active Projects List */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Active Projects ({projects.filter(p => p.status === 'active').length})</h3>
                  <div className="space-y-2">
                    {projects.filter(p => p.status === 'active').map(project => (
                      <div
                        key={project.id}
                        onClick={() => setSelectedProject(project)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedProject?.id === project.id
                            ? 'border-lab-primary bg-lab-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{project.code}</p>
                            <p className="text-xs text-gray-500">{project.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{project.progress}%</p>
                            <p className="text-xs text-gray-500">{project.priority} priority</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 p-4">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="w-full bg-lab-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close Settings
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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