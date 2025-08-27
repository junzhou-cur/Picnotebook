'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  X, 
  Eye, 
  Download,
  Image as ImageIcon,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Search,
  Trash2
} from 'lucide-react';
import { api } from '@/lib/api';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

interface NotesViewerProps {
  projectId: number;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface LabNote {
  id: number;
  title?: string;
  content?: string;
  filename: string;
  file_size: number;
  processed_text?: string;
  processing_status: string;
  project_name?: string;
  author_name?: string;
  created_at: string;
  updated_at?: string;
}

export function NotesViewer({ projectId, projectName, isOpen, onClose }: NotesViewerProps) {
  const [selectedNote, setSelectedNote] = useState<LabNote | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch lab notes
  const { data: notes = [], isLoading, error } = useQuery({
    queryKey: ['notes', projectId],
    queryFn: () => api.getNotes({ project_id: projectId }),
    enabled: isOpen,
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: number) => api.deleteNote(noteId),
    onSuccess: () => {
      // Refresh the notes list
      queryClient.invalidateQueries({ queryKey: ['notes', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      // Clear selected note if it was deleted
      if (selectedNote) {
        setSelectedNote(null);
      }
    },
    onError: (error) => {
      console.error('Failed to delete note:', error);
      // You could add a toast notification here
    },
  });

  const handleDeleteNote = async (noteId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      deleteNoteMutation.mutate(noteId);
    }
  };

  const filteredNotes = notes.filter((note) =>
    note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.processed_text?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'processing': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'processing': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
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
            <FileText className="w-6 h-6 text-lab-primary" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Project Notes</h2>
              <p className="text-sm text-gray-600">{projectName} • {notes.length} notes</p>
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
          {/* Sidebar - Notes List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Search notes..."
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-lab-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">
                  <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
                  <p>Error loading notes</p>
                </div>
              ) : filteredNotes.length > 0 ? (
                <div className="space-y-2">
                  {filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`group p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedNote?.id === note.id
                          ? 'border-lab-primary bg-lab-primary/5'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedNote(note)}
                    >
                      <div className="flex items-start space-x-3">
                        <ImageIcon className="w-5 h-5 text-gray-400 mt-1" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {note.title || note.filename || 'Untitled Note'}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(note.processing_status)}`}>
                              {getStatusIcon(note.processing_status)}
                              <span className="ml-1 capitalize">{note.processing_status}</span>
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(note.created_at)} • {formatFileSize(note.file_size || 1024)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteNote(note.id, e)}
                          disabled={deleteNoteMutation.isPending}
                          className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>No notes found</p>
                  {searchQuery && (
                    <p className="text-sm mt-1">Try adjusting your search</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {selectedNote ? (
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedNote.title || selectedNote.filename || 'Untitled Note'}
                    </h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{selectedNote.author_name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(selectedNote.created_at)}</span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedNote.processing_status)}`}>
                        {getStatusIcon(selectedNote.processing_status)}
                        <span className="ml-1 capitalize">{selectedNote.processing_status}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteNote(selectedNote.id, e)}
                      disabled={deleteNoteMutation.isPending}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Note Content */}
                <div className="space-y-6">
                  {selectedNote.processed_text && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Processed Content
                      </h4>
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
                          {selectedNote.processed_text}
                        </pre>
                      </div>
                    </div>
                  )}

                  {selectedNote.content && selectedNote.content !== selectedNote.processed_text && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Raw Content
                      </h4>
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
                          {selectedNote.content}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium">Select a note to view</p>
                  <p className="text-sm">Choose a note from the sidebar to view its content</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}