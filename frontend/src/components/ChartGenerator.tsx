'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  LineChart,
  PieChart,
  ScatterChart,
  TrendingUp,
  Download,
  Settings,
  RefreshCw,
  Maximize2,
  Eye,
  EyeOff,
  Palette,
  Grid,
  Zap,
  ChevronDown,
  Play,
  Save
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Line, Bar, Pie, Scatter } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface NumericalColumn {
  column: number;
  header: string;
  values: number[];
  data_type: string;
}

interface TableData {
  table_id: string;
  type: string;
  confidence: number;
  headers: string[];
  data: string[][];
  numerical_data?: {
    columns: NumericalColumn[];
    chart_suggestions: string[];
  };
}

interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'scatter';
  title: string;
  xAxis: string;
  yAxis: string;
  colorScheme: 'lab' | 'scientific' | 'colorful' | 'monochrome';
  showLegend: boolean;
  showGrid: boolean;
  animation: boolean;
}

interface ChartGeneratorProps {
  tableData: TableData[];
  onChartSave?: (chartConfig: ChartConfig, chartData: any) => void;
  className?: string;
}

const COLOR_SCHEMES = {
  lab: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'],
  scientific: ['#1E3A8A', '#059669', '#DC2626', '#7C2D12', '#581C87', '#0C4A6E'],
  colorful: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
  monochrome: ['#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB', '#F3F4F6']
};

const CHART_TEMPLATES = {
  ph_over_time: {
    type: 'line' as const,
    title: 'pH Level Over Time',
    xAxis: 'Time',
    yAxis: 'pH Level',
    colorScheme: 'lab' as const
  },
  temperature_measurement: {
    type: 'line' as const,
    title: 'Temperature Monitoring',
    xAxis: 'Time',
    yAxis: 'Temperature (°C)',
    colorScheme: 'scientific' as const
  },
  concentration_comparison: {
    type: 'bar' as const,
    title: 'Concentration Comparison',
    xAxis: 'Sample',
    yAxis: 'Concentration',
    colorScheme: 'lab' as const
  },
  measurement_distribution: {
    type: 'pie' as const,
    title: 'Measurement Distribution',
    xAxis: 'Category',
    yAxis: 'Count',
    colorScheme: 'colorful' as const
  }
};

