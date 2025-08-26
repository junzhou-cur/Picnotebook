'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Loader2 } from 'lucide-react';
import type { Project } from '@/types';

interface ProjectFormProps {
  project?: Project | null;
  onSubmit: (data: {
    name: string;
    description?: string;
    hypothesis?: string;
    purpose?: string;
    current_progress?: string;
    future_plan?: string;
    status?: string;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProjectForm({ project, onSubmit, onCancel, isLoading = false }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    hypothesis: '',
    purpose: '',
    current_progress: '',
    future_plan: '',
    status: 'active' as 'active' | 'completed' | 'paused',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        hypothesis: project.hypothesis || '',
        purpose: project.purpose || '',
        current_progress: project.current_progress || '',
        future_plan: project.future_plan || '',
        status: project.status || 'active',
      });
    }
  }, [project]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Project name must be at least 3 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      hypothesis: formData.hypothesis.trim() || undefined,
      purpose: formData.purpose.trim() || undefined,
      current_progress: formData.current_progress.trim() || undefined,
      future_plan: formData.future_plan.trim() || undefined,
      status: formData.status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Project Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Project Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`input-field ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
          placeholder="Enter project name"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="input-field resize-none"
          placeholder="Brief description of the project"
          disabled={isLoading}
        />
      </div>

      {/* Hypothesis */}
      <div>
        <label htmlFor="hypothesis" className="block text-sm font-medium text-gray-700 mb-2">
          Hypothesis
        </label>
        <textarea
          id="hypothesis"
          name="hypothesis"
          value={formData.hypothesis}
          onChange={handleChange}
          rows={3}
          className="input-field resize-none"
          placeholder="Research hypothesis or expected outcomes"
          disabled={isLoading}
        />
      </div>

      {/* Purpose */}
      <div>
        <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
          Purpose
        </label>
        <textarea
          id="purpose"
          name="purpose"
          value={formData.purpose}
          onChange={handleChange}
          rows={3}
          className="input-field resize-none"
          placeholder="Purpose and objectives of the project"
          disabled={isLoading}
        />
      </div>

      {/* Current Progress (only show for editing) */}
      {project && (
        <div>
          <label htmlFor="current_progress" className="block text-sm font-medium text-gray-700 mb-2">
            Current Progress
          </label>
          <textarea
            id="current_progress"
            name="current_progress"
            value={formData.current_progress}
            onChange={handleChange}
            rows={4}
            className="input-field resize-none"
            placeholder="Current project progress and notes"
            disabled={isLoading}
          />
        </div>
      )}

      {/* Future Plan */}
      <div>
        <label htmlFor="future_plan" className="block text-sm font-medium text-gray-700 mb-2">
          Future Plan
          <span className="text-xs text-gray-500 ml-2">(Auto-updated when notes are uploaded)</span>
        </label>
        <textarea
          id="future_plan"
          name="future_plan"
          value={formData.future_plan}
          onChange={handleChange}
          rows={4}
          className="input-field resize-none bg-blue-50 border-blue-200"
          placeholder="AI-generated future plan based on experimental progress..."
          disabled={isLoading}
        />
      </div>

      {/* Status (only show for editing) */}
      {project && (
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="input-field"
            disabled={isLoading}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="btn-outline flex items-center space-x-2"
          disabled={isLoading}
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>
        <button
          type="submit"
          className="btn-primary flex items-center space-x-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isLoading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}</span>
        </button>
      </div>
    </form>
  );
}