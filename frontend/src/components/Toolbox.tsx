'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Upload, 
  Database, 
  Play, 
  FileText, 
  Settings, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  Plus
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ToolboxProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Sequence {
  output_name: string;
  amplicon_seq: string;
  sgRNA: string;
}

interface UploadedFile {
  original_name: string;
  stored_name: string;
  file_path: string;
  file_size: number;
}

export function Toolbox({ isOpen, onClose }: ToolboxProps) {
  const [activeTab, setActiveTab] = useState<'sequences' | 'upload' | 'analysis'>('sequences');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Sequence management state
  const [newSequence, setNewSequence] = useState<Sequence>({
    output_name: '',
    amplicon_seq: '',
    sgRNA: ''
  });

  // Analysis parameters state
  const [analysisParams, setAnalysisParams] = useState({
    output_name: '',
    amplicon_seq: '',
    sgRNA: '',
    wc: -10,
    w: 20,
    p: 4,
    base_editor_output: true,
    sample_data: [] as Array<{sample_name: string, file_name: string}>
  });

  // Fetch sequences
  const { data: sequences = [], isLoading: sequencesLoading } = useQuery({
    queryKey: ['toolbox-sequences'],
    queryFn: () => api.get('/api/toolbox/sequences').then(res => res.json()).then(data => data.sequences),
    enabled: isOpen,
  });

  // Save sequence mutation
  const saveSequenceMutation = useMutation({
    mutationFn: (sequence: Sequence) => 
      api.post('/api/toolbox/sequences', sequence).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toolbox-sequences'] });
      setNewSequence({ output_name: '', amplicon_seq: '', sgRNA: '' });
    },
  });

  // Upload files mutation
  const uploadFilesMutation = useMutation({
    mutationFn: (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      
      return fetch('/api/toolbox/upload-data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      }).then(res => res.json());
    },
    onSuccess: (data) => {
      setUploadedFiles(prev => [...prev, ...data.uploaded_files]);
    },
  });

  // Start analysis mutation
  const startAnalysisMutation = useMutation({
    mutationFn: (params: typeof analysisParams) =>
      api.post('/api/toolbox/analysis', params).then(res => res.json()),
    onSuccess: (data) => {
      console.log('Analysis started:', data);
      // Could add job tracking here
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      await uploadFilesMutation.mutateAsync(files);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSequenceLoad = (sequence: Sequence) => {
    setAnalysisParams(prev => ({
      ...prev,
      output_name: sequence.output_name,
      amplicon_seq: sequence.amplicon_seq,
      sgRNA: sequence.sgRNA
    }));
    setActiveTab('analysis');
  };

  const handleStartAnalysis = () => {
    if (!analysisParams.output_name || !analysisParams.amplicon_seq || !analysisParams.sgRNA) {
      alert('Please fill in all required sequence information');
      return;
    }

    if (uploadedFiles.length === 0) {
      alert('Please upload FASTQ files first');
      return;
    }

    // Map uploaded files to sample data
    const sampleData = uploadedFiles.map((file, index) => ({
      sample_name: `Sample_${index + 1}`,
      file_name: file.stored_name
    }));

    startAnalysisMutation.mutate({
      ...analysisParams,
      sample_data: sampleData
    });
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
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-lab-primary" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">MiSeq Data Analysis Toolbox</h2>
              <p className="text-sm text-gray-600">Process FASTQ files and analyze CRISPR editing data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'sequences', label: 'Sequence Management', icon: Database },
            { id: 'upload', label: 'File Upload', icon: Upload },
            { id: 'analysis', label: 'Run Analysis', icon: Play },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-lab-primary text-lab-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Sequence Management Tab */}
          {activeTab === 'sequences' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Sequence</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Output Name
                    </label>
                    <input
                      type="text"
                      value={newSequence.output_name}
                      onChange={(e) => setNewSequence(prev => ({ ...prev, output_name: e.target.value }))}
                      className="input-field"
                      placeholder="e.g., Experiment_001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amplicon Sequence
                    </label>
                    <textarea
                      value={newSequence.amplicon_seq}
                      onChange={(e) => setNewSequence(prev => ({ ...prev, amplicon_seq: e.target.value }))}
                      className="input-field resize-none"
                      rows={3}
                      placeholder="Enter the amplicon DNA sequence"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      sgRNA Sequence
                    </label>
                    <input
                      type="text"
                      value={newSequence.sgRNA}
                      onChange={(e) => setNewSequence(prev => ({ ...prev, sgRNA: e.target.value }))}
                      className="input-field"
                      placeholder="Enter the sgRNA sequence"
                    />
                  </div>
                  <button
                    onClick={() => saveSequenceMutation.mutate(newSequence)}
                    disabled={saveSequenceMutation.isPending || !newSequence.output_name || !newSequence.amplicon_seq || !newSequence.sgRNA}
                    className="btn-primary self-start"
                  >
                    {saveSequenceMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Add Sequence</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Sequences</h3>
                {sequencesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-lab-primary" />
                  </div>
                ) : sequences.length > 0 ? (
                  <div className="space-y-3">
                    {sequences.map((sequence: Sequence, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{sequence.output_name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Amplicon: {sequence.amplicon_seq.substring(0, 50)}...
                            </p>
                            <p className="text-sm text-gray-600">
                              sgRNA: {sequence.sgRNA}
                            </p>
                          </div>
                          <button
                            onClick={() => handleSequenceLoad(sequence)}
                            className="btn-outline text-sm"
                          >
                            Use for Analysis
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>No sequences saved yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* File Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload FASTQ Files</h3>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-lab-primary transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop FASTQ files here or click to browse
                  </p>
                  <p className="text-sm text-gray-600">
                    Supports .fastq, .fastq.gz, .fq, .fq.gz files and Excel metadata files
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".fastq,.fastq.gz,.fq,.fq.gz,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {uploadedFiles.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Uploaded Files</h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.original_name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.file_size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isUploading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-lab-primary mr-2" />
                  <span className="text-sm text-gray-600">Uploading files...</span>
                </div>
              )}
            </div>
          )}

          {/* Analysis Tab */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Parameters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Output Name
                    </label>
                    <input
                      type="text"
                      value={analysisParams.output_name}
                      onChange={(e) => setAnalysisParams(prev => ({ ...prev, output_name: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Window Center (-wc)
                    </label>
                    <input
                      type="number"
                      value={analysisParams.wc}
                      onChange={(e) => setAnalysisParams(prev => ({ ...prev, wc: parseInt(e.target.value) }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Window Size (-w)
                    </label>
                    <input
                      type="number"
                      value={analysisParams.w}
                      onChange={(e) => setAnalysisParams(prev => ({ ...prev, w: parseInt(e.target.value) }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Processes (-p)
                    </label>
                    <input
                      type="number"
                      value={analysisParams.p}
                      onChange={(e) => setAnalysisParams(prev => ({ ...prev, p: parseInt(e.target.value) }))}
                      className="input-field"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amplicon Sequence
                  </label>
                  <textarea
                    value={analysisParams.amplicon_seq}
                    onChange={(e) => setAnalysisParams(prev => ({ ...prev, amplicon_seq: e.target.value }))}
                    className="input-field resize-none"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    sgRNA Sequence
                  </label>
                  <input
                    type="text"
                    value={analysisParams.sgRNA}
                    onChange={(e) => setAnalysisParams(prev => ({ ...prev, sgRNA: e.target.value }))}
                    className="input-field"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="base_editor_output"
                    checked={analysisParams.base_editor_output}
                    onChange={(e) => setAnalysisParams(prev => ({ ...prev, base_editor_output: e.target.checked }))}
                    className="rounded border-gray-300 text-lab-primary focus:ring-lab-primary"
                  />
                  <label htmlFor="base_editor_output" className="ml-2 text-sm text-gray-700">
                    Enable Base Editor Output
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <button
                  onClick={handleStartAnalysis}
                  disabled={startAnalysisMutation.isPending}
                  className="btn-primary"
                >
                  {startAnalysisMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Starting Analysis...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Start Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}