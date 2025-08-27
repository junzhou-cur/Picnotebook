'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Modal, ModalFooter } from '../ui';
import { entryService, experimentService, fileService } from '../../services';
import { Entry, EntryCreateRequest, EntryUpdateRequest, Experiment, FileEntity } from '../../types/api';
import { FileUpload } from '../files/FileUpload';
import { X, Upload, File } from 'lucide-react';

interface EntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Entry) => void;
  entry?: Entry;
  projectId?: string;
  experimentId?: string;
}

export const EntryForm: React.FC<EntryFormProps> = ({
  isOpen,
  onClose,
  onSave,
  entry,
  projectId,
  experimentId,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    entry_type: 'note' as 'note' | 'observation' | 'procedure' | 'result',
    tags: '',
    experiment_id: experimentId || '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<FileEntity[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (entry) {
        setFormData({
          title: entry.title,
          content: entry.content || '',
          entry_type: entry.entry_type as 'note' | 'observation' | 'procedure' | 'result',
          tags: entry.tags?.join(', ') || '',
          experiment_id: entry.experiment_id || '',
        });
        loadAttachedFiles(entry);
      } else {
        setFormData({
          title: '',
          content: '',
          entry_type: 'note',
          tags: '',
          experiment_id: experimentId || '',
        });
        setAttachedFiles([]);
      }
      
      if (projectId) {
        loadExperiments();
      }
    }
  }, [isOpen, entry, projectId, experimentId]);

  const loadExperiments = async () => {
    if (!projectId) return;
    
    try {
      const response = await experimentService.listExperiments({
        project_id: projectId,
        status: 'active',
        size: 100,
      });
      setExperiments(response.experiments);
    } catch (error) {
      console.error('Failed to load experiments:', error);
    }
  };

  const loadAttachedFiles = async (entryData: Entry) => {
    // TODO: Add file_ids to Entry interface
    setAttachedFiles([]);
    return;
    
    // Original code - uncomment when Entry interface has file_ids:
    // if (!entryData.file_ids || entryData.file_ids.length === 0) {
    //   setAttachedFiles([]);
    //   return;
    // }
    // try {
    //   const filePromises = entryData.file_ids.map(fileId => 
    //     fileService.getFile(fileId)
    //   );
    //   const files = await Promise.all(filePromises);
    //   setAttachedFiles(files.filter(Boolean));
    // } catch (error) {
    //   console.error('Failed to load attached files:', error);
    //   setAttachedFiles([]);
    // }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const fileIds = attachedFiles.map(file => file.id);

      if (entry) {
        // Update existing entry
        const updateData: EntryUpdateRequest = {
          title: formData.title,
          content: formData.content,
          entry_type: formData.entry_type,
          tags: tags.length > 0 ? tags : undefined,
          // experiment_id: formData.experiment_id || undefined, // TODO: Add to interface
          // file_ids: fileIds.length > 0 ? fileIds : undefined, // TODO: Add to interface
        };

        const updatedEntry = await entryService.updateEntry(entry.id, updateData);
        onSave(updatedEntry);
      } else {
        // Create new entry
        const createData: EntryCreateRequest = {
          project_id: projectId || '', // Add required project_id
          entry_date: new Date().toISOString(), // Add required entry_date
          title: formData.title,
          content: formData.content,
          entry_type: formData.entry_type,
          tags: tags.length > 0 ? tags : undefined,
          // experiment_id: formData.experiment_id || undefined, // TODO: Add to interface
          // file_ids: fileIds.length > 0 ? fileIds : undefined, // TODO: Add to interface
        };

        const newEntry = await entryService.createEntry(createData);
        onSave(newEntry);
      }

      onClose();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save entry' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (files: FileEntity[]) => {
    setAttachedFiles(prev => [...prev, ...files]);
    setShowFileUpload(false);
  };

  const removeFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={entry ? 'Edit Entry' : 'Create Entry'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            error={errors.title}
            required
            disabled={loading}
          />

          {/* Entry Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entry Type
            </label>
            <select
              value={formData.entry_type}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                entry_type: e.target.value as 'note' | 'observation' | 'procedure' | 'result'
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="note">Note</option>
              <option value="observation">Observation</option>
              <option value="procedure">Procedure</option>
              <option value="result">Result</option>
            </select>
          </div>

          {/* Experiment Selection */}
          {experiments.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Associated Experiment (Optional)
              </label>
              <select
                value={formData.experiment_id}
                onChange={(e) => setFormData(prev => ({ ...prev, experiment_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="">Select an experiment...</option>
                {experiments.map(exp => (
                  <option key={exp.id} value={exp.id}>
                    {exp.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Write your entry content in Markdown format..."
              disabled={loading}
              required
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Supports Markdown formatting
            </p>
          </div>

          {/* Tags */}
          <Input
            label="Tags (Optional)"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="Enter tags separated by commas"
            helperText="e.g., experiment, data, results"
            disabled={loading}
          />

          {/* Attached Files */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Attached Files
              </label>
              <Button
                type="button"
                variant="outline"
                
                onClick={() => setShowFileUpload(true)}
                disabled={loading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Add Files
              </Button>
            </div>

            {attachedFiles.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
                {attachedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <File className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.filename}</p>
                        <p className="text-xs text-gray-500">
                          {fileService.formatFileSize(file.file_size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="text-gray-400 hover:text-red-600"
                      disabled={loading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Display */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">Save Error</h3>
                  <p className="mt-1 text-sm text-red-700">{errors.submit}</p>
                </div>
              </div>
            </div>
          )}
        </form>

        <ModalFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {entry ? 'Update Entry' : 'Create Entry'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* File Upload Modal */}
      <FileUpload
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onUpload={handleFileUpload}
        associatedType="entry"
        associatedId={entry?.id}
      />
    </>
  );
};