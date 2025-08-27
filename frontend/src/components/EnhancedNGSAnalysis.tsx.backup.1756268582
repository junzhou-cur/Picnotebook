'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Dna,
  Upload,
  FileText,
  Play,
  Terminal as TerminalIcon,
  Database,
  Settings,
  FolderOpen,
  FileSpreadsheet,
  Copy,
  CheckCircle,
  AlertTriangle,
  Command,
  Clock,
  Zap,
  Save,
  ChevronDown,
  Trash2,
  Download,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface CommandHistory {
  command: string;
  output: string;
  error?: string;
  timestamp: string;
  executionTime?: number;
  returnCode?: number;
}

interface SavedConfiguration {
  id: string;
  name: string;
  projectName: string;
  ampliconSeq: string;
  sgRNA: string;
  windowCenter: number;
  windowSize: number;
  numProcesses: number;
  baseEditorOutput: boolean;
  createdAt: string;
}

interface AnalysisResults {
  gene_name: string;
  analysis_date: string;
  samples: {
    name: string;
    results: Record<string, string>;
    files: {
      quantification: boolean;
      nucleotide_frequency: boolean;
      allele_frequency: boolean;
      plots: boolean;
    };
  }[];
}

interface EnhancedNGSAnalysisProps {
  isOpen: boolean;
  onClose: () => void;
}

