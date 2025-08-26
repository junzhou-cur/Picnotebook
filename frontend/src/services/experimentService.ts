// Experiment Service API Client
import {
  buildCoreUrl,
  API_ENDPOINTS,
  getAuthHeaders,
  apiCall,
} from '../config/api';
import {
  Experiment,
  ExperimentCreateRequest,
  ExperimentUpdateRequest,
  ExperimentListResponse,
  ExperimentSearchRequest,
  PaginationParams,
} from '../types/api';
import { authService } from './authService';

export class ExperimentService {
  // Get authorization headers
  private getHeaders() {
    return getAuthHeaders(authService.getToken() || undefined);
  }

  // List experiments with pagination and filters
  async listExperiments(params: PaginationParams & {
    project_id?: string;
    status?: string;
    priority?: string;
  } = {}): Promise<ExperimentListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.size) searchParams.set('size', params.size.toString());
    if (params.project_id) searchParams.set('project_id', params.project_id);
    if (params.status) searchParams.set('status', params.status);
    if (params.priority) searchParams.set('priority', params.priority);

    const url = buildCoreUrl(`${API_ENDPOINTS.experiments.list}?${searchParams.toString()}`);
    return apiCall<ExperimentListResponse>(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  // Get experiment by ID
  async getExperiment(id: string): Promise<Experiment> {
    const url = buildCoreUrl(API_ENDPOINTS.experiments.get(id));
    return apiCall<Experiment>(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  // Create new experiment
  async createExperiment(experimentData: ExperimentCreateRequest): Promise<Experiment> {
    const url = buildCoreUrl(API_ENDPOINTS.experiments.create);
    return apiCall<Experiment>(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(experimentData),
    });
  }

  // Update experiment
  async updateExperiment(id: string, updates: ExperimentUpdateRequest): Promise<Experiment> {
    const url = buildCoreUrl(API_ENDPOINTS.experiments.update(id));
    return apiCall<Experiment>(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
  }

  // Delete experiment
  async deleteExperiment(id: string): Promise<void> {
    const url = buildCoreUrl(API_ENDPOINTS.experiments.delete(id));
    return apiCall<void>(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
  }

  // Search experiments
  async searchExperiments(
    searchRequest: ExperimentSearchRequest,
    params: PaginationParams = {}
  ): Promise<ExperimentListResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.size) searchParams.set('size', params.size.toString());

    const url = buildCoreUrl(`${API_ENDPOINTS.experiments.search}?${searchParams.toString()}`);
    return apiCall<ExperimentListResponse>(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(searchRequest),
    });
  }

  // Get experiments by project
  async getExperimentsByProject(projectId: string, params: PaginationParams = {}): Promise<ExperimentListResponse> {
    return this.listExperiments({ ...params, project_id: projectId });
  }

  // Start experiment
  async startExperiment(id: string): Promise<Experiment> {
    return this.updateExperiment(id, {
      status: 'in_progress',
      started_at: new Date().toISOString(),
    });
  }

  // Complete experiment
  async completeExperiment(id: string, results?: string): Promise<Experiment> {
    const updates: ExperimentUpdateRequest = {
      status: 'completed',
      completed_at: new Date().toISOString(),
    };

    if (results) {
      updates.expected_outcomes = results;
    }

    return this.updateExperiment(id, updates);
  }

  // Cancel experiment
  async cancelExperiment(id: string, reason?: string): Promise<Experiment> {
    const updates: ExperimentUpdateRequest = {
      status: 'cancelled',
    };

    if (reason) {
      updates.metadata = { cancellation_reason: reason };
    }

    return this.updateExperiment(id, updates);
  }

  // Put experiment on hold
  async holdExperiment(id: string, reason?: string): Promise<Experiment> {
    const updates: ExperimentUpdateRequest = {
      status: 'on_hold',
    };

    if (reason) {
      updates.metadata = { hold_reason: reason };
    }

    return this.updateExperiment(id, updates);
  }

  // Resume experiment from hold
  async resumeExperiment(id: string): Promise<Experiment> {
    return this.updateExperiment(id, { status: 'in_progress' });
  }

  // Duplicate experiment
  async duplicateExperiment(id: string, title?: string, projectId?: string): Promise<Experiment> {
    const originalExperiment = await this.getExperiment(id);
    
    const duplicateData: ExperimentCreateRequest = {
      project_id: projectId || originalExperiment.project_id,
      title: title || `${originalExperiment.title} (Copy)`,
      description: originalExperiment.description,
      protocol: originalExperiment.protocol,
      priority: originalExperiment.priority,
      tags: [...originalExperiment.tags],
      metadata: { ...originalExperiment.metadata },
      conditions: { ...originalExperiment.conditions },
      expected_outcomes: originalExperiment.expected_outcomes,
      status: 'planned', // Reset status for duplicate
    };

    return this.createExperiment(duplicateData);
  }

  // Get active experiments
  async getActiveExperiments(params: PaginationParams = {}): Promise<ExperimentListResponse> {
    return this.listExperiments({ ...params, status: 'in_progress' });
  }

  // Get planned experiments
  async getPlannedExperiments(params: PaginationParams = {}): Promise<ExperimentListResponse> {
    return this.listExperiments({ ...params, status: 'planned' });
  }

  // Get completed experiments
  async getCompletedExperiments(params: PaginationParams = {}): Promise<ExperimentListResponse> {
    return this.listExperiments({ ...params, status: 'completed' });
  }

  // Update experiment conditions
  async updateConditions(id: string, conditions: Record<string, any>): Promise<Experiment> {
    return this.updateExperiment(id, { conditions });
  }

  // Add tag to experiment
  async addTag(id: string, tag: string): Promise<Experiment> {
    const experiment = await this.getExperiment(id);
    const tags = [...experiment.tags, tag];
    return this.updateExperiment(id, { tags });
  }

  // Remove tag from experiment
  async removeTag(id: string, tag: string): Promise<Experiment> {
    const experiment = await this.getExperiment(id);
    const tags = experiment.tags.filter(t => t !== tag);
    return this.updateExperiment(id, { tags });
  }

  // Get experiment statistics
  async getExperimentStats(): Promise<{
    total: number;
    planned: number;
    in_progress: number;
    completed: number;
    cancelled: number;
    on_hold: number;
  }> {
    // This would typically be a dedicated endpoint, but we can simulate it
    const allExperiments = await this.listExperiments({ size: 1000 });
    const experiments = allExperiments.experiments;
    
    return {
      total: experiments.length,
      planned: experiments.filter(e => e.status === 'planned').length,
      in_progress: experiments.filter(e => e.status === 'in_progress').length,
      completed: experiments.filter(e => e.status === 'completed').length,
      cancelled: experiments.filter(e => e.status === 'cancelled').length,
      on_hold: experiments.filter(e => e.status === 'on_hold').length,
    };
  }
}

// Singleton instance
export const experimentService = new ExperimentService();