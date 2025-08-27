'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target,
  CheckCircle,
  Circle,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  FileText,
  TrendingUp,
  Plus,
  Edit3,
  Flag,
  Activity,
  BarChart3,
  X,
  Save,
  Trash2,
  Brain,
  Lightbulb,
  ArrowRight,
  CheckSquare,
  List
} from 'lucide-react';
import { AccessibilityTooltip } from './AccessibilityTooltip';
import { api } from '@/lib/api';

interface Milestone {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  completedDate?: string;
  assignee?: string;
  notes?: string;
  dependencies?: string[];
  progress: number;
  tasks: Task[];
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  assignee?: string;
  dueDate?: string;
}

interface ProgressTrackerProps {
  projectId: string;
  projectName: string;
  projectCode: string;
  initialProgress?: number;
  milestones?: Milestone[];
  onProgressUpdate?: (progress: number, milestones: Milestone[]) => void;
  className?: string;
}

// Sample milestone data based on the projects
const SAMPLE_MILESTONES: Record<string, Milestone[]> = {
  'CF1282': [
    {
      id: '1',
      title: 'Literature Review & Protocol Design',
      description: 'Review current CFTR W1282X research and design prime editing protocol',
      status: 'completed',
      priority: 'high',
      progress: 100,
      completedDate: '2025-07-15',
      assignee: 'Team Lead',
      tasks: [
        { id: '1a', title: 'Review CFTR mutation literature', completed: true },
        { id: '1b', title: 'Design prime editing guide RNAs', completed: true },
        { id: '1c', title: 'Protocol optimization strategy', completed: true }
      ]
    },
    {
      id: '2',
      title: 'Construct Preparation',
      description: 'Clone and validate prime editing constructs for W1282X correction',
      status: 'in_progress',
      priority: 'high',
      progress: 60,
      dueDate: '2025-08-15',
      assignee: 'Team Lead',
      tasks: [
        { id: '2a', title: 'Clone PE3-NG construct', completed: true },
        { id: '2b', title: 'Clone pegRNA constructs', completed: true },
        { id: '2c', title: 'Validate construct sequences', completed: false, dueDate: '2025-08-10' },
        { id: '2d', title: 'Prepare transfection-ready DNA', completed: false, dueDate: '2025-08-15' }
      ]
    },
    {
      id: '3',
      title: 'Cell Line Establishment',
      description: 'Establish and characterize CFTR W1282X cell models',
      status: 'pending',
      priority: 'medium',
      progress: 0,
      dueDate: '2025-09-01',
      dependencies: ['2'],
      tasks: [
        { id: '3a', title: 'Culture HEK293T cells', completed: false },
        { id: '3b', title: 'Transfect prime editing system', completed: false },
        { id: '3c', title: 'Screen for edited clones', completed: false }
      ]
    },
    {
      id: '4',
      title: 'Functional Validation',
      description: 'Validate CFTR function restoration in edited cells',
      status: 'pending',
      priority: 'high',
      progress: 0,
      dueDate: '2025-10-01',
      dependencies: ['3'],
      tasks: [
        { id: '4a', title: 'Western blot analysis', completed: false },
        { id: '4b', title: 'Chloride transport assay', completed: false },
        { id: '4c', title: 'Statistical analysis', completed: false }
      ]
    }
  ],
  'MizCGBE': [
    {
      id: '1',
      title: 'CGBE1 Miniaturization Design',
      description: 'Design and optimize miniaturized CGBE1 base editor',
      status: 'completed',
      priority: 'high',
      progress: 100,
      completedDate: '2025-07-20',
      tasks: [
        { id: '1a', title: 'Analyze CGBE1 domains', completed: true },
        { id: '1b', title: 'Design truncation variants', completed: true }
      ]
    },
    {
      id: '2',
      title: 'Construct Assembly & Testing',
      description: 'Assemble and test miniaturized CGBE variants',
      status: 'completed',
      priority: 'high',
      progress: 100,
      completedDate: '2025-08-01',
      tasks: [
        { id: '2a', title: 'Clone MizCGBE variants', completed: true },
        { id: '2b', title: 'Initial activity screening', completed: true }
      ]
    },
    {
      id: '3',
      title: 'Optimization & Characterization',
      description: 'Optimize editing efficiency and characterize off-target effects',
      status: 'in_progress',
      priority: 'high',
      progress: 75,
      dueDate: '2025-08-20',
      tasks: [
        { id: '3a', title: 'Target site optimization', completed: true },
        { id: '3b', title: 'Editing window analysis', completed: true },
        { id: '3c', title: 'Off-target assessment', completed: false, dueDate: '2025-08-15' }
      ]
    },
    {
      id: '4',
      title: 'Manuscript Preparation',
      description: 'Prepare manuscript for publication',
      status: 'pending',
      priority: 'medium',
      progress: 0,
      dueDate: '2025-09-15',
      dependencies: ['3'],
      tasks: [
        { id: '4a', title: 'Draft manuscript', completed: false },
        { id: '4b', title: 'Prepare figures', completed: false }
      ]
    }
  ],
  'APOC3': [
    {
      id: '1',
      title: 'Target Validation',
      description: 'Validate APOC3 as therapeutic target for triglyceride reduction',
      status: 'in_progress',
      priority: 'medium',
      progress: 30,
      dueDate: '2025-08-30',
      tasks: [
        { id: '1a', title: 'Literature review', completed: true },
        { id: '1b', title: 'Target site selection', completed: false },
        { id: '1c', title: 'Safety assessment', completed: false }
      ]
    }
  ]
};

