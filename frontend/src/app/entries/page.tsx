'use client';

import React from 'react';
import { Layout } from '../../components/layout/Layout';
import { EntryList } from '../../components/entries/EntryList';

export default function EntriesPage() {
  return (
    <Layout requireAuth={false}>
      <EntryList />
    </Layout>
  );
}