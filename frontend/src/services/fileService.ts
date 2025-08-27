// File Service API Client
import {
  buildCoreUrl,
  API_ENDPOINTS,
  getAuthHeaders,
  getFileUploadHeaders,
  apiCall,
} from '../config/api';
import {
  FileEntity,
  FileUpdateRequest,
  FileListResponse,
  FileSearchRequest,
  FileAssociation,
  FileAssociationRequest,
  PaginationParams,
} from '../types/api';
import { authService } from './authService';

export class FileService {
  // Get authorization headers
  private getHeaders() {
    return getAuthHeaders(authService.getToken() || undefined);
  }

  // Get file upload headers
  private getUploadHeaders() {
    return getFileUploadHeaders(authService.getToken() || undefined);
  }

  // List files with pagination and filters
  async listFiles(params: PaginationParams & {
    file_type?: string;
    associated_type?: string;
    associated_id?: string;
  } = {}): Promise<FileListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.size) searchParams.set('size', params.size.toString());
    if (params.file_type) searchParams.set('file_type', params.file_type);
    if (params.associated_type) searchParams.set('associated_type', params.associated_type);
    if (params.associated_id) searchParams.set('associated_id', params.associated_id);

    const url = buildCoreUrl(`${API_ENDPOINTS.files.list}?${searchParams.toString()}`);
    return apiCall<FileListResponse>(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  // Get file by ID
  async getFile(id: string): Promise<FileEntity> {
    const url = buildCoreUrl(API_ENDPOINTS.files.get(id));
    return apiCall<FileEntity>(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  // Upload file
  async uploadFile(
    file: File,
    options: {
      description?: string;
      tags?: string[];
      associated_type?: string;
      associated_id?: string;
    } = {}
  ): Promise<FileEntity> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options.description) {
      formData.append('description', options.description);
    }
    
    if (options.tags) {
      formData.append('tags', JSON.stringify(options.tags));
    }
    
    if (options.associated_type) {
      formData.append('associated_type', options.associated_type);
    }
    
    if (options.associated_id) {
      formData.append('associated_id', options.associated_id);
    }

    const url = buildCoreUrl(API_ENDPOINTS.files.upload);
    return apiCall<FileEntity>(url, {
      method: 'POST',
      headers: this.getUploadHeaders(),
      body: formData,
    });
  }

  // Upload multiple files
  async uploadFiles(
    files: File[],
    options: {
      description?: string;
      tags?: string[];
      associated_type?: string;
      associated_id?: string;
    } = {}
  ): Promise<FileEntity[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, options));
    return Promise.all(uploadPromises);
  }

  // Update file metadata
  async updateFile(id: string, updates: FileUpdateRequest): Promise<FileEntity> {
    const url = buildCoreUrl(API_ENDPOINTS.files.update(id));
    return apiCall<FileEntity>(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
  }

  // Delete file
  async deleteFile(id: string): Promise<void> {
    const url = buildCoreUrl(API_ENDPOINTS.files.delete(id));
    return apiCall<void>(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
  }

  // Search files
  async searchFiles(
    searchRequest: FileSearchRequest,
    params: PaginationParams = {}
  ): Promise<FileListResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.size) searchParams.set('size', params.size.toString());

    const url = buildCoreUrl(`${API_ENDPOINTS.files.search}?${searchParams.toString()}`);
    return apiCall<FileListResponse>(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(searchRequest),
    });
  }

  // Associate file with entity
  async associateFile(fileId: string, association: FileAssociationRequest): Promise<FileAssociation> {
    const url = buildCoreUrl(API_ENDPOINTS.files.associate(fileId));
    return apiCall<FileAssociation>(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(association),
    });
  }

  // Get download URL for file
  getDownloadUrl(id: string): string {
    return buildCoreUrl(API_ENDPOINTS.files.download(id));
  }

  // Download file
  async downloadFile(id: string): Promise<Blob> {
    const url = this.getDownloadUrl(id);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    return response.blob();
  }

  // Get files by type
  async getFilesByType(fileType: string, params: PaginationParams = {}): Promise<FileListResponse> {
    return this.listFiles({ ...params, file_type: fileType });
  }

  // Get files associated with entity
  async getAssociatedFiles(
    associatedType: string,
    associatedId: string,
    params: PaginationParams = {}
  ): Promise<FileListResponse> {
    return this.listFiles({ 
      ...params, 
      associated_type: associatedType, 
      associated_id: associatedId 
    });
  }

  // Get files for project
  async getProjectFiles(projectId: string, params: PaginationParams = {}): Promise<FileListResponse> {
    return this.getAssociatedFiles('project', projectId, params);
  }

  // Get files for experiment
  async getExperimentFiles(experimentId: string, params: PaginationParams = {}): Promise<FileListResponse> {
    return this.getAssociatedFiles('experiment', experimentId, params);
  }

  // Get files for entry
  async getEntryFiles(entryId: string, params: PaginationParams = {}): Promise<FileListResponse> {
    return this.getAssociatedFiles('entry', entryId, params);
  }

  // Get image files
  async getImageFiles(params: PaginationParams = {}): Promise<FileListResponse> {
    return this.searchFiles({
      file_type: 'image/',
    }, params);
  }

  // Get document files
  async getDocumentFiles(params: PaginationParams = {}): Promise<FileListResponse> {
    return this.searchFiles({
      query: '',
      file_type: 'application/', // PDFs, docs, etc.
    }, params);
  }

  // Add tag to file
  async addTag(id: string, tag: string): Promise<FileEntity> {
    const file = await this.getFile(id);
    const tags = [...file.tags, tag];
    return this.updateFile(id, { tags });
  }

  // Remove tag from file
  async removeTag(id: string, tag: string): Promise<FileEntity> {
    const file = await this.getFile(id);
    const tags = file.tags.filter(t => t !== tag);
    return this.updateFile(id, { tags });
  }

  // Get file preview URL (for images)
  getPreviewUrl(id: string, size: 'thumbnail' | 'medium' | 'large' = 'medium'): string {
    return buildCoreUrl(`${API_ENDPOINTS.files.get(id)}/preview?size=${size}`);
  }

  // Check if file is an image
  isImageFile(file: FileEntity): boolean {
    return file.file_type.startsWith('image/');
  }

  // Check if file is a document
  isDocumentFile(file: FileEntity): boolean {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
    ];
    return documentTypes.includes(file.file_type);
  }

  // Get file size in human readable format
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Validate file before upload
  validateFile(file: File, options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  } = {}): { valid: boolean; error?: string } {
    const maxSize = options.maxSize || 100 * 1024 * 1024; // 100MB default
    const allowedTypes = options.allowedTypes || [
      'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff',
      'application/pdf', 'text/plain', 'text/markdown', 'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${this.formatFileSize(maxSize)}`,
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`,
      };
    }

    return { valid: true };
  }

  // Get file statistics
  async getFileStats(): Promise<{
    total: number;
    total_size: number;
    by_type: Record<string, number>;
    recent_count: number;
  }> {
    // This would typically be a dedicated endpoint, but we can simulate it
    const allFiles = await this.listFiles({ size: 1000 });
    const files = allFiles.files;
    
    const byType: Record<string, number> = {};
    let totalSize = 0;
    
    files.forEach(file => {
      const mainType = file.file_type.split('/')[0];
      byType[mainType] = (byType[mainType] || 0) + 1;
      totalSize += file.file_size;
    });

    // Count recent files (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentCount = files.filter(file => 
      new Date(file.created_at) > oneWeekAgo
    ).length;
    
    return {
      total: files.length,
      total_size: totalSize,
      by_type: byType,
      recent_count: recentCount,
    };
  }
}

// Singleton instance
export const fileService = new FileService();