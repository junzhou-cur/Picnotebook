'use client';

import React from 'react';
import { Layout } from '../../components/layout/Layout';
import { ExperimentList } from '../../components/experiments/ExperimentList';

export default function ExperimentsPage() {
  return (
    <Layout requireAuth={false}>
      <ExperimentList />
    </Layout>
  );
}