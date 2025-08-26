'use client';

import React from 'react';
import { Layout } from '../../components/layout/Layout';
import { FileList } from '../../components/files/FileList';

export default function FilesPage() {
  return (
    <Layout requireAuth={false}>
      <FileList />
    </Layout>
  );
}