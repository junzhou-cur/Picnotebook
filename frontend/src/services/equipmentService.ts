import { apiCall, buildCoreUrl } from '../config/api';

export interface LabEquipment {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  serial_number: string;
  equipment_type: 'spectrometer' | 'chromatograph' | 'microscope' | 'centrifuge' | 'thermocycler' | 'balance' | 'ph_meter' | 'incubator' | 'other';
  location: string;
  status: 'available' | 'in_use' | 'maintenance' | 'offline' | 'error';
  capabilities: string[];
  data_formats: string[];
  connection_type: 'usb' | 'ethernet' | 'serial' | 'wifi' | 'bluetooth' | 'manual';
  api_endpoint?: string;
  driver_info?: {
    driver_type: string;
    version: string;
    config: Record<string, any>;
  };
  calibration_date?: string;
  next_maintenance_date?: string;
  created_at: string;
  updated_at: string;
}

export interface DataImportJob {
  id: string;
  equipment_id: string;
  experiment_id?: string;
  entry_id?: string;
  job_type: 'real_time' | 'batch_import' | 'scheduled';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  file_path?: string;
  import_config: {
    data_format: string;
    column_mapping: Record<string, string>;
    filters?: Record<string, any>;
    transformations?: Array<{
      type: 'unit_conversion' | 'normalization' | 'calibration' | 'filtering';
      config: Record<string, any>;
    }>;
  };
  imported_records: number;
  total_records: number;
  errors: string[];
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface EquipmentData {
  id: string;
  equipment_id: string;
  experiment_id?: string;
  entry_id?: string;
  timestamp: string;
  parameters: Record<string, {
    value: number;
    unit: string;
    quality_flag?: string;
    calibrated: boolean;
  }>;
  metadata: {
    instrument_settings: Record<string, any>;
    environmental_conditions?: Record<string, any>;
    operator?: string;
    method?: string;
  };
  raw_data?: any;
  processed_data?: any;
  quality_score: number;
  import_job_id?: string;
}

export interface EquipmentTemplate {
  id: string;
  name: string;
  equipment_type: string;
  manufacturer: string;
  model: string;
  default_config: {
    connection_settings: Record<string, any>;
    data_mapping: Record<string, string>;
    default_parameters: Record<string, any>;
  };
  supported_formats: string[];
  driver_requirements: string[];
  is_public: boolean;
  created_by: string;
}

export interface RealTimeMonitor {
  id: string;
  equipment_id: string;
  experiment_id?: string;
  parameters: string[];
  sampling_interval: number; // seconds
  alert_conditions: Array<{
    parameter: string;
    condition: 'above' | 'below' | 'equals' | 'change_rate';
    threshold: number;
    action: 'email' | 'sms' | 'slack' | 'webhook';
    recipients: string[];
  }>;
  status: 'active' | 'paused' | 'stopped';
  created_at: string;
  last_reading?: string;
}

export interface CalibrationRecord {
  id: string;
  equipment_id: string;
  calibration_type: 'standard' | 'user' | 'factory';
  standards_used: Array<{
    parameter: string;
    expected_value: number;
    measured_value: number;
    unit: string;
  }>;
  calibration_curve?: {
    equation: string;
    r_squared: number;
    coefficients: number[];
  };
  performed_by: string;
  performed_at: string;
  valid_until?: string;
  notes?: string;
  attachments?: string[];
}

class EquipmentService {
  /**
   * Get all lab equipment
   */
  async getEquipment(params?: {
    equipment_type?: string;
    status?: string;
    location?: string;
    manufacturer?: string;
  }): Promise<LabEquipment[]> {
    const url = buildCoreUrl('/equipment');
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return apiCall<LabEquipment[]>(`${url}?${searchParams}`, { method: 'GET' });
  }

  /**
   * Get specific equipment
   */
  async getEquipmentById(equipmentId: string): Promise<LabEquipment> {
    const url = buildCoreUrl(`/equipment/${equipmentId}`);
    return apiCall<LabEquipment>(url, { method: 'GET' });
  }