export function ChartGenerator({ 
  tableData, 
  onChartSave, 
  className = '' 
}: ChartGeneratorProps) {
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    type: 'line',
    title: 'Lab Data Chart',
    xAxis: 'X Axis',
    yAxis: 'Y Axis',
    colorScheme: 'lab',
    showLegend: true,
    showGrid: true,
    animation: true
  });
  const [selectedColumns, setSelectedColumns] = useState<{ x: number; y: number }>({ x: 0, y: 1 });
  const [chartData, setChartData] = useState<ChartData<any> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const chartRef = useRef<any>(null);

  // Auto-select first table with numerical data
  useEffect(() => {
    const tableWithData = tableData.find(table => 
      table.numerical_data && table.numerical_data.columns.length >= 2
    );
    if (tableWithData && !selectedTable) {
      setSelectedTable(tableWithData);
      
      // Auto-detect chart type based on data
      const columns = tableWithData.numerical_data!.columns;
      const hasTimeData = columns.some(col => col.data_type === 'time');
      const hasPHData = columns.some(col => col.data_type === 'pH');
      
      if (hasTimeData) {
        setChartConfig(prev => ({
          ...prev,
          type: 'line',
          title: hasPHData ? 'pH Level Over Time' : 'Measurements Over Time'
        }));
      }
    }
  }, [tableData, selectedTable]);

  // Generate chart data when table or configuration changes
  useEffect(() => {
    if (selectedTable && selectedTable.numerical_data && selectedTable.numerical_data.columns.length >= 2) {
      generateChartData();
    }
  }, [selectedTable, selectedColumns, chartConfig]);

  const generateChartData = useCallback(() => {
    if (!selectedTable?.numerical_data) return;

    const columns = selectedTable.numerical_data.columns;
    const xColumn = columns[selectedColumns.x];
    const yColumn = columns[selectedColumns.y];

    if (!xColumn || !yColumn) return;

    const colors = COLOR_SCHEMES[chartConfig.colorScheme];
    
    let data: ChartData<any>;

    switch (chartConfig.type) {
      case 'line':
        data = {
          labels: xColumn.values.map((_, i) => `Point ${i + 1}`),
          datasets: [{
            label: yColumn.header,
            data: yColumn.values,
            borderColor: colors[0],
            backgroundColor: colors[0] + '20',
            tension: 0.4,
            fill: true
          }]
        };
        break;

      case 'bar':
        data = {
          labels: xColumn.values.map((_, i) => `Sample ${i + 1}`),
          datasets: [{
            label: yColumn.header,
            data: yColumn.values,
            backgroundColor: colors.slice(0, yColumn.values.length),
            borderColor: colors.slice(0, yColumn.values.length),
            borderWidth: 1
          }]
        };
        break;

      case 'pie':
        data = {
          labels: yColumn.values.map((_, i) => `${xColumn.header} ${i + 1}`),
          datasets: [{
            data: yColumn.values,
            backgroundColor: colors.slice(0, yColumn.values.length),
            borderColor: '#ffffff',
            borderWidth: 2
          }]
        };
        break;

      case 'scatter':
        data = {
          datasets: [{
            label: `${yColumn.header} vs ${xColumn.header}`,
            data: xColumn.values.map((x, i) => ({ x, y: yColumn.values[i] })),
            backgroundColor: colors[0],
            borderColor: colors[0]
          }]
        };
        break;

      default:
        return;
    }

    setChartData(data);
  }, [selectedTable, selectedColumns, chartConfig]);

  const getChartOptions = useCallback((): ChartOptions<any> => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: chartConfig.animation ? {
        duration: 1000,
        easing: 'easeInOutQuart'
      } : false,
      plugins: {
        legend: {
          display: chartConfig.showLegend,
          position: 'top' as const,
        },
        title: {
          display: true,
          text: chartConfig.title,
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
        }
      },
      scales: chartConfig.type !== 'pie' ? {
        x: {
          display: true,
          title: {
            display: true,
            text: chartConfig.xAxis
          },
          grid: {
            display: chartConfig.showGrid
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: chartConfig.yAxis
          },
          grid: {
            display: chartConfig.showGrid
          }
        }
      } : undefined,
      interaction: {
        mode: 'nearest' as const,
        axis: 'x' as const,
        intersect: false,
      }
    };
  }, [chartConfig]);

  const handleTemplateApply = useCallback((templateKey: keyof typeof CHART_TEMPLATES) => {
    const template = CHART_TEMPLATES[templateKey];
    setChartConfig(prev => ({
      ...prev,
      ...template,
      showLegend: prev.showLegend,
      showGrid: prev.showGrid,
      animation: prev.animation
    }));
  }, []);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    generateChartData();
    setIsGenerating(false);
  }, [generateChartData]);

  const handleDownload = useCallback(() => {
    if (chartRef.current) {
      const canvas = chartRef.current.canvas;
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${chartConfig.title.replace(/\s+/g, '_')}.png`;
      link.href = url;
      link.click();
    }
  }, [chartConfig.title]);

  const handleSave = useCallback(() => {
    if (chartData) {
      onChartSave?.(chartConfig, chartData);
    }
  }, [chartConfig, chartData, onChartSave]);

  const renderChart = () => {
    if (!chartData) return null;

    const commonProps = {
      ref: chartRef,
      data: chartData,
      options: getChartOptions()
    };

    switch (chartConfig.type) {
      case 'line':
        return <Line {...commonProps} />;
      case 'bar':
        return <Bar {...commonProps} />;
      case 'pie':
        return <Pie {...commonProps} />;
      case 'scatter':
        return <Scatter {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-lab-primary/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-lab-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Chart Generator</h3>
              <p className="text-sm text-gray-500">
                Convert table data into interactive charts
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${
                showSettings ? 'bg-lab-primary text-white' : 'hover:bg-gray-100'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Table Selection */}
        {tableData.length > 1 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Table
            </label>
            <select
              value={selectedTable?.table_id || ''}
              onChange={(e) => {
                const table = tableData.find(t => t.table_id === e.target.value);
                setSelectedTable(table || null);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
            >
              {tableData.map((table) => (
                <option key={table.table_id} value={table.table_id}>
                  {table.table_id} ({table.numerical_data?.columns.length || 0} numerical columns)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chart Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chart Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { type: 'line', icon: LineChart, label: 'Line' },
                      { type: 'bar', icon: BarChart3, label: 'Bar' },
                      { type: 'pie', icon: PieChart, label: 'Pie' },
                      { type: 'scatter', icon: ScatterChart, label: 'Scatter' }
                    ].map(({ type, icon: Icon, label }) => (
                      <button
                        key={type}
                        onClick={() => setChartConfig(prev => ({ ...prev, type: type as any }))}
                        className={`p-2 border rounded-lg flex items-center space-x-2 transition-colors ${
                          chartConfig.type === type
                            ? 'border-lab-primary bg-lab-primary text-white'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Scheme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Scheme
                  </label>
                  <select
                    value={chartConfig.colorScheme}
                    onChange={(e) => setChartConfig(prev => ({ 
                      ...prev, 
                      colorScheme: e.target.value as any 
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
                  >
                    <option value="lab">Lab Theme</option>
                    <option value="scientific">Scientific</option>
                    <option value="colorful">Colorful</option>
                    <option value="monochrome">Monochrome</option>
                  </select>
                </div>

                {/* Chart Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chart Title
                  </label>
                  <input
                    type="text"
                    value={chartConfig.title}
                    onChange={(e) => setChartConfig(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
                  />
                </div>

                {/* Axis Labels */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    X-Axis Label
                  </label>
                  <input
                    type="text"
                    value={chartConfig.xAxis}
                    onChange={(e) => setChartConfig(prev => ({ ...prev, xAxis: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Y-Axis Label
                  </label>
                  <input
                    type="text"
                    value={chartConfig.yAxis}
                    onChange={(e) => setChartConfig(prev => ({ ...prev, yAxis: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
                  />
                </div>

                {/* Options */}
                <div className="md:col-span-2">
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={chartConfig.showLegend}
                        onChange={(e) => setChartConfig(prev => ({ 
                          ...prev, 
                          showLegend: e.target.checked 
                        }))}
                        className="rounded border-gray-300 text-lab-primary focus:ring-lab-primary"
                      />
                      <span className="text-sm">Show Legend</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={chartConfig.showGrid}
                        onChange={(e) => setChartConfig(prev => ({ 
                          ...prev, 
                          showGrid: e.target.checked 
                        }))}
                        className="rounded border-gray-300 text-lab-primary focus:ring-lab-primary"
                      />
                      <span className="text-sm">Show Grid</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={chartConfig.animation}
                        onChange={(e) => setChartConfig(prev => ({ 
                          ...prev, 
                          animation: e.target.checked 
                        }))}
                        className="rounded border-gray-300 text-lab-primary focus:ring-lab-primary"
                      />
                      <span className="text-sm">Enable Animation</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Column Selection */}
        {selectedTable?.numerical_data && selectedTable.numerical_data.columns.length >= 2 && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                X-Axis Data
              </label>
              <select
                value={selectedColumns.x}
                onChange={(e) => setSelectedColumns(prev => ({ 
                  ...prev, 
                  x: parseInt(e.target.value) 
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
              >
                {selectedTable.numerical_data.columns.map((col, index) => (
                  <option key={index} value={index}>
                    {col.header} ({col.data_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Y-Axis Data
              </label>
              <select
                value={selectedColumns.y}
                onChange={(e) => setSelectedColumns(prev => ({ 
                  ...prev, 
                  y: parseInt(e.target.value) 
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
              >
                {selectedTable.numerical_data.columns.map((col, index) => (
                  <option key={index} value={index}>
                    {col.header} ({col.data_type})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Quick Templates */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Templates
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(CHART_TEMPLATES).map(([key, template]) => (
              <button
                key={key}
                onClick={() => handleTemplateApply(key as keyof typeof CHART_TEMPLATES)}
                className="p-2 text-xs border border-gray-300 rounded-lg hover:border-lab-primary hover:bg-lab-primary/5 transition-colors text-left"
              >
                <div className="font-medium">{template.title}</div>
                <div className="text-gray-500 capitalize">{template.type}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="mb-4 flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedTable?.numerical_data}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span>{isGenerating ? 'Generating...' : 'Generate Chart'}</span>
          </button>
        </div>

        {/* Chart Display */}
        {chartData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Generated Chart</h4>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownload}
                  className="btn-outline text-sm flex items-center space-x-1"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                
                {onChartSave && (
                  <button
                    onClick={handleSave}
                    className="btn-primary text-sm flex items-center space-x-1"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                )}
              </div>
            </div>

            <div className="h-64 md:h-80">
              {renderChart()}
            </div>
          </motion.div>
        )}

        {/* No Data Message */}
        {tableData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-medium mb-2">No Table Data Available</h4>
            <p className="text-sm">
              Upload lab notes with tables to generate charts from numerical data.
            </p>
          </div>
        )}

        {/* No Numerical Data Message */}
        {tableData.length > 0 && selectedTable && !selectedTable.numerical_data && (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-medium mb-2">No Numerical Data Detected</h4>
            <p className="text-sm">
              The selected table doesn't contain sufficient numerical data for chart generation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}