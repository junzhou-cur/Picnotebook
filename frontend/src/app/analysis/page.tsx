'use client';

import { TableChartAnalysis } from '@/components/TableChartAnalysis';
import { Suspense } from 'react';

export default function AnalysisPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-lab-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading analysis tools...</p>
          </div>
        </div>
      }>
        <TableChartAnalysis />
      </Suspense>
    </div>
  );
}