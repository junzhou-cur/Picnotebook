// Project Service API Client
import {
  buildCoreUrl,
  API_ENDPOINTS,
  getAuthHeaders,
  apiCall,
} from '../config/api';
import {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  ProjectListResponse,
  ProjectSearchRequest,
  ProjectAnalytics,
  PaginationParams,
} from '../types/api';
import { authService } from './authService';

export class ProjectService {
  // Get authorization headers
  private getHeaders() {
    return getAuthHeaders(authService.getToken() || undefined);
  }

  // List projects with pagination and filters
  async listProjects(params: PaginationParams & {
    status?: string;
    priority?: string;
    is_public?: boolean;
  } = {}): Promise<ProjectListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.size) searchParams.set('size', params.size.toString());
    if (params.status) searchParams.set('status', params.status);
    if (params.priority) searchParams.set('priority', params.priority);
    if (params.is_public !== undefined) searchParams.set('is_public', params.is_public.toString());

    const url = buildCoreUrl(`${API_ENDPOINTS.projects.list}?${searchParams.toString()}`);
    return apiCall<ProjectListResponse>(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  // Get project by ID
  async getProject(id: string): Promise<Project> {
    const url = buildCoreUrl(API_ENDPOINTS.projects.get(id));
    return apiCall<Project>(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  // Create new project
  async createProject(projectData: ProjectCreateRequest): Promise<Project> {
    const url = buildCoreUrl(API_ENDPOINTS.projects.create);
    return apiCall<Project>(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(projectData),
    });
  }

  // Update project
  async updateProject(id: string, updates: ProjectUpdateRequest): Promise<Project> {
    const url = buildCoreUrl(API_ENDPOINTS.projects.update(id));
    return apiCall<Project>(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
  }

  // Delete project
  async deleteProject(id: string): Promise<void> {
    const url = buildCoreUrl(API_ENDPOINTS.projects.delete(id));
    return apiCall<void>(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
  }

  // Search projects
  async searchProjects(
    searchRequest: ProjectSearchRequest,
    params: PaginationParams = {}
  ): Promise<ProjectListResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.size) searchParams.set('size', params.size.toString());

    const url = buildCoreUrl(`${API_ENDPOINTS.projects.search}?${searchParams.toString()}`);
    return apiCall<ProjectListResponse>(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(searchRequest),
    });
  }

  // Get project analytics
  async getProjectAnalytics(id: string): Promise<ProjectAnalytics> {
    const url = buildCoreUrl(API_ENDPOINTS.projects.analytics(id));
    return apiCall<ProjectAnalytics>(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  // Archive project
  async archiveProject(id: string): Promise<Project> {
    return this.updateProject(id, { status: 'archived' });
  }

  // Activate project
  async activateProject(id: string): Promise<Project> {
    return this.updateProject(id, { status: 'active' });
  }

  // Complete project
  async completeProject(id: string): Promise<Project> {
    return this.updateProject(id, { 
      status: 'completed',
      end_date: new Date().toISOString().split('T')[0],
    });
  }

  // Add collaborator to project
  async addCollaborator(id: string, collaboratorId: string): Promise<Project> {
    const project = await this.getProject(id);
    const collaborators = [...project.collaborators, collaboratorId];
    return this.updateProject(id, { collaborators });
  }

  // Remove collaborator from project
  async removeCollaborator(id: string, collaboratorId: string): Promise<Project> {
    const project = await this.getProject(id);
    const collaborators = project.collaborators.filter(c => c !== collaboratorId);
    return this.updateProject(id, { collaborators });
  }

  // Duplicate project
  async duplicateProject(id: string, title?: string): Promise<Project> {
    const originalProject = await this.getProject(id);
    
    const duplicateData: ProjectCreateRequest = {
      title: title || `${originalProject.title} (Copy)`,
      description: originalProject.description,
      priority: originalProject.priority,
      tags: [...originalProject.tags],
      metadata: { ...originalProject.metadata },
      is_public: false, // Duplicates are private by default
    };

    return this.createProject(duplicateData);
  }

  // Get projects by status
  async getProjectsByStatus(status: string, params: PaginationParams = {}): Promise<ProjectListResponse> {
    return this.listProjects({ ...params, status });
  }

  // Get public projects
  async getPublicProjects(params: PaginationParams = {}): Promise<ProjectListResponse> {
    return this.listProjects({ ...params, is_public: true });
  }

  // Get user's active projects
  async getActiveProjects(params: PaginationParams = {}): Promise<ProjectListResponse> {
    return this.listProjects({ ...params, status: 'active' });
  }
}

// Singleton instance
export const projectService = new ProjectService();