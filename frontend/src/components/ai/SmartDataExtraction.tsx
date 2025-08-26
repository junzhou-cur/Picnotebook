'use client';

import React, { useState } from 'react';
import { Button, Card, Badge, Modal, ModalFooter, LoadingSpinner } from '../ui';
import { aiService, AIDataExtractionResult, SmartDataExtractionRequest } from '../../services/aiService';
import { 
  Brain, 
  FileText, 
  Database, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Download,
  Copy,
  Eye,
  BarChart3,
  Beaker
} from 'lucide-react';

interface SmartDataExtractionProps {
  isOpen: boolean;
  onClose: () => void;
  initialText?: string;
  onExtractedData?: (data: AIDataExtractionResult) => void;
}

export const SmartDataExtraction: React.FC<SmartDataExtractionProps> = ({
  isOpen,
  onClose,
  initialText = '',
  onExtractedData
}) => {
  const [inputText, setInputText] = useState(initialText);
  const [context, setContext] = useState<'lab_notes' | 'protocol' | 'results' | 'observation'>('lab_notes');
  const [experimentType, setExperimentType] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractionResult, setExtractionResult] = useState<AIDataExtractionResult | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);

  const handleExtractData = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      const request: SmartDataExtractionRequest = {
        text: inputText,
        context,
        experiment_type: experimentType || undefined
      };

      const result = await aiService.extractStructuredData(request);
      setExtractionResult(result);
      onExtractedData?.(result);
    } catch (error: any) {
      console.error('Failed to extract data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEntityTypeColor = (type: string) => {
    switch (type) {
      case 'measurement': return 'text-blue-600 bg-blue-50';
      case 'condition': return 'text-green-600 bg-green-50';
      case 'result': return 'text-purple-600 bg-purple-50';
      case 'observation': return 'text-orange-600 bg-orange-50';
      case 'protocol': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'measurement': return <BarChart3 className="w-4 h-4" />;
      case 'condition': return <Beaker className="w-4 h-4" />;
      case 'result': return <TrendingUp className="w-4 h-4" />;
      case 'observation': return <Eye className="w-4 h-4" />;
      case 'protocol': return <FileText className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const highlightEntities = (text: string, entities: any[]) => {
    if (!entities.length) return text;

    const sortedEntities = [...entities].sort((a, b) => a.position.start - b.position.start);
    let result = '';
    let lastIndex = 0;

    sortedEntities.forEach((entity) => {
      // Add text before entity
      result += text.slice(lastIndex, entity.position.start);
      
      // Add highlighted entity
      const entityText = text.slice(entity.position.start, entity.position.end);
      result += `<mark class="bg-${entity.type === 'measurement' ? 'blue' : 
                                entity.type === 'condition' ? 'green' :
                                entity.type === 'result' ? 'purple' :
                                entity.type === 'observation' ? 'orange' : 'red'}-100 
                                text-${entity.type === 'measurement' ? 'blue' : 
                                entity.type === 'condition' ? 'green' :
                                entity.type === 'result' ? 'purple' :
                                entity.type === 'observation' ? 'orange' : 'red'}-800 
                                px-1 rounded cursor-pointer" 
                       title="${entity.type}: ${entity.confidence.toFixed(2)} confidence"
                       onclick="selectEntity('${entity.type}', '${entityText}')">${entityText}</mark>`;
      
      lastIndex = entity.position.end;
    });

    // Add remaining text
    result += text.slice(lastIndex);
    return result;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportData = (format: 'json' | 'csv') => {
    if (!extractionResult) return;

    let content = '';
    let filename = '';

    if (format === 'json') {
      content = JSON.stringify(extractionResult, null, 2);
      filename = 'extracted_data.json';
    } else {
      // CSV format for measurements
      const measurements = extractionResult.structured_data.measurements;
      if (measurements.length > 0) {
        const headers = ['Parameter', 'Value', 'Unit', 'Timestamp'];
        const rows = measurements.map(m => [
          m.parameter,
          m.value.toString(),
          m.unit || '',
          m.timestamp || ''
        ]);
        
        content = [headers, ...rows].map(row => row.join(',')).join('\n');
        filename = 'measurements.csv';
      }
    }

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Smart Data Extraction" size="xl">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            🧠 AI-Powered Data Extraction
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Extract structured data from your lab notes, protocols, and experimental records using advanced AI.
          </p>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Context Type
              </label>
              <select
                value={context}
                onChange={(e) => setContext(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="lab_notes">Lab Notes</option>
                <option value="protocol">Protocol</option>
                <option value="results">Results</option>
                <option value="observation">Observation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experiment Type (Optional)
              </label>
              <input
                type="text"
                value={experimentType}
                onChange={(e) => setExperimentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., PCR, Western blot, Cell culture..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text to Analyze
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Paste your lab notes, protocol, or experimental text here..."
            />
          </div>

          <Button onClick={handleExtractData} loading={loading} disabled={!inputText.trim()}>
            <Brain className="w-4 h-4 mr-2" />
            Extract Data
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-2 text-sm text-gray-600">AI is analyzing your text...</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {extractionResult && (
          <div className="space-y-6">
            {/* Quality Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Quality Score</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(extractionResult.quality_score * 100)}%
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${getQualityColor(extractionResult.quality_score)}`}>
                    {extractionResult.quality_score >= 0.8 ? 
                      <CheckCircle className="w-6 h-6" /> : 
                      <AlertCircle className="w-6 h-6" />
                    }
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completeness</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(extractionResult.completeness_score * 100)}%
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${getQualityColor(extractionResult.completeness_score)}`}>
                    <Database className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Export Actions */}
            <div className="flex items-center space-x-2">
              <Button  variant="outline" onClick={() => exportData('json')}>
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
              <Button  variant="outline" onClick={() => exportData('csv')}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button 
                 
                variant="outline" 
                onClick={() => copyToClipboard(JSON.stringify(extractionResult.structured_data, null, 2))}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Data
              </Button>
            </div>

            {/* Extracted Entities */}
            <Card className="p-4">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                Extracted Entities ({extractionResult.entities.length})
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {Object.entries(
                  extractionResult.entities.reduce((acc, entity) => {
                    acc[entity.type] = (acc[entity.type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([type, count]) => (
                  <div key={type} className={`p-3 rounded-lg ${getEntityTypeColor(type)}`}>
                    <div className="flex items-center space-x-2">
                      {getEntityIcon(type)}
                      <span className="text-sm font-medium capitalize">{type}</span>
                      <Badge variant="default">{count}</Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {extractionResult.entities.map((entity, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                    onClick={() => setSelectedEntity(entity)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-1 rounded ${getEntityTypeColor(entity.type)}`}>
                        {getEntityIcon(entity.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{entity.value}</p>
                        {entity.unit && (
                          <p className="text-xs text-gray-500">Unit: {entity.unit}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="default">
                      {Math.round(entity.confidence * 100)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Structured Data */}
            <Card className="p-4">
              <h4 className="text-md font-medium text-gray-900 mb-4">Structured Data</h4>
              
              {/* Measurements */}
              {extractionResult.structured_data.measurements.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">
                    Measurements ({extractionResult.structured_data.measurements.length})
                  </h5>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Parameter</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {extractionResult.structured_data.measurements.map((measurement, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-sm text-gray-900">{measurement.parameter}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{measurement.value}</td>
                            <td className="px-3 py-2 text-sm text-gray-500">{measurement.unit || '-'}</td>
                            <td className="px-3 py-2 text-sm text-gray-500">{measurement.timestamp || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Conditions */}
              {Object.keys(extractionResult.structured_data.conditions).length > 0 && (
                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Conditions</h5>
                  <div className="bg-green-50 p-3 rounded-md">
                    <pre className="text-sm text-green-800">
                      {JSON.stringify(extractionResult.structured_data.conditions, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Protocols */}
              {extractionResult.structured_data.protocols.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">
                    Protocols ({extractionResult.structured_data.protocols.length})
                  </h5>
                  <ul className="list-disc list-inside space-y-1">
                    {extractionResult.structured_data.protocols.map((protocol, index) => (
                      <li key={index} className="text-sm text-gray-700">{protocol}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Results */}
              {extractionResult.structured_data.results.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">
                    Results ({extractionResult.structured_data.results.length})
                  </h5>
                  <ul className="list-disc list-inside space-y-1">
                    {extractionResult.structured_data.results.map((result, index) => (
                      <li key={index} className="text-sm text-gray-700">{result}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          </div>
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