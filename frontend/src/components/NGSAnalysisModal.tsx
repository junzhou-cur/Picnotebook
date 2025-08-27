'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Dna,
  Upload,
  FileText,
  Play,
  Download,
  AlertCircle,
  CheckCircle,
  Loader2,
  Database,
  Settings,
  FolderOpen,
  FileSpreadsheet
} from 'lucide-react';

interface NGSSequence {
  output_name: string;
  amplicon_seq: string;
  sgRNA: string;
}

interface NGSAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NGSAnalysisModal({ isOpen, onClose }: NGSAnalysisModalProps) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'database'>('analysis');
  const [fastqFiles, setFastqFiles] = useState<File[]>([]);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [outputName, setOutputName] = useState('');
  const [ampliconSeq, setAmpliconSeq] = useState('');
  const [sgRNA, setSgRNA] = useState('');
  const [savedSequences, setSavedSequences] = useState<NGSSequence[]>([]);
  const [selectedSequence, setSelectedSequence] = useState<string>('');
  
  // Analysis parameters
  const [windowCenter, setWindowCenter] = useState(-10);
  const [windowSize, setWindowSize] = useState(20);
  const [numProcesses, setNumProcesses] = useState(4);
  const [baseEditorOutput, setBaseEditorOutput] = useState(true);
  
  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisLog, setAnalysisLog] = useState<string[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSavedSequences();
    }
  }, [isOpen]);

  const fetchSavedSequences = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005'}/api/sequences`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const sequences = data.sequences || [];
        setSavedSequences(sequences);
        if (sequences.length > 0) {
          setSelectedSequence(sequences[0].output_name);
        }
      }
    } catch (error) {
      console.error('Error fetching sequences:', error);
    }
  };

  const handleFastqUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const fastqGzFiles = files.filter(f => f.name.endsWith('.fastq.gz'));
    setFastqFiles(prev => [...prev, ...fastqGzFiles]);
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setExcelFile(file);
    }
  };

  const handleBatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.txt')) {
      setBatchFile(file);
    }
  };

  const removeFastqFile = (index: number) => {
    setFastqFiles(prev => prev.filter((_, i) => i !== index));
  };

  const saveSequenceToDb = async () => {
    if (!outputName || !ampliconSeq || !sgRNA) {
      alert('All fields are required to save sequence');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005'}/api/sequences`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          output_name: outputName,
          amplicon_seq: ampliconSeq,
          sgRNA: sgRNA
        })
      });

      if (response.ok) {
        alert('Sequence saved successfully');
        fetchSavedSequences();
      }
    } catch (error) {
      console.error('Error saving sequence:', error);
      alert('Failed to save sequence');
    }
  };

  const loadSequenceFromDb = async () => {
    if (!selectedSequence) return;
    
    const sequence = savedSequences.find(s => s.output_name === selectedSequence);
    if (sequence) {
      setOutputName(sequence.output_name);
      setAmpliconSeq(sequence.amplicon_seq);
      setSgRNA(sequence.sgRNA);
    }
  };

  const startAnalysis = async () => {
    if (!outputName || !ampliconSeq || !sgRNA) {
      alert('Please provide gene name, amplicon sequence, and sgRNA');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisLog(['Starting NGS analysis...']);

    // Extract sample names from FASTQ files or use defaults
    const sampleNames = fastqFiles.length > 0 
      ? fastqFiles.map(f => f.name.replace('.fastq.gz', ''))
      : ['Sample1', 'Sample2', 'Sample3', 'Sample4'];

    try {
      const token = localStorage.getItem('token');
      
      // If batch file is uploaded, read it and send to backend
      let batchContent = null;
      if (batchFile) {
        setAnalysisLog(prev => [...prev, 'Reading batch file...']);
        batchContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(batchFile);
        });
      }
      
      // Step 1: Run simplified workflow
      setAnalysisProgress(20);
      setAnalysisLog(prev => [...prev, 'Creating analysis files...']);
      
      const analysisResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005'}/api/ngs/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          gene_name: outputName,
          amplicon_seq: ampliconSeq,
          sgRNA: sgRNA,
          sample_names: sampleNames,
          batch_content: batchContent  // Send batch file content if available
        })
      });

      if (!analysisResponse.ok) {
        throw new Error('Analysis setup failed');
      }

      const analysisData = await analysisResponse.json();
      setAnalysisProgress(40);
      setAnalysisLog(prev => [...prev, `Files created in: ${analysisData.output_folder}`]);

      // Step 2: Prepare instructions for manual execution
      setAnalysisProgress(80);
      setAnalysisLog(prev => [...prev, 'Preparing execution instructions...']);
      
      if (analysisData.note) {
        setAnalysisLog(prev => [...prev, `Note: ${analysisData.note}`]);
      }

      setAnalysisProgress(100);
      setAnalysisResults(analysisData);
      setAnalysisLog(prev => [...prev, 'Analysis workflow completed successfully!']);
      
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setAnalysisLog(prev => [...prev, `Error: ${errorMessage}`]);
      setAnalysisResults({
        success: false,
        error: errorMessage,
        message: 'Analysis failed'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                    <Dna className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">NGS Analysis</h2>
                    <p className="text-sm text-gray-500">MiSeq FASTQ Analysis Pipeline</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'analysis' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Play className="w-4 h-4" />
                    <span>Analysis</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('database')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'database' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4" />
                    <span>Sequence Database</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              {activeTab === 'analysis' ? (
                <div className="space-y-6">
                  {/* FASTQ Files Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      FASTQ Files (.fastq.gz)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        multiple
                        accept=".fastq.gz"
                        onChange={handleFastqUpload}
                        className="hidden"
                        id="fastq-upload"
                      />
                      <label
                        htmlFor="fastq-upload"
                        className="flex flex-col items-center cursor-pointer"
                      >
                        <FolderOpen className="w-12 h-12 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          Click to upload FASTQ files or drag and drop
                        </span>
                      </label>
                    </div>
                    
                    {fastqFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {fastqFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-gray-500">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <button
                              onClick={() => removeFastqFile(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Excel File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Excel Sample File (.xlsx) - Optional
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleExcelUpload}
                        className="hidden"
                        id="excel-upload"
                      />
                      <label
                        htmlFor="excel-upload"
                        className="flex flex-col items-center cursor-pointer"
                      >
                        <FileSpreadsheet className="w-12 h-12 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          Upload Excel file with sample names (optional)
                        </span>
                      </label>
                    </div>
                    
                    {excelFile && (
                      <div className="mt-3 flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          <FileSpreadsheet className="w-4 h-4 text-green-600" />
                          <span className="text-sm">{excelFile.name}</span>
                        </div>
                        <button
                          onClick={() => setExcelFile(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Batch File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CRISPResso Batch File (.txt) - Custom batch configuration
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        accept=".txt"
                        onChange={handleBatchUpload}
                        className="hidden"
                        id="batch-upload"
                      />
                      <label
                        htmlFor="batch-upload"
                        className="flex flex-col items-center cursor-pointer"
                      >
                        <FileText className="w-12 h-12 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          Upload your batch.txt file for CRISPRessoBatch
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          Format: name[tab]fastq_r1[tab]fastq_r2 (optional)
                        </span>
                      </label>
                    </div>
                    
                    {batchFile && (
                      <div className="mt-3 flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">{batchFile.name}</span>
                        </div>
                        <button
                          onClick={() => setBatchFile(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Analysis Parameters */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Window Center (-wc)
                      </label>
                      <input
                        type="number"
                        value={windowCenter}
                        onChange={(e) => setWindowCenter(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Window Size (-w)
                      </label>
                      <input
                        type="number"
                        value={windowSize}
                        onChange={(e) => setWindowSize(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Processes (-p)
                      </label>
                      <input
                        type="number"
                        value={numProcesses}
                        onChange={(e) => setNumProcesses(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="flex items-center space-x-2 mt-6">
                        <input
                          type="checkbox"
                          checked={baseEditorOutput}
                          onChange={(e) => setBaseEditorOutput(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Enable Base Editor Output
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Analysis Progress */}
                  {isAnalyzing && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          Analysis in progress...
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${analysisProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Analysis Log */}
                  {analysisLog.length > 0 && (
                    <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm max-h-48 overflow-y-auto">
                      {analysisLog.map((log, index) => (
                        <div key={index}>{log}</div>
                      ))}
                    </div>
                  )}

                  {/* Results */}
                  {analysisResults && (
                    <div className={`rounded-lg p-4 ${analysisResults.success ? 'bg-green-50' : 'bg-yellow-50'}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        {analysisResults.success ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                        )}
                        <span className={`font-medium ${analysisResults.success ? 'text-green-900' : 'text-yellow-900'}`}>
                          {analysisResults.success ? 'Analysis Complete!' : 'Analysis Status'}
                        </span>
                      </div>
                      
                      {analysisResults.message && (
                        <p className={`text-sm mb-2 ${analysisResults.success ? 'text-green-700' : 'text-yellow-700'}`}>
                          {analysisResults.message}
                        </p>
                      )}
                      
                      {analysisResults.output_path && (
                        <div className="bg-white rounded p-3 mb-3">
                          <p className="text-sm font-medium text-gray-900 mb-1">Output Directory:</p>
                          <p className="text-sm text-gray-600 font-mono break-all">
                            {analysisResults.output_path}
                          </p>
                        </div>
                      )}
                      
                      {analysisResults.results_directory && (
                        <div className="bg-white rounded p-3 mb-3">
                          <p className="text-sm font-medium text-gray-900 mb-1">Results Directory:</p>
                          <p className="text-sm text-gray-600 font-mono break-all">
                            {analysisResults.results_directory}
                          </p>
                        </div>
                      )}
                      
                      {analysisResults.files_saved && (
                        <div className="bg-white rounded p-3 mb-3">
                          <p className="text-sm font-medium text-gray-900 mb-1">Files Saved:</p>
                          <ul className="text-sm text-gray-600 list-disc list-inside">
                            {analysisResults.files_saved.map((file: string, index: number) => (
                              <li key={index}>{file}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {analysisResults.indel_summary && (
                        <div className="bg-white rounded p-3 mb-3">
                          <p className="text-sm font-medium text-gray-900 mb-1">Analysis Summary:</p>
                          <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                            {analysisResults.indel_summary}
                          </pre>
                        </div>
                      )}
                      
                      {analysisResults.error_details && (
                        <div className="bg-red-50 rounded p-3 mb-3">
                          <p className="text-sm font-medium text-red-900 mb-1">Error Details:</p>
                          <pre className="text-xs text-red-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                            {analysisResults.error_details}
                          </pre>
                        </div>
                      )}
                      
                      {analysisResults.results && (
                        <div className="bg-white rounded p-3 mb-3">
                          <p className="text-sm font-medium text-gray-900 mb-2">Quick Results:</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {analysisResults.results.editing_efficiency && (
                              <div>
                                <span className="text-gray-600">Editing Efficiency:</span>
                                <span className="font-medium ml-2">{analysisResults.results.editing_efficiency}</span>
                              </div>
                            )}
                            {analysisResults.results.indel_frequency && (
                              <div>
                                <span className="text-gray-600">Indel Frequency:</span>
                                <span className="font-medium ml-2">{analysisResults.results.indel_frequency}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3 mt-3">
                        <button
                          onClick={() => {
                            if (analysisResults.output_path) {
                              navigator.clipboard.writeText(analysisResults.output_path);
                              alert('Path copied to clipboard!');
                            }
                          }}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                            analysisResults.success
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                          <span>Copy Path</span>
                        </button>
                        
                        {analysisResults.success && analysisResults.results_directory && (
                          <button
                            onClick={() => {
                              if (analysisResults.results_directory) {
                                navigator.clipboard.writeText(analysisResults.results_directory);
                                alert('Results directory path copied!');
                              }
                            }}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            <span>Copy Results Path</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Start Analysis Button */}
                  <button
                    onClick={startAnalysis}
                    disabled={isAnalyzing || (fastqFiles.length === 0 && !batchFile)}
                    className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                      isAnalyzing || (fastqFiles.length === 0 && !batchFile)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'
                    }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        <span>Start NGS Analysis</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Database Tab */
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Saved Sequence
                    </label>
                    <select
                      value={selectedSequence}
                      onChange={(e) => setSelectedSequence(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Select a sequence --</option>
                      {savedSequences.map((seq) => (
                        <option key={seq.output_name} value={seq.output_name}>
                          {seq.output_name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={loadSequenceFromDb}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Load from Database
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Output Name
                      </label>
                      <input
                        type="text"
                        value={outputName}
                        onChange={(e) => setOutputName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., CF1282_PE_Analysis"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amplicon Sequence
                      </label>
                      <textarea
                        value={ampliconSeq}
                        onChange={(e) => setAmpliconSeq(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        rows={3}
                        placeholder="Enter amplicon sequence (e.g., ATGGCTAGC...)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        sgRNA Sequence
                      </label>
                      <input
                        type="text"
                        value={sgRNA}
                        onChange={(e) => setSgRNA(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                        placeholder="Enter sgRNA sequence (e.g., GGCACTGCGGCTGGAGGTGG)"
                      />
                    </div>

                    <button
                      onClick={saveSequenceToDb}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
                    >
                      <Database className="w-4 h-4" />
                      <span>Save to Database</span>
                    </button>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-900">
                        <p className="font-medium mb-1">Database Usage:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-700">
                          <li>Save frequently used amplicon and sgRNA sequences</li>
                          <li>The analysis will auto-match sequences by output name prefix</li>
                          <li>Excel file should contain 'OutputName' and 'SampleNames' columns</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}