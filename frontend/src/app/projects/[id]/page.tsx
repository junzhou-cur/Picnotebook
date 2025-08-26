'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '../../../components/layout/Layout';
import { Card, CardContent, Button } from '../../../components/ui';
import { Project } from '../../../types/api';

interface ProjectDetailPageProps {
  params: {
    id: string;
  };
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProject();
  }, [params.id]);

  const loadProject = () => {
    // Mock project data based on ID
    const mockProjects: { [key: string]: Project } = {
      '1': {
        id: '1',
        tenant_id: 'demo-tenant',
        title: 'CRISPR Gene Editing Study',
        description: 'Investigating CRISPR-Cas9 efficiency in human cell lines. This comprehensive study aims to evaluate the effectiveness of CRISPR-Cas9 gene editing technology in various human cell line models, with a focus on precision, efficiency, and off-target effects.',
        status: 'active',
        priority: 'high',
        tags: ['CRISPR', 'Gene Editing', 'Cell Biology'],
        metadata: { 
          lab: 'Molecular Biology Lab', 
          equipment: ['PCR', 'Gel Electrophoresis'],
          budget: 50000,
          funding_source: 'NIH Grant'
        },
        start_date: '2024-01-15',
        end_date: '2024-06-15',
        created_by: 'demo-user',
        is_public: false,
        collaborators: ['researcher1', 'researcher2'],
        settings: {},
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T14:30:00Z'
      },
      '2': {
        id: '2',
        tenant_id: 'demo-tenant',
        title: 'Protein Crystallization',
        description: 'X-ray crystallography of novel enzyme structures. This project focuses on determining the three-dimensional structures of newly discovered enzymes using X-ray crystallography techniques.',
        status: 'active',
        priority: 'medium',
        tags: ['Protein', 'Crystallography', 'Structure'],
        metadata: { 
          lab: 'Structural Biology Lab', 
          equipment: ['X-ray Diffractometer'],
          resolution_target: '2.0 Å'
        },
        start_date: '2024-01-10', 
        end_date: '2024-05-10',
        created_by: 'demo-user',
        is_public: true,
        collaborators: ['researcher3'],
        settings: {},
        created_at: '2024-01-10T09:00:00Z',
        updated_at: '2024-01-18T16:45:00Z'
      },
      '3': {
        id: '3',
        tenant_id: 'demo-tenant',
        title: 'Drug Screening Assay',
        description: 'High-throughput screening of potential therapeutic compounds. Systematic evaluation of compound libraries for identifying potential drug candidates.',
        status: 'completed',
        priority: 'high',
        tags: ['Drug Discovery', 'HTS', 'Therapeutics'],
        metadata: { 
          lab: 'Pharmacology Lab', 
          compounds_tested: 10000,
          hit_rate: '0.5%'
        },
        start_date: '2024-01-05',
        end_date: '2024-01-15',
        created_by: 'demo-user',
        is_public: false,
        collaborators: ['researcher4', 'researcher5'],
        settings: {},
        created_at: '2024-01-05T08:00:00Z',
        updated_at: '2024-01-15T17:00:00Z'
      }
    };

    const projectData = mockProjects[params.id];
    setProject(projectData || null);
    setLoading(false);
  };

  if (loading) {
    return (
      <Layout requireAuth={true}>
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout requireAuth={true}>
        <div className="text-center py-12">
          <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Project Not Found</h3>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => window.location.href = '/projects'}>
            Back to Projects
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth={true}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/projects'}
            >
              ← Back to Projects
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
              <p className="text-gray-600 mt-1">Project ID: {project.id}</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline">
              Edit Project
            </Button>
            <Button>
              New Experiment
            </Button>
          </div>
        </div>

        {/* Project Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700">{project.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Experiments</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Cell Viability Assay</p>
                      <p className="text-sm text-gray-600">Started 2 days ago</p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      In Progress
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Gene Expression Analysis</p>
                      <p className="text-sm text-gray-600">Completed last week</p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      Completed
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="w-full">
                    View All Experiments
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Project Info</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        project.status === 'active' ? 'bg-green-100 text-green-800' :
                        project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Priority</dt>
                    <dd className="mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        project.priority === 'high' ? 'bg-red-100 text-red-800' :
                        project.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(project.start_date!).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">End Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(project.end_date!).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Visibility</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {project.is_public ? 'Public' : 'Private'}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Collaborators</h3>
                <div className="space-y-2">
                  {project.collaborators.map((collaborator) => (
                    <div key={collaborator} className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {collaborator.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-900">{collaborator}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}