// API Services Index
// Export all services for easy importing

export { authService, AuthService } from './authService';
export { projectService, ProjectService } from './projectService';
export { experimentService, ExperimentService } from './experimentService';
export { entryService, EntryService } from './entryService';
export { fileService, FileService } from './fileService';

// Re-export API configuration and utilities
export * from '../config/api';
export * from '../types/api';

// Composite service for common operations
import { authService } from './authService';
import { projectService } from './projectService';
import { experimentService } from './experimentService';
import { entryService } from './entryService';
import { fileService } from './fileService';

export class PicNotebookAPI {
  public auth = authService;
  public projects = projectService;
  public experiments = experimentService;
  public entries = entryService;
  public files = fileService;

  // Initialization method
  async initialize(): Promise<boolean> {
    try {
      // Check if user is authenticated
      if (this.auth.isAuthenticated()) {
        // Verify token is still valid
        await this.auth.checkAuth();
        return true;
      }
      return false;
    } catch (error) {
      // Token might be expired, clear it
      this.auth.setToken(null);
      return false;
    }
  }

  // Health check for all services
  async healthCheck(): Promise<{
    auth: boolean;
    core: boolean;
    overall: boolean;
  }> {
    const results = {
      auth: false,
      core: false,
      overall: false,
    };

    try {
      // Check auth service
      await fetch(`${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:8001'}/health`);
      results.auth = true;
    } catch {
      // Auth service is down
    }

    try {
      // Check core service
      await fetch(`${process.env.NEXT_PUBLIC_CORE_SERVICE_URL || 'http://localhost:8000'}/api/v1/monitoring/health`);
      results.core = true;
    } catch {
      // Core service is down
    }

    results.overall = results.auth && results.core;
    return results;
  }

  // Quick stats dashboard data
  async getDashboardStats(): Promise<{
    projects: {
      total: number;
      active: number;
    };
    experiments: {
      total: number;
      in_progress: number;
      completed: number;
    };
    entries: {
      total: number;
      recent_count: number;
    };
    files: {
      total: number;
      total_size: number;
    };
  }> {
    const [projectStats, experimentStats, entryStats, fileStats] = await Promise.all([
      this.projects.getActiveProjects({ size: 1 }).then(r => ({ total: r.total, active: r.total })),
      this.experiments.getExperimentStats(),
      this.entries.getEntryStats(),
      this.files.getFileStats(),
    ]);

    return {
      projects: projectStats,
      experiments: experimentStats,
      entries: entryStats,
      files: fileStats,
    };
  }

  // Search across all entities
  async globalSearch(query: string, filters?: {
    types?: ('project' | 'experiment' | 'entry' | 'file')[];
    project_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<{
    projects: any[];
    experiments: any[];
    entries: any[];
    files: any[];
    total: number;
  }> {
    const searchPromises: Promise<any>[] = [];
    const types = filters?.types || ['project', 'experiment', 'entry', 'file'];

    if (types.includes('project')) {
      searchPromises.push(
        this.projects.searchProjects({ query }, { size: 10 })
          .then(r => r.projects)
          .catch(() => [])
      );
    } else {
      searchPromises.push(Promise.resolve([]));
    }

    if (types.includes('experiment')) {
      searchPromises.push(
        this.experiments.searchExperiments({ 
          query,
          project_id: filters?.project_id,
        }, { size: 10 })
          .then(r => r.experiments)
          .catch(() => [])
      );
    } else {
      searchPromises.push(Promise.resolve([]));
    }

    if (types.includes('entry')) {
      searchPromises.push(
        this.entries.searchEntries({ 
          query,
          project_id: filters?.project_id,
          date_from: filters?.date_from,
          date_to: filters?.date_to,
        }, { size: 10 })
          .then(r => r.entries)
          .catch(() => [])
      );
    } else {
      searchPromises.push(Promise.resolve([]));
    }

    if (types.includes('file')) {
      searchPromises.push(
        this.files.searchFiles({ 
          query,
          created_after: filters?.date_from,
          created_before: filters?.date_to,
        }, { size: 10 })
          .then(r => r.files)
          .catch(() => [])
      );
    } else {
      searchPromises.push(Promise.resolve([]));
    }

    const [projects, experiments, entries, files] = await Promise.all(searchPromises);

    return {
      projects,
      experiments,
      entries,
      files,
      total: projects.length + experiments.length + entries.length + files.length,
    };
  }

  // Bulk operations
  async bulkDeleteProjects(projectIds: string[]): Promise<void> {
    await Promise.all(
      projectIds.map(id => this.projects.deleteProject(id))
    );
  }

  async bulkDeleteExperiments(experimentIds: string[]): Promise<void> {
    await Promise.all(
      experimentIds.map(id => this.experiments.deleteExperiment(id))
    );
  }

  async bulkDeleteEntries(entryIds: string[]): Promise<void> {
    await Promise.all(
      entryIds.map(id => this.entries.deleteEntry(id))
    );
  }

  async bulkDeleteFiles(fileIds: string[]): Promise<void> {
    await Promise.all(
      fileIds.map(id => this.files.deleteFile(id))
    );
  }

  // Backup user data
  async exportUserData(): Promise<{
    projects: any[];
    experiments: any[];
    entries: any[];
    files: any[];
    exported_at: string;
  }> {
    const [projects, experiments, entries, files] = await Promise.all([
      this.projects.listProjects({ size: 1000 }).then(r => r.projects),
      this.experiments.listExperiments({ size: 1000 }).then(r => r.experiments),
      this.entries.listEntries({ size: 1000 }).then(r => r.entries),
      this.files.listFiles({ size: 1000 }).then(r => r.files),
    ]);

    return {
      projects,
      experiments,
      entries,
      files,
      exported_at: new Date().toISOString(),
    };
  }
}

// Singleton API instance
export const api = new PicNotebookAPI();