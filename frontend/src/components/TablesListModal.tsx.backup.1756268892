'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Table,
  Calendar,
  Search,
  ChevronRight,
  FileText,
  Download,
  Eye,
  Database
} from 'lucide-react';

interface DetectedTable {
  id: number;
  note_id: number;
  note_title: string;
  table_data: any[][];
  headers?: string[];
  created_at: string;
  confidence: number;
  rows: number;
  columns: number;
  description?: string;
}

interface TablesListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTableSelect?: (table: DetectedTable) => void;
}

export function TablesListModal({ isOpen, onClose, onTableSelect }: TablesListModalProps) {
  const [tables, setTables] = useState<DetectedTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTable, setSelectedTable] = useState<DetectedTable | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTables();
    }
  }, [isOpen]);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5005/detected_tables');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched tables:', data);
        setTables(data);
      } else {
        throw new Error('Failed to fetch tables');
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      // Use mock data for demonstration
      setTables([
        {
          id: 1,
          note_id: 2,
          note_title: 'Lab Note - P.ATB1 Experiment',
          table_data: [
            ['Sample', 'Concentration', 'pH', 'Temperature'],
            ['A1', '500 ng/mL', '7.4', '37°C'],
            ['A2', '250 ng/mL', '7.2', '37°C'],
            ['Control', '0 ng/mL', '7.0', '25°C']
          ],
          headers: ['Sample', 'Concentration', 'pH', 'Temperature'],
          created_at: '2025-08-03T23:54:53.451205',
          confidence: 0.92,
          rows: 4,
          columns: 4,
          description: 'Heparin sodium concentration measurements'
        },
        {
          id: 2,
          note_id: 3,
          note_title: 'Lab Note - P.ATB Aminolysis',
          table_data: [
            ['Time (min)', 'Absorbance', 'Concentration'],
            ['0', '0.000', '0'],
            ['15', '0.245', '12.3'],
            ['30', '0.489', '24.5'],
            ['60', '0.923', '46.2']
          ],
          headers: ['Time (min)', 'Absorbance', 'Concentration'],
          created_at: '2025-08-04T01:09:44.016820',
          confidence: 0.88,
          rows: 5,
          columns: 3,
          description: 'Time-course absorbance measurements'
        },
        {
          id: 3,
          note_id: 4,
          note_title: 'Lab Note - P.ATLAS',
          table_data: [
            ['Sample ID', 'Cell Count', 'Viability (%)', 'Notes'],
            ['ATLAS-001', '2.3×10⁶', '95', 'Good morphology'],
            ['ATLAS-002', '1.8×10⁶', '92', 'Some debris'],
            ['ATLAS-003', '2.1×10⁶', '94', 'Excellent']
          ],
          headers: ['Sample ID', 'Cell Count', 'Viability (%)', 'Notes'],
          created_at: '2025-08-04T02:30:30.053466',
          confidence: 0.95,
          rows: 4,
          columns: 4,
          description: 'Cell viability assessment'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTables = tables.filter(table => 
    table.note_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.headers?.some(h => h.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const handleTableClick = (table: DetectedTable) => {
    setSelectedTable(table);
    if (onTableSelect) {
      onTableSelect(table);
    }
  };

  const exportTableAsCSV = (table: DetectedTable) => {
    const csvContent = table.table_data
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `table_${table.id}_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
                  <h2 className="text-2xl font-bold text-gray-900">Detected Tables</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {tables.length} tables detected from your lab notes
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
                  placeholder="Search tables by note title, headers, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex h-[calc(90vh-180px)]">
              {/* Tables List */}
              <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : filteredTables.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Table className="w-12 h-12 mb-3" />
                    <p>No tables found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredTables.map((table) => (
                      <div
                        key={table.id}
                        onClick={() => handleTableClick(table)}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedTable?.id === table.id ? 'bg-purple-50 border-l-4 border-purple-600' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {table.note_title}
                            </h3>
                            {table.description && (
                              <p className="text-sm text-gray-600 mb-2">
                                {table.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Database className="w-3 h-3" />
                                <span>{table.rows}×{table.columns}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(table.created_at)}</span>
                              </div>
                              {table.confidence && (
                                <span className="text-green-600">
                                  {(table.confidence * 100).toFixed(0)}% confidence
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Table Preview */}
              <div className="w-2/3 p-6 overflow-y-auto bg-gray-50">
                {selectedTable ? (
                  <div>
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {selectedTable.note_title}
                        </h3>
                        <button
                          onClick={() => exportTableAsCSV(selectedTable)}
                          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>Export CSV</span>
                        </button>
                      </div>
                      {selectedTable.description && (
                        <p className="text-gray-600 mb-2">{selectedTable.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Table className="w-4 h-4" />
                          <span>{selectedTable.rows} rows × {selectedTable.columns} columns</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="w-4 h-4" />
                          <span>From note #{selectedTable.note_id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        {selectedTable.headers && (
                          <thead className="bg-gray-50">
                            <tr>
                              {selectedTable.headers.map((header, index) => (
                                <th
                                  key={index}
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                        )}
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedTable.table_data.slice(selectedTable.headers ? 1 : 0).map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50">
                              {row.map((cell, cellIndex) => (
                                <td
                                  key={cellIndex}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6 flex items-center justify-end space-x-3">
                      <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <Eye className="w-4 h-4" />
                        <span>View in Note</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Table className="w-16 h-16 mb-4" />
                    <p className="text-lg">Select a table to preview</p>
                    <p className="text-sm mt-2">Click on any table from the list to see its contents</p>
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