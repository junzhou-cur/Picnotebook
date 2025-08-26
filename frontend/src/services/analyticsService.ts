import { apiCall, buildCoreUrl } from '../config/api';

export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
  parameter: string;
  unit?: string;
  metadata?: Record<string, any>;
  quality_score?: number;
  experiment_id?: string;
  entry_id?: string;
}

export interface TimeSeriesAnalysis {
  parameter: string;
  unit?: string;
  data_points: TimeSeriesDataPoint[];
  statistics: {
    mean: number;
    median: number;
    std_dev: number;
    min: number;
    max: number;
    count: number;
    trend: 'increasing' | 'decreasing' | 'stable' | 'oscillating';
    trend_strength: number;
    seasonality_detected: boolean;
    anomaly_count: number;
  };
  anomalies: Array<{
    timestamp: string;
    value: number;
    type: 'outlier' | 'drift' | 'spike' | 'drop';
    severity: 'low' | 'medium' | 'high';
    confidence: number;
  }>;
  correlations: Array<{
    parameter: string;
    correlation: number;
    p_value: number;
    significance: 'high' | 'medium' | 'low' | 'none';
  }>;
  forecast?: {
    timestamps: string[];
    predicted_values: number[];
    confidence_intervals: Array<{ lower: number; upper: number }>;
    model_type: string;
    accuracy_score: number;
  };
}

export interface AnalyticsQuery {
  experiment_ids?: string[];
  project_ids?: string[];
  parameters?: string[];
  start_date?: string;
  end_date?: string;
  aggregation?: 'raw' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  include_forecast?: boolean;
  forecast_horizon?: number; // days
  include_anomalies?: boolean;
  include_correlations?: boolean;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: AnalyticsWidget[];
  layout: DashboardLayout;
  filters: DashboardFilter[];
  created_by: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
}

export interface AnalyticsWidget {
  id: string;
  type: 'time_series' | 'histogram' | 'scatter' | 'correlation_matrix' | 'statistical_summary' | 'anomaly_detection';
  title: string;
  configuration: {
    query: AnalyticsQuery;
    chart_type?: 'line' | 'bar' | 'scatter' | 'heatmap';
    x_axis?: string;
    y_axis?: string;
    color_by?: string;
    aggregation?: string;
    show_trend?: boolean;
    show_anomalies?: boolean;
    show_confidence_intervals?: boolean;
  };
  position: { x: number; y: number; width: number; height: number };
}

export interface DashboardLayout {
  columns: number;
  row_height: number;
  margin: number;
  container_padding: number;
}

export interface DashboardFilter {
  id: string;
  name: string;
  type: 'date_range' | 'parameter_select' | 'experiment_select' | 'numeric_range';
  default_value: any;
  options?: any[];
}

export interface ExperimentMetrics {
  experiment_id: string;
  duration: number; // hours
  parameters_tracked: number;
  data_points_collected: number;
  success_rate: number;
  data_quality_score: number;
  completion_percentage: number;
  milestone_progress: Array<{
    milestone: string;
    completed: boolean;
    completion_date?: string;
    target_date: string;
  }>;
}

export interface ParameterComparison {
  parameters: string[];
  experiments: string[];
  comparison_matrix: Array<{
    experiment_id: string;
    parameter: string;
    mean_value: number;
    std_dev: number;
    sample_size: number;
  }>;
  statistical_tests: Array<{
    parameter: string;
    test_type: 'anova' | 't_test' | 'wilcoxon' | 'kruskal_wallis';
    p_value: number;
    significant: boolean;
    effect_size: number;
  }>;
}

