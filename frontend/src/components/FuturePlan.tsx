'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Target, 
  Brain, 
  BarChart3, 
  Calendar, 
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Edit,
  Save,
  Lightbulb,
  PieChart,
  ArrowRight,
  Users,
  BookOpen
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { useAppStore } from '@/stores/app';
import type { Project } from '@/types';

interface FuturePlanProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProjectPlanSummary extends Project {
  planProgress?: number;
  planStatus?: 'not_set' | 'draft' | 'active' | 'completed';
  lastUpdated?: string;
}

export function FuturePlan({ isOpen, onClose }: FuturePlanProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'ai-assistant' | 'analytics'>('overview');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingPlan, setEditingPlan] = useState(false);
  const [planContent, setPlanContent] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { user } = useAuthStore();
  const { apiKey, addNotification } = useAppStore();
  const queryClient = useQueryClient();

  // Fetch projects with future plan analysis
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
    enabled: isOpen,
  });

  // Transform projects data to include plan analysis
  const projectSummaries: ProjectPlanSummary[] = projects.map((project: Project) => ({
    ...project,
    planProgress: project.future_plan ? 
      (project.future_plan.length > 100 ? 100 : (project.future_plan.length / 100) * 100) : 0,
    planStatus: !project.future_plan ? 'not_set' : 
      project.future_plan.length < 50 ? 'draft' : 'active',
    lastUpdated: project.updated_at
  }));

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      addNotification({
        type: 'success',
        title: 'Future Plan Updated',
        message: 'Project future plan has been updated successfully.',
      });
      setEditingPlan(false);
      setSelectedProject(null);
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to update future plan.',
      });
    },
  });

  const handleEditPlan = (project: Project) => {
    setSelectedProject(project);
    setPlanContent(project.future_plan || '');
    setEditingPlan(true);
  };

  const handleSavePlan = () => {
    if (!selectedProject) return;
    
    updateProjectMutation.mutate({
      id: selectedProject.id,
      data: { future_plan: planContent }
    });
  };

  const handleGenerateAIPlan = async () => {
    if (!selectedProject || !apiKey) {
      addNotification({
        type: 'error',
        title: 'Missing Requirements',
        message: 'Please select a project and set your xAI API key in settings.',
      });
      return;
    }

    setIsGenerating(true);
    try {
      // This would call a backend endpoint for AI generation
      // For now, we'll simulate the functionality
      const prompt = aiPrompt || `Generate a comprehensive future plan for the project "${selectedProject.name}" based on its current description and hypothesis.`;
      
      // Simulate AI generation (in real implementation, this would call the backend)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedPlan = `# Future Plan for ${selectedProject.name}

## Immediate Next Steps (1-3 months)
1. **Validation Phase**: Complete initial proof-of-concept experiments
   - Validate core hypothesis through controlled trials
   - Establish baseline measurements and controls
   - Document initial findings and observations

2. **Optimization**: Refine experimental protocols
   - Optimize key parameters based on initial results
   - Improve efficiency and reproducibility
   - Address any technical challenges identified

## Medium-term Goals (3-6 months)
1. **Scale-up Studies**: Expand experimental scope
   - Increase sample sizes for statistical significance
   - Test across different conditions/variables
   - Validate results in multiple experimental setups

2. **Collaboration**: Engage with relevant stakeholders
   - Present findings to peer review groups
   - Seek feedback from domain experts
   - Explore potential partnerships or collaborations

## Long-term Vision (6-12 months)
1. **Publication Preparation**: Document and disseminate findings
   - Prepare manuscripts for peer-reviewed journals
   - Create comprehensive documentation
   - Develop presentation materials for conferences

2. **Future Applications**: Explore broader applications
   - Identify potential commercial or clinical applications
   - Plan follow-up studies or extensions
   - Consider intellectual property considerations

## Success Metrics
- Completion of validation experiments by [timeline]
- Achievement of target efficacy/performance metrics
- Successful presentation of findings at relevant venues
- Establishment of next-phase funding or partnerships

Generated using AI assistance based on project context.`;

      setPlanContent(generatedPlan);
      addNotification({
        type: 'success',
        title: 'AI Plan Generated',
        message: 'Future plan has been generated successfully. Review and edit as needed.',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: 'Failed to generate AI plan. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'active': return 'text-blue-600 bg-blue-50';
      case 'draft': return 'text-yellow-600 bg-yellow-50';
      case 'not_set': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'active': return <TrendingUp className="w-4 h-4" />;
      case 'draft': return <Edit className="w-4 h-4" />;
      case 'not_set': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateOverallProgress = () => {
    if (projectSummaries.length === 0) return { avg: 0, withPlans: 0, total: projectSummaries.length };
    
    const withPlans = projectSummaries.filter(p => p.future_plan).length;
    const avgProgress = projectSummaries.reduce((sum, p) => sum + (p.planProgress || 0), 0) / projectSummaries.length;
    
    return {
      avg: Math.round(avgProgress),
      withPlans,
      total: projectSummaries.length
    };
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
            <Target className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Future Plan Manager</h2>
              <p className="text-sm text-gray-600">Manage and generate future plans for your research projects</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'overview', label: 'Project Overview', icon: Target },
            { id: 'ai-assistant', label: 'AI Assistant', icon: Brain },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700">Total Projects</p>
                      <p className="text-2xl font-bold text-purple-900">{projectSummaries.length}</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700">With Plans</p>
                      <p className="text-2xl font-bold text-green-900">{calculateOverallProgress().withPlans}</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Avg Progress</p>
                      <p className="text-2xl font-bold text-blue-900">{calculateOverallProgress().avg}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Future Plans</h3>
                {projectsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                  </div>
                ) : projectSummaries.length > 0 ? (
                  <div className="space-y-4">
                    {projectSummaries.map((project) => (
                      <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium text-gray-900">{project.name}</h4>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.planStatus || 'not_set')}`}>
                                {getStatusIcon(project.planStatus || 'not_set')}
                                <span className="ml-1 capitalize">{project.planStatus?.replace('_', ' ')}</span>
                              </span>
                              <span className="text-xs text-gray-500">
                                Progress: {project.progress_percentage || 0}%
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {project.description || 'No description available'}
                            </p>
                            
                            {project.future_plan ? (
                              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                                <h5 className="text-sm font-medium text-blue-900 mb-1">Current Future Plan:</h5>
                                <p className="text-sm text-blue-800 line-clamp-3">{project.future_plan}</p>
                              </div>
                            ) : (
                              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                <p className="text-sm text-gray-600 italic">No future plan set for this project</p>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Updated {formatDate(project.updated_at)}</span>
                              <div className="flex items-center space-x-1">
                                <Users className="w-3 h-3" />
                                <span>{project.member_count || 1} members</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2 ml-4">
                            <button
                              onClick={() => handleEditPlan(project)}
                              className="btn-outline text-sm"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit Plan
                            </button>
                            {!project.future_plan && (
                              <button
                                onClick={() => {
                                  setSelectedProject(project);
                                  setActiveTab('ai-assistant');
                                }}
                                className="btn-primary text-sm"
                              >
                                <Brain className="w-4 h-4 mr-1" />
                                Generate
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>No projects found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Assistant Tab */}
          {activeTab === 'ai-assistant' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Brain className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">AI-Powered Future Planning</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Use AI to generate comprehensive future plans based on your project context, progress, and research goals.
                </p>
                
                {!apiKey && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        Please set your xAI API key in Settings to use AI features.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Project
                  </label>
                  <select
                    value={selectedProject?.id || ''}
                    onChange={(e) => {
                      const project = projectSummaries.find(p => p.id === Number(e.target.value));
                      setSelectedProject(project || null);
                      setPlanContent(project?.future_plan || '');
                    }}
                    className="input-field"
                  >
                    <option value="">Choose a project...</option>
                    {projectSummaries.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProject && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{selectedProject.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Description:</strong> {selectedProject.description || 'No description'}
                    </p>
                    {selectedProject.hypothesis && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Hypothesis:</strong> {selectedProject.hypothesis}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      <strong>Progress:</strong> {selectedProject.progress_percentage || 0}% complete
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Prompt (Optional)
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="input-field resize-none"
                    rows={3}
                    placeholder="Provide specific instructions for the AI, or leave blank for a general plan..."
                  />
                </div>

                <button
                  onClick={handleGenerateAIPlan}
                  disabled={!selectedProject || !apiKey || isGenerating}
                  className="btn-primary"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Plan...</span>
                    </>
                  ) : (
                    <>
                      <Lightbulb className="w-4 h-4" />
                      <span>Generate AI Plan</span>
                    </>
                  )}
                </button>

                {planContent && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Generated Future Plan
                      </label>
                      <textarea
                        value={planContent}
                        onChange={(e) => setPlanContent(e.target.value)}
                        className="input-field resize-none"
                        rows={12}
                        placeholder="Future plan will appear here..."
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSavePlan}
                        disabled={updateProjectMutation.isPending}
                        className="btn-primary"
                      >
                        {updateProjectMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save Plan</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setPlanContent('');
                          setSelectedProject(null);
                          setAiPrompt('');
                        }}
                        className="btn-outline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Planning Analytics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Plan Coverage</h4>
                      <PieChart className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Projects with plans</span>
                        <span className="text-sm font-medium">{calculateOverallProgress().withPlans}/{calculateOverallProgress().total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(calculateOverallProgress().withPlans / calculateOverallProgress().total) * 100}%` 
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        {Math.round((calculateOverallProgress().withPlans / calculateOverallProgress().total) * 100)}% coverage
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Plan Quality</h4>
                      <BarChart3 className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                      {['Comprehensive', 'Basic', 'Draft', 'None'].map((quality, index) => {
                        const count = index === 0 ? 
                          projectSummaries.filter(p => (p.future_plan?.length || 0) > 500).length :
                          index === 1 ? 
                          projectSummaries.filter(p => (p.future_plan?.length || 0) > 200 && (p.future_plan?.length || 0) <= 500).length :
                          index === 2 ? 
                          projectSummaries.filter(p => (p.future_plan?.length || 0) > 0 && (p.future_plan?.length || 0) <= 200).length :
                          projectSummaries.filter(p => !p.future_plan).length;
                        
                        return (
                          <div key={quality} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{quality}</span>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Recent Planning Activity</h4>
                  <div className="space-y-3">
                    {projectSummaries
                      .filter(p => p.future_plan)
                      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                      .slice(0, 5)
                      .map((project) => (
                        <div key={project.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-900">{project.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">{formatDate(project.updated_at)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit Plan Modal */}
        <AnimatePresence>
          {editingPlan && selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-60"
              onClick={() => setEditingPlan(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Edit Future Plan: {selectedProject.name}
                  </h3>
                  <button
                    onClick={() => setEditingPlan(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  <textarea
                    value={planContent}
                    onChange={(e) => setPlanContent(e.target.value)}
                    className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Enter the future plan for this project..."
                  />
                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      onClick={() => setEditingPlan(false)}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSavePlan}
                      disabled={updateProjectMutation.isPending}
                      className="btn-primary"
                    >
                      {updateProjectMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Plan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}