'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Eye, 
  History,
  AlertCircle,
  Loader2,
  Download,
  Share2,
  Mail
} from 'lucide-react';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ProtocolManagerProps {
  projectId: number;
  userRole: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Protocol {
  id: number;
  name: string;
  content: string;
  version: number;
  project_id: number;
  project_name: string;
  author_id: number;
  author_name: string;
  created_at: string;
  updated_at: string;
  highlighted_content: any;
  change_count: number;
}

export function ProtocolManager({ projectId, userRole, isOpen, onClose }: ProtocolManagerProps) {
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState<Protocol | null>(null);
  const [protocolName, setProtocolName] = useState('');
  const [protocolContent, setProtocolContent] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [includePDF, setIncludePDF] = useState(true);
  
  const queryClient = useQueryClient();
  
  // Fetch protocols
  const { data: protocols = [], isLoading: protocolsLoading, refetch: refetchProtocols } = useQuery({
    queryKey: ['project-protocols', projectId],
    queryFn: () => api.getProjectProtocols(projectId),
    enabled: isOpen,
  });

  // Create protocol mutation
  const createProtocolMutation = useMutation({
    mutationFn: (data: { name: string; content: string }) => 
      api.createProtocol(projectId, data),
    onSuccess: () => {
      refetchProtocols();
      setShowCreateForm(false);
      setProtocolName('');
      setProtocolContent('');
    },
  });

  // Update protocol mutation
  const updateProtocolMutation = useMutation({
    mutationFn: ({ protocolId, data }: { protocolId: number; data: any }) => 
      api.updateProtocol(protocolId, data),
    onSuccess: () => {
      refetchProtocols();
      setEditingProtocol(null);
      setProtocolName('');
      setProtocolContent('');
    },
  });

  // Delete protocol mutation
  const deleteProtocolMutation = useMutation({
    mutationFn: (protocolId: number) => api.deleteProtocol(protocolId),
    onSuccess: () => {
      refetchProtocols();
      setSelectedProtocol(null);
    },
  });

  // Export PDF mutation
  const exportPDFMutation = useMutation({
    mutationFn: (protocolId: number) => api.exportProtocolPDF(protocolId),
    onSuccess: (blob, protocolId) => {
      const protocol = protocols.find(p => p.id === protocolId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${protocol?.name || 'protocol'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });

  // Share protocol mutation
  const shareProtocolMutation = useMutation({
    mutationFn: ({ protocolId, shareData }: { protocolId: number; shareData: any }) => 
      api.shareProtocol(protocolId, shareData),
    onSuccess: () => {
      setShowShareModal(false);
      setShareEmail('');
      setShareMessage('');
      alert('Protocol shared successfully!');
    },
  });

  const handleCreateProtocol = () => {
    if (!protocolName.trim() || !protocolContent.trim()) return;
    
    createProtocolMutation.mutate({
      name: protocolName.trim(),
      content: protocolContent.trim(),
    });
  };

  const handleEditProtocol = (protocol: Protocol) => {
    setEditingProtocol(protocol);
    setProtocolName(protocol.name);
    setProtocolContent(protocol.content);
  };

  const handleUpdateProtocol = () => {
    if (!editingProtocol || (!protocolName.trim() && !protocolContent.trim())) return;
    
    updateProtocolMutation.mutate({
      protocolId: editingProtocol.id,
      data: {
        name: protocolName.trim(),
        content: protocolContent.trim(),
        change_description: 'Manual update'
      }
    });
  };

  const handleDeleteProtocol = (protocol: Protocol) => {
    if (window.confirm(`Are you sure you want to delete protocol "${protocol.name}"?`)) {
      deleteProtocolMutation.mutate(protocol.id);
    }
  };

  const handleExportPDF = (protocol: Protocol) => {
    exportPDFMutation.mutate(protocol.id);
  };

  const handleShareProtocol = (protocol: Protocol) => {
    setSelectedProtocol(protocol);
    setShowShareModal(true);
  };

  const handleSubmitShare = () => {
    if (!selectedProtocol || !shareEmail.trim()) {
      alert('Please enter a valid email address');
      return;
    }

    shareProtocolMutation.mutate({
      protocolId: selectedProtocol.id,
      shareData: {
        email: shareEmail.trim(),
        message: shareMessage.trim(),
        include_pdf: includePDF,
      },
    });
  };

  const renderHighlightedContent = (highlighted_content: any) => {
    if (typeof highlighted_content === 'string') {
      return <pre className="whitespace-pre-wrap font-mono text-sm">{highlighted_content}</pre>;
    }
    
    if (Array.isArray(highlighted_content)) {
      return (
        <div className="space-y-1">
          {highlighted_content.map((line: any, index: number) => (
            <div 
              key={index} 
              className={`font-mono text-sm ${line.changed ? 'bg-red-100 border-l-4 border-red-500 pl-2' : ''}`}
            >
              {line.text}
            </div>
          ))}
        </div>
      );
    }
    
    return <pre className="whitespace-pre-wrap font-mono text-sm">{JSON.stringify(highlighted_content, null, 2)}</pre>;
  };

  const canManageProtocols = userRole === 'owner' || userRole === 'admin' || userRole === 'member';

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
            <BookOpen className="w-6 h-6 text-lab-primary" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Protocol Management</h2>
              <p className="text-sm text-gray-600">Manage experimental protocols with change tracking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-140px)]">
          {/* Sidebar - Protocol List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              {canManageProtocols && (
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="w-full btn-primary flex items-center justify-center space-x-2 mb-4"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Protocol</span>
                </button>
              )}

              {protocolsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-lab-primary" />
                </div>
              ) : protocols.length > 0 ? (
                <div className="space-y-2">
                  {protocols.map((protocol: Protocol) => (
                    <div
                      key={protocol.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedProtocol?.id === protocol.id
                          ? 'border-lab-primary bg-lab-primary/5'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedProtocol(protocol)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{protocol.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            v{protocol.version} • {protocol.change_count} changes
                          </p>
                          <p className="text-xs text-gray-400">
                            Updated {new Date(protocol.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        {canManageProtocols && (
                          <div className="flex space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProtocol(protocol);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProtocol(protocol);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>No protocols yet</p>
                  {canManageProtocols && (
                    <p className="text-sm">Create your first protocol to get started</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {showCreateForm || editingProtocol ? (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingProtocol ? 'Edit Protocol' : 'Create New Protocol'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Protocol Name
                    </label>
                    <input
                      type="text"
                      value={protocolName}
                      onChange={(e) => setProtocolName(e.target.value)}
                      className="input-field"
                      placeholder="Enter protocol name..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Protocol Content
                    </label>
                    <textarea
                      value={protocolContent}
                      onChange={(e) => setProtocolContent(e.target.value)}
                      rows={15}
                      className="input-field font-mono text-sm"
                      placeholder="Enter protocol steps and procedures..."
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={editingProtocol ? handleUpdateProtocol : handleCreateProtocol}
                      disabled={createProtocolMutation.isPending || updateProtocolMutation.isPending}
                      className="btn-primary flex items-center space-x-2"
                    >
                      {(createProtocolMutation.isPending || updateProtocolMutation.isPending) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>{editingProtocol ? 'Update' : 'Create'} Protocol</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingProtocol(null);
                        setProtocolName('');
                        setProtocolContent('');
                      }}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : selectedProtocol ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedProtocol.name}</h3>
                    <p className="text-sm text-gray-600">
                      Version {selectedProtocol.version} • Created by {selectedProtocol.author_name}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleExportPDF(selectedProtocol)}
                      disabled={exportPDFMutation.isPending}
                      className="btn-outline flex items-center space-x-2"
                    >
                      {exportPDFMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>Export PDF</span>
                    </button>
                    <button
                      onClick={() => handleShareProtocol(selectedProtocol)}
                      className="btn-outline flex items-center space-x-2"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className="btn-outline flex items-center space-x-2"
                    >
                      <History className="w-4 h-4" />
                      <span>History</span>
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="mb-2 flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Protocol Content</span>
                    {selectedProtocol.change_count > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Recent changes highlighted
                      </span>
                    )}
                  </div>
                  <div className="bg-white rounded border p-4 max-h-96 overflow-y-auto">
                    {renderHighlightedContent(selectedProtocol.highlighted_content)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium">Select a protocol to view</p>
                  <p className="text-sm">Choose a protocol from the sidebar to view its content</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-60">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-lab-primary" />
                  <h3 className="text-lg font-semibold text-gray-900">Share Protocol</h3>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedProtocol && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{selectedProtocol.name}</p>
                  <p className="text-xs text-gray-500">Version {selectedProtocol.version}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="input-field"
                    placeholder="Enter recipient email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={shareMessage}
                    onChange={(e) => setShareMessage(e.target.value)}
                    rows={3}
                    className="input-field"
                    placeholder="Add a personal message..."
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={includePDF}
                      onChange={(e) => setIncludePDF(e.target.checked)}
                      className="rounded border-gray-300 text-lab-primary focus:ring-lab-primary"
                    />
                    <span className="text-sm text-gray-700">Include PDF attachment</span>
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitShare}
                    disabled={shareProtocolMutation.isPending || !shareEmail.trim()}
                    className="btn-primary flex items-center space-x-2"
                  >
                    {shareProtocolMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}