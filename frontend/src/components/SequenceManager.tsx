'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/stores/app';
import { 
  Plus, 
  Search, 
  Filter,
  FileText,
  Upload,
  Download,
  Eye,
  Edit3,
  Trash2,
  MoreVertical,
  Dna,
  Activity,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Zap,
  Target,
  X
} from 'lucide-react';

interface Sequence {
  id: number;
  name: string;
  sequence_type: string;
  description?: string;
  original_filename?: string;
  file_format?: string;
  sequence_length?: number;
  gc_content?: number;
  read_count?: number;
  file_size?: number;
  project_id: number;
  project_name?: string;
  user_id: number;
  user_name?: string;
  created_at: string;
  updated_at: string;
  analysis_results?: any;
  amplicon_count: number;
}

interface Amplicon {
  id: number;
  name: string;
  primer_forward?: string;
  primer_reverse?: string;
  target_region?: string;
  expected_size?: number;
  actual_size?: number;
  primer_efficiency?: number;
  specificity_score?: number;
  annealing_temp?: number;
  cycle_count?: number;
  sequence_id: number;
  sequence_name?: string;
  project_id: number;
  project_name?: string;
  user_id: number;
  user_name?: string;
  created_at: string;
  updated_at: string;
  analysis_output?: any;
  quality_metrics?: any;
  pcr_conditions?: any;
}

interface SequenceManagerProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function SequenceManager({ projectId, isOpen, onClose }: SequenceManagerProps) {
  const { addNotification } = useAppStore();
  const queryClient = useQueryClient();
  