export function ProgressTracker({
  projectId,
  projectName,
  projectCode,
  initialProgress = 0,
  milestones: propMilestones,
  onProgressUpdate,
  className = ''
}: ProgressTrackerProps) {
  const [milestones, setMilestones] = useState<Milestone[]>(
    propMilestones || SAMPLE_MILESTONES[projectCode] || []
  );
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  
  // New edit functionality states
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<{milestoneId: string, taskId: string} | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [taskInputText, setTaskInputText] = useState('');
  const [parsedTasks, setParsedTasks] = useState<Array<{id: string; title: string; category: string; priority: 'high' | 'medium' | 'low'; estimated_time: string}>>([]);
  const [showTaskReview, setShowTaskReview] = useState(false);
  
  // Form states for editing
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    dueDate: '',
    assignee: ''
  });
  const [taskEditForm, setTaskEditForm] = useState({
    title: '',
    assignee: '',
    dueDate: ''
  });

  // Load milestones from API
  useEffect(() => {
    if (!propMilestones && projectId) {
      loadMilestones();
    }
  }, [projectId, propMilestones]);

  const loadMilestones = async () => {
    try {
      setLoading(true);
      const apiMilestones = await api.getMilestones(parseInt(projectId));
      setMilestones(apiMilestones);
    } catch (error) {
      console.error('Failed to load milestones:', error);
      // Fall back to sample data on error
      setMilestones(SAMPLE_MILESTONES[projectCode] || []);
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall progress
  const calculateProgress = useCallback(() => {
    if (milestones.length === 0) return initialProgress;
    
    const totalWeight = milestones.length;
    const weightedProgress = milestones.reduce((sum, milestone) => {
      return sum + (milestone.progress / 100);
    }, 0);
    
    return Math.round((weightedProgress / totalWeight) * 100);
  }, [milestones, initialProgress]);

  // Get status color
  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'blocked': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: Milestone['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // Get status icon
  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return Clock;
      case 'blocked': return AlertTriangle;
      default: return Circle;
    }
  };

  // Toggle task completion
  const toggleTask = useCallback(async (milestoneId: string, taskId: string) => {
    try {
      // Find the current task to toggle its completion status
      const currentMilestone = milestones.find(m => m.id === milestoneId);
      const currentTask = currentMilestone?.tasks.find(t => t.id === taskId);
      
      if (!currentTask) return;
      
      const result = await api.updateTask(parseInt(taskId), {
        completed: !currentTask.completed
      });
      
      // Update the milestone with the API response
      setMilestones(prev => prev.map(milestone => 
        milestone.id === milestoneId
          ? {
              ...result.milestone,
              tasks: milestone.tasks.map(task =>
                task.id === taskId ? result.task : task
              )
            }
          : milestone
      ));
    } catch (error) {
      console.error('Failed to toggle task:', error);
      alert('Failed to update task. Please try again.');
    }
  }, [milestones]);

  // Enhanced editing functions
  const handleEditMilestone = useCallback((milestone: Milestone) => {
    setEditingMilestone(milestone.id);
    setEditForm({
      title: milestone.title,
      description: milestone.description,
      priority: milestone.priority,
      dueDate: milestone.dueDate || '',
      assignee: milestone.assignee || ''
    });
  }, []);

  const handleSaveMilestone = useCallback(() => {
    if (!editingMilestone) return;
    
    setMilestones(prev => prev.map(milestone => 
      milestone.id === editingMilestone 
        ? { 
            ...milestone, 
            title: editForm.title,
            description: editForm.description,
            priority: editForm.priority,
            dueDate: editForm.dueDate || undefined,
            assignee: editForm.assignee || undefined
          }
        : milestone
    ));
    setEditingMilestone(null);
  }, [editingMilestone, editForm]);

  const handleEditTask = useCallback((milestoneId: string, task: Task) => {
    setEditingTask({ milestoneId, taskId: task.id });
    setTaskEditForm({
      title: task.title,
      assignee: task.assignee || '',
      dueDate: task.dueDate || ''
    });
  }, []);

  const handleSaveTask = useCallback(() => {
    if (!editingTask) return;
    
    setMilestones(prev => prev.map(milestone => 
      milestone.id === editingTask.milestoneId
        ? {
            ...milestone,
            tasks: milestone.tasks.map(task => 
              task.id === editingTask.taskId
                ? {
                    ...task,
                    title: taskEditForm.title,
                    assignee: taskEditForm.assignee || undefined,
                    dueDate: taskEditForm.dueDate || undefined
                  }
                : task
            )
          }
        : milestone
    ));
    setEditingTask(null);
  }, [editingTask, taskEditForm]);

  const handleDeleteTask = useCallback(async (milestoneId: string, taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const result = await api.deleteTask(parseInt(taskId));
        
        // Update the milestone with the updated progress from the API
        setMilestones(prev => prev.map(milestone => 
          milestone.id === milestoneId
            ? {
                ...milestone,
                ...result.milestone,
                tasks: milestone.tasks.filter(task => task.id !== taskId)
              }
            : milestone
        ));
      } catch (error) {
        console.error('Failed to delete task:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  }, []);

  const handleDeleteMilestone = useCallback(async (milestoneId: string) => {
    if (window.confirm('Are you sure you want to delete this milestone? All associated tasks will also be deleted.')) {
      try {
        await api.deleteMilestone(parseInt(milestoneId));
        setMilestones(prev => prev.filter(milestone => milestone.id !== milestoneId));
      } catch (error) {
        console.error('Failed to delete milestone:', error);
        alert('Failed to delete milestone. Please try again.');
      }
    }
  }, []);

  // Smart task parsing function
  const parseTaskInput = useCallback((input: string) => {
    const lines = input.split('\n').filter(line => line.trim().length > 0);
    const tasks: Array<{id: string; title: string; category: string; priority: 'high' | 'medium' | 'low'; estimated_time: string}> = [];

    const categories = {
      'research': ['research', 'study', 'analyze', 'investigate', 'review', 'literature'],
      'development': ['develop', 'create', 'build', 'implement', 'design', 'code'],
      'testing': ['test', 'validate', 'verify', 'check', 'screen', 'assay'],
      'documentation': ['document', 'write', 'prepare', 'draft', 'report'],
      'collaboration': ['meet', 'discuss', 'present', 'collaborate', 'review with'],
      'planning': ['plan', 'schedule', 'organize', 'coordinate', 'timeline']
    };

    const priorityKeywords = {
      'high': ['urgent', 'critical', 'important', 'asap', 'priority', 'deadline'],
      'low': ['optional', 'nice to have', 'when time permits', 'future', 'later']
    };

    const timePatterns = {
      'hours': /(\d+)\s*(?:hours?|hrs?|h)\b/i,
      'days': /(\d+)\s*(?:days?|d)\b/i,
      'weeks': /(\d+)\s*(?:weeks?|wks?|w)\b/i
    };

    lines.forEach((line, index) => {
      // Remove list markers
      let taskText = line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim();
      
      if (taskText.length < 5) return; // Skip very short lines

      // Determine category
      let category = 'general';
      let maxScore = 0;
      
      for (const [cat, keywords] of Object.entries(categories)) {
        const score = keywords.reduce((acc, keyword) => {
          return acc + (taskText.toLowerCase().includes(keyword) ? 1 : 0);
        }, 0);
        if (score > maxScore) {
          maxScore = score;
          category = cat;
        }
      }

      // Determine priority
      let priority: 'high' | 'medium' | 'low' = 'medium';
      for (const [prio, keywords] of Object.entries(priorityKeywords)) {
        if (keywords.some(keyword => taskText.toLowerCase().includes(keyword))) {
          priority = prio as 'high' | 'medium' | 'low';
          break;
        }
      }

      // Extract time estimate
      let estimated_time = '';
      for (const [unit, pattern] of Object.entries(timePatterns)) {
        const match = taskText.match(pattern);
        if (match) {
          estimated_time = `${match[1]} ${unit}`;
          break;
        }
      }

      // Clean up task title (remove time estimates and priority keywords)
      let cleanTitle = taskText
        .replace(/(\d+)\s*(?:hours?|hrs?|h|days?|d|weeks?|wks?|w)\b/gi, '')
        .replace(/\b(urgent|critical|important|asap|priority|deadline|optional|nice to have|when time permits|future|later)\b/gi, '')
        .trim();

      tasks.push({
        id: `parsed_${index}_${Date.now()}`,
        title: cleanTitle,
        category: category,
        priority: priority,
        estimated_time: estimated_time
      });
    });

    setParsedTasks(tasks);
    setShowTaskReview(true);
  }, []);

  const handleConfirmTasks = useCallback((selectedTaskIds: string[]) => {
    const tasksToAdd = parsedTasks
      .filter(task => selectedTaskIds.includes(task.id))
      .map(task => ({
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: task.title,
        completed: false,
        assignee: undefined,
        dueDate: undefined
      }));

    if (selectedMilestone) {
      // Add to specific milestone
      setMilestones(prev => prev.map(milestone => 
        milestone.id === selectedMilestone
          ? { ...milestone, tasks: [...milestone.tasks, ...tasksToAdd] }
          : milestone
      ));
    } else {
      // Create new milestone for these tasks
      const newMilestone: Milestone = {
        id: `milestone_${Date.now()}`,
        title: 'New Tasks',
        description: 'Tasks added from text input',
        status: 'pending',
        priority: 'medium',
        progress: 0,
        tasks: tasksToAdd
      };
      setMilestones(prev => [...prev, newMilestone]);
    }

    setShowTaskReview(false);
    setTaskInputText('');
    setParsedTasks([]);
    setShowTaskInput(false);
  }, [parsedTasks, selectedMilestone]);

  const overallProgress = calculateProgress();

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-lab-primary/10 rounded-lg">
              <Target className="w-5 h-5 text-lab-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {projectCode} Progress
              </h3>
              <p className="text-sm text-gray-500">
                {projectName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTaskInput(true)}
              className="btn-primary text-sm flex items-center space-x-2"
            >
              <Brain className="w-4 h-4" />
              <span>Add Tasks</span>
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="btn-outline text-sm"
            >
              {showDetails ? 'Hide Details' : 'View Details'}
            </button>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-2xl font-bold text-lab-primary">{overallProgress}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="bg-gradient-to-r from-lab-primary to-blue-500 h-full rounded-full"
            />
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>{milestones.filter(m => m.status === 'completed').length} of {milestones.length} milestones completed</span>
            <span>
              {milestones.filter(m => m.status === 'in_progress').length} in progress • 
              {milestones.filter(m => m.status === 'blocked').length} blocked
            </span>
          </div>
        </div>
      </div>

      {/* Milestone Overview */}
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {milestones.slice(0, 4).map((milestone, index) => {
            const StatusIcon = getStatusIcon(milestone.status);
            
            return (
              <AccessibilityTooltip
                key={milestone.id}
                title={milestone.title}
                content={
                  <div className="space-y-2 max-w-xs">
                    <p className="text-sm">{milestone.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-1 rounded-full ${getStatusColor(milestone.status)}`}>
                        {milestone.status.replace('_', ' ')}
                      </span>
                      <span>{milestone.progress}% complete</span>
                    </div>
                    {milestone.dueDate && (
                      <p className="text-xs text-gray-500">
                        Due: {new Date(milestone.dueDate).toLocaleDateString()}
                      </p>
                    )}
                    <div className="text-xs">
                      <p>{milestone.tasks.filter(t => t.completed).length}/{milestone.tasks.length} tasks completed</p>
                    </div>
                  </div>
                }
                position="top"
                trigger="hover"
              >
                <div className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-help group relative">
                  <div className="flex items-center space-x-2 mb-2">
                    <StatusIcon className={`w-4 h-4 ${
                      milestone.status === 'completed' ? 'text-green-500' :
                      milestone.status === 'in_progress' ? 'text-blue-500' :
                      milestone.status === 'blocked' ? 'text-red-500' :
                      'text-gray-400'
                    }`} />
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {milestone.title}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMilestone(milestone.id);
                      }}
                      className="ml-auto opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 rounded transition-all"
                      title="Delete milestone"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-full rounded-full ${
                        milestone.status === 'completed' ? 'bg-green-500' :
                        milestone.status === 'in_progress' ? 'bg-blue-500' :
                        milestone.status === 'blocked' ? 'bg-red-500' :
                        'bg-gray-400'
                      }`}
                      style={{ width: `${milestone.progress}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{milestone.progress}%</span>
                    <span>{milestone.tasks.filter(t => t.completed).length}/{milestone.tasks.length}</span>
                  </div>
                </div>
              </AccessibilityTooltip>
            );
          })}
        </div>

        {/* Detailed View */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 border-t border-gray-200 pt-4"
            >
              {milestones.map((milestone) => {
                const StatusIcon = getStatusIcon(milestone.status);
                const isExpanded = selectedMilestone === milestone.id;
                
                return (
                  <div key={milestone.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedMilestone(isExpanded ? null : milestone.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <StatusIcon className={`w-5 h-5 mt-0.5 ${
                          milestone.status === 'completed' ? 'text-green-500' :
                          milestone.status === 'in_progress' ? 'text-blue-500' :
                          milestone.status === 'blocked' ? 'text-red-500' :
                          'text-gray-400'
                        }`} />
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteMilestone(milestone.id);
                                }}
                                className="px-2 py-1 text-red-600 bg-red-100 hover:bg-red-200 rounded border border-red-300 text-xs font-bold"
                                title="Delete this milestone"
                              >
                                🗑️ DELETE
                              </button>
                            </div>
                            <div className="flex items-center space-x-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditMilestone(milestone);
                                }}
                                className="px-3 py-2 text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors flex items-center space-x-1 border border-blue-200"
                                title="Edit milestone"
                              >
                                <Edit3 className="w-5 h-5" />
                                <span className="text-sm font-medium">Edit</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteMilestone(milestone.id);
                                }}
                                className="px-3 py-2 text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 rounded-lg transition-colors flex items-center space-x-1 border border-red-200"
                                title="Delete milestone"
                              >
                                <Trash2 className="w-5 h-5" />
                                <span className="text-sm font-medium">Delete</span>
                              </button>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(milestone.status)}`}>
                                {milestone.status.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              {milestone.assignee && (
                                <div className="flex items-center space-x-1">
                                  <User className="w-3 h-3" />
                                  <span>{milestone.assignee}</span>
                                </div>
                              )}
                              {milestone.dueDate && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>Due {new Date(milestone.dueDate).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-full rounded-full ${
                                    milestone.status === 'completed' ? 'bg-green-500' :
                                    milestone.status === 'in_progress' ? 'bg-blue-500' :
                                    'bg-gray-400'
                                  }`}
                                  style={{ width: `${milestone.progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {milestone.progress}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded Tasks */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-gray-200 bg-gray-50 p-4"
                        >
                          <h5 className="text-sm font-medium text-gray-900 mb-3">
                            Tasks ({milestone.tasks.filter(t => t.completed).length}/{milestone.tasks.length} completed)
                          </h5>
                          
                          <div className="space-y-2">
                            {milestone.tasks.map((task) => (
                              <div key={task.id} className="flex items-center space-x-3">
                                <button
                                  onClick={() => toggleTask(milestone.id, task.id)}
                                  className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                    task.completed
                                      ? 'bg-green-500 border-green-500 text-white'
                                      : 'border-gray-300 hover:border-gray-400'
                                  }`}
                                >
                                  {task.completed && <CheckCircle className="w-3 h-3" />}
                                </button>
                                
                                <span className={`text-sm flex-1 ${
                                  task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                                }`}>
                                  {task.title}
                                </span>
                                
                                <div className="flex items-center space-x-2">
                                  {task.dueDate && (
                                    <span className="text-xs text-gray-500">
                                      {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleEditTask(milestone.id, task)}
                                    className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                                    title="Edit task"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTask(milestone.id, task.id)}
                                    className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                                    title="Delete task"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Smart Task Input Modal */}
      <AnimatePresence>
        {showTaskInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowTaskInput(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <Brain className="w-6 h-6 text-lab-primary" />
                  <h3 className="text-lg font-semibold text-gray-900">Smart Task Input</h3>
                </div>
                <button
                  onClick={() => setShowTaskInput(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Enter your tasks in natural language. The system will automatically categorize them, detect priorities, and extract time estimates.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-3 mb-3">
                    <h4 className="text-sm font-medium text-blue-900 mb-1">Example:</h4>
                    <p className="text-xs text-blue-800">
                      • Review literature on CRISPR editing (urgent, 2 hours)<br/>
                      • Design primers for PCR amplification (3 days)<br/>
                      • Run gel electrophoresis experiment<br/>
                      • Write progress report (optional, when time permits)
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Task List
                    </label>
                    <textarea
                      value={taskInputText}
                      onChange={(e) => setTaskInputText(e.target.value)}
                      rows={8}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lab-primary focus:border-transparent resize-none"
                      placeholder="Enter tasks, one per line..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add to Milestone (Optional)
                    </label>
                    <select
                      value={selectedMilestone || ''}
                      onChange={(e) => setSelectedMilestone(e.target.value || null)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lab-primary focus:border-transparent"
                    >
                      <option value="">Create new milestone</option>
                      {milestones.map((milestone) => (
                        <option key={milestone.id} value={milestone.id}>
                          {milestone.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={() => setShowTaskInput(false)}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => parseTaskInput(taskInputText)}
                      disabled={!taskInputText.trim()}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Lightbulb className="w-4 h-4" />
                      <span>Parse Tasks</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Review Modal */}
      <AnimatePresence>
        {showTaskReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowTaskReview(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <CheckSquare className="w-6 h-6 text-lab-primary" />
                  <h3 className="text-lg font-semibold text-gray-900">Review Parsed Tasks</h3>
                </div>
                <button
                  onClick={() => setShowTaskReview(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <p className="text-sm text-gray-600 mb-4">
                  Review the automatically categorized tasks below. Select which ones to add to your project.
                </p>
                
                <TaskReviewComponent
                  tasks={parsedTasks}
                  onConfirm={handleConfirmTasks}
                  onCancel={() => setShowTaskReview(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Milestone Modal */}
      <AnimatePresence>
        {editingMilestone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setEditingMilestone(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-md w-full"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Edit Milestone</h3>
                <button
                  onClick={() => setEditingMilestone(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lab-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lab-primary focus:border-transparent resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={editForm.priority}
                      onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value as 'high' | 'medium' | 'low' }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lab-primary focus:border-transparent"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                    <input
                      type="date"
                      value={editForm.dueDate}
                      onChange={(e) => setEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lab-primary focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
                  <input
                    type="text"
                    value={editForm.assignee}
                    onChange={(e) => setEditForm(prev => ({ ...prev, assignee: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lab-primary focus:border-transparent"
                    placeholder="Enter assignee name"
                  />
                </div>
                
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setEditingMilestone(null)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveMilestone}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Task Modal */}
      <AnimatePresence>
        {editingTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setEditingTask(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-md w-full"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Edit Task</h3>
                <button
                  onClick={() => setEditingTask(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                  <input
                    type="text"
                    value={taskEditForm.title}
                    onChange={(e) => setTaskEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lab-primary focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
                    <input
                      type="text"
                      value={taskEditForm.assignee}
                      onChange={(e) => setTaskEditForm(prev => ({ ...prev, assignee: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lab-primary focus:border-transparent"
                      placeholder="Enter assignee"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                    <input
                      type="date"
                      value={taskEditForm.dueDate}
                      onChange={(e) => setTaskEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lab-primary focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setEditingTask(null)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTask}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Task Review Component
function TaskReviewComponent({ 
  tasks, 
  onConfirm, 
  onCancel 
}: { 
  tasks: Array<{id: string; title: string; category: string; priority: 'high' | 'medium' | 'low'; estimated_time: string}>; 
  onConfirm: (selectedIds: string[]) => void; 
  onCancel: () => void; 
}) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>(tasks.map(t => t.id));

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'research': return 'bg-blue-100 text-blue-800';
      case 'development': return 'bg-green-100 text-green-800';
      case 'testing': return 'bg-purple-100 text-purple-800';
      case 'documentation': return 'bg-yellow-100 text-yellow-800';
      case 'collaboration': return 'bg-pink-100 text-pink-800';
      case 'planning': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <div className="max-h-96 overflow-y-auto space-y-3">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className={`border rounded-lg p-3 transition-colors ${
              selectedTasks.includes(task.id) ? 'border-lab-primary bg-lab-primary/5' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={selectedTasks.includes(task.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedTasks(prev => [...prev, task.id]);
                  } else {
                    setSelectedTasks(prev => prev.filter(id => id !== task.id));
                  }
                }}
                className="mt-1 rounded border-gray-300 text-lab-primary focus:ring-lab-primary"
              />
              
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                    {task.category}
                  </span>
                  <Flag className={`w-3 h-3 ${getPriorityColor(task.priority)}`} />
                  <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  {task.estimated_time && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{task.estimated_time}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <span className="text-sm text-gray-600">
          {selectedTasks.length} of {tasks.length} tasks selected
        </span>
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="btn-outline"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedTasks)}
            disabled={selectedTasks.length === 0}
            className="btn-primary flex items-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Add Selected Tasks</span>
          </button>
        </div>
      </div>
    </div>
  );
}