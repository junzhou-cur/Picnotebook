// Entry Service API Client
import {
  buildCoreUrl,
  API_ENDPOINTS,
  getAuthHeaders,
  apiCall,
} from '../config/api';
import {
  Entry,
  EntryCreateRequest,
  EntryUpdateRequest,
  EntryListResponse,
  EntrySearchRequest,
  PaginationParams,
} from '../types/api';
import { authService } from './authService';

export class EntryService {
  // Get authorization headers
  private getHeaders() {
    return getAuthHeaders(authService.getToken() || undefined);
  }

  // List entries with pagination and filters
  async listEntries(params: PaginationParams & {
    project_id?: string;
    experiment_id?: string;
    entry_type?: string;
    visibility?: string;
  } = {}): Promise<EntryListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.size) searchParams.set('size', params.size.toString());
    if (params.project_id) searchParams.set('project_id', params.project_id);
    if (params.experiment_id) searchParams.set('experiment_id', params.experiment_id);
    if (params.entry_type) searchParams.set('entry_type', params.entry_type);
    if (params.visibility) searchParams.set('visibility', params.visibility);

    const url = buildCoreUrl(`${API_ENDPOINTS.entries.list}?${searchParams.toString()}`);
    return apiCall<EntryListResponse>(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  // Get entry by ID
  async getEntry(id: string): Promise<Entry> {
    const url = buildCoreUrl(API_ENDPOINTS.entries.get(id));
    return apiCall<Entry>(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  // Create new entry
  async createEntry(entryData: EntryCreateRequest): Promise<Entry> {
    const url = buildCoreUrl(API_ENDPOINTS.entries.create);
    return apiCall<Entry>(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(entryData),
    });
  }

  // Update entry
  async updateEntry(id: string, updates: EntryUpdateRequest): Promise<Entry> {
    const url = buildCoreUrl(API_ENDPOINTS.entries.update(id));
    return apiCall<Entry>(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
  }

  // Delete entry
  async deleteEntry(id: string): Promise<void> {
    const url = buildCoreUrl(API_ENDPOINTS.entries.delete(id));
    return apiCall<void>(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
  }

  // Search entries
  async searchEntries(
    searchRequest: EntrySearchRequest,
    params: PaginationParams = {}
  ): Promise<EntryListResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.size) searchParams.set('size', params.size.toString());

    const url = buildCoreUrl(`${API_ENDPOINTS.entries.search}?${searchParams.toString()}`);
    return apiCall<EntryListResponse>(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(searchRequest),
    });
  }

  // Get entries by project
  async getEntriesByProject(projectId: string, params: PaginationParams = {}): Promise<EntryListResponse> {
    return this.listEntries({ ...params, project_id: projectId });
  }

  // Get entries by experiment
  async getEntriesByExperiment(experimentId: string, params: PaginationParams = {}): Promise<EntryListResponse> {
    return this.listEntries({ ...params, experiment_id: experimentId });
  }

  // Get entries by type
  async getEntriesByType(entryType: string, params: PaginationParams = {}): Promise<EntryListResponse> {
    return this.listEntries({ ...params, entry_type: entryType });
  }

  // Get public entries
  async getPublicEntries(params: PaginationParams = {}): Promise<EntryListResponse> {
    return this.listEntries({ ...params, visibility: 'public' });
  }

  // Get team entries
  async getTeamEntries(params: PaginationParams = {}): Promise<EntryListResponse> {
    return this.listEntries({ ...params, visibility: 'team' });
  }

  // Create observation entry
  async createObservation(
    projectId: string,
    experimentId: string | undefined,
    observation: {
      title: string;
      observations: string;
      entry_date?: string;
      tags?: string[];
      metadata?: Record<string, any>;
    }
  ): Promise<Entry> {
    const entryData: EntryCreateRequest = {
      project_id: projectId,
      experiment_id: experimentId,
      title: observation.title,
      entry_type: 'observation',
      entry_date: observation.entry_date || new Date().toISOString().split('T')[0],
      observations: observation.observations,
      tags: observation.tags || [],
      metadata: observation.metadata || {},
    };

    return this.createEntry(entryData);
  }

  // Create measurement entry
  async createMeasurement(
    projectId: string,
    experimentId: string | undefined,
    measurement: {
      title: string;
      results: string;
      entry_date?: string;
      tags?: string[];
      metadata?: Record<string, any>;
    }
  ): Promise<Entry> {
    const entryData: EntryCreateRequest = {
      project_id: projectId,
      experiment_id: experimentId,
      title: measurement.title,
      entry_type: 'measurement',
      entry_date: measurement.entry_date || new Date().toISOString().split('T')[0],
      results: measurement.results,
      tags: measurement.tags || [],
      metadata: measurement.metadata || {},
    };

    return this.createEntry(entryData);
  }

  // Create note entry
  async createNote(
    projectId: string,
    experimentId: string | undefined,
    note: {
      title: string;
      content: string;
      entry_date?: string;
      tags?: string[];
      metadata?: Record<string, any>;
    }
  ): Promise<Entry> {
    const entryData: EntryCreateRequest = {
      project_id: projectId,
      experiment_id: experimentId,
      title: note.title,
      entry_type: 'note',
      entry_date: note.entry_date || new Date().toISOString().split('T')[0],
      content: note.content,
      tags: note.tags || [],
      metadata: note.metadata || {},
    };

    return this.createEntry(entryData);
  }

  // Create protocol entry
  async createProtocol(
    projectId: string,
    experimentId: string | undefined,
    protocol: {
      title: string;
      content: string;
      entry_date?: string;
      tags?: string[];
      metadata?: Record<string, any>;
    }
  ): Promise<Entry> {
    const entryData: EntryCreateRequest = {
      project_id: projectId,
      experiment_id: experimentId,
      title: protocol.title,
      entry_type: 'protocol',
      entry_date: protocol.entry_date || new Date().toISOString().split('T')[0],
      content: protocol.content,
      tags: protocol.tags || [],
      metadata: protocol.metadata || {},
    };

    return this.createEntry(entryData);
  }

  // Duplicate entry
  async duplicateEntry(id: string, title?: string): Promise<Entry> {
    const originalEntry = await this.getEntry(id);
    
    const duplicateData: EntryCreateRequest = {
      project_id: originalEntry.project_id,
      experiment_id: originalEntry.experiment_id,
      title: title || `${originalEntry.title} (Copy)`,
      content: originalEntry.content,
      entry_type: originalEntry.entry_type,
      entry_date: new Date().toISOString().split('T')[0], // Use today's date
      tags: [...originalEntry.tags],
      metadata: { ...originalEntry.metadata },
      observations: originalEntry.observations,
      results: originalEntry.results,
      notes: originalEntry.notes,
      visibility: originalEntry.visibility,
    };

    return this.createEntry(duplicateData);
  }

  // Change entry visibility
  async changeVisibility(id: string, visibility: 'private' | 'team' | 'public'): Promise<Entry> {
    return this.updateEntry(id, { visibility });
  }

  // Add tag to entry
  async addTag(id: string, tag: string): Promise<Entry> {
    const entry = await this.getEntry(id);
    const tags = [...entry.tags, tag];
    return this.updateEntry(id, { tags });
  }

  // Remove tag from entry
  async removeTag(id: string, tag: string): Promise<Entry> {
    const entry = await this.getEntry(id);
    const tags = entry.tags.filter(t => t !== tag);
    return this.updateEntry(id, { tags });
  }

  // Get recent entries
  async getRecentEntries(params: PaginationParams = {}): Promise<EntryListResponse> {
    // Recent entries are sorted by creation date by default
    return this.listEntries(params);
  }

  // Get entries by date range
  async getEntriesByDateRange(
    dateFrom: string,
    dateTo: string,
    params: PaginationParams = {}
  ): Promise<EntryListResponse> {
    return this.searchEntries({
      date_from: dateFrom,
      date_to: dateTo,
    }, params);
  }

  // Get entry statistics
  async getEntryStats(): Promise<{
    total: number;
    by_type: Record<string, number>;
    by_visibility: Record<string, number>;
    recent_count: number;
  }> {
    // This would typically be a dedicated endpoint, but we can simulate it
    const allEntries = await this.listEntries({ size: 1000 });
    const entries = allEntries.entries;
    
    const byType: Record<string, number> = {};
    const byVisibility: Record<string, number> = {};
    
    entries.forEach(entry => {
      byType[entry.entry_type] = (byType[entry.entry_type] || 0) + 1;
      byVisibility[entry.visibility] = (byVisibility[entry.visibility] || 0) + 1;
    });

    // Count recent entries (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentCount = entries.filter(entry => 
      new Date(entry.created_at) > oneWeekAgo
    ).length;
    
    return {
      total: entries.length,
      by_type: byType,
      by_visibility: byVisibility,
      recent_count: recentCount,
    };
  }
}

// Singleton instance
export const entryService = new EntryService();