  /**
   * Register new equipment
   */
  async registerEquipment(equipment: Omit<LabEquipment, 'id' | 'created_at' | 'updated_at'>): Promise<LabEquipment> {
    const url = buildCoreUrl('/equipment');
    return apiCall<LabEquipment>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(equipment),
    });
  }

  /**
   * Update equipment
   */
  async updateEquipment(equipmentId: string, updates: Partial<LabEquipment>): Promise<LabEquipment> {
    const url = buildCoreUrl(`/equipment/${equipmentId}`);
    return apiCall<LabEquipment>(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete equipment
   */
  async deleteEquipment(equipmentId: string): Promise<void> {
    const url = buildCoreUrl(`/equipment/${equipmentId}`);
    await apiCall<void>(url, { method: 'DELETE' });
  }

  /**
   * Test equipment connection
   */
  async testConnection(equipmentId: string): Promise<{ success: boolean; message: string; response_time?: number }> {
    const url = buildCoreUrl(`/equipment/${equipmentId}/test-connection`);
    return apiCall<{ success: boolean; message: string; response_time?: number }>(url, { method: 'POST' });
  }

  /**
   * Start data import job
   */
  async startDataImport(job: Omit<DataImportJob, 'id' | 'status' | 'imported_records' | 'total_records' | 'errors' | 'created_at'>): Promise<DataImportJob> {
    const url = buildCoreUrl('/equipment/data-import');
    return apiCall<DataImportJob>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(job),
    });
  }

  /**
   * Get data import jobs
   */
  async getDataImportJobs(params?: {
    equipment_id?: string;
    status?: string;
    job_type?: string;
  }): Promise<DataImportJob[]> {
    const url = buildCoreUrl('/equipment/data-import');
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return apiCall<DataImportJob[]>(`${url}?${searchParams}`, { method: 'GET' });
  }

  /**
   * Get specific data import job
   */
  async getDataImportJob(jobId: string): Promise<DataImportJob> {
    const url = buildCoreUrl(`/equipment/data-import/${jobId}`);
    return apiCall<DataImportJob>(url, { method: 'GET' });
  }

  /**
   * Cancel data import job
   */
  async cancelDataImportJob(jobId: string): Promise<void> {
    const url = buildCoreUrl(`/equipment/data-import/${jobId}/cancel`);
    await apiCall<void>(url, { method: 'POST' });
  }

  /**
   * Get equipment data
   */
  async getEquipmentData(params: {
    equipment_id?: string;
    experiment_id?: string;
    start_date?: string;
    end_date?: string;
    parameters?: string[];
    page?: number;
    size?: number;
  }): Promise<{ data: EquipmentData[]; total: number; total_pages: number }> {
    const url = buildCoreUrl('/equipment/data');
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    return apiCall<{ data: EquipmentData[]; total: number; total_pages: number }>(
      `${url}?${searchParams}`, 
      { method: 'GET' }
    );
  }

  /**
   * Import data from file
   */
  async importDataFromFile(equipmentId: string, file: File, config: {
    experiment_id?: string;
    entry_id?: string;
    column_mapping: Record<string, string>;
    data_format: string;
  }): Promise<DataImportJob> {
    const url = buildCoreUrl(`/equipment/${equipmentId}/import-file`);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('config', JSON.stringify(config));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to import data');
    }

    return response.json();
  }

  /**
   * Start real-time monitoring
   */
  async startRealTimeMonitoring(monitor: Omit<RealTimeMonitor, 'id' | 'status' | 'created_at' | 'last_reading'>): Promise<RealTimeMonitor> {
    const url = buildCoreUrl('/equipment/real-time-monitor');
    return apiCall<RealTimeMonitor>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(monitor),
    });
  }

  /**
   * Get real-time monitors
   */
  async getRealTimeMonitors(equipmentId?: string): Promise<RealTimeMonitor[]> {
    const url = buildCoreUrl('/equipment/real-time-monitor');
    const searchParams = new URLSearchParams();
    
    if (equipmentId) {
      searchParams.append('equipment_id', equipmentId);
    }

    return apiCall<RealTimeMonitor[]>(`${url}?${searchParams}`, { method: 'GET' });
  }

  /**
   * Stop real-time monitoring
   */
  async stopRealTimeMonitoring(monitorId: string): Promise<void> {
    const url = buildCoreUrl(`/equipment/real-time-monitor/${monitorId}/stop`);
    await apiCall<void>(url, { method: 'POST' });
  }

  /**
   * Get equipment templates
   */
  async getEquipmentTemplates(params?: { equipment_type?: string; manufacturer?: string }): Promise<EquipmentTemplate[]> {
    const url = buildCoreUrl('/equipment/templates');
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return apiCall<EquipmentTemplate[]>(`${url}?${searchParams}`, { method: 'GET' });
  }

  /**
   * Create equipment template
   */
  async createEquipmentTemplate(template: Omit<EquipmentTemplate, 'id' | 'created_by'>): Promise<EquipmentTemplate> {
    const url = buildCoreUrl('/equipment/templates');
    return apiCall<EquipmentTemplate>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    });
  }

  /**
   * Record calibration
   */
  async recordCalibration(calibration: Omit<CalibrationRecord, 'id'>): Promise<CalibrationRecord> {
    const url = buildCoreUrl('/equipment/calibration');
    return apiCall<CalibrationRecord>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(calibration),
    });
  }

  /**
   * Get calibration records
   */
  async getCalibrationRecords(equipmentId: string): Promise<CalibrationRecord[]> {
    const url = buildCoreUrl(`/equipment/${equipmentId}/calibration`);
    return apiCall<CalibrationRecord[]>(url, { method: 'GET' });
  }

  /**
   * Get equipment status
   */
  async getEquipmentStatus(equipmentId: string): Promise<{
    status: string;
    last_communication: string;
    current_operation?: string;
    error_message?: string;
    performance_metrics: Record<string, number>;
  }> {
    const url = buildCoreUrl(`/equipment/${equipmentId}/status`);
    return apiCall<{
      status: string;
      last_communication: string;
      current_operation?: string;
      error_message?: string;
      performance_metrics: Record<string, number>;
    }>(url, { method: 'GET' });
  }

  /**
   * Send equipment command
   */
  async sendCommand(equipmentId: string, command: {
    action: string;
    parameters?: Record<string, any>;
  }): Promise<{ success: boolean; response: any }> {
    const url = buildCoreUrl(`/equipment/${equipmentId}/command`);
    return apiCall<{ success: boolean; response: any }>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    });
  }

  /**
   * Get supported equipment types
   */
  async getSupportedEquipmentTypes(): Promise<Array<{
    type: string;
    name: string;
    description: string;
    common_parameters: string[];
    typical_manufacturers: string[];
  }>> {
    const url = buildCoreUrl('/equipment/supported-types');
    return apiCall<Array<{
      type: string;
      name: string;
      description: string;
      common_parameters: string[];
      typical_manufacturers: string[];
    }>>(url, { method: 'GET' });
  }
}

export const equipmentService = new EquipmentService();