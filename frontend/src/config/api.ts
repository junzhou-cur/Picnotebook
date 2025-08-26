// API Configuration for PicNotebook 2.0 Microservices

// Service URLs based on environment
export const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:8001';
export const CORE_SERVICE_URL = process.env.NEXT_PUBLIC_CORE_SERVICE_URL || 'http://localhost:8000';
export const LEGACY_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003';
export const CHART_API_URL = process.env.NEXT_PUBLIC_CHART_API_URL || 'http://localhost:5004';

// API endpoints for microservices
export const API_ENDPOINTS = {
  // Authentication Service
  auth: {
    login: '/auth/api/login',
    register: '/auth/api/register',
    logout: '/auth/logout',
    refresh: '/auth/api/refresh',
    check: '/auth/api/me',
    profile: '/auth/api/me',
    mfa: {
      setup: '/auth/mfa/setup',
      verify: '/auth/mfa/verify',
      disable: '/auth/mfa/disable',
    },
  },
  
  // Core Service - Projects
  projects: {
    list: '/api/v1/projects',
    create: '/api/v1/projects',
    get: (id: string) => `/api/v1/projects/${id}`,
    update: (id: string) => `/api/v1/projects/${id}`,
    delete: (id: string) => `/api/v1/projects/${id}`,
    search: '/api/v1/projects/search',
    analytics: (id: string) => `/api/v1/projects/${id}/analytics`,
  },
  
  // Core Service - Experiments
  experiments: {
    list: '/api/v1/experiments',
    create: '/api/v1/experiments',
    get: (id: string) => `/api/v1/experiments/${id}`,
    update: (id: string) => `/api/v1/experiments/${id}`,
    delete: (id: string) => `/api/v1/experiments/${id}`,
    search: '/api/v1/experiments/search',
  },
  
  // Core Service - Entries
  entries: {
    list: '/api/v1/entries',
    create: '/api/v1/entries',
    get: (id: string) => `/api/v1/entries/${id}`,
    update: (id: string) => `/api/v1/entries/${id}`,
    delete: (id: string) => `/api/v1/entries/${id}`,
    search: '/api/v1/entries/search',
  },
  
  // Core Service - Files
  files: {
    list: '/api/v1/files',
    upload: '/api/v1/files',
    get: (id: string) => `/api/v1/files/${id}`,
    update: (id: string) => `/api/v1/files/${id}`,
    delete: (id: string) => `/api/v1/files/${id}`,
    search: '/api/v1/files/search',
    associate: (id: string) => `/api/v1/files/${id}/associate`,
    download: (id: string) => `/api/v1/files/${id}/download`,
  },
  
  // Core Service - Analytics
  analytics: {
    projects: '/api/v1/analytics/projects',
    experiments: '/api/v1/analytics/experiments',
    entries: '/api/v1/analytics/entries',
    usage: '/api/v1/analytics/usage',
  },
  
  // Core Service - Search
  search: {
    global: '/api/v1/search',
    suggestions: '/api/v1/search/suggestions',
  },
  
  // Core Service - Cache Management
  cache: {
    stats: '/api/v1/cache/stats',
    invalidate: '/api/v1/cache/invalidate',
    health: '/api/v1/cache/health',
  },
  
  // Core Service - Monitoring
  monitoring: {
    health: '/api/v1/monitoring/health',
    detailed: '/api/v1/monitoring/health/detailed',
    metrics: '/api/v1/monitoring/metrics',
  },
  
  // Legacy OCR and Analysis (for backwards compatibility)
  legacy: {
    ocr: '/enhanced_ocr',
    processLabNote: '/process_lab_note',
    parseText: '/parse_text',
    searchRecords: '/lab_records/search',
    detectTables: '/detect_tables_with_charts',
    generateChart: '/generate_chart',
    chartTemplates: '/chart_templates',
  },
};

// Service-specific URL builders
export function buildAuthUrl(endpoint: string): string {
  return buildApiUrl(endpoint, AUTH_SERVICE_URL);
}

export function buildCoreUrl(endpoint: string): string {
  return buildApiUrl(endpoint, CORE_SERVICE_URL);
}

export function buildLegacyUrl(endpoint: string): string {
  return buildApiUrl(endpoint, LEGACY_API_URL);
}

export function buildChartApiUrl(endpoint: string): string {
  return buildApiUrl(endpoint, CHART_API_URL);
}

// Helper function to build full API URLs
export function buildApiUrl(endpoint: string, baseUrl: string): string {
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  // Remove trailing slash from baseUrl if present
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  return `${cleanBaseUrl}/${cleanEndpoint}`;
}

// Request options with authentication
export function getAuthHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

// Form data headers (for file uploads)
export function getFileUploadHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Don't set Content-Type for FormData - browser will set it with boundary
  return headers;
}

// Error response types
export interface ApiError {
  error: string;
  message?: string;
  details?: any;
  status_code?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  validation_errors?: ValidationError[];
}

// Pagination response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Generic API response handler
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let error: ApiError;
    
    try {
      const errorData = await response.json();
      error = {
        error: errorData.error || errorData.detail || 'API request failed',
        message: errorData.message,
        details: errorData.details,
        status_code: response.status,
      };
    } catch {
      error = {
        error: `HTTP ${response.status}: ${response.statusText}`,
        status_code: response.status,
      };
    }
    
    throw error;
  }
  
  // Handle 204 No Content responses
  if (response.status === 204) {
    return null as T;
  }
  
  return response.json();
}

// Retry configuration
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryOn: number[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryOn: [408, 429, 500, 502, 503, 504],
};

// API client with retry logic
export async function apiCall<T>(
  url: string,
  options: RequestInit = {},
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      return await handleApiResponse<T>(response);
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on client errors (4xx except specific ones)
      if (error.status_code && error.status_code >= 400 && error.status_code < 500) {
        if (!retryConfig.retryOn.includes(error.status_code)) {
          throw error;
        }
      }
      
      // Don't retry on last attempt
      if (attempt === retryConfig.maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryConfig.retryDelay * (attempt + 1)));
    }
  }
  
  throw lastError;
}

// Health check utilities
export async function checkServiceHealth(serviceUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${serviceUrl}/health`, {
      method: 'GET',
      timeout: 5000,
    } as any);
    return response.ok;
  } catch {
    return false;
  }
}

export async function getServiceStatus() {
  const services = [
    { name: 'Auth Service', url: AUTH_SERVICE_URL },
    { name: 'Core Service', url: CORE_SERVICE_URL },
    { name: 'Legacy API', url: LEGACY_API_URL },
    { name: 'Chart API', url: CHART_API_URL },
  ];
  
  const statusChecks = services.map(async (service) => ({
    name: service.name,
    url: service.url,
    healthy: await checkServiceHealth(service.url),
  }));
  
  return Promise.all(statusChecks);
}