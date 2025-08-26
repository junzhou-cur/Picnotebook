import { API_BASE_URL, CHART_API_URL } from '@/config/api';

export interface TableData {
  table_id: string;
  type: string;
  confidence: number;
  dimensions: { rows: number; cols: number };
  position: { x: number; y: number; width: number; height: number };
  headers: string[];
  data: string[][];
  numerical_data?: {
    columns: Array<{
      column: number;
      header: string;
      values: number[];
      data_type: string;
    }>;
    chart_suggestions: string[];
  };
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

export interface ProcessingResult {
  success: boolean;
  image_processing: {
    ocr_results: any;
    tables_detected: number;
    charts_available: number;
  };
  tables: TableData[];
  chart_data: any[];
  processing_timestamp: string;
}

export interface ChartGenerationResult {
  success: boolean;
  chart_data: any;
  chart_options: any;
  metadata: {
    chart_type: string;
    data_points: number;
    x_range: [number, number] | null;
    y_range: [number, number] | null;
  };
  generated_at: string;
}

export interface ChartTemplate {
  type: string;
  title: string;
  description: string;
  suggested_for: string[];
  color_scheme: string;
}

class ChartApiService {
  private baseUrl = CHART_API_URL;

  async detectTablesWithCharts(imageFile: File): Promise<ProcessingResult> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${this.baseUrl}/detect_tables_with_charts`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to process image');
    }

    return response.json();
  }

  async generateChart(
    tableData: TableData,
    chartConfig: ChartConfig
  ): Promise<ChartGenerationResult> {
    const response = await fetch(`${this.baseUrl}/generate_chart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        table_data: tableData,
        chart_config: chartConfig,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate chart');
    }

    return response.json();
  }

  async getChartTemplates(): Promise<{
    success: boolean;
    templates: Record<string, ChartTemplate>;
    supported_types: string[];
    data_types: string[];
  }> {
    const response = await fetch(`${this.baseUrl}/chart_templates`);

    if (!response.ok) {
      throw new Error('Failed to fetch chart templates');
    }

    return response.json();
  }

  // Helper method to save chart data locally
  saveChartData(chartConfig: ChartConfig, chartData: any): void {
    const savedCharts = this.getSavedCharts();
    const newChart = {
      id: Date.now().toString(),
      config: chartConfig,
      data: chartData,
      createdAt: new Date().toISOString(),
    };
    
    savedCharts.push(newChart);
    localStorage.setItem('picnotebook_saved_charts', JSON.stringify(savedCharts));
  }

  // Helper method to get saved charts
  getSavedCharts(): Array<{
    id: string;
    config: ChartConfig;
    data: any;
    createdAt: string;
  }> {
    const saved = localStorage.getItem('picnotebook_saved_charts');
    return saved ? JSON.parse(saved) : [];
  }

  // Helper method to delete a saved chart
  deleteSavedChart(chartId: string): void {
    const savedCharts = this.getSavedCharts();
    const filtered = savedCharts.filter(chart => chart.id !== chartId);
    localStorage.setItem('picnotebook_saved_charts', JSON.stringify(filtered));
  }

  // Helper method to export chart as image
  async exportChartAsImage(canvas: HTMLCanvasElement, filename: string): Promise<void> {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        resolve();
      }, 'image/png');
    });
  }

  // Helper method to export table data as CSV
  exportTableAsCSV(table: TableData, filename: string): void {
    const headers = table.headers.join(',');
    const rows = table.data.map(row => row.join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Helper method to analyze table data for insights
  analyzeTableData(table: TableData): {
    summary: Record<string, any>;
    insights: string[];
  } {
    const insights: string[] = [];
    const summary: Record<string, any> = {
      dimensions: table.dimensions,
      numericalColumns: table.numerical_data?.columns.length || 0,
      dataQuality: table.confidence,
    };

    if (table.numerical_data) {
      const columns = table.numerical_data.columns;
      
      // Analyze trends
      columns.forEach(col => {
        const values = col.values;
        if (values.length >= 3) {
          const trend = this.calculateTrend(values);
          if (trend.direction !== 'stable') {
            insights.push(
              `${col.header} shows a ${trend.direction} trend with ${trend.strength} strength`
            );
          }
        }

        // Check for outliers
        const outliers = this.detectOutliers(values);
        if (outliers.length > 0) {
          insights.push(
            `${col.header} contains ${outliers.length} potential outlier(s)`
          );
        }
      });

      // Check for correlations
      if (columns.length >= 2) {
        for (let i = 0; i < columns.length - 1; i++) {
          for (let j = i + 1; j < columns.length; j++) {
            const correlation = this.calculateCorrelation(
              columns[i].values,
              columns[j].values
            );
            
            if (Math.abs(correlation) > 0.7) {
              insights.push(
                `Strong ${correlation > 0 ? 'positive' : 'negative'} correlation between ${columns[i].header} and ${columns[j].header}`
              );
            }
          }
        }
      }
    }

    return { summary, insights };
  }

  private calculateTrend(values: number[]): {
    direction: 'increasing' | 'decreasing' | 'stable';
    strength: 'weak' | 'moderate' | 'strong';
  } {
    if (values.length < 2) {
      return { direction: 'stable', strength: 'weak' };
    }

    let increases = 0;
    let decreases = 0;
    
    for (let i = 1; i < values.length; i++) {
      if (values[i] > values[i - 1]) increases++;
      else if (values[i] < values[i - 1]) decreases++;
    }

    const totalChanges = increases + decreases;
    const changeRatio = totalChanges / (values.length - 1);
    
    let direction: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (increases > decreases * 1.5) direction = 'increasing';
    else if (decreases > increases * 1.5) direction = 'decreasing';

    let strength: 'weak' | 'moderate' | 'strong' = 'weak';
    if (changeRatio > 0.8) strength = 'strong';
    else if (changeRatio > 0.5) strength = 'moderate';

    return { direction, strength };
  }

  private detectOutliers(values: number[]): number[] {
    if (values.length < 3) return [];
    
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return values.filter(v => v < lowerBound || v > upperBound);
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;
    
    const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
    const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
    const sumXY = x.slice(0, n).reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.slice(0, n).reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.slice(0, n).reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }
}

export const chartApi = new ChartApiService();