class AnalyticsService {
  /**
   * Get time series data and analysis
   */
  async getTimeSeriesAnalysis(query: AnalyticsQuery): Promise<TimeSeriesAnalysis[]> {
    const url = buildCoreUrl('/analytics/time-series');
    return apiCall<TimeSeriesAnalysis[]>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    });
  }

  /**
   * Get raw time series data points
   */
  async getTimeSeriesData(query: AnalyticsQuery): Promise<TimeSeriesDataPoint[]> {
    const url = buildCoreUrl('/analytics/data-points');
    return apiCall<TimeSeriesDataPoint[]>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    });
  }

  /**
   * Detect anomalies in time series data
   */
  async detectAnomalies(parameters: string[], experimentIds: string[], sensitivity: number = 0.8): Promise<any[]> {
    const url = buildCoreUrl('/analytics/anomalies');
    return apiCall<any[]>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parameters,
        experiment_ids: experimentIds,
        sensitivity,
      }),
    });
  }

  /**
   * Get parameter correlations
   */
  async getParameterCorrelations(parameters: string[], experimentIds?: string[]): Promise<any> {
    const url = buildCoreUrl('/analytics/correlations');
    return apiCall<any>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parameters,
        experiment_ids: experimentIds,
      }),
    });
  }

  /**
   * Generate forecasts for parameters
   */
  async generateForecast(parameter: string, experimentId: string, horizon: number = 7): Promise<any> {
    const url = buildCoreUrl('/analytics/forecast');
    return apiCall<any>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parameter,
        experiment_id: experimentId,
        horizon_days: horizon,
      }),
    });
  }

  /**
   * Get experiment metrics
   */
  async getExperimentMetrics(experimentIds: string[]): Promise<ExperimentMetrics[]> {
    const url = buildCoreUrl('/analytics/experiment-metrics');
    return apiCall<ExperimentMetrics[]>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ experiment_ids: experimentIds }),
    });
  }

  /**
   * Compare parameters across experiments
   */
  async compareParameters(parameters: string[], experimentIds: string[]): Promise<ParameterComparison> {
    const url = buildCoreUrl('/analytics/parameter-comparison');
    return apiCall<ParameterComparison>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parameters,
        experiment_ids: experimentIds,
      }),
    });
  }

  /**
   * Get available parameters for analysis
   */
  async getAvailableParameters(params?: { 
    experiment_ids?: string[]; 
    project_ids?: string[];
    start_date?: string;
    end_date?: string;
  }): Promise<Array<{ parameter: string; unit?: string; count: number; experiments: string[] }>> {
    const url = buildCoreUrl('/analytics/parameters');
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
    }

    return apiCall<Array<{ parameter: string; unit?: string; count: number; experiments: string[] }>>(
      `${url}?${searchParams}`, 
      { method: 'GET' }
    );
  }

  /**
   * Create analytics dashboard
   */
  async createDashboard(dashboard: Omit<Dashboard, 'id' | 'created_by' | 'created_at' | 'updated_at'>): Promise<Dashboard> {
    const url = buildCoreUrl('/analytics/dashboards');
    return apiCall<Dashboard>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dashboard),
    });
  }

  /**
   * Get analytics dashboards
   */
  async getDashboards(params?: { is_public?: boolean; created_by?: string }): Promise<Dashboard[]> {
    const url = buildCoreUrl('/analytics/dashboards');
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return apiCall<Dashboard[]>(`${url}?${searchParams}`, { method: 'GET' });
  }

  /**
   * Get specific dashboard
   */
  async getDashboard(dashboardId: string): Promise<Dashboard> {
    const url = buildCoreUrl(`/analytics/dashboards/${dashboardId}`);
    return apiCall<Dashboard>(url, { method: 'GET' });
  }

  /**
   * Update dashboard
   */
  async updateDashboard(dashboardId: string, updates: Partial<Dashboard>): Promise<Dashboard> {
    const url = buildCoreUrl(`/analytics/dashboards/${dashboardId}`);
    return apiCall<Dashboard>(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete dashboard
   */
  async deleteDashboard(dashboardId: string): Promise<void> {
    const url = buildCoreUrl(`/analytics/dashboards/${dashboardId}`);
    await apiCall<void>(url, { method: 'DELETE' });
  }

  /**
   * Export analytics data
   */
  async exportData(query: AnalyticsQuery, format: 'csv' | 'json' | 'excel' = 'csv'): Promise<Blob> {
    const url = buildCoreUrl(`/analytics/export?format=${format}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      throw new Error('Failed to export data');
    }

    return response.blob();
  }

  /**
   * Generate analytics report
   */
  async generateReport(params: {
    experiment_ids?: string[];
    project_ids?: string[];
    start_date?: string;
    end_date?: string;
    include_forecasts?: boolean;
    include_anomalies?: boolean;
    format?: 'pdf' | 'html';
  }): Promise<Blob> {
    const url = buildCoreUrl('/analytics/reports');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to generate report');
    }

    return response.blob();
  }
}

export const analyticsService = new AnalyticsService();