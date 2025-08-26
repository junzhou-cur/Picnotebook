'use client';

import { EnhancedDashboard } from '@/components/EnhancedDashboard';
import { AuthGuard } from '@/components/AuthGuard';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <EnhancedDashboard />
    </AuthGuard>
  );
}