  const [selectedTab, setSelectedTab] = useState<'sequences' | 'amplicons'>('sequences');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSequenceModal, setShowSequenceModal] = useState(false);
  const [showAmpliconModal, setShowAmpliconModal] = useState(false);
  const [editingSequence, setEditingSequence] = useState<Sequence | null>(null);
  const [editingAmplicon, setEditingAmplicon] = useState<Amplicon | null>(null);
  const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(null);

  // Fetch sequences
  const { data: sequences = [], isLoading: sequencesLoading, refetch: refetchSequences } = useQuery({
    queryKey: ['sequences', projectId],
    queryFn: () => api.getSequences(projectId),
    enabled: isOpen && projectId > 0,
  });

  // Fetch amplicons
  const { data: amplicons = [], isLoading: ampliconsLoading, refetch: refetchAmplicons } = useQuery({
    queryKey: ['amplicons', projectId],
    queryFn: () => api.getAmplicons(projectId),
    enabled: isOpen && projectId > 0,
  });

  // Upload sequence mutation
  const uploadSequenceMutation = useMutation({
    mutationFn: (data: FormData) => api.uploadSequence(data),
    onSuccess: () => {
      refetchSequences();
      setShowUploadModal(false);
      addNotification({
        type: 'success',
        title: 'Sequence Uploaded',
        message: 'Sequence file has been uploaded and analyzed successfully.',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Upload Failed',
        message: error.message || 'Failed to upload sequence file.',
      });
    },
  });

  // Create/update sequence mutation
  const saveSequenceMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingSequence) {
        return api.updateSequence(editingSequence.id, data);
      } else {
        return api.createSequence({ ...data, project_id: projectId });
      }
    },
    onSuccess: () => {
      refetchSequences();
      setShowSequenceModal(false);
      setEditingSequence(null);
      addNotification({
        type: 'success',
        title: editingSequence ? 'Sequence Updated' : 'Sequence Created',
        message: 'Sequence has been saved successfully.',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: error.message || 'Failed to save sequence.',
      });
    },
  });

  // Create/update amplicon mutation
  const saveAmpliconMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingAmplicon) {
        return api.updateAmplicon(editingAmplicon.id, data);
      } else {
        return api.createAmplicon({ ...data, project_id: projectId });
      }
    },
    onSuccess: () => {
      refetchAmplicons();
      setShowAmpliconModal(false);
      setEditingAmplicon(null);
      addNotification({
        type: 'success',
        title: editingAmplicon ? 'Amplicon Updated' : 'Amplicon Created',
        message: 'Amplicon has been saved successfully.',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: error.message || 'Failed to save amplicon.',
      });
    },
  });

  // Delete mutations
  const deleteSequenceMutation = useMutation({
    mutationFn: (id: number) => api.deleteSequence(id),
    onSuccess: () => {
      refetchSequences();
      addNotification({
        type: 'success',
        title: 'Sequence Deleted',
        message: 'Sequence has been deleted successfully.',
      });
    },
  });

  const deleteAmpliconMutation = useMutation({
    mutationFn: (id: number) => api.deleteAmplicon(id),
    onSuccess: () => {
      refetchAmplicons();
      addNotification({
        type: 'success',
        title: 'Amplicon Deleted',
        message: 'Amplicon has been deleted successfully.',
      });
    },
  });

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSequenceTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'dna': return <Dna className="w-4 h-4 text-blue-600" />;
      case 'rna': return <Activity className="w-4 h-4 text-green-600" />;
      case 'fastq': return <BarChart3 className="w-4 h-4 text-purple-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleUploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', projectId.toString());
    
    // Determine sequence type based on file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    let sequenceType = 'DNA';
    if (extension === 'fastq' || extension === 'gz') {
      sequenceType = 'FASTQ';
    }
    formData.append('sequence_type', sequenceType);
    formData.append('name', file.name.replace(/\.[^/.]+$/, "")); // Remove extension

    uploadSequenceMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Sequence Management</h2>
            <p className="text-sm text-gray-600">Manage DNA/RNA sequences and amplicons</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload FASTQ</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'sequences', label: 'Sequences', icon: Dna },
              { key: 'amplicons', label: 'Amplicons', icon: Target },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedTab(key as any)}
                className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  selectedTab === key
                    ? 'border-lab-primary text-lab-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <AnimatePresence mode="wait">
            {selectedTab === 'sequences' && (
              <motion.div
                key="sequences"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Sequences Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search sequences..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lab-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingSequence(null);
                      setShowSequenceModal(true);
                    }}
                    className="btn-outline flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Sequence</span>
                  </button>
                </div>

                {/* Sequences Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sequences.map((sequence) => (
                    <div key={sequence.id} className="card p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getSequenceTypeIcon(sequence.sequence_type)}
                          <h3 className="font-medium text-gray-900 truncate">{sequence.name}</h3>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setEditingSequence(sequence);
                              setShowSequenceModal(true);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this sequence?')) {
                                deleteSequenceMutation.mutate(sequence.id);
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Type:</span>
                          <span className="font-medium">{sequence.sequence_type}</span>
                        </div>
                        {sequence.sequence_length && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Length:</span>
                            <span className="font-medium">{sequence.sequence_length.toLocaleString()} bp</span>
                          </div>
                        )}
                        {sequence.gc_content && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">GC Content:</span>
                            <span className="font-medium">{sequence.gc_content.toFixed(1)}%</span>
                          </div>
                        )}
                        {sequence.read_count && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Reads:</span>
                            <span className="font-medium">{sequence.read_count.toLocaleString()}</span>
                          </div>
                        )}
                        {sequence.file_size && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Size:</span>
                            <span className="font-medium">{formatFileSize(sequence.file_size)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">Amplicons:</span>
                          <span className="font-medium">{sequence.amplicon_count}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Created {formatDate(sequence.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {sequences.length === 0 && (
                  <div className="text-center py-12">
                    <Dna className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No sequences yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Upload FASTQ files or add sequences manually.
                    </p>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="btn-primary"
                    >
                      Upload First Sequence
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {selectedTab === 'amplicons' && (
              <motion.div
                key="amplicons"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Amplicons Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search amplicons..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lab-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingAmplicon(null);
                      setShowAmpliconModal(true);
                    }}
                    className="btn-outline flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Amplicon</span>
                  </button>
                </div>

                {/* Amplicons Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {amplicons.map((amplicon) => (
                    <div key={amplicon.id} className="card p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-green-600" />
                          <h3 className="font-medium text-gray-900 truncate">{amplicon.name}</h3>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setEditingAmplicon(amplicon);
                              setShowAmpliconModal(true);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this amplicon?')) {
                                deleteAmpliconMutation.mutate(amplicon.id);
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        {amplicon.target_region && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Target:</span>
                            <span className="font-medium truncate">{amplicon.target_region}</span>
                          </div>
                        )}
                        {amplicon.expected_size && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Expected Size:</span>
                            <span className="font-medium">{amplicon.expected_size} bp</span>
                          </div>
                        )}
                        {amplicon.actual_size && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Actual Size:</span>
                            <span className="font-medium">{amplicon.actual_size} bp</span>
                          </div>
                        )}
                        {amplicon.primer_efficiency !== null && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Efficiency:</span>
                            <span className={`font-medium ${amplicon.primer_efficiency >= 80 ? 'text-green-600' : amplicon.primer_efficiency >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {amplicon.primer_efficiency?.toFixed(1)}%
                            </span>
                          </div>
                        )}
                        {amplicon.specificity_score !== null && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Specificity:</span>
                            <span className={`font-medium ${amplicon.specificity_score >= 80 ? 'text-green-600' : amplicon.specificity_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {amplicon.specificity_score?.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Created {formatDate(amplicon.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {amplicons.length === 0 && (
                  <div className="text-center py-12">
                    <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No amplicons yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Add amplicons to track PCR results and analysis.
                    </p>
                    <button
                      onClick={() => {
                        setEditingAmplicon(null);
                        setShowAmpliconModal(true);
                      }}
                      className="btn-primary"
                    >
                      Add First Amplicon
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Upload Modal */}
        <AnimatePresence>
          {showUploadModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-60"
              onClick={() => setShowUploadModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl p-6 w-full max-w-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Upload Sequence File
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload FASTQ, FASTQ.GZ, or FASTA files for analysis.
                </p>
                
                <input
                  type="file"
                  accept=".fastq,.fastq.gz,.fasta,.fa"
                  onChange={handleUploadFile}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-lab-primary transition-colors"
                />
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}