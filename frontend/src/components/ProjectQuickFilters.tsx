'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter,
  Search,
  Star,
  Clock,
  Users,
  FileText,
  ChevronDown,
  X,
  Dna,
  Microscope,
  Beaker,
  Target,
  Calendar,
  TrendingUp,
  Archive
} from 'lucide-react';
import { useAppStore } from '@/stores/app';

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
  tags: string[];
}

interface ProjectQuickFiltersProps {
  onProjectSelect?: (project: Project | null) => void;
  onFilterChange?: (filters: FilterState) => void;
  className?: string;
}

interface FilterState {
  selectedProject: Project | null;
  status: string[];
  category: string[];
  priority: string[];
  searchQuery: string;
  timeRange: 'all' | 'today' | 'week' | 'month';
}

// Mock project data based on the screenshot
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

const CATEGORY_CONFIG = {
  gene_editing: {
    label: 'Gene Editing',
    icon: Dna,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  protein: {
    label: 'Protein Studies',
    icon: Microscope,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  therapy: {
    label: 'Therapy Development',
    icon: Beaker,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  analysis: {
    label: 'Data Analysis',
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  }
};

export function ProjectQuickFilters({
  onProjectSelect,
  onFilterChange,
  className = ''
}: ProjectQuickFiltersProps) {
  const [projects] = useState<Project[]>(SAMPLE_PROJECTS);
  const [filters, setFilters] = useState<FilterState>({
    selectedProject: null,
    status: [],
    category: [],
    priority: [],
    searchQuery: '',
    timeRange: 'all'
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);

  // Apply filters
  useEffect(() => {
    let filtered = projects;

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(project => filters.status.includes(project.status));
    }

    // Category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(project => filters.category.includes(project.category));
    }

    // Priority filter
    if (filters.priority.length > 0) {
      filtered = filtered.filter(project => filters.priority.includes(project.priority));
    }

    setFilteredProjects(filtered);
  }, [projects, filters]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  }, [filters, onFilterChange]);

  // Select project
  const handleProjectSelect = useCallback((project: Project | null) => {
    updateFilters({ selectedProject: project });
    onProjectSelect?.(project);
  }, [updateFilters, onProjectSelect]);

  // Toggle filter value
  const toggleFilterValue = useCallback((filterType: keyof FilterState, value: string) => {
    const currentValues = filters[filterType] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    updateFilters({ [filterType]: newValues });
  }, [filters, updateFilters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    const clearedFilters: FilterState = {
      selectedProject: null,
      status: [],
      category: [],
      priority: [],
      searchQuery: '',
      timeRange: 'all'
    };
    setFilters(clearedFilters);
    onFilterChange?.(clearedFilters);
    onProjectSelect?.(null);
  }, [onFilterChange, onProjectSelect]);

  // Get active filter count
  const getActiveFilterCount = () => {
    return (
      filters.status.length +
      filters.category.length +
      filters.priority.length +
      (filters.searchQuery ? 1 : 0) +
      (filters.timeRange !== 'all' ? 1 : 0)
    );
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-lab-primary/10 rounded-lg">
              <Filter className="w-5 h-5 text-lab-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Project Filters</h3>
              <p className="text-sm text-gray-500">
                Quick access to your research projects
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getActiveFilterCount() > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            )}
            
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`p-2 rounded-lg transition-colors ${
                showAdvanced ? 'bg-lab-primary text-white' : 'hover:bg-gray-100'
              }`}
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${
                showAdvanced ? 'rotate-180' : ''
              }`} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects, codes, or tags (e.g., CF1282, CFTR, prime-editing)..."
            value={filters.searchQuery}
            onChange={(e) => updateFilters({ searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-lab-primary focus:border-lab-primary"
          />
        </div>

        {/* Quick Project Access */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-800">Active Projects</h4>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {projects.filter(p => p.status === 'active').length} active
            </span>
          </div>
          
          <div className="space-y-3">
            {projects.filter(p => p.status === 'active').map(project => {
              const categoryConfig = CATEGORY_CONFIG[project.category];
              const Icon = categoryConfig.icon;
              const isSelected = filters.selectedProject?.id === project.id;
              
              return (
                <motion.button
                  key={project.id}
                  onClick={() => handleProjectSelect(isSelected ? null : project)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full p-4 text-left border rounded-xl transition-all duration-200 hover:shadow-lg ${
                    isSelected
                      ? 'border-lab-primary bg-gradient-to-br from-lab-primary/5 to-lab-primary/10 shadow-md'
                      : 'border-gray-200 hover:border-lab-primary/50 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${categoryConfig.bgColor}`}>
                          <Icon className={`w-5 h-5 ${categoryConfig.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-900 text-lg">{project.code}</span>
                            {project.priority === 'high' && (
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-amber-500 fill-current" />
                                <span className="text-xs text-amber-600 font-medium">HIGH</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {project.description}
                          </p>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="w-2 h-2 bg-lab-primary rounded-full animate-pulse"></div>
                      )}
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center bg-white/50 rounded-lg p-2 border border-gray-100">
                        <FileText className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-gray-900">{project.note_count}</div>
                        <div className="text-xs text-gray-500">Notes</div>
                      </div>
                      
                      <div className="text-center bg-white/50 rounded-lg p-2 border border-gray-100">
                        <Users className="w-4 h-4 text-green-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-gray-900">{project.member_count}</div>
                        <div className="text-xs text-gray-500">Members</div>
                      </div>
                      
                      <div className="text-center bg-white/50 rounded-lg p-2 border border-gray-100">
                        <TrendingUp className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-gray-900">{project.progress}%</div>
                        <div className="text-xs text-gray-500">Progress</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 font-medium">Project Progress</span>
                        <span className={`font-bold ${
                          project.progress === 0 ? 'text-gray-400' :
                          project.progress < 30 ? 'text-red-500' :
                          project.progress < 70 ? 'text-amber-500' :
                          'text-green-500'
                        }`}>
                          {project.progress === 0 ? 'Not Started' :
                           project.progress < 30 ? 'Starting' :
                           project.progress < 70 ? 'In Progress' :
                           'Near Completion'
                          }
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={`h-full rounded-full transition-all ${
                            project.progress === 0 ? 'bg-gray-300' :
                            project.progress < 30 ? 'bg-gradient-to-r from-red-400 to-red-500' :
                            project.progress < 70 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                            'bg-gradient-to-r from-green-400 to-green-500'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Category & Last Activity */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${categoryConfig.color.replace('text-', 'bg-')}`}></div>
                        <span className="text-gray-600 font-medium">{categoryConfig.label}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>2 hours ago</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 border-t border-gray-200 pt-4"
            >
              {/* Status Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
                <div className="flex flex-wrap gap-2">
                  {['active', 'completed', 'paused'].map(status => (
                    <button
                      key={status}
                      onClick={() => toggleFilterValue('status', status)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        filters.status.includes(status)
                          ? 'border-lab-primary bg-lab-primary text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Category</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                    const Icon = config.icon;
                    const isActive = filters.category.includes(key);
                    
                    return (
                      <button
                        key={key}
                        onClick={() => toggleFilterValue('category', key)}
                        className={`px-3 py-1 text-sm rounded-full border transition-colors flex items-center space-x-1 ${
                          isActive
                            ? 'border-lab-primary bg-lab-primary text-white'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Priority</h4>
                <div className="flex flex-wrap gap-2">
                  {['high', 'medium', 'low'].map(priority => (
                    <button
                      key={priority}
                      onClick={() => toggleFilterValue('priority', priority)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        filters.priority.includes(priority)
                          ? 'border-lab-primary bg-lab-primary text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Range */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Last Activity</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'All Time' },
                    { value: 'today', label: 'Today' },
                    { value: 'week', label: 'This Week' },
                    { value: 'month', label: 'This Month' }
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => updateFilters({ timeRange: value as any })}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        filters.timeRange === value
                          ? 'border-lab-primary bg-lab-primary text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters Summary */}
        {getActiveFilterCount() > 0 && (
          <div className="bg-lab-primary/5 border border-lab-primary/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-lab-primary">
                  {getActiveFilterCount()} filter(s) active
                </span>
                <span className="text-sm text-gray-600">
                  • {filteredProjects.length} project(s) found
                </span>
              </div>
              
              {filters.selectedProject && (
                <div className="flex items-center space-x-2 text-sm text-lab-primary">
                  <Target className="w-4 h-4" />
                  <span>Viewing: {filters.selectedProject.code}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}