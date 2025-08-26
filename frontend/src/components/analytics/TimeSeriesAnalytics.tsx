'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Badge, Modal, ModalFooter, LoadingSpinner } from '../ui';
import { analyticsService, TimeSeriesAnalysis, AnalyticsQuery, TimeSeriesDataPoint } from '../../services/analyticsService';
import { experimentService } from '../../services/experimentService';
import { Experiment } from '../../types/api';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle, 
  BarChart3,
  LineChart,
  PieChart,
  Download,
  Filter,
  Calendar,
  Target,
  Zap,
  Eye,
  Settings,
  RefreshCw
} from 'lucide-react';

interface TimeSeriesAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
  experimentId?: string;
  projectId?: string;
}

// Simple chart component (in a real app, you'd use a proper charting library like Chart.js or Recharts)
const SimpleLineChart: React.FC<{ 
  data: TimeSeriesDataPoint[]; 
  title: string; 
  showTrend?: boolean;
  showAnomalies?: boolean;
  anomalies?: any[];
}> = ({ data, title, showTrend = false, showAnomalies = false, anomalies = [] }) => {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="h-64 bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-900 mb-3">{title}</h4>
      <div className="relative h-48">
        <svg width="100%" height="100%" className="overflow-visible">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(percent => (
            <line
              key={percent}
              x1="0"
              y1={`${percent}%`}
              x2="100%"
              y2={`${percent}%`}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}
          
          {/* Data line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((point.value - minValue) / range) * 100;
              return `${x},${y}`;
            }).join(' ')}
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((point.value - minValue) / range) * 100;
            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={`${y}%`}
                r="3"
                fill="#3b82f6"
                className="hover:fill-blue-700 cursor-pointer"
              >
                <title>{`${point.parameter}: ${point.value} ${point.unit || ''} at ${new Date(point.timestamp).toLocaleString()}`}</title>
              </circle>
            );
          })}
          
          {/* Anomalies */}
          {showAnomalies && anomalies.map((anomaly, index) => {
            const dataIndex = data.findIndex(d => d.timestamp === anomaly.timestamp);
            if (dataIndex === -1) return null;
            
            const x = (dataIndex / (data.length - 1)) * 100;
            const y = 100 - ((anomaly.value - minValue) / range) * 100;
            
            return (
              <circle
                key={`anomaly-${index}`}
                cx={`${x}%`}
                cy={`${y}%`}
                r="5"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                className="animate-pulse"
              >
                <title>{`Anomaly: ${anomaly.type} (${anomaly.severity})`}</title>
              </circle>
            );
          })}
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
          <span>{maxValue.toFixed(1)}</span>
          <span>{((maxValue + minValue) / 2).toFixed(1)}</span>
          <span>{minValue.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};

export const TimeSeriesAnalytics: React.FC<TimeSeriesAnalyticsProps> = ({
  isOpen,
  onClose,
  experimentId,
  projectId
}) => {
  const [loading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState<TimeSeriesAnalysis[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [availableParameters, setAvailableParameters] = useState<Array<{ parameter: string; unit?: string; count: number }>>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<TimeSeriesAnalysis | null>(null);
  
  // Query form
  const [query, setQuery] = useState<AnalyticsQuery>({
    experiment_ids: experimentId ? [experimentId] : [],
    project_ids: projectId ? [projectId] : [],
    parameters: [],
    aggregation: 'daily',
    include_forecast: true,
    include_anomalies: true,
    include_correlations: true,
    forecast_horizon: 7
  });

  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadExperiments();
      loadAvailableParameters();
    }
  }, [isOpen, projectId]);

  const loadExperiments = async () => {
    if (!projectId && !experimentId) return;
    
    try {
      if (projectId) {
        const response = await experimentService.listExperiments({ project_id: projectId, size: 100 });
        setExperiments(response.experiments);
      }
    } catch (error) {
      console.error('Failed to load experiments:', error);
    }
  };

  const loadAvailableParameters = async () => {
    try {
      const params: any = {};
      if (projectId) params.project_ids = [projectId];
      if (experimentId) params.experiment_ids = [experimentId];
      if (dateRange.start) params.start_date = dateRange.start;
      if (dateRange.end) params.end_date = dateRange.end;
      
      const parameters = await analyticsService.getAvailableParameters(params);
      setAvailableParameters(parameters);
    } catch (error) {
      console.error('Failed to load parameters:', error);
    }
  };

  const runAnalysis = async () => {
    if (query.parameters?.length === 0) return;

    setLoading(true);
    try {
      const finalQuery = {
        ...query,
        start_date: dateRange.start || undefined,
        end_date: dateRange.end || undefined
      };
      
      const results = await analyticsService.getTimeSeriesAnalysis(finalQuery);
      setAnalyses(results);
    } catch (error) {
      console.error('Failed to run analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleParameter = (parameter: string) => {
    setQuery(prev => ({
      ...prev,
      parameters: prev.parameters?.includes(parameter)
        ? prev.parameters.filter(p => p !== parameter)
        : [...(prev.parameters || []), parameter]
    }));
  };

  const toggleExperiment = (expId: string) => {
    setQuery(prev => ({
      ...prev,
      experiment_ids: prev.experiment_ids?.includes(expId)
        ? prev.experiment_ids.filter(id => id !== expId)
        : [...(prev.experiment_ids || []), expId]
    }));
  };

  const exportData = async (format: 'csv' | 'json' | 'excel') => {
    try {
      const blob = await analyticsService.exportData(query, format);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics_export.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <Activity className="w-4 h-4 text-blue-500" />;
      case 'oscillating': return <Zap className="w-4 h-4 text-purple-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-green-600 bg-green-50';
      case 'decreasing': return 'text-red-600 bg-red-50';
      case 'stable': return 'text-blue-600 bg-blue-50';
      case 'oscillating': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Time-Series Analytics" size="xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            📊 Advanced Time-Series Analysis
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Track experimental parameters over time with AI-powered analytics, anomaly detection, and forecasting.
          </p>
        </div>

        {/* Query Configuration */}
        <Card className="p-4">
          <h4 className="text-md font-medium text-gray-900 mb-4">Analysis Configuration</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  placeholder="Start date"
                />
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  placeholder="End date"
                />
              </div>
            </div>

            {/* Aggregation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Aggregation</label>
              <select
                value={query.aggregation}
                onChange={(e) => setQuery(prev => ({ ...prev, aggregation: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="raw">Raw Data</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          {/* Parameters Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Parameters ({query.parameters?.length || 0} selected)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
              {availableParameters.map((param) => (
                <div key={param.parameter} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={query.parameters?.includes(param.parameter) || false}
                    onChange={() => toggleParameter(param.parameter)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{param.parameter}</p>
                    <p className="text-xs text-gray-500">
                      {param.unit && `${param.unit} • `}{param.count} points
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Experiments Selection */}
          {experiments.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Experiments ({query.experiment_ids?.length || 0} selected)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3">
                {experiments.map((exp) => (
                  <div key={exp.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={query.experiment_ids?.includes(exp.id) || false}
                      onChange={() => toggleExperiment(exp.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{exp.title}</p>
                      <p className="text-xs text-gray-500">{exp.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Options */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={query.include_forecast || false}
                onChange={(e) => setQuery(prev => ({ ...prev, include_forecast: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">Include Forecast</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={query.include_anomalies || false}
                onChange={(e) => setQuery(prev => ({ ...prev, include_anomalies: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">Detect Anomalies</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={query.include_correlations || false}
                onChange={(e) => setQuery(prev => ({ ...prev, include_correlations: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">Find Correlations</label>
            </div>
            
            {query.include_forecast && (
              <div>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={query.forecast_horizon}
                  onChange={(e) => setQuery(prev => ({ ...prev, forecast_horizon: Number(e.target.value) }))}
                  placeholder="Forecast days"
                />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button onClick={runAnalysis} loading={loading} disabled={!query.parameters?.length}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Run Analysis
            </Button>
            <Button variant="outline" onClick={loadAvailableParameters}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Parameters
            </Button>
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-2 text-sm text-gray-600">Analyzing time-series data...</p>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analyses.length > 0 && (
          <div className="space-y-6">
            {/* Export Options */}
            <div className="flex items-center space-x-2">
              <Button  variant="outline" onClick={() => exportData('csv')}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button  variant="outline" onClick={() => exportData('json')}>
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
              <Button  variant="outline" onClick={() => exportData('excel')}>
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
            </div>

            {/* Analysis Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analyses.map((analysis) => (
                <Card key={analysis.parameter} className="p-4">
                  {/* Parameter Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {analysis.parameter}
                        {analysis.unit && <span className="text-sm text-gray-500 ml-2">({analysis.unit})</span>}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getTrendColor(analysis.statistics.trend)}>
                          {getTrendIcon(analysis.statistics.trend)}
                          <span className="ml-1 capitalize">{analysis.statistics.trend}</span>
                        </Badge>
                        {analysis.statistics.seasonality_detected && (
                          <Badge variant="default">Seasonal</Badge>
                        )}
                      </div>
                    </div>
                    <Button  variant="outline" onClick={() => setSelectedAnalysis(analysis)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                  </div>

                  {/* Chart */}
                  <SimpleLineChart
                    data={analysis.data_points}
                    title={`${analysis.parameter} Over Time`}
                    showAnomalies={query.include_anomalies}
                    anomalies={analysis.anomalies}
                  />

                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-600">Mean</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {analysis.statistics.mean.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-600">Std Dev</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {analysis.statistics.std_dev.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-600">Data Points</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {analysis.statistics.count}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-600">Anomalies</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {analysis.statistics.anomaly_count}
                      </p>
                    </div>
                  </div>

                  {/* Quick Insights */}
                  <div className="mt-4 space-y-2">
                    {analysis.statistics.anomaly_count > 0 && (
                      <div className="flex items-center space-x-2 text-sm text-amber-700 bg-amber-50 p-2 rounded">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{analysis.statistics.anomaly_count} anomalies detected</span>
                      </div>
                    )}
                    
                    {analysis.forecast && (
                      <div className="flex items-center space-x-2 text-sm text-blue-700 bg-blue-50 p-2 rounded">
                        <Target className="w-4 h-4" />
                        <span>Forecast accuracy: {Math.round(analysis.forecast.accuracy_score * 100)}%</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Correlations Summary */}
            {analyses.some(a => a.correlations.length > 0) && (
              <Card className="p-4">
                <h4 className="text-md font-medium text-gray-900 mb-4">Parameter Correlations</h4>
                <div className="space-y-2">
                  {analyses.flatMap(a => 
                    a.correlations
                      .filter(c => Math.abs(c.correlation) > 0.5)
                      .map(c => (
                        <div key={`${a.parameter}-${c.parameter}`} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-900">
                            {a.parameter} ↔ {c.parameter}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Badge variant={Math.abs(c.correlation) > 0.8 ? 'success' : 'default'}>
                              r = {c.correlation.toFixed(3)}
                            </Badge>
                            <Badge variant={c.significance === 'high' ? 'success' : 'default'}>
                              {c.significance}
                            </Badge>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Detailed Analysis Modal */}
        {selectedAnalysis && (
          <Modal
            isOpen={!!selectedAnalysis}
            onClose={() => setSelectedAnalysis(null)}
            title={`Detailed Analysis: ${selectedAnalysis.parameter}`}
            size="xl"
          >
            <div className="space-y-4">
              {/* Comprehensive Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(selectedAnalysis.statistics).map(([key, value]) => (
                  <div key={key} className="text-center p-3 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-600 capitalize">
                      {key.replace('_', ' ')}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {typeof value === 'number' ? value.toFixed(3) : value.toString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Anomalies Detail */}
              {selectedAnalysis.anomalies.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Detected Anomalies</h5>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedAnalysis.anomalies.map((anomaly, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <div>
                          <p className="text-sm font-medium text-red-900">
                            {anomaly.type} - {anomaly.value.toFixed(2)} {selectedAnalysis.unit}
                          </p>
                          <p className="text-xs text-red-700">
                            {new Date(anomaly.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="danger">{anomaly.severity}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Forecast Details */}
              {selectedAnalysis.forecast && (
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Forecast Information</h5>
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-900">
                      Model: {selectedAnalysis.forecast.model_type}
                    </p>
                    <p className="text-sm text-blue-900">
                      Accuracy: {Math.round(selectedAnalysis.forecast.accuracy_score * 100)}%
                    </p>
                    <p className="text-sm text-blue-900">
                      Forecast Points: {selectedAnalysis.forecast.predicted_values.length}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <ModalFooter>
              <Button variant="outline" onClick={() => setSelectedAnalysis(null)}>
                Close
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};