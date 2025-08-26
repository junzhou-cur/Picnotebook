'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, LoadingState, ConfirmModal } from '../ui';
import { ProjectCard } from './ProjectCard';
import { ProjectForm } from './ProjectForm';
import { Project, ProjectCreateRequest, ProjectUpdateRequest } from '../../types/api';
import { projectService } from '../../services';

interface ProjectListProps {
  className?: string;
}

export const ProjectList: React.FC<ProjectListProps> = ({ className }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      // Empty array - no demo projects
      const mockProjects: Project[] = [];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setProjects(mockProjects);
      setTotalProjects(mockProjects.length);
      setTotalPages(1);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [currentPage, filterStatus, filterPriority]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadProjects();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCreateProject = async (data: ProjectCreateRequest) => {
    setSubmitting(true);
    try {
      const newProject = await projectService.createProject(data);
      setProjects(prev => [newProject, ...prev]);
      setTotalProjects(prev => prev + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProject = async (data: ProjectUpdateRequest) => {
    if (!editingProject) return;
    
    setSubmitting(true);
    try {
      const updatedProject = await projectService.updateProject(editingProject.id, data);
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
      setEditingProject(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deletingProject) return;
    
    setSubmitting(true);
    try {
      await projectService.deleteProject(deletingProject.id);
      setProjects(prev => prev.filter(p => p.id !== deletingProject.id));
      setTotalProjects(prev => prev - 1);
      setDeletingProject(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProjectClick = (project: Project) => {
    // Navigate to project detail page
    window.location.href = `/projects/${project.id}`;
  };

  const filteredProjects = projects.filter(project => {
    if (searchQuery && !searchQuery.trim()) return true;
    // Additional client-side filtering if needed
    return true;
  });

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">
            {totalProjects} project{totalProjects !== 1 ? 's' : ''} total
          </p>
        </div>

        <Button onClick={() => setShowCreateModal(true)}>
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">All Priority</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Project Grid */}
      <LoadingState loading={loading} error={error}>
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'Try adjusting your search or filters' : 'Get started by creating your first project'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowCreateModal(true)}>
                Create Project
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => handleProjectClick(project)}
                  onEdit={() => setEditingProject(project)}
                  onDelete={() => setDeletingProject(project)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * 12 + 1} to {Math.min(currentPage * 12, totalProjects)} of {totalProjects} projects
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 text-sm rounded ${
                            page === currentPage
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </LoadingState>

      {/* Create/Edit Project Modal */}
      <ProjectForm
        isOpen={showCreateModal || !!editingProject}
        onClose={() => {
          setShowCreateModal(false);
          setEditingProject(null);
        }}
        onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
        project={editingProject}
        loading={submitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to delete "${deletingProject?.title}"? This action cannot be undone and will also delete all associated experiments and entries.`}
        confirmText="Delete Project"
        loading={submitting}
        variant="danger"
      />
    </div>
  );
};