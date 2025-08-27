'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  FileText, 
  Calendar, 
  Search,
  ChevronRight,
  Clock,
  Tag,
  Eye
} from 'lucide-react';

interface LabNote {
  id: number;
  title: string;
  content: string;
  created_at: string;
  project_id?: number;
  project_name?: string;
  tags?: string[];
  preview?: string;
}

interface NotesListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNoteSelect?: (note: LabNote) => void;
}

export function NotesListModal({ isOpen, onClose, onNoteSelect }: NotesListModalProps) {
  const [notes, setNotes] = useState<LabNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<LabNote | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotes();
    }
  }, [isOpen]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      // Fetch from actual API endpoint
      const response = await fetch('http://localhost:5005/lab_records');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched notes:', data);
        
        // Data is already in the correct format from the API
        setNotes(data);
      } else {
        console.error('Failed to fetch notes:', response.status);
        throw new Error('Failed to fetch notes');
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      // Try without http prefix in case we're on production
      try {
        const response = await fetch('/lab_records');
        if (response.ok) {
          const data = await response.json();
          setNotes(data);
        }
      } catch (secondError) {
        console.error('Second attempt failed:', secondError);
        // Set empty array if all attempts fail
        setNotes([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleNoteClick = (note: LabNote) => {
    setSelectedNote(note);
    if (onNoteSelect) {
      onNoteSelect(note);
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
            className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Previous Lab Notes</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {notes.length} notes found in your notebook
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notes by title, content, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex h-[calc(90vh-180px)]">
              {/* Notes List */}
              <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredNotes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <FileText className="w-12 h-12 mb-3" />
                    <p>No notes found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredNotes.map((note) => (
                      <div
                        key={note.id}
                        onClick={() => handleNoteClick(note)}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedNote?.id === note.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {note.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {note.preview}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(note.created_at)}</span>
                              </div>
                              {note.tags && note.tags.length > 0 && (
                                <div className="flex items-center space-x-1">
                                  <Tag className="w-3 h-3" />
                                  <span>{note.tags.slice(0, 2).join(', ')}</span>
                                  {note.tags.length > 2 && (
                                    <span>+{note.tags.length - 2}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Note Preview */}
              <div className="w-1/2 p-6 overflow-y-auto bg-gray-50">
                {selectedNote ? (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {selectedNote.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(selectedNote.created_at)}</span>
                        </div>
                        {selectedNote.project_name && (
                          <div className="flex items-center space-x-1">
                            <FileText className="w-4 h-4" />
                            <span>{selectedNote.project_name}</span>
                          </div>
                        )}
                      </div>
                      {selectedNote.tags && selectedNote.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {selectedNote.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="prose prose-sm max-w-none">
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <pre className="whitespace-pre-wrap font-sans text-gray-700">
                          {selectedNote.content}
                        </pre>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end space-x-3">
                      <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Eye className="w-4 h-4" />
                        <span>View Full Note</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <FileText className="w-16 h-16 mb-4" />
                    <p className="text-lg">Select a note to preview</p>
                    <p className="text-sm mt-2">Click on any note from the list to see details</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}