'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Badge, Modal, ModalFooter, LoadingSpinner } from '../ui';
import { aiService, AIExperimentSuggestion, AITroubleshootingSuggestion, ExperimentDesignRequest, TroubleshootingRequest } from '../../services/aiService';
import { 
  Brain, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  BookOpen,
  Zap,
  Search,
  Microscope,
  Settings,
  TrendingUp,
  Target,
  Shield
} from 'lucide-react';

interface AILabAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  experimentId?: string;
  projectId?: string;
  context?: 'design' | 'troubleshoot' | 'optimize';
}

export const AILabAssistant: React.FC<AILabAssistantProps> = ({
  isOpen,
  onClose,
  experimentId,
  projectId,
  context = 'design'
}) => {
  const [activeTab, setActiveTab] = useState<'design' | 'troubleshoot' | 'optimize' | 'analyze'>('design');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AIExperimentSuggestion[]>([]);
  const [troubleshootingSuggestions, setTroubleshootingSuggestions] = useState<AITroubleshootingSuggestion[]>([]);
  
  // Design form state
  const [designForm, setDesignForm] = useState<ExperimentDesignRequest>({
    objective: '',
    constraints: [],
    available_equipment: [],
    budget_limit: undefined,
    time_limit: '',
    previous_experiments: [],
    organism: '',
    technique_preferences: []
  });

  // Troubleshooting form state
  const [troubleshootForm, setTroubleshootForm] = useState<TroubleshootingRequest>({
    experiment_type: '',
    issue_description: '',
    symptoms: [],
    conditions: {},
    recent_changes: []
  });

  // Form inputs
  const [constraintInput, setConstraintInput] = useState('');
  const [equipmentInput, setEquipmentInput] = useState('');
  const [symptomInput, setSymptomInput] = useState('');
  const [changeInput, setChangeInput] = useState('');

  useEffect(() => {
    if (isOpen && context) {
      setActiveTab(context);
    }
  }, [isOpen, context]);

  const handleDesignSuggestions = async () => {
    if (!designForm.objective.trim()) return;

    setLoading(true);
    try {
      const results = await aiService.getExperimentSuggestions(designForm);
      setSuggestions(results);
    } catch (error: any) {
      console.error('Failed to get design suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTroubleshootingSuggestions = async () => {
    if (!troubleshootForm.issue_description.trim()) return;

    setLoading(true);
    try {
      const results = await aiService.getTroubleshootingSuggestions(troubleshootForm);
      setTroubleshootingSuggestions(results);
    } catch (error: any) {
      console.error('Failed to get troubleshooting suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addConstraint = () => {
    if (constraintInput.trim()) {
      setDesignForm(prev => ({
        ...prev,
        constraints: [...(prev.constraints || []), constraintInput.trim()]
      }));
      setConstraintInput('');
    }
  };

  const addEquipment = () => {
    if (equipmentInput.trim()) {
      setDesignForm(prev => ({
        ...prev,
        available_equipment: [...(prev.available_equipment || []), equipmentInput.trim()]
      }));
      setEquipmentInput('');
    }
  };

  const addSymptom = () => {
    if (symptomInput.trim()) {
      setTroubleshootForm(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, symptomInput.trim()]
      }));
      setSymptomInput('');
    }
  };

  const addChange = () => {
    if (changeInput.trim()) {
      setTroubleshootForm(prev => ({
        ...prev,
        recent_changes: [...(prev.recent_changes || []), changeInput.trim()]
      }));
      setChangeInput('');
    }
  };

  const removeItem = (list: string[], index: number, setter: (fn: (prev: any) => any) => void, key: string) => {
    setter((prev: any) => ({
      ...prev,
      [key]: list.filter((_, i) => i !== index)
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'methodology': return <Microscope className="w-4 h-4" />;
      case 'controls': return <Shield className="w-4 h-4" />;
      case 'parameters': return <Settings className="w-4 h-4" />;
      case 'troubleshooting': return <AlertTriangle className="w-4 h-4" />;
      case 'optimization': return <TrendingUp className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'methodology': return 'text-blue-600 bg-blue-50';
      case 'controls': return 'text-green-600 bg-green-50';
      case 'parameters': return 'text-purple-600 bg-purple-50';
      case 'troubleshooting': return 'text-red-600 bg-red-50';
      case 'optimization': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Lab Assistant" size="xl">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'design', label: 'Experiment Design', icon: Microscope },
              { key: 'troubleshoot', label: 'Troubleshooting', icon: AlertTriangle },
              { key: 'optimize', label: 'Optimization', icon: TrendingUp },
              { key: 'analyze', label: 'Results Analysis', icon: Target },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Design Tab */}
        {activeTab === 'design' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                🧬 Experiment Design Assistant
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Get AI-powered suggestions for your experimental design, including methodology, controls, and optimization strategies.
              </p>
            </div>

            {/* Design Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input
                  label="Research Objective"
                  value={designForm.objective}
                  onChange={(e) => setDesignForm(prev => ({ ...prev, objective: e.target.value }))}
                  placeholder="Describe what you want to achieve..."
                  required
                />

                <Input
                  label="Organism/System"
                  value={designForm.organism}
                  onChange={(e) => setDesignForm(prev => ({ ...prev, organism: e.target.value }))}
                  placeholder="e.g., E. coli, HeLa cells, mouse model..."
                />

                <Input
                  label="Time Limit"
                  value={designForm.time_limit}
                  onChange={(e) => setDesignForm(prev => ({ ...prev, time_limit: e.target.value }))}
                  placeholder="e.g., 2 weeks, 1 month..."
                />

                <Input
                  label="Budget Limit (USD)"
                  type="number"
                  value={designForm.budget_limit || ''}
                  onChange={(e) => setDesignForm(prev => ({ 
                    ...prev, 
                    budget_limit: e.target.value ? Number(e.target.value) : undefined 
                  }))}
                  placeholder="Maximum budget..."
                />
              </div>

              <div className="space-y-4">
                {/* Constraints */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Constraints
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <Input
                      value={constraintInput}
                      onChange={(e) => setConstraintInput(e.target.value)}
                      placeholder="Add constraint..."
                      onKeyPress={(e) => e.key === 'Enter' && addConstraint()}
                    />
                    <Button  onClick={addConstraint}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {designForm.constraints?.map((constraint, index) => (
                      <Badge 
                        key={index} 
                        variant="default"
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => removeItem(designForm.constraints!, index, setDesignForm, 'constraints')}
                      >
                        {constraint} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Available Equipment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Equipment
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <Input
                      value={equipmentInput}
                      onChange={(e) => setEquipmentInput(e.target.value)}
                      placeholder="Add equipment..."
                      onKeyPress={(e) => e.key === 'Enter' && addEquipment()}
                    />
                    <Button  onClick={addEquipment}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {designForm.available_equipment?.map((equipment, index) => (
                      <Badge 
                        key={index} 
                        variant="success"
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => removeItem(designForm.available_equipment!, index, setDesignForm, 'available_equipment')}
                      >
                        {equipment} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={handleDesignSuggestions} loading={loading} disabled={!designForm.objective.trim()}>
              <Brain className="w-4 h-4 mr-2" />
              Get AI Suggestions
            </Button>

            {/* Design Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">AI Suggestions</h4>
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(suggestion.type)}`}>
                          {getTypeIcon(suggestion.type)}
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">{suggestion.title}</h5>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="default">{suggestion.type}</Badge>
                            <Badge className={getRiskColor(suggestion.riskLevel)}>
                              {suggestion.riskLevel} risk
                            </Badge>
                            <div className="flex items-center text-sm text-gray-500">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {Math.round(suggestion.confidence * 100)}% confidence
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{suggestion.description}</p>
                    
                    <div className="bg-blue-50 p-3 rounded-md mb-3">
                      <h6 className="text-sm font-medium text-blue-900 mb-1">Rationale</h6>
                      <p className="text-sm text-blue-800">{suggestion.rationale}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        {suggestion.estimatedTime && (
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {suggestion.estimatedTime}
                          </div>
                        )}
                        {suggestion.estimatedCost && (
                          <div className="flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {suggestion.estimatedCost}
                          </div>
                        )}
                      </div>
                      {suggestion.references && suggestion.references.length > 0 && (
                        <div className="flex items-center">
                          <BookOpen className="w-3 h-3 mr-1" />
                          {suggestion.references.length} references
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Troubleshooting Tab */}
        {activeTab === 'troubleshoot' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                🔧 Troubleshooting Assistant
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Get AI-powered help to diagnose and solve experimental problems.
              </p>
            </div>

            {/* Troubleshooting Form */}
            <div className="space-y-4">
              <Input
                label="Experiment Type"
                value={troubleshootForm.experiment_type}
                onChange={(e) => setTroubleshootForm(prev => ({ ...prev, experiment_type: e.target.value }))}
                placeholder="e.g., PCR, Western blot, Cell culture..."
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Description
                </label>
                <textarea
                  value={troubleshootForm.issue_description}
                  onChange={(e) => setTroubleshootForm(prev => ({ ...prev, issue_description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the problem you're experiencing..."
                />
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptoms
                </label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    placeholder="Add symptom..."
                    onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
                  />
                  <Button  onClick={addSymptom}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {troubleshootForm.symptoms.map((symptom, index) => (
                    <Badge 
                      key={index} 
                      variant="warning"
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => removeItem(troubleshootForm.symptoms, index, setTroubleshootForm, 'symptoms')}
                    >
                      {symptom} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Recent Changes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recent Changes
                </label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={changeInput}
                    onChange={(e) => setChangeInput(e.target.value)}
                    placeholder="What changed recently..."
                    onKeyPress={(e) => e.key === 'Enter' && addChange()}
                  />
                  <Button  onClick={addChange}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {troubleshootForm.recent_changes?.map((change, index) => (
                    <Badge 
                      key={index} 
                      variant="default"
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => removeItem(troubleshootForm.recent_changes!, index, setTroubleshootForm, 'recent_changes')}
                    >
                      {change} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Button 
              onClick={handleTroubleshootingSuggestions} 
              loading={loading} 
              disabled={!troubleshootForm.issue_description.trim()}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Get Troubleshooting Help
            </Button>

            {/* Troubleshooting Suggestions */}
            {troubleshootingSuggestions.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Troubleshooting Solutions</h4>
                {troubleshootingSuggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="p-4">
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">{suggestion.issue}</h5>
                      <div className="flex items-center mb-3">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm text-gray-600">
                          {Math.round(suggestion.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>

                    {/* Possible Causes */}
                    <div className="mb-4">
                      <h6 className="text-sm font-medium text-gray-900 mb-2">Possible Causes:</h6>
                      <ul className="list-disc list-inside space-y-1">
                        {suggestion.possibleCauses.map((cause, index) => (
                          <li key={index} className="text-sm text-gray-700">{cause}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Solutions */}
                    <div className="mb-4">
                      <h6 className="text-sm font-medium text-gray-900 mb-2">Solutions:</h6>
                      <div className="space-y-3">
                        {suggestion.solutions.map((solution, index) => (
                          <div key={index} className="bg-green-50 p-3 rounded-md">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-green-900">{solution.description}</p>
                              <div className="flex items-center space-x-2">
                                <Badge variant="success">{Math.round(solution.success_probability * 100)}% success</Badge>
                                <Badge variant="default">{solution.time_estimate}</Badge>
                              </div>
                            </div>
                            <ol className="list-decimal list-inside space-y-1">
                              {solution.steps.map((step, stepIndex) => (
                                <li key={stepIndex} className="text-sm text-green-800">{step}</li>
                              ))}
                            </ol>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Prevention Tips */}
                    {suggestion.prevention_tips.length > 0 && (
                      <div className="bg-blue-50 p-3 rounded-md">
                        <h6 className="text-sm font-medium text-blue-900 mb-2">Prevention Tips:</h6>
                        <ul className="list-disc list-inside space-y-1">
                          {suggestion.prevention_tips.map((tip, index) => (
                            <li key={index} className="text-sm text-blue-800">{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-2 text-sm text-gray-600">AI is analyzing your request...</p>
            </div>
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