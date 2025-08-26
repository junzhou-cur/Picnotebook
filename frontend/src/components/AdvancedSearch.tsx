'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Calendar,
  X,
  ChevronDown,
  Tag,
  Folder,
  Clock,
  Zap
} from 'lucide-react';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import type { LabNote } from '@/types';

interface SearchFilters {
  q: string;
  project_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  category?: string;
}

interface SearchResult {
  notes: (LabNote & {
    category: string;
    relevance_score: number;
  })[];
  total: number;
  facets: {
    projects: Array<{id: number; name: string; count: number}>;
    statuses: Array<{key: string; label: string; count: number}>;
    categories: Array<{key: string; label: string; count: number}>;
  };
  query: string;
  filters_applied: any;
}

interface AdvancedSearchProps {
  onResults?: (results: SearchResult) => void;
  className?: string;
}

export function AdvancedSearch({ onResults, className = '' }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    q: '',
    project_id: undefined,
    status: undefined,
    date_from: undefined,
    date_to: undefined,
    category: undefined,
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Search query
  const { data: searchResults, refetch: performSearch } = useQuery({
    queryKey: ['search', filters],
    queryFn: () => api.search({
      ...filters,
      limit: 50,
      offset: 0,
    }),
    enabled: false, // Only run when explicitly triggered
  });

  useEffect(() => {
    if (searchResults && onResults) {
      // Transform notes to include required properties for SearchResult type
      const transformedResults = {
        ...searchResults,
        notes: searchResults.notes.map((note: LabNote) => ({
          ...note,
          category: 'experiment', // Default category
          relevance_score: 1.0 // Default relevance score
        }))
      };
      onResults(transformedResults);
    }
  }, [searchResults, onResults]);

  const handleSearch = async () => {
    if (!filters.q.trim() && !filters.project_id && !filters.status && !filters.date_from && !filters.date_to) {
      return;
    }
    
    setIsSearching(true);
    try {
      await performSearch();
    } finally {
      setIsSearching(false);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      project_id: undefined,
      status: undefined,
      date_from: undefined,
      date_to: undefined,
      category: undefined,
    });
  };

  const activeFilterCount = Object.values(filters).filter(v => 
    v !== undefined && v !== null && v !== ''
  ).length;

  return (
    <div className={`w-full ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={filters.q}
              onChange={(e) => handleFilterChange('q', e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="input-field pl-10 pr-4"
              placeholder="Search lab notes, experiments, observations..."
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-outline flex items-center space-x-2 ${
              activeFilterCount > 0 ? 'bg-lab-primary text-white' : ''
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-white text-lab-primary rounded-full px-2 py-0.5 text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="btn-primary flex items-center space-x-2"
          >
            {isSearching ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-4 h-4" />
              </motion.div>
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>{isSearching ? 'Searching...' : 'Search'}</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Project Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Folder className="w-4 h-4 inline mr-1" />
                  Project
                </label>
                <select
                  value={filters.project_id || ''}
                  onChange={(e) => handleFilterChange('project_id', e.target.value ? Number(e.target.value) : undefined)}
                  className="input-field"
                >
                  <option value="">All Projects</option>
                  {searchResults?.facets.projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="input-field"
                >
                  <option value="">All Statuses</option>
                  {searchResults?.facets.statuses.map((status) => (
                    <option key={status.key} value={status.key}>
                      {status.label} ({status.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Category
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="input-field"
                >
                  <option value="">All Categories</option>
                  {searchResults?.facets.categories.map((category) => (
                    <option key={category.key} value={category.key}>
                      {category.label} ({category.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date Range
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={filters.date_from || ''}
                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                    className="input-field text-sm"
                    placeholder="From"
                  />
                  <input
                    type="date"
                    value={filters.date_to || ''}
                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                    className="input-field text-sm"
                    placeholder="To"
                  />
                </div>
              </div>
            </div>

            {/* Active Filters Summary */}
            {activeFilterCount > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {filters.q && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-lab-primary text-white">
                      Query: "{filters.q}"
                      <button
                        onClick={() => handleFilterChange('q', '')}
                        className="ml-2 text-white/80 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.project_id && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      Project Filter Active
                      <button
                        onClick={() => handleFilterChange('project_id', undefined)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.status && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      Status: {filters.status}
                      <button
                        onClick={() => handleFilterChange('status', undefined)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {(filters.date_from || filters.date_to) && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                      Date Range Applied
                      <button
                        onClick={() => {
                          handleFilterChange('date_from', undefined);
                          handleFilterChange('date_to', undefined);
                        }}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}