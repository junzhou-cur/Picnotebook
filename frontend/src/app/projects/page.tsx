'use client';

import React from 'react';
import { Layout } from '../../components/layout/Layout';
import { ProjectList } from '../../components/projects/ProjectList';

export default function ProjectsPage() {
  return (
    <Layout requireAuth={true}>
      <ProjectList />
    </Layout>
  );
}