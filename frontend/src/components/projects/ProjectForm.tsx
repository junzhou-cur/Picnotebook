'use client';

import React, { useState } from 'react';
import { Button, Input, Textarea, Modal, ModalFooter } from '../ui';
import { Project, ProjectCreateRequest, ProjectUpdateRequest } from '../../types/api';

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectCreateRequest | ProjectUpdateRequest) => Promise<void>;
  project?: Project | null;
  loading?: boolean;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  project = null,
  loading = false,
}) => {
  const isEditing = !!project;
  
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    status: project?.status || 'active',
    priority: project?.priority || 'medium',
    tags: project?.tags?.join(', ') || '',
    start_date: project?.start_date || '',
    end_date: project?.end_date || '',
    is_public: project?.is_public || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const submitData = {
        ...formData,
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0),
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
      };

      await onSubmit(submitData);
      onClose();
      
      // Reset form if creating new project
      if (!isEditing) {
        setFormData({
          title: '',
          description: '',
          status: 'active',
          priority: 'medium',
          tags: '',
          start_date: '',
          end_date: '',
          is_public: false,
        });
      }
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save project' });
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Project' : 'Create New Project'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Project Title *"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={errors.title}
          placeholder="Enter project title"
          disabled={loading}
        />

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          error={errors.description}
          placeholder="Describe your project (optional)"
          rows={4}
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <Input
          label="Tags"
          value={formData.tags}
          onChange={(e) => handleChange('tags', e.target.value)}
          placeholder="Enter tags separated by commas"
          helperText="Separate multiple tags with commas (e.g., research, biology, experiment)"
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="Start Date"
            value={formData.start_date}
            onChange={(e) => handleChange('start_date', e.target.value)}
            disabled={loading}
          />

          <Input
            type="date"
            label="End Date"
            value={formData.end_date}
            onChange={(e) => handleChange('end_date', e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_public"
            checked={formData.is_public}
            onChange={(e) => handleChange('is_public', e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            disabled={loading}
          />
          <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700">
            Make this project public
          </label>
        </div>

        {errors.submit && (
          <div className="text-red-600 text-sm">{errors.submit}</div>
        )}
      </form>

      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={loading}
        >
          {isEditing ? 'Update Project' : 'Create Project'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};