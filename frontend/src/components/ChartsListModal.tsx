'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  BarChart3,
  Calendar,
  Search,
  ChevronRight,
  FileText,
  Download,
  TrendingUp,
  PieChart,
  LineChart,
  Eye
} from 'lucide-react';

interface GeneratedChart {
  id: number;
  note_id: number;
  note_title: string;
  chart_type: 'line' | 'bar' | 'pie' | 'scatter' | 'area';
  chart_data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string;
    }>;
  };
  title: string;
  description?: string;
  created_at: string;
  data_points: number;
  image_url?: string;
}

interface ChartsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChartSelect?: (chart: GeneratedChart) => void;
}

export function ChartsListModal({ isOpen, onClose, onChartSelect }: ChartsListModalProps) {
  const router = useRouter();
  const [charts, setCharts] = useState<GeneratedChart[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChart, setSelectedChart] = useState<GeneratedChart | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCharts();
    }
  }, [isOpen]);

  const fetchCharts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005'}/generated_charts`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched charts:', data);
        setCharts(data);
      } else {
        throw new Error('Failed to fetch charts');
      }
    } catch (error) {
      console.error('Error fetching charts:', error);
      // Use mock data for demonstration
      setCharts([
        {
          id: 1,
          note_id: 2,
          note_title: 'Lab Note - P.ATB1 pH Monitoring',
          chart_type: 'line',
          chart_data: {
            labels: ['0 min', '15 min', '30 min', '45 min', '60 min', '90 min', '120 min'],
            datasets: [{
              label: 'pH Level',
              data: [7.4, 7.35, 7.32, 7.28, 7.25, 7.22, 7.20],
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)'
            }]
          },
          title: 'pH Change Over Time',
          description: 'pH monitoring during heparin sodium treatment',
          created_at: '2025-08-03T23:54:53.451205',
          data_points: 7
        },
        {
          id: 2,
          note_id: 3,
          note_title: 'Lab Note - Absorbance Measurements',
          chart_type: 'bar',
          chart_data: {
            labels: ['Sample A', 'Sample B', 'Sample C', 'Control'],
            datasets: [{
              label: 'Absorbance at 280nm',
              data: [0.923, 0.845, 0.756, 0.123],
              backgroundColor: ['#10B981', '#3B82F6', '#8B5CF6', '#6B7280']
            }]
          },
          title: 'Protein Concentration Analysis',
          description: 'Absorbance measurements for protein quantification',
          created_at: '2025-08-04T01:09:44.016820',
          data_points: 4
        },
        {
          id: 3,
          note_id: 4,
          note_title: 'Lab Note - Cell Viability',
          chart_type: 'pie',
          chart_data: {
            labels: ['Viable Cells', 'Dead Cells', 'Debris'],
            datasets: [{
              label: 'Cell Distribution',
              data: [94, 4, 2],
              backgroundColor: ['#10B981', '#EF4444', '#FCD34D']
            }]
          },
          title: 'Cell Viability Distribution',
          description: 'Cell viability assessment for ATLAS samples',
          created_at: '2025-08-04T02:30:30.053466',
          data_points: 3
        },
        {
          id: 4,
          note_id: 3,
          note_title: 'Lab Note - Time Course',
          chart_type: 'area',
          chart_data: {
            labels: ['0h', '2h', '4h', '6h', '8h', '12h', '24h'],
            datasets: [{
              label: 'Enzyme Activity',
              data: [0, 23, 45, 67, 82, 95, 98],
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              borderColor: '#8B5CF6'
            }]
          },
          title: 'Enzyme Activity Time Course',
          description: 'Enzymatic reaction progress over 24 hours',
          created_at: '2025-08-04T01:09:44.016820',
          data_points: 7
        },
        {
          id: 5,
          note_id: 5,
          note_title: 'Lab Note - Temperature Profile',
          chart_type: 'scatter',
          chart_data: {
            labels: ['Point 1', 'Point 2', 'Point 3', 'Point 4', 'Point 5'],
            datasets: [{
              label: 'Temperature vs Activity',
              data: [
                {x: 20, y: 45},
                {x: 25, y: 62},
                {x: 30, y: 78},
                {x: 37, y: 95},
                {x: 42, y: 72}
              ] as any,
              backgroundColor: '#F59E0B'
            }]
          },
          title: 'Temperature-Activity Correlation',
          description: 'Relationship between temperature and enzymatic activity',
          created_at: '2025-08-04T03:15:35.562649',
          data_points: 5
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCharts = charts.filter(chart => 
    chart.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chart.note_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chart.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chart.chart_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleChartClick = (chart: GeneratedChart) => {
    setSelectedChart(chart);
    if (onChartSelect) {
      onChartSelect(chart);
    }
  };

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'line': return <LineChart className="w-4 h-4" />;
      case 'bar': return <BarChart3 className="w-4 h-4" />;
      case 'pie': return <PieChart className="w-4 h-4" />;
      case 'scatter': 
      case 'area': return <TrendingUp className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getChartColor = (type: string) => {
    switch (type) {
      case 'line': return 'text-blue-600 bg-blue-100';
      case 'bar': return 'text-green-600 bg-green-100';
      case 'pie': return 'text-purple-600 bg-purple-100';
      case 'scatter': return 'text-orange-600 bg-orange-100';
      case 'area': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderChartPreview = (chart: GeneratedChart) => {
    // Simple SVG representation of the chart
    const { chart_data, chart_type } = chart;
    
    if (chart_type === 'pie') {
      return (
        <div className="w-full h-64 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-48 h-48">
            <circle cx="100" cy="100" r="80" fill="#10B981" />
            <path d="M 100 100 L 100 20 A 80 80 0 0 1 180 100 Z" fill="#EF4444" />
            <path d="M 100 100 L 180 100 A 80 80 0 0 1 170 150 Z" fill="#FCD34D" />
          </svg>
        </div>
      );
    }

    const maxValue = Math.max(...(chart_data.datasets[0].data as number[]));
    const barWidth = 100 / chart_data.labels.length;

    return (
      <div className="w-full h-64 bg-white rounded-lg p-4">
        <svg viewBox="0 0 400 200" className="w-full h-full">
          {chart_type === 'line' ? (
            <>
              <polyline
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                points={chart_data.datasets[0].data
                  .map((value, i) => 
                    `${i * (400 / (chart_data.labels.length - 1))},${200 - ((value as number) / maxValue) * 180}`
                  )
                  .join(' ')}
              />
              {chart_data.datasets[0].data.map((value, i) => (
                <circle
                  key={i}
                  cx={i * (400 / (chart_data.labels.length - 1))}
                  cy={200 - ((value as number) / maxValue) * 180}
                  r="4"
                  fill="#3B82F6"
                />
              ))}
            </>
          ) : chart_type === 'bar' ? (
            chart_data.datasets[0].data.map((value, i) => (
              <rect
                key={i}
                x={i * (400 / chart_data.labels.length) + 10}
                y={200 - ((value as number) / maxValue) * 180}
                width={barWidth * 3}
                height={((value as number) / maxValue) * 180}
                fill={Array.isArray(chart_data.datasets[0].backgroundColor) 
                  ? chart_data.datasets[0].backgroundColor[i] 
                  : '#3B82F6'}
              />
            ))
          ) : null}
        </svg>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Generated Charts</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {charts.length} charts generated from your data
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search charts by title, type, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex h-[calc(90vh-180px)]">
              {/* Charts List */}
              <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                  </div>
                ) : filteredCharts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <BarChart3 className="w-12 h-12 mb-3" />
                    <p>No charts found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredCharts.map((chart) => (
                      <div
                        key={chart.id}
                        onClick={() => handleChartClick(chart)}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedChart?.id === chart.id ? 'bg-orange-50 border-l-4 border-orange-600' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className={`p-1 rounded ${getChartColor(chart.chart_type)}`}>
                                {getChartIcon(chart.chart_type)}
                              </div>
                              <h3 className="font-semibold text-gray-900">
                                {chart.title}
                              </h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {chart.note_title}
                            </p>
                            {chart.description && (
                              <p className="text-xs text-gray-500 mb-2">
                                {chart.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="capitalize">{chart.chart_type} chart</span>
                              <span>{chart.data_points} data points</span>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(chart.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chart Preview */}
              <div className="w-2/3 p-6 overflow-y-auto bg-gray-50">
                {selectedChart ? (
                  <div>
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {selectedChart.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            From: {selectedChart.note_title}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                            <Download className="w-4 h-4" />
                            <span>Export</span>
                          </button>
                        </div>
                      </div>
                      {selectedChart.description && (
                        <p className="text-gray-600 mb-4">{selectedChart.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          {getChartIcon(selectedChart.chart_type)}
                          <span className="capitalize">{selectedChart.chart_type} Chart</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="w-4 h-4" />
                          <span>{selectedChart.data_points} data points</span>
                        </div>
                      </div>
                    </div>

                    {/* Chart Visualization */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      {renderChartPreview(selectedChart)}
                    </div>

                    {/* Data Table */}
                    <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Data Points</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                              {selectedChart.chart_data.datasets.map((dataset, i) => (
                                <th key={i} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  {dataset.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedChart.chart_data.labels.map((label, i) => (
                              <tr key={i}>
                                <td className="px-4 py-2 text-sm text-gray-900">{label}</td>
                                {selectedChart.chart_data.datasets.map((dataset, j) => (
                                  <td key={j} className="px-4 py-2 text-sm text-gray-900">
                                    {typeof dataset.data[i] === 'object' 
                                      ? `(${(dataset.data[i] as any).x}, ${(dataset.data[i] as any).y})`
                                      : dataset.data[i]}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end space-x-3">
                      <button 
                        onClick={() => {
                          // Navigate to the entries page with the note ID
                          router.push(`/entries?noteId=${selectedChart.note_id}`);
                          onClose();
                        }}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View in Note</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <BarChart3 className="w-16 h-16 mb-4" />
                    <p className="text-lg">Select a chart to preview</p>
                    <p className="text-sm mt-2">Click on any chart from the list to see visualization</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}