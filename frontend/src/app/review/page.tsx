'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  Plus,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { ExperimentRecordReview } from '@/components/ExperimentRecordReview';

interface PendingRecord {
  record_id: string;
  title: string;
  project_code: string;
  project_name: string;
  researcher: string;
  date: string;
  ocr_confidence: number;
  needs_review: boolean;
  processing_timestamp: string;
}

export default function ReviewPage() {
  const [pendingRecords, setPendingRecords] = useState<PendingRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  useEffect(() => {
    loadPendingRecords();
  }, []);

  const loadPendingRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:5005/experiment_records/pending');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPendingRecords(data.records);
        }
      }
    } catch (error) {
      console.error('Failed to load pending records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordSave = (updates: any, reviewer: string) => {
    // Refresh the list after saving
    loadPendingRecords();
    setSelectedRecord(null);
  };

  const filteredRecords = pendingRecords.filter(record => {
    const matchesSearch = !searchTerm || 
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.researcher.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.record_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProject = !projectFilter || record.project_code === projectFilter;
    
    return matchesSearch && matchesProject;
  });

  const uniqueProjects = Array.from(new Set(pendingRecords.map(r => r.project_code)));

  if (selectedRecord) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <ExperimentRecordReview
          recordId={selectedRecord}
          onSave={handleRecordSave}
          onClose={() => setSelectedRecord(null)}
          className="max-w-6xl mx-auto"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Experiment Record Review
              </h1>
              <p className="mt-2 text-gray-600">
                Review and edit automatically generated experiment records
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={loadPendingRecords}
                className="btn-outline flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              
              <button className="btn-primary flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Upload New Notes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-lab-primary focus:border-lab-primary"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-lab-primary focus:border-lab-primary appearance-none"
              >
                <option value="">All Projects</option>
                {uniqueProjects.map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>
            
            <div className="text-sm text-gray-600 flex items-center">
              <span className="font-medium">{filteredRecords.length}</span>
              <span className="ml-1">records pending review</span>
            </div>
          </div>
        </div>

        {/* Records List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-20 h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No records to review
            </h3>
            <p className="text-gray-600 mb-6">
              All experiment records have been reviewed or no records match your filters.
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="btn-outline"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record, index) => (
              <motion.div
                key={record.record_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedRecord(record.record_id)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Status Icon */}
                      <div className="flex-shrink-0">
                        {record.needs_review ? (
                          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-yellow-600" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                        )}
                      </div>
                      
                      {/* Record Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {record.title}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-lab-primary/10 text-lab-primary">
                            {record.project_code}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center space-x-1">
                            <FileText className="w-4 h-4" />
                            <span>{record.record_id}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(record.processing_timestamp).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>By {record.researcher}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600">{record.project_name}</p>
                      </div>
                    </div>
                    
                    {/* Confidence & Action */}
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {record.ocr_confidence}% confidence
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          record.ocr_confidence >= 85 
                            ? 'bg-green-100 text-green-800' 
                            : record.ocr_confidence >= 70 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.ocr_confidence >= 85 ? 'High' : record.ocr_confidence >= 70 ? 'Medium' : 'Low'}
                        </div>
                      </div>
                      
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}