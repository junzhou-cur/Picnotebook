import { apiCall, buildCoreUrl } from '../config/api';

export interface AIExperimentSuggestion {
  id: string;
  type: 'methodology' | 'controls' | 'parameters' | 'troubleshooting' | 'optimization';
  title: string;
  description: string;
  rationale: string;
  confidence: number;
  references?: string[];
  parameters?: Record<string, any>;
  estimatedTime?: string;
  estimatedCost?: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface AITroubleshootingSuggestion {
  id: string;
  issue: string;
  possibleCauses: string[];
  solutions: Array<{
    description: string;
    steps: string[];
    success_probability: number;
    time_estimate: string;
  }>;
  prevention_tips: string[];
  confidence: number;
}

export interface AIDataExtractionResult {
  entities: Array<{
    type: 'measurement' | 'condition' | 'result' | 'observation' | 'protocol';
    value: string;
    unit?: string;
    confidence: number;
    position: { start: number; end: number };
  }>;
  structured_data: {
    measurements: Array<{
      parameter: string;
      value: number;
      unit: string;
      timestamp?: string;
    }>;
    conditions: Record<string, any>;
    protocols: string[];
    results: string[];
  };
  quality_score: number;
  completeness_score: number;
}

export interface ExperimentDesignRequest {
  objective: string;
  constraints?: string[];
  available_equipment?: string[];
  budget_limit?: number;
  time_limit?: string;
  previous_experiments?: string[];
  organism?: string;
  technique_preferences?: string[];
}

export interface TroubleshootingRequest {
  experiment_type: string;
  issue_description: string;
  symptoms: string[];
  conditions: Record<string, any>;
  recent_changes?: string[];
}

export interface SmartDataExtractionRequest {
  text: string;
  context?: 'lab_notes' | 'protocol' | 'results' | 'observation';
  experiment_type?: string;
}

class AIService {
  /**
   * Get AI-powered experiment design suggestions
   */
  async getExperimentSuggestions(request: ExperimentDesignRequest): Promise<AIExperimentSuggestion[]> {
    const url = buildCoreUrl('/ai/experiment-suggestions');
    return apiCall<AIExperimentSuggestion[]>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
  }

  /**
   * Get troubleshooting suggestions for experimental issues
   */
  async getTroubleshootingSuggestions(request: TroubleshootingRequest): Promise<AITroubleshootingSuggestion[]> {
    const url = buildCoreUrl('/ai/troubleshooting');
    return apiCall<AITroubleshootingSuggestion[]>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
  }

  /**
   * Extract structured data from lab notes using AI
   */
  async extractStructuredData(request: SmartDataExtractionRequest): Promise<AIDataExtractionResult> {
    const url = buildCoreUrl('/ai/extract-data');
    return apiCall<AIDataExtractionResult>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
  }

  /**
   * Get AI-powered protocol optimization suggestions
   */
  async optimizeProtocol(protocolText: string, objectives: string[]): Promise<AIExperimentSuggestion[]> {
    const url = buildCoreUrl('/ai/optimize-protocol');
    return apiCall<AIExperimentSuggestion[]>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        protocol: protocolText,
        objectives,
      }),
    });
  }

  /**
   * Get similar experiments from database
   */
  async findSimilarExperiments(description: string, limit: number = 10): Promise<any[]> {
    const url = buildCoreUrl('/ai/similar-experiments');
    return apiCall<any[]>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        limit,
      }),
    });
  }

  /**
   * Generate experimental controls suggestions
   */
  async suggestControls(experimentDescription: string): Promise<AIExperimentSuggestion[]> {
    const url = buildCoreUrl('/ai/suggest-controls');
    return apiCall<AIExperimentSuggestion[]>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: experimentDescription,
      }),
    });
  }

  /**
   * Get statistical analysis suggestions
   */
  async suggestStatisticalAnalysis(dataDescription: string, sampleSize: number, studyDesign: string): Promise<any> {
    const url = buildCoreUrl('/ai/statistical-analysis');
    return apiCall<any>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data_description: dataDescription,
        sample_size: sampleSize,
        study_design: studyDesign,
      }),
    });
  }

  /**
   * Generate literature search suggestions
   */
  async suggestLiterature(keywords: string[], experimentType: string): Promise<any[]> {
    const url = buildCoreUrl('/ai/literature-suggestions');
    return apiCall<any[]>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keywords,
        experiment_type: experimentType,
      }),
    });
  }

  /**
   * Analyze experimental results for insights
   */
  async analyzeResults(resultsText: string, expectedOutcomes: string[]): Promise<any> {
    const url = buildCoreUrl('/ai/analyze-results');
    return apiCall<any>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        results: resultsText,
        expected_outcomes: expectedOutcomes,
      }),
    });
  }
}

export const aiService = new AIService();