const EnhancedNGSAnalysis: React.FC<EnhancedNGSAnalysisProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'setup' | 'terminal' | 'results'>('setup');
  
  // Setup state
  const [projectName, setProjectName] = useState('');
  const [ampliconSeq, setAmpliconSeq] = useState('');
  const [sgRNA, setSgRNA] = useState('');
  const [fastqFiles, setFastqFiles] = useState<File[]>([]);
  const [sampleNames, setSampleNames] = useState<string[]>([]);
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchFileContent, setBatchFileContent] = useState<string | null>(null);
  
  // Saved configurations state
  const [savedConfigs, setSavedConfigs] = useState<SavedConfiguration[]>([]);
  const [showSavedConfigs, setShowSavedConfigs] = useState(false);
  const [configName, setConfigName] = useState('');
  
  // Analysis parameters
  const [windowCenter, setWindowCenter] = useState(-10);
  const [windowSize, setWindowSize] = useState(20);
  const [numProcesses, setNumProcesses] = useState(4);
  const [baseEditorOutput, setBaseEditorOutput] = useState(true);
  
  // Terminal state
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Results state
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  // Load saved configurations from localStorage
  useEffect(() => {
    const loadedConfigs = localStorage.getItem('ngs_saved_configs');
    if (loadedConfigs) {
      try {
        setSavedConfigs(JSON.parse(loadedConfigs));
      } catch (e) {
        console.error('Failed to load saved configurations:', e);
      }
    } else {
      // Create default CF1282 configuration if no saved configs exist
      const defaultConfigs: SavedConfiguration[] = [
        {
          id: 'default-cf1282',
          name: 'CF1282 - Default',
          projectName: 'CF1282',
          ampliconSeq: 'GGGAAGAACTGGATCAGGGAAGAGTACTTTGTTATCAGCTTTTTTGAGACTACTGAACACTGAAGGAGAAATCCAGATCGATGGTGTGTCTTGGGATTCAATAACTTTGCAACAGTGGAGGAAAGCCTTTGGAGTGATACCACAGGTGAGCAAAAGGACTTAGCCAGAAAAAAGGCAACTAAATTATATTTTTTACTGCTATTTGATACTTGTACTCAAGAAATTCATATTACTCTGCAAAATATATTTGTTATGCATTGCTGTCTTTTTTCTCCAGTGCAGTTTTCTCATAGGC',
          sgRNA: 'CAATAACTTTGCAACAGTGG',
          windowCenter: -10,
          windowSize: 20,
          numProcesses: 4,
          baseEditorOutput: true,
          createdAt: new Date().toISOString()
        }
      ];
      setSavedConfigs(defaultConfigs);
      localStorage.setItem('ngs_saved_configs', JSON.stringify(defaultConfigs));
    }
  }, []);

  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
      // For production domains
      if (window.location.hostname === 'picnotebook.com' || window.location.hostname === 'www.picnotebook.com') {
        // Use relative URL so it goes through the same domain
        return '';
      }
      // For local development - use environment variable
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';
      }
    }
    // Default to relative URL
    return '';
  };

  const executeCommand = async (cmd: string) => {
    setIsExecuting(true);
    
    try {
      const response = await fetch(`${getApiBaseUrl()}/execute_command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: cmd
        })
      });

      // Check if response is ok and has JSON content-type
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text.substring(0, 200)}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Expected JSON response but got: ${contentType}. Response: ${text.substring(0, 200)}`);
      }

      const result = await response.json();

      const historyEntry: CommandHistory = {
        command: cmd,
        output: result.stdout || '',
        error: result.stderr || result.error,
        timestamp: result.timestamp || new Date().toISOString(),
        executionTime: result.execution_time,
        returnCode: result.return_code
      };

      setHistory(prev => [...prev, historyEntry]);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorEntry: CommandHistory = {
        command: cmd,
        output: '',
        error: `Network error: ${errorMessage}`,
        timestamp: new Date().toISOString()
      };
      setHistory(prev => [...prev, errorEntry]);
      return { success: false, error: errorMessage };
    } finally {
      setIsExecuting(false);
    }
  };

  const executeManualCommand = async () => {
    if (!command.trim() || isExecuting) return;
    
    const currentCommand = command.trim();
    setCommand('');
    await executeCommand(currentCommand);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeManualCommand();
    }
  };

  // Automated NGS Analysis Steps
  const ngsSteps = [
    {
      title: "Setup Analysis Files",
      description: "Create batch.txt and configuration files on server",
      manual: false,
      command: "Automated via web interface"
    },
    {
      title: "Navigate to Analysis Folder", 
      description: "Change to the analysis directory",
      manual: false,
      command: (outputFolder?: string) => `cd "${outputFolder || `~/Desktop/${projectName}`}"`
    },
    {
      title: "Run CRISPResso Analysis",
      description: "Execute the CRISPResso batch analysis (this takes 10-30 minutes)",
      manual: false,
      command: (outputFolder?: string) => `cd "${outputFolder || `~/Desktop/${projectName}`}" && /opt/anaconda3/bin/conda run -n crispresso2_v233 CRISPRessoBatch --batch_settings crispresso_batch.txt --amplicon_seq "${ampliconSeq}" -g "${sgRNA}" -p ${numProcesses} -wc ${windowCenter} -w ${windowSize} ${baseEditorOutput ? '--base_editor_output' : ''}`
    },
    {
      title: "Process Results",
      description: "Generate analysis report and visualization",
      manual: false,
      command: (outputFolder?: string) => `cd "${outputFolder || `~/Desktop/${projectName}`}" && echo "Analysis complete. Results available in CRISPRessoBatch_on_crispresso_batch.html" && ls -la CRISPRessoBatch_on_crispresso_batch/`
    }
  ];

  const runAnalysisStep = async (stepIndex: number, uploadedDir?: string) => {
    if (stepIndex >= ngsSteps.length) return;
    
    setCurrentStep(stepIndex);
    const step = ngsSteps[stepIndex];
    let cmd = typeof step.command === 'function' ? step.command(uploadedDir) : step.command;
    
    // Handle template variables in commands (if it's a string)
    if (typeof cmd === 'string') {
      cmd = cmd.replace(/\${projectName}/g, projectName);
      cmd = cmd.replace(/\${ampliconSeq}/g, ampliconSeq);
      cmd = cmd.replace(/\${sgRNA}/g, sgRNA);
      cmd = cmd.replace(/\${numProcesses}/g, numProcesses.toString());
      cmd = cmd.replace(/\${windowCenter}/g, windowCenter.toString());
      cmd = cmd.replace(/\${windowSize}/g, windowSize.toString());
    }
    
    setHistory(prev => [...prev, {
      command: `# Step ${stepIndex + 1}: ${step.title}`,
      output: step.description,
      timestamp: new Date().toISOString()
    }]);
    
    const result = await executeCommand(cmd);
    
    // Check if command was successful
    if (result.success !== false && result.return_code === 0) {
      // Auto-advance to next step if successful
      if (stepIndex < ngsSteps.length - 1) {
        setTimeout(() => runAnalysisStep(stepIndex + 1, uploadedDir), 2000);
      } else {
        // All steps completed successfully
        setAnalysisCompleted(true);
        setHistory(prev => [...prev, {
          command: '# 🎉 Analysis Complete!',
          output: `All NGS analysis steps have been completed successfully!\n\n✅ Real CRISPResso analysis has been executed on the server\n✅ Results are now available for download in the Results tab\n\nClick the "Results" tab to view detailed analysis results and download the complete report.`,
          timestamp: new Date().toISOString()
        }]);
        
        // Load results automatically and switch to results tab
        setTimeout(() => {
          loadAnalysisResults();
          setActiveTab('results');
        }, 2000);
      }
    } else {
      // Step failed, stop the analysis
      setHistory(prev => [...prev, {
        command: `# ⚠️ Step ${stepIndex + 1} Failed`,
        output: `Analysis stopped due to error in step: ${step.title}\nYou can manually run the remaining steps or fix the issue and restart.`,
        error: result.error || result.stderr || 'Unknown error',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const uploadFiles = async (): Promise<string | null> => {
    if (fastqFiles.length === 0) return null;

    try {
      const formData = new FormData();
      fastqFiles.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });
      formData.append('project_name', projectName);

      const response = await fetch(`${getApiBaseUrl()}/api/upload_ngs_files`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setHistory(prev => [...prev, {
          command: '# File Upload Complete',
          output: `Files uploaded to: ${result.project_directory}\nFiles: ${result.files_saved.join(', ')}`,
          timestamp: new Date().toISOString()
        }]);
        return result.project_directory;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      setHistory(prev => [...prev, {
        command: '# File Upload Failed',
        output: '',
        error: `Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      }]);
      return null;
    }
  };

  const startAnalysis = async () => {
    if (!projectName || !ampliconSeq || !sgRNA) {
      alert('Please fill in all required fields: Project Name, Amplicon Sequence, and sgRNA');
      return;
    }
    
    if (!batchFileContent) {
      alert('Please upload a batch.txt file before starting analysis');
      return;
    }
    
    setActiveTab('terminal');
    setHistory([]);
    setCurrentStep(0);

    // Show setup progress
    setHistory([{
      command: '# Starting NGS analysis...',
      output: 'Creating analysis folder and configuration files...',
      timestamp: new Date().toISOString()
    }]);

    try {
      // Call the setup API endpoint
      const response = await fetch(`${getApiBaseUrl()}/api/ngs/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || localStorage.getItem('authToken') || localStorage.getItem('access_token') || 'demo-token'}`
        },
        body: JSON.stringify({
          gene_name: projectName,
          amplicon_seq: ampliconSeq,
          sgRNA: sgRNA,
          sample_names: sampleNames,
          batch_content: batchFileContent
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setHistory(prev => [...prev, {
          command: '# ✅ Setup Complete!',
          output: `Analysis files created in: ${result.output_folder}\n\n🚀 Starting automated CRISPResso analysis...\n\nFiles created:\n• ${result.files.batch_file}\n• ${result.files.config_file}`,
          timestamp: new Date().toISOString()
        }]);

        // Start the automated analysis steps
        setTimeout(() => runAnalysisStep(1, result.output_folder), 1000);
      } else {
        throw new Error(result.error || 'Setup failed');
      }
    } catch (error) {
      setHistory(prev => [...prev, {
        command: '# ❌ Setup Failed',
        output: '',
        error: `Setup error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const showManualInstructions = () => {
    setHistory(prev => [...prev, {
      command: '# 📋 Manual Steps (if needed):',
      output: `If automatic analysis fails, you can run CRISPResso manually:\n\n${ngsSteps.map((step, index) => 
        `${index + 1}. ${step.title}\n   ${step.description}\n   Command: ${step.command}\n`
      ).join('\n')}`,
      timestamp: new Date().toISOString()
    }]);
  };

  const generateCommands = () => {
    if (!projectName) {
      alert('Please enter a project name first');
      return;
    }

    const workDir = `~/Desktop/${projectName}_NGS_Analysis`;
    
    let commandsText = '';
    if (batchFileContent) {
      commandsText += `# NOTE: Using uploaded batch.txt file content:\n# ${batchFileContent.split('\n').join('\n# ')}\n\n`;
    }
    
    const commands = ngsSteps.map((step, index) => 
      `# Step ${index + 1}: ${step.title}\n# ${step.description}\n${step.command}\n`
    ).join('\n');
    
    commandsText += commands;

    navigator.clipboard.writeText(commandsText).then(() => {
      alert('All commands copied to clipboard!');
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const fastqFiles = files.filter(f => {
      const name = f.name.toLowerCase();
      return name.endsWith('.fastq.gz') || name.endsWith('.fastq') || 
             name.endsWith('.fq.gz') || name.endsWith('.fq') ||
             (name.endsWith('.gz') && (name.includes('fastq') || name.includes('fq')));
    });
    
    if (fastqFiles.length === 0) {
      alert('Please select valid FASTQ files (.fastq, .fastq.gz, .fq, .fq.gz)');
      return;
    }
    
    setFastqFiles(prev => [...prev, ...fastqFiles]);
    
    // Auto-generate sample names from file names
    const newSampleNames = fastqFiles.map(f => 
      f.name.replace(/\.(fastq|fq)(\.gz)?$/i, '')
    );
    setSampleNames(prev => [...prev, ...newSampleNames]);
  };

  const removeFastqFile = (index: number) => {
    setFastqFiles(prev => prev.filter((_, i) => i !== index));
    setSampleNames(prev => prev.filter((_, i) => i !== index));
  };

  const handleBatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.txt')) {
      setBatchFile(file);
      
      // Read the file content
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setBatchFileContent(content);
      };
      reader.readAsText(file);
    }
  };

  const clearTerminal = () => {
    setHistory([]);
  };

  // Save current configuration
  const saveConfiguration = () => {
    if (!configName.trim()) {
      alert('Please enter a name for this configuration');
      return;
    }

    const newConfig: SavedConfiguration = {
      id: Date.now().toString(),
      name: configName,
      projectName,
      ampliconSeq,
      sgRNA,
      windowCenter,
      windowSize,
      numProcesses,
      baseEditorOutput,
      createdAt: new Date().toISOString()
    };

    const updatedConfigs = [...savedConfigs, newConfig];
    setSavedConfigs(updatedConfigs);
    localStorage.setItem('ngs_saved_configs', JSON.stringify(updatedConfigs));
    setConfigName('');
    alert(`Configuration "${configName}" saved successfully!`);
  };

  // Load a saved configuration
  const loadConfiguration = (config: SavedConfiguration) => {
    setProjectName(config.projectName);
    setAmpliconSeq(config.ampliconSeq);
    setSgRNA(config.sgRNA);
    setWindowCenter(config.windowCenter);
    setWindowSize(config.windowSize);
    setNumProcesses(config.numProcesses);
    setBaseEditorOutput(config.baseEditorOutput);
    setShowSavedConfigs(false);
  };

  // Delete a saved configuration
  const deleteConfiguration = (configId: string) => {
    const updatedConfigs = savedConfigs.filter(c => c.id !== configId);
    setSavedConfigs(updatedConfigs);
    localStorage.setItem('ngs_saved_configs', JSON.stringify(updatedConfigs));
  };

  // Load analysis results
  const loadAnalysisResults = async () => {
    if (!projectName) return;
    
    setIsLoadingResults(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/ngs/results/${projectName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAnalysisResults(result.summary);
        }
      }
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setIsLoadingResults(false);
    }
  };

  // Download results
  const downloadResults = async () => {
    if (!projectName) return;
    
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/ngs/download/${projectName}`, {
        method: 'GET'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName}_analysis_results.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Download failed. Please ensure analysis is completed.');
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed due to network error.');
    }
  };

  // Check analysis status
  const checkAnalysisStatus = async () => {
    if (!projectName) return;
    
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/ngs/status/${projectName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.status === 'completed') {
          setAnalysisCompleted(true);
          loadAnalysisResults();
        }
      }
    } catch (error) {
      console.error('Failed to check status:', error);
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
            className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden"
          >
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                    <Dna className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Enhanced NGS Analysis</h2>
                    <p className="text-sm text-gray-500">Interactive CRISPResso Analysis with Terminal</p>
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
                {[
                  { id: 'setup', label: 'Setup', icon: Settings },
                  { id: 'terminal', label: 'Terminal', icon: TerminalIcon },
                  { id: 'results', label: analysisCompleted ? 'Results ✓' : 'Results', icon: analysisCompleted ? CheckCircle : FileText }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                      activeTab === tab.id 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(95vh - 200px)' }}>
              {activeTab === 'setup' && (
                <div className="p-6 space-y-6">
                  {/* Saved Configurations */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-blue-900">Saved Configurations</h3>
                      <button
                        onClick={() => setShowSavedConfigs(!showSavedConfigs)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <span className="text-sm">{savedConfigs.length} saved</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showSavedConfigs ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {showSavedConfigs && (
                      <div className="space-y-2">
                        {savedConfigs.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">No saved configurations yet</p>
                        ) : (
                          savedConfigs.map(config => (
                            <div key={config.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium text-sm text-gray-900">{config.name}</div>
                                <div className="text-xs text-gray-500">
                                  Project: {config.projectName} | Created: {new Date(config.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => loadConfiguration(config)}
                                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                >
                                  Load
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete configuration "${config.name}"?`)) {
                                      deleteConfiguration(config.id);
                                    }
                                  }}
                                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Save Current Configuration */}
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={configName}
                          onChange={(e) => setConfigName(e.target.value)}
                          placeholder="Enter configuration name (e.g., CF1282)"
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={saveConfiguration}
                          disabled={!projectName || !ampliconSeq || !sgRNA || !configName.trim()}
                          className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            !projectName || !ampliconSeq || !sgRNA || !configName.trim()
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Current</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Project Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Name *
                      </label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., CF1282_PE"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Processes
                      </label>
                      <input
                        type="number"
                        value={numProcesses}
                        onChange={(e) => setNumProcesses(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="1"
                        max="8"
                      />
                    </div>
                  </div>

                  {/* Sequences */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amplicon Sequence *
                    </label>
                    <textarea
                      value={ampliconSeq}
                      onChange={(e) => setAmpliconSeq(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      rows={3}
                      placeholder="Enter amplicon sequence (DNA bases: A, T, G, C)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      sgRNA Sequence *
                    </label>
                    <input
                      type="text"
                      value={sgRNA}
                      onChange={(e) => setSgRNA(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                      placeholder="Enter sgRNA sequence (typically 20 bases)"
                    />
                  </div>

                  {/* Analysis Parameters */}
                  <div className="grid grid-cols-3 gap-4">
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
                      <label className="flex items-center space-x-2 mt-6">
                        <input
                          type="checkbox"
                          checked={baseEditorOutput}
                          onChange={(e) => setBaseEditorOutput(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Base Editor Output
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      FASTQ Files
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept=".fastq,.fastq.gz,.fq,.fq.gz,application/gzip,application/x-gzip"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="fastq-upload"
                      />
                      <label
                        htmlFor="fastq-upload"
                        className="flex flex-col items-center cursor-pointer"
                      >
                        <FolderOpen className="w-12 h-12 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600 text-center">
                          Click to upload FASTQ files<br />
                          <span className="text-xs text-gray-500">
                            Supports: .fastq, .fastq.gz, .fq, .fq.gz
                          </span>
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
                                Sample: {sampleNames[index]}
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

                  {/* Batch File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CRISPResso Batch File (.txt) - Required *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
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
                        <span className="text-sm text-gray-600 text-center">
                          Upload your custom batch.txt file<br />
                          <span className="text-xs text-gray-500">
                            Format: name[tab]fastq_r1[tab]fastq_r2 (optional)
                          </span>
                        </span>
                      </label>
                    </div>
                    
                    {batchFile && (
                      <div className="mt-3 flex items-center justify-between bg-green-50 p-2 rounded border border-green-200">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">{batchFile.name}</span>
                          <span className="text-xs text-green-600">✓ Will be used instead of auto-generated batch</span>
                        </div>
                        <button
                          onClick={() => {
                            setBatchFile(null);
                            setBatchFileContent(null);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <button
                      onClick={startAnalysis}
                      disabled={!projectName || !ampliconSeq || !sgRNA || !batchFileContent}
                      className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                        !projectName || !ampliconSeq || !sgRNA || !batchFileContent
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'
                      }`}
                    >
                      <Play className="w-5 h-5" />
                      <span>Start Analysis</span>
                    </button>

                    <button
                      onClick={generateCommands}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Copy className="w-5 h-5" />
                      <span>Copy Commands</span>
                    </button>
                  </div>

                  {/* File Upload Troubleshooting */}
                  <div className="bg-amber-50 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div className="text-sm text-amber-900">
                        <p className="font-medium mb-1">File Upload Tips:</p>
                        <ul className="list-disc list-inside space-y-1 text-amber-700">
                          <li>If .fastq.gz files won't upload, try renaming them temporarily (e.g., remove .gz)</li>
                          <li>Alternatively, you can manually copy files to the server using the Terminal tab</li>
                          <li>Supported formats: .fastq, .fastq.gz, .fq, .fq.gz</li>
                          <li>File size limit: 100MB per file</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Analysis Info */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start space-x-2">
                      <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-900">
                        <p className="font-medium mb-1">🚀 Automated Analysis</p>
                        <p className="text-blue-700 mb-2">
                          The system will automatically run the complete CRISPResso analysis pipeline. 
                          The analysis typically takes 10-30 minutes depending on file size and parameters.
                        </p>
                        <p className="text-blue-700">
                          This tool will <strong>setup files</strong> and <strong>execute CRISPResso automatically</strong> with real-time progress monitoring.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Help Text */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-900">
                        <p className="font-medium mb-1">Analysis Steps:</p>
                        <ol className="list-decimal list-inside space-y-1 text-blue-700">
                          {ngsSteps.map((step, index) => (
                            <li key={index}>{step.title} - {step.description}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'terminal' && (
                <div className="h-full bg-gray-900 text-green-400 font-mono">
                  {/* Terminal Header */}
                  <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
                    <div className="flex items-center space-x-2">
                      <TerminalIcon size={16} />
                      <span className="text-sm">NGS Analysis Terminal</span>
                      {currentStep < ngsSteps.length && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                          Step {currentStep + 1}/{ngsSteps.length}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={clearTerminal}
                      className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Terminal Output */}
                  <div 
                    ref={outputRef}
                    className="h-96 overflow-y-auto p-4 bg-gray-900"
                  >
                    {history.map((entry, index) => (
                      <div key={index} className="mb-3">
                        {/* Command */}
                        <div className="flex items-center space-x-2 text-blue-400">
                          <span className="text-gray-500">$</span>
                          <span>{entry.command}</span>
                          {entry.executionTime && (
                            <span className="text-xs text-gray-500 flex items-center ml-auto">
                              <Clock size={10} className="mr-1" />
                              {entry.executionTime}s
                            </span>
                          )}
                        </div>
                        
                        {/* Output */}
                        {entry.output && (
                          <pre className="text-gray-300 text-sm mt-1 whitespace-pre-wrap">
                            {entry.output}
                          </pre>
                        )}
                        
                        {/* Error */}
                        {entry.error && (
                          <div className="text-red-400 text-sm mt-1 flex items-start space-x-1">
                            <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                            <pre className="whitespace-pre-wrap">{String(entry.error)}</pre>
                          </div>
                        )}
                      </div>
                    ))}

                    {isExecuting && (
                      <div className="flex items-center space-x-2 text-yellow-400">
                        <span className="text-gray-500">$</span>
                        <span>Executing...</span>
                        <div className="animate-pulse">●</div>
                      </div>
                    )}
                  </div>

                  {/* Terminal Input */}
                  <div className="bg-gray-800 border-t border-gray-700 p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">$</span>
                      <input
                        ref={inputRef}
                        type="text"
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter command..."
                        className="flex-1 bg-transparent outline-none text-green-400"
                        disabled={isExecuting}
                      />
                      <button
                        onClick={executeManualCommand}
                        disabled={!command.trim() || isExecuting}
                        className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
                      >
                        <Play size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'results' && (
                <div className="p-6">
                  {!analysisCompleted && !analysisResults ? (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Analysis Results</h3>
                      <p className="text-gray-600 mb-4">
                        Results will appear here after running the analysis
                      </p>
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={() => setActiveTab('terminal')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Go to Terminal
                        </button>
                        {projectName && (
                          <button
                            onClick={checkAnalysisStatus}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            <span>Check Status</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Results Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Analysis Results</h3>
                          <p className="text-gray-600">
                            {analysisResults ? `Project: ${analysisResults.gene_name}` : `Project: ${projectName}`}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={loadAnalysisResults}
                            disabled={isLoadingResults}
                            className={`px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2 ${
                              isLoadingResults ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <RefreshCw className={`w-4 h-4 ${isLoadingResults ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                          </button>
                          <button
                            onClick={downloadResults}
                            className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 flex items-center space-x-2"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download Results</span>
                          </button>
                        </div>
                      </div>

                      {isLoadingResults ? (
                        <div className="text-center py-8">
                          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading results...</p>
                        </div>
                      ) : analysisResults ? (
                        <div className="space-y-6">
                          {/* Analysis Summary */}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <h4 className="font-semibold text-green-900">Analysis Completed</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-green-800">
                              <div>
                                <span className="font-medium">Analysis Status:</span> {(analysisResults as any).status || 'Complete'}
                              </div>
                              <div>
                                <span className="font-medium">Files Created:</span> {(analysisResults as any).files_created?.length || 0}
                              </div>
                            </div>
                          </div>

                          {/* Analysis Results */}
                          <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                              <BarChart3 className="w-5 h-5" />
                              <span>Analysis Results</span>
                            </h4>
                            
                            <div className="border border-gray-200 rounded-lg p-4">
                              <div className="mb-4">
                                <h5 className="font-semibold text-gray-900 mb-2">{analysisResults.gene_name} Analysis</h5>
                                <p className="text-gray-600">{(analysisResults as any).note}</p>
                              </div>
                              
                              {(analysisResults as any).analysis_type === 'real_crispresso_analysis' && (
                                <div className="space-y-3">
                                  <h6 className="font-medium text-gray-900">Available Results:</h6>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {(analysisResults as any).available_results?.map((result: string, index: number) => (
                                      <div key={index} className="flex items-center space-x-2 text-sm">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span>{result}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {analysisResults.next_steps && (
                                <div className="mt-4 space-y-2">
                                  <h6 className="font-medium text-gray-900">Next Steps:</h6>
                                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                    {analysisResults.next_steps.map((step, index) => (
                                      <li key={index}>{step}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              <div className="mt-4 pt-3 border-t border-gray-200">
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                  <span>Analysis Folder:</span>
                                  <span className="font-mono text-xs">{analysisResults.analysis_folder}</span>
                                </div>
                                {analysisResults.results_folder && (
                                  <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                                    <span>Results Folder:</span>
                                    <span className="font-mono text-xs">{analysisResults.results_folder}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Download Section */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-blue-900 mb-1">Download Complete Results</h4>
                                <p className="text-sm text-blue-700">
                                  Download includes all quantification files, plots, configuration, and detailed analysis reports.
                                </p>
                              </div>
                              <button
                                onClick={downloadResults}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 font-medium"
                              >
                                <Download className="w-5 h-5" />
                                <span>Download ZIP</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h4>
                          <p className="text-gray-600 mb-4">
                            Unable to load analysis results. The analysis may still be running or may have failed.
                          </p>
                          <div className="flex justify-center space-x-4">
                            <button
                              onClick={() => setActiveTab('terminal')}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              Check Terminal
                            </button>
                            <button
                              onClick={checkAnalysisStatus}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                            >
                              <RefreshCw className="w-4 h-4" />
                              <span>Retry</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EnhancedNGSAnalysis;