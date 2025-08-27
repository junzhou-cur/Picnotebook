// User types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  last_login?: string;
}

// Project types
export interface Project {
  id: number;
  name: string;
  description?: string;
  hypothesis?: string;
  purpose?: string;
  current_progress?: string;
  future_plan?: string;
  progress_percentage?: number;
  status: 'active' | 'completed' | 'paused';
  owner_id: number;
  owner?: string;
  owner_name?: string;
  user_role?: string;
  is_owner?: boolean;
  note_count: number;
  member_count?: number;
  created_at: string;
  updated_at: string;
}

// Lab Note types
export interface LabNote {
  id: number;
  filename: string;
  title: string;
  content?: string;
  processed_text?: string;
  original_image_path?: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'error';
  auto_classified?: boolean;
  project_id: number;
  project_name?: string;
  author_id?: number;
  author_name?: string;
  file_size: number;
  created_at: string;
  updated_at?: string;
}

// Processing Job types
export interface ProcessingJob {
  id: string | number;
  filename: string;
  job_type?: 'image_processing' | 'report_generation';
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  error_message?: string;
  result?: any;
  user_id?: number;
  project_id?: number;
  lab_note_id?: number;
  note_id?: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  per_page: number;
}

// Form types
export interface LoginForm {
  username_or_email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirm_password?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
}

export interface ProjectForm {
  name: string;
  description?: string;
  hypothesis?: string;
  purpose?: string;
}

// Upload types
export interface UploadResponse {
  success: boolean;
  filename?: string;
  filepath?: string;
  file_type?: string;
  needs_processing?: boolean;
  processing_started?: boolean;
  processing_completed?: boolean;
  note_id?: number;
  note_title?: string;
  processing_error?: string;
  message?: string;
  original_name?: string;
  lab_note_id?: number;
  error?: string;
}

export interface ProcessImageRequest {
  api_key: string;
  project_id?: number;
}

export interface ProcessImageResponse {
  success: boolean;
  result?: {
    lab_note_id: number;
    title: string;
    content: string;
    project_id: number;
    project_name: string;
    auto_classified: boolean;
  };
  error?: string;
}

// UI State types
export interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
  active?: boolean;
}

// Sequence types
export interface Sequence {
  id: number;
  name: string;
  sequence_type: string;
  sequence_data?: string;
  description?: string;
  original_filename?: string;
  file_format?: string;
  quality_scores?: string;
  read_count?: number;
  file_size?: number;
  gc_content?: number;
  sequence_length?: number;
  analysis_results?: any;
  project_id: number;
  project_name?: string;
  user_id: number;
  user_name?: string;
  created_at: string;
  updated_at: string;
  amplicon_count: number;
}

// Amplicon types
export interface Amplicon {
  id: number;
  name: string;
  primer_forward?: string;
  primer_reverse?: string;
  target_region?: string;
  expected_size?: number;
  amplicon_sequence?: string;
  actual_size?: number;
  primer_efficiency?: number;
  specificity_score?: number;
  annealing_temp?: number;
  cycle_count?: number;
  pcr_conditions?: any;
  analysis_output?: any;
  quality_metrics?: any;
  sequence_id: number;
  sequence_name?: string;
  project_id: number;
  project_name?: string;
  user_id: number;
  user_name?: string;
  created_at: string;
  updated_at: string;
}

// Table Data types for chart generation
export interface TableData {
  table_id: string;
  type: 'grid' | 'lines' | 'whitespace';
  confidence: number;
  dimensions: {
    rows: number;
    cols: number;
  };
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  headers: string[];
  data: string[][];
  numerical_data?: {
    columns: NumericalColumn[];
    chart_suggestions: string[];
  };
}

export interface NumericalColumn {
  column: number;
  header: string;
  values: number[];
  data_type: string;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'scatter';
  title: string;
  xAxis: string;
  yAxis: string;
  colorScheme: 'lab' | 'scientific' | 'colorful' | 'monochrome';
  showLegend: boolean;
  showGrid: boolean;
  animation: boolean;
}

export interface TextRegion {
  id: string;
  text: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  wordLevel?: boolean;
}

export interface OCRResult {
  text: string;
  confidence: number;
  regions?: TextRegion[];
  method?: string;
  processingTime?: number;
}

export interface Experiment {
  id: string;
  experiment_id: string;
  date: string;
  researcher: string;
  methods?: string;
  results?: string;
  observations?: string;
  measurements?: Measurement[];
  encrypted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Measurement {
  id?: string;
  type: string;
  value: string;
  unit: string;
  timestamp?: string;
}