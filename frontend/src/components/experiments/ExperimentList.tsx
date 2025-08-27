'use client';

import React, { useState, useEffect } from 'react';
import { ExperimentCard } from './ExperimentCard';
import { LoadingSpinner, Button } from '../ui';
import { Experiment } from '../../types/api';

export const ExperimentList: React.FC = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExperiments();
  }, []);

  const loadExperiments = async () => {
    try {
      setLoading(true);
      setError(null);
      // Mock data for now
      setExperiments([]);
    } catch (err: any) {
      setError(err.message || 'Failed to load experiments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadExperiments}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Experiments</h1>
        <Button onClick={() => window.location.href = '/experiments/new'}>
          New Experiment
        </Button>
      </div>

      {experiments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No experiments found</p>
          <Button onClick={() => window.location.href = '/experiments/new'}>
            Create Your First Experiment
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiments.map((experiment) => (
            <ExperimentCard
              key={experiment.id}
              experiment={experiment}
              onClick={() => window.location.href = `/experiments/${experiment.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};