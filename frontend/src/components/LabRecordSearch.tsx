'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter,
  X,
  FileText,
  User,
  Calendar,
  Hash,
  Thermometer,
  FlaskConical,
  TrendingUp,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { useAppStore } from '@/stores/app';
import { api } from '@/lib/api';

interface SearchResult {
  experiment_id: string;
  date: string;
  researcher: string;
  title: string;
  methods?: string;
  results?: string;
  observations?: string;
  raw_text?: string;
  created_at: string;
  relevance_score?: number;
}

interface MeasurementResult {
  experiment_id: string;
  measurement_type: string;
  value: string;
  unit: string;
  timestamp?: string;
  title: string;
  researcher: string;
  date: string;
  created_at: string;
}

interface SearchSuggestions {
  experiment_ids: string[];
  researchers: string[];
  titles: string[];
  measurement_types: string[];
}

interface LabRecordSearchProps {
  onResultSelect?: (result: SearchResult | MeasurementResult) => void;
  className?: string;
}

export function LabRecordSearch({ 
  onResultSelect,
  className = '' 
}: LabRecordSearchProps) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [measurementResults, setMeasurementResults] = useState<MeasurementResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestions>({
    experiment_ids: [],
    researchers: [],
    titles: [],
    measurement_types: []
  });
  
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<'experiments' | 'measurements'>('experiments');
  const [showFilters, setShowFilters] = useState(false);
  
  // Measurement filters
  const [measurementType, setMeasurementType] = useState('');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useAppStore();
  
  // Debounced search suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        fetchSuggestions();
      } else {
        setSuggestions({
          experiment_ids: [],
          researchers: [],
          titles: [],
          measurement_types: []
        });
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);
  
  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const fetchSuggestions = useCallback(async () => {
    try {
      const response = await api.get(`/search_suggestions?q=${encodeURIComponent(query)}`);
      if (response.success) {
        setSuggestions(response.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  }, [query]);
  
  const searchExperiments = useCallback(async (searchQuery?: string) => {
    const queryToUse = searchQuery || query;
    if (!queryToUse.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await api.get(`/search_lab_records?q=${encodeURIComponent(queryToUse)}&limit=50`);
      if (response.success) {
        setSearchResults(response.results);
        setActiveTab('experiments');
        
        addNotification({
          type: 'info',
          title: 'Search Complete',
          message: `Found ${response.results.length} experiments matching "${queryToUse}"`,
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Search Failed',
        message: error instanceof Error ? error.message : 'Search failed',
      });
    } finally {
      setIsSearching(false);
      setShowSuggestions(false);
    }
  }, [query, addNotification]);
  
  const searchMeasurements = useCallback(async () => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (measurementType) params.append('type', measurementType);
      if (minValue) params.append('min_value', minValue);
      if (maxValue) params.append('max_value', maxValue);
      params.append('limit', '50');
      
      const response = await api.get(`/search_measurements?${params.toString()}`);
      if (response.success) {
        setMeasurementResults(response.results);
        setActiveTab('measurements');
        
        addNotification({
          type: 'info',
          title: 'Search Complete',
          message: `Found ${response.results.length} measurements`,
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Search Failed',
        message: error instanceof Error ? error.message : 'Measurement search failed',
      });
    } finally {
      setIsSearching(false);
    }
  }, [measurementType, minValue, maxValue, addNotification]);
  
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'experiments') {
      searchExperiments();
    } else {
      searchMeasurements();
    }
  }, [activeTab, searchExperiments, searchMeasurements]);
  
  const handleSuggestionClick = useCallback((suggestion: string, type: string) => {
    if (type === 'measurement_type') {
      setMeasurementType(suggestion);
      setActiveTab('measurements');
    } else {
      setQuery(suggestion);
      searchExperiments(suggestion);
    }
    setShowSuggestions(false);
  }, [searchExperiments]);
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Unknown date';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };
  
  const highlightMatch = (text: string, searchQuery: string) => {
    if (!searchQuery || !text) return text;
    
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };
  
  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Search Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Search Lab Records</span>
          </h2>
          
          <div className="flex items-center space-x-2">
            {/* Tab Switcher */}
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                onClick={() => setActiveTab('experiments')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeTab === 'experiments' 
                    ? 'bg-white text-lab-primary shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-1" />
                Experiments
              </button>
              <button
                onClick={() => setActiveTab('measurements')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeTab === 'measurements' 
                    ? 'bg-white text-lab-primary shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Measurements
              </button>
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-outline text-sm ${showFilters ? 'bg-lab-primary text-white' : ''}`}
            >
              <Filter className="w-4 h-4 mr-1" />
              Filters
              <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-4">
          {activeTab === 'experiments' ? (
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                  placeholder="Search experiments by ID, title, researcher, methods, results..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-lab-primary focus:border-lab-primary"
                  disabled={isSearching}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setSearchResults([]);
                      setShowSuggestions(false);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              {/* Search Suggestions */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    ref={suggestionsRef}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
                  >
                    {Object.entries(suggestions).map(([type, items]) => (
                      items.length > 0 && (
                        <div key={type} className="p-2">
                          <div className="text-xs font-medium text-gray-500 mb-1 flex items-center space-x-1">
                            {type === 'experiment_ids' && <Hash className="w-3 h-3" />}
                            {type === 'researchers' && <User className="w-3 h-3" />}
                            {type === 'titles' && <FileText className="w-3 h-3" />}
                            {type === 'measurement_types' && <FlaskConical className="w-3 h-3" />}
                            <span>{type.replace('_', ' ').toUpperCase()}</span>
                          </div>
                          {items.map((item, index) => (
                            <button
                              key={`${type}-${index}`}
                              onClick={() => handleSuggestionClick(item, type)}
                              className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      )
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Measurement Type
                </label>
                <input
                  type="text"
                  value={measurementType}
                  onChange={(e) => setMeasurementType(e.target.value)}
                  placeholder="e.g., temperature, pH, volume"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-lab-primary focus:border-lab-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Value
                </label>
                <input
                  type="number"
                  step="any"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-lab-primary focus:border-lab-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Value
                </label>
                <input
                  type="number"
                  step="any"
                  value={maxValue}
                  onChange={(e) => setMaxValue(e.target.value)}
                  placeholder="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-lab-primary focus:border-lab-primary"
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSearching || (activeTab === 'experiments' && !query.trim())}
              className="btn-primary flex items-center space-x-2"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>
                Search {activeTab === 'experiments' ? 'Experiments' : 'Measurements'}
              </span>
            </button>
          </div>
        </form>
      </div>
      
      {/* Search Results */}
      <AnimatePresence>
        {(searchResults.length > 0 || measurementResults.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Search Results ({activeTab === 'experiments' ? searchResults.length : measurementResults.length})
              </h3>
            </div>
            
            {activeTab === 'experiments' ? (
              <div className="space-y-3">
                {searchResults.map((result, index) => (
                  <motion.div
                    key={`${result.experiment_id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="card p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onResultSelect?.(result)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-lab-primary">
                          {result.experiment_id}
                        </span>
                        {result.relevance_score && result.relevance_score > 0 && (
                          <span className="text-xs bg-lab-primary/10 text-lab-primary px-2 py-1 rounded-full">
                            Relevance: {result.relevance_score}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center space-x-4">
                        {result.researcher && (
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{result.researcher}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(result.date || result.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {result.title && (
                      <h4 className="font-medium text-gray-900 mb-2">
                        {highlightMatch(result.title, query)}
                      </h4>
                    )}
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      {result.methods && (
                        <div>
                          <span className="font-medium">Methods:</span>{' '}
                          <span className="line-clamp-2">
                            {highlightMatch(result.methods.substring(0, 150) + '...', query)}
                          </span>
                        </div>
                      )}
                      {result.results && (
                        <div>
                          <span className="font-medium">Results:</span>{' '}
                          <span className="line-clamp-2">
                            {highlightMatch(result.results.substring(0, 150) + '...', query)}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {measurementResults.map((result, index) => (
                  <motion.div
                    key={`${result.experiment_id}-${result.measurement_type}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="card p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onResultSelect?.(result)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Thermometer className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {result.measurement_type}
                        </span>
                        <span className="text-lg font-semibold text-lab-primary">
                          {result.value} {result.unit}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(result.date || result.created_at)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Hash className="w-3 h-3" />
                          <span>{result.experiment_id}</span>
                        </div>
                        {result.researcher && (
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{result.researcher}</span>
                          </div>
                        )}
                      </div>
                      {result.title && (
                        <span className="truncate max-w-xs">{result.title}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* No Results */}
      {!isSearching && ((activeTab === 'experiments' && searchResults.length === 0 && query) || 
                        (activeTab === 'measurements' && measurementResults.length === 0 && (measurementType || minValue || maxValue))) && (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No {activeTab} found matching your search criteria.</p>
          <p className="text-sm mt-1">Try adjusting your search terms or filters.</p>
        </div>
      )}
    </div>
  );
}