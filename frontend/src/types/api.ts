// TypeScript types for PicNotebook 2.0 API

// Base types
export interface BaseEntity {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

// User types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_verified: boolean;
  mfa_enabled: boolean;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  settings?: Record<string, any>;
  preferences?: Record<string, any>;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
  mfa_code?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

// Project types
export interface Project extends BaseEntity {
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'archived' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  metadata: Record<string, any>;
  start_date?: string;
  end_date?: string;
  created_by: string;
  is_public: boolean;
  collaborators: string[];
  settings: Record<string, any>;
}

export interface ProjectCreateRequest {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  start_date?: string;
  end_date?: string;
  is_public?: boolean;
}

export interface ProjectUpdateRequest {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  start_date?: string;
  end_date?: string;
  is_public?: boolean;
}

export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Experiment types
export interface Experiment extends BaseEntity {
  project_id: string;
  title: string;
  description?: string;
  protocol?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  metadata: Record<string, any>;
  conditions: Record<string, any>;
  expected_outcomes?: string;
  started_at?: string;
  completed_at?: string;
  created_by: string;
  duration_days?: number;
}

export interface ExperimentCreateRequest {
  project_id: string;
  title: string;
  description?: string;
  protocol?: string;
  status?: string;
  priority?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  conditions?: Record<string, any>;
  expected_outcomes?: string;
  started_at?: string;
  completed_at?: string;
}

export interface ExperimentUpdateRequest {
  title?: string;
  description?: string;
  protocol?: string;
  status?: string;
  priority?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  conditions?: Record<string, any>;
  expected_outcomes?: string;
  started_at?: string;
  completed_at?: string;
}

export interface ExperimentListResponse {
  experiments: Experiment[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Entry types
export interface Entry extends BaseEntity {
  project_id: string;
  experiment_id?: string;
  title: string;
  content?: string;
  entry_type: string;
  entry_date: string;
  tags: string[];
  metadata: Record<string, any>;
  observations?: string;
  results?: string;
  notes?: string;
  visibility: 'private' | 'team' | 'public';
  created_by: string;
}

export interface EntryCreateRequest {
  project_id: string;
  experiment_id?: string;
  title: string;
  content?: string;
  entry_type?: string;
  entry_date: string;
  tags?: string[];
  metadata?: Record<string, any>;
  observations?: string;
  results?: string;
  notes?: string;
  visibility?: string;
}

export interface EntryUpdateRequest {
  title?: string;
  content?: string;
  entry_type?: string;
  entry_date?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  observations?: string;
  results?: string;
  notes?: string;
  visibility?: string;
}

export interface EntryListResponse {
  entries: Entry[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// File types
export interface FileEntity extends BaseEntity {
  filename: string;
  file_type: string;
  file_size: number;
  file_hash: string;
  storage_path: string;
  description?: string;
  tags: string[];
  metadata: Record<string, any>;
  uploaded_by: string;
  download_url?: string;
}

export interface FileUploadRequest {
  filename: string;
  file_type: string;
  description?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  associated_type?: string;
  associated_id?: string;
}

export interface FileUpdateRequest {
  filename?: string;
  description?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface FileListResponse {
  files: FileEntity[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface FileAssociation {
  id: string;
  file_id: string;
  associated_type: string;
  associated_id: string;
  created_at: string;
  created_by: string;
}

export interface FileAssociationRequest {
  associated_type: string;
  associated_id: string;
}

// Search types
export interface SearchRequest {
  query?: string;
  filters?: Record<string, any>;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ProjectSearchRequest extends SearchRequest {
  status?: string;
  priority?: string;
  tags?: string[];
  created_by?: string;
  start_date_from?: string;
  start_date_to?: string;
  is_public?: boolean;
}

export interface ExperimentSearchRequest extends SearchRequest {
  status?: string;
  priority?: string;
  tags?: string[];
  project_id?: string;
  created_by?: string;
  started_after?: string;
  started_before?: string;
}

export interface EntrySearchRequest extends SearchRequest {
  entry_type?: string;
  tags?: string[];
  project_id?: string;
  experiment_id?: string;
  created_by?: string;
  date_from?: string;
  date_to?: string;
  visibility?: string;
}

export interface FileSearchRequest extends SearchRequest {
  file_type?: string;
  tags?: string[];
  uploaded_by?: string;
  size_min?: number;
  size_max?: number;
  created_after?: string;
  created_before?: string;
  associated_type?: string;
  associated_id?: string;
}

// Analytics types
export interface ProjectAnalytics {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  projects_by_status: Record<string, number>;
  projects_by_priority: Record<string, number>;
  monthly_activity: Array<{
    month: string;
    count: number;
  }>;
}

export interface ExperimentAnalytics {
  total_experiments: number;
  active_experiments: number;
  completed_experiments: number;
  experiments_by_status: Record<string, number>;
  average_duration: number;
  success_rate: number;
}

export interface EntryAnalytics {
  total_entries: number;
  entries_by_type: Record<string, number>;
  entries_by_visibility: Record<string, number>;
  daily_activity: Array<{
    date: string;
    count: number;
  }>;
}

// Monitoring types
export interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  checks: Record<string, {
    status: string;
    message?: string;
    duration_ms?: number;
  }>;
}

export interface SystemMetrics {
  request_count: number;
  error_rate: number;
  response_time_p95: number;
  cache_hit_rate: number;
  database_connections: number;
  memory_usage: number;
  cpu_usage: number;
}

// Cache types
export interface CacheStats {
  hits: number;
  misses: number;
  hit_rate: number;
  memory_usage: number;
  key_count: number;
  evictions: number;
}

// Global search types
export interface GlobalSearchResult {
  type: 'project' | 'experiment' | 'entry' | 'file';
  id: string;
  title: string;
  description?: string;
  highlights: string[];
  score: number;
  metadata: Record<string, any>;
}

export interface GlobalSearchResponse {
  results: GlobalSearchResult[];
  total: number;
  query: string;
  took_ms: number;
  facets: Record<string, Array<{
    value: string;
    count: number;
  }>>;
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  size?: number;
}

// Filter and sort parameters
export interface FilterParams {
  [key: string]: string | number | boolean | string[] | undefined;
}

export interface SortParams {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}