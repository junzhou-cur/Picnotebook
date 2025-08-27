import type { 
  Project, 
  LabNote, 
  ProcessingJob, 
  Sequence,
  Amplicon,
  ApiResponse, 
  ProcessImageRequest, 
  ProcessImageResponse,
  UploadResponse 
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'picnotebook.com' || window.location.hostname === 'www.picnotebook.com')
    ? 'https://picnotebook.com' 
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005');

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token');
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  } else {
    // Demo mode - add a demo token for development
    headers.set('Authorization', 'Bearer demo-token');
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // In demo mode, just log the error and continue
    console.log('Auth failed, continuing in demo mode');
    // Don't redirect to login in demo mode
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error || `HTTP ${response.status}`,
      response.status,
      errorData
    );
  }

  return response;
}

export const api = {
  // Dashboard
  async getDashboardStats(): Promise<{stats: {total_notes: number; projects: number; processing: number}}> {
    const response = await fetchWithAuth('/api/dashboard/stats');
    return await response.json();
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    const response = await fetchWithAuth('/api/projects');
    const data = await response.json();
    return data.projects || [];
  },

  async createProject(projectData: {
    name: string;
    description?: string;
    hypothesis?: string;
    purpose?: string;
    future_plan?: string;
  }): Promise<Project> {
    const response = await fetchWithAuth('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
    
    const data = await response.json();
    if (data.success) {
      return data.project;
    }
    
    throw new ApiError(data.error || 'Project creation failed', response.status);
  },

  async getProject(id: number): Promise<Project> {
    const response = await fetchWithAuth(`/api/projects/${id}`);
    const data = await response.json();
    return data.project;
  },

  async updateProject(id: number, projectData: {
    name?: string;
    description?: string;
    hypothesis?: string;
    purpose?: string;
    current_progress?: string;
    future_plan?: string;
    status?: string;
  }): Promise<Project> {
    const response = await fetchWithAuth(`/api/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
    
    const data = await response.json();
    if (data.success) {
      return data.project;
    }
    
    throw new ApiError(data.error || 'Project update failed', response.status);
  },

  async deleteProject(id: number): Promise<void> {
    const response = await fetchWithAuth(`/api/projects/${id}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    if (!data.success) {
      throw new ApiError(data.error || 'Project deletion failed', response.status);
    }
  },

  // Project Collaboration
  async getProjectMembers(projectId: number): Promise<any[]> {
    const response = await fetchWithAuth(`/api/projects/${projectId}/members`);
    const data = await response.json();
    return data.members || [];
  },

  async addProjectMember(projectId: number, memberData: {
    email: string;
    role: 'admin' | 'member' | 'viewer';
  }): Promise<any> {
    const response = await fetchWithAuth(`/api/projects/${projectId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    });
    
    const data = await response.json();
    if (data.success) {
      return data.member;
    }
    
    throw new ApiError(data.error || 'Failed to add member', response.status);
  },

  async updateProjectMember(projectId: number, memberId: number, role: string): Promise<any> {
    const response = await fetchWithAuth(`/api/projects/${projectId}/members/${memberId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    });
    
    const data = await response.json();
    if (data.success) {
      return data.member;
    }
    
    throw new ApiError(data.error || 'Failed to update member role', response.status);
  },

  async removeProjectMember(projectId: number, memberId: number): Promise<void> {
    const response = await fetchWithAuth(`/api/projects/${projectId}/members/${memberId}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    if (!data.success) {
      throw new ApiError(data.error || 'Failed to remove member', response.status);
    }
  },

  async searchUsers(query: string): Promise<{users: any[], total_users: number}> {
    const response = await fetchWithAuth(`/api/users/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    return {
      users: data.users || [],
      total_users: data.total_users || 0
    };
  },

  async getAvailableUsers(projectId?: number): Promise<{users: any[], total_users: number, available_count: number}> {
    const url = projectId 
      ? `/api/users/available?project_id=${projectId}`
      : '/api/users/available';
    const response = await fetchWithAuth(url);
    const data = await response.json();
    return {
      users: data.users || [],
      total_users: data.total_users || 0,
      available_count: data.available_count || 0
    };
  },

  // Excel Export
  async exportProjectExcel(projectId: number): Promise<Blob> {
    const response = await fetchWithAuth(`/api/projects/${projectId}/export/excel`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || 'Export failed',
        response.status,
        errorData
      );
    }
    
    return await response.blob();
  },

  // Protocol Management
  async getProjectProtocols(projectId: number): Promise<any[]> {
    const response = await fetchWithAuth(`/api/projects/${projectId}/protocols`);
    const data = await response.json();
    return data.protocols || [];
  },

  async createProtocol(projectId: number, protocolData: {
    name: string;
    content: string;
  }): Promise<any> {
    const response = await fetchWithAuth(`/api/projects/${projectId}/protocols`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(protocolData),
    });
    
    const data = await response.json();
    if (data.success) {
      return data.protocol;
    }
    
    throw new ApiError(data.error || 'Failed to create protocol', response.status);
  },

  async getProtocol(protocolId: number): Promise<any> {
    const response = await fetchWithAuth(`/api/protocols/${protocolId}`);
    const data = await response.json();
    return data.protocol;
  },

  async updateProtocol(protocolId: number, protocolData: {
    name?: string;
    content?: string;
    change_description?: string;
    lab_note_id?: number;
  }): Promise<any> {
    const response = await fetchWithAuth(`/api/protocols/${protocolId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(protocolData),
    });
    
    const data = await response.json();
    if (data.success) {
      return data.protocol;
    }
    
    throw new ApiError(data.error || 'Failed to update protocol', response.status);
  },

  async deleteProtocol(protocolId: number): Promise<void> {
    const response = await fetchWithAuth(`/api/protocols/${protocolId}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    if (!data.success) {
      throw new ApiError(data.error || 'Failed to delete protocol', response.status);
    }
  },

  // Protocol Export and Sharing
  async exportProtocolPDF(protocolId: number): Promise<Blob> {
    const response = await fetchWithAuth(`/api/protocols/${protocolId}/export/pdf`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || 'PDF export failed',
        response.status,
        errorData
      );
    }
    
    return await response.blob();
  },

  async shareProtocol(protocolId: number, shareData: {
    email: string;
    message?: string;
    include_pdf?: boolean;
  }): Promise<any> {
    const response = await fetchWithAuth(`/api/protocols/${protocolId}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shareData),
    });
    
    const data = await response.json();
    if (data.success) {
      return data;
    }
    
    throw new ApiError(data.error || 'Failed to share protocol', response.status);
  },

  // Project Progress
  async updateProjectProgress(projectId: number, progressPercentage: number): Promise<any> {
    const response = await fetchWithAuth(`/api/projects/${projectId}/progress`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ progress_percentage: progressPercentage }),
    });
    
    const data = await response.json();
    if (data.success) {
      return data.project;
    }
    
    throw new ApiError(data.error || 'Failed to update progress', response.status);
  },

  // Lab Notes - Updated to support query parameters and provide fallback
  async getNotes(params?: { project_id?: number | null; search?: string }): Promise<LabNote[]> {
    try {
      if (params?.project_id) {
        const response = await fetchWithAuth(`/api/notes/${params.project_id}`);
        const data = await response.json();
        return data.notes || [];
      } else {
        // Get all notes when no project is selected
        const response = await fetchWithAuth('/api/notes');
        const data = await response.json();
        return data.notes || [];
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      return [];
    }
  },

  async getLabNotes(projectId: number): Promise<LabNote[]> {
    const response = await fetchWithAuth(`/api/notes/${projectId}`);
    const data = await response.json();
    return data.notes || [];
  },

  async deleteNote(noteId: number): Promise<void> {
    const response = await fetchWithAuth(`/api/notes/${noteId}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    if (!data.success) {
      throw new ApiError(data.error || 'Failed to delete note', response.status);
    }
  },

  // Image Upload and Processing
  // Toolbox API methods
  async get(url: string): Promise<Response> {
    return fetchWithAuth(url);
  },

  async post(url: string, data: any): Promise<Response> {
    return fetchWithAuth(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },

  async uploadImage(file: File, projectId?: number): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add API key to form data if available
    const apiKey = localStorage.getItem('xai_api_key');
    if (apiKey) {
      formData.append('api_key', apiKey);
    }
    
    // Use project-specific upload endpoint if projectId provided, otherwise use general upload
    const endpoint = projectId ? `/api/projects/${projectId}/upload` : '/api/upload';
    
    const response = await fetchWithAuth(endpoint, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.error || 'Upload failed', response.status, errorData);
    }
    
    return await response.json();
  },

  async processImage(request: ProcessImageRequest): Promise<ProcessImageResponse> {
    const response = await fetchWithAuth('/process_image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    return await response.json();
  },

  // Advanced Search API
  async search(params: {
    q?: string;
    project_id?: number;
    status?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    notes: LabNote[];
    total: number;
    facets: {
      projects: Array<{id: number; name: string; count: number}>;
      statuses: Array<{key: string; label: string; count: number}>;
      categories: Array<{key: string; label: string; count: number}>;
    };
    query: string;
    filters_applied: any;
  }> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    const response = await fetchWithAuth(`/api/search?${searchParams.toString()}`);
    return await response.json();
  },

  // Processing Jobs - Mock implementation for now
  async getProcessingJobs(): Promise<ProcessingJob[]> {
    // Mock implementation - in a real app, this would fetch from /api/jobs
    return [];
  },

  async getJobStatus(jobId: string): Promise<ProcessingJob> {
    const response = await fetchWithAuth(`/job_status/${jobId}`);
    return await response.json();
  },

  // Reports
  async generateReport(projectId: number, apiKey: string): Promise<{ job_id: string }> {
    const response = await fetchWithAuth(`/generate_report_async/${projectId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ api_key: apiKey }),
    });

    return await response.json();
  },

  // User Info
  async getCurrentUser() {
    const response = await fetchWithAuth('/auth/api/me');
    return await response.json();
  },

  // Sequence Management
  async getSequences(projectId: number): Promise<Sequence[]> {
    const response = await fetchWithAuth(`/api/projects/${projectId}/sequences`);
    const data = await response.json();
    return data.sequences || [];
  },

  async createSequence(sequenceData: {
    name: string;
    sequence_type: string;
    sequence_data?: string;
    description?: string;
    project_id: number;
  }): Promise<Sequence> {
    const response = await fetchWithAuth('/api/sequences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sequenceData),
    });
    
    const data = await response.json();
    if (data.success) {
      return data.sequence;
    }
    
    throw new ApiError(data.error || 'Failed to create sequence', response.status);
  },

  async updateSequence(sequenceId: number, sequenceData: any): Promise<Sequence> {
    const response = await fetchWithAuth(`/api/sequences/${sequenceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sequenceData),
    });
    
    const data = await response.json();
    if (data.success) {
      return data.sequence;
    }
    
    throw new ApiError(data.error || 'Failed to update sequence', response.status);
  },

  async deleteSequence(sequenceId: number): Promise<void> {
    const response = await fetchWithAuth(`/api/sequences/${sequenceId}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    if (!data.success) {
      throw new ApiError(data.error || 'Failed to delete sequence', response.status);
    }
  },

  async uploadSequence(formData: FormData): Promise<Sequence> {
    const response = await fetchWithAuth('/api/sequences/upload', {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    if (data.success) {
      return data.sequence;
    }
    
    throw new ApiError(data.error || 'Failed to upload sequence', response.status);
  },

  // Amplicon Management
  async getAmplicons(projectId: number): Promise<Amplicon[]> {
    const response = await fetchWithAuth(`/api/projects/${projectId}/amplicons`);
    const data = await response.json();
    return data.amplicons || [];
  },

  async createAmplicon(ampliconData: {
    name: string;
    sequence_id?: number;
    project_id: number;
    primer_forward?: string;
    primer_reverse?: string;
    target_region?: string;
    expected_size?: number;
    amplicon_sequence?: string;
    annealing_temp?: number;
    cycle_count?: number;
  }): Promise<Amplicon> {
    const response = await fetchWithAuth('/api/amplicons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ampliconData),
    });
    
    const data = await response.json();
    if (data.success) {
      return data.amplicon;
    }
    
    throw new ApiError(data.error || 'Failed to create amplicon', response.status);
  },

  async updateAmplicon(ampliconId: number, ampliconData: any): Promise<Amplicon> {
    const response = await fetchWithAuth(`/api/amplicons/${ampliconId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ampliconData),
    });
    
    const data = await response.json();
    if (data.success) {
      return data.amplicon;
    }
    
    throw new ApiError(data.error || 'Failed to update amplicon', response.status);
  },

  async deleteAmplicon(ampliconId: number): Promise<void> {
    const response = await fetchWithAuth(`/api/amplicons/${ampliconId}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    if (!data.success) {
      throw new ApiError(data.error || 'Failed to delete amplicon', response.status);
    }
  },

  // Milestones
  async getMilestones(projectId: number): Promise<any[]> {
    const response = await fetchWithAuth(`/api/projects/${projectId}/milestones`);
    const data = await response.json();
    return data.milestones || [];
  },

  async createMilestone(projectId: number, milestoneData: {
    title: string;
    description?: string;
    priority?: 'high' | 'medium' | 'low';
    assignee?: string;
    due_date?: string;
    notes?: string;
    dependencies?: string[];
  }): Promise<any> {
    const response = await fetchWithAuth(`/api/projects/${projectId}/milestones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(milestoneData),
    });
    
    const data = await response.json();
    if (data.success) {
      return data.milestone;
    }
    
    throw new ApiError(data.error || 'Failed to create milestone', response.status);
  },

  async updateMilestone(milestoneId: number, milestoneData: {
    title?: string;
    description?: string;
    priority?: 'high' | 'medium' | 'low';
    assignee?: string;
    due_date?: string;
    notes?: string;
    status?: string;
    dependencies?: string[];
  }): Promise<any> {
    const response = await fetchWithAuth(`/api/milestones/${milestoneId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(milestoneData),
    });
    
    const data = await response.json();
    if (data.success) {
      return data.milestone;
    }
    
    throw new ApiError(data.error || 'Failed to update milestone', response.status);
  },

  async deleteMilestone(milestoneId: number): Promise<void> {
    const response = await fetchWithAuth(`/api/milestones/${milestoneId}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    if (!data.success) {
      throw new ApiError(data.error || 'Failed to delete milestone', response.status);
    }
  },

  // Tasks
  async getTasks(milestoneId: number): Promise<any[]> {
    const response = await fetchWithAuth(`/api/milestones/${milestoneId}/tasks`);
    const data = await response.json();
    return data.tasks || [];
  },

  async createTask(milestoneId: number, taskData: {
    title: string;
    assignee?: string;
    due_date?: string;
    notes?: string;
  }): Promise<any> {
    const response = await fetchWithAuth(`/api/milestones/${milestoneId}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    
    const data = await response.json();
    if (data.success) {
      return data.task;
    }
    
    throw new ApiError(data.error || 'Failed to create task', response.status);
  },

  async updateTask(taskId: number, taskData: {
    title?: string;
    assignee?: string;
    due_date?: string;
    notes?: string;
    completed?: boolean;
  }): Promise<{task: any, milestone: any}> {
    const response = await fetchWithAuth(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    
    const data = await response.json();
    if (data.success) {
      return {
        task: data.task,
        milestone: data.milestone
      };
    }
    
    throw new ApiError(data.error || 'Failed to update task', response.status);
  },

  async deleteTask(taskId: number): Promise<{milestone: any}> {
    const response = await fetchWithAuth(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    if (data.success) {
      return {
        milestone: data.milestone
      };
    }
    
    throw new ApiError(data.error || 'Failed to delete task', response.status);
  },
};

// React Query helpers
export const queryKeys = {
  projects: ['projects'] as const,
  project: (id: number) => ['projects', id] as const,
  labNotes: (projectId: number) => ['labNotes', projectId] as const,
  jobStatus: (jobId: string) => ['jobStatus', jobId] as const,
  milestones: (projectId: number) => ['milestones', projectId] as const,
  tasks: (milestoneId: number) => ['tasks', milestoneId] as const,
  currentUser: ['currentUser'] as const,
};