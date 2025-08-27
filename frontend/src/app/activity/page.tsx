'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Activity, Clock, FileText, Upload, BarChart3, Plus, User, Calendar } from 'lucide-react';
import { AuthGuard } from '@/components/AuthGuard';
import Link from 'next/link';

interface ActivityItem {
  id: string;
  type: 'upload' | 'analysis' | 'experiment' | 'chart' | 'note';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  project?: string;
  metadata?: any;
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    fetchActivityData();
  }, []);

  const fetchActivityData = async () => {
    try {
      // Fetch lab records to generate activity data
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005'}/lab_records`);
      if (response.ok) {
        const records = await response.json();
        
        const activityItems: ActivityItem[] = [];
        
        records.forEach((record: any, index: number) => {
          // Create upload activity
          activityItems.push({
            id: `upload-${record.id || index}`,
            type: 'upload',
            title: 'Uploaded experiment photos',
            description: record.ocr_text?.substring(0, 100) || 'Lab experiment documentation',
            timestamp: record.created_at || new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            user: 'Current User',
            project: record.project_name
          });

          // Create analysis activity if OCR text exists
          if (record.ocr_text) {
            activityItems.push({
              id: `analysis-${record.id || index}`,
              type: 'analysis',
              title: 'Generated OCR analysis',
              description: `Extracted text from lab images`,
              timestamp: record.created_at || new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
              user: 'System',
              project: record.project_name
            });
          }
        });

        // Add some sample activities
        const sampleActivities: ActivityItem[] = [
          {
            id: 'sample-1',
            type: 'experiment',
            title: 'Started new PCR experiment',
            description: 'Began PCR amplification protocol for gene analysis',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            user: 'Current User',
            project: 'CF1282'
          },
          {
            id: 'sample-2',
            type: 'chart',
            title: 'Generated analysis chart',
            description: 'Created visualization for western blot results',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            user: 'Current User',
            project: 'MizCGBE'
          },
          {
            id: 'sample-3',
            type: 'note',
            title: 'Added experiment notes',
            description: 'Documented cell culture conditions and observations',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            user: 'Current User',
            project: 'APOC3'
          }
        ];

        const allActivities = [...activityItems, ...sampleActivities]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setActivities(allActivities);
      }
    } catch (error) {
      console.error('Failed to fetch activity data:', error);
      // Fallback to mock data
      setActivities([
        {
          id: '1',
          type: 'upload',
          title: 'Uploaded experiment photos',
          description: 'Added new lab images for analysis',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          user: 'Current User'
        },
        {
          id: '2',
          type: 'experiment',
          title: 'Started new PCR experiment',
          description: 'Began PCR protocol for sample analysis',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          user: 'Current User'
        },
        {
          id: '3',
          type: 'chart',
          title: 'Generated analysis chart',
          description: 'Created visualization for experiment data',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          user: 'Current User'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload': return <Upload className="w-4 h-4 text-green-600" />;
      case 'analysis': return <BarChart3 className="w-4 h-4 text-blue-600" />;
      case 'experiment': return <div className="text-sm">🧪</div>;
      case 'chart': return <BarChart3 className="w-4 h-4 text-purple-600" />;
      case 'note': return <FileText className="w-4 h-4 text-orange-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'upload': return 'bg-green-100';
      case 'analysis': return 'bg-blue-100';
      case 'experiment': return 'bg-yellow-100';
      case 'chart': return 'bg-purple-100';
      case 'note': return 'bg-orange-100';
      default: return 'bg-gray-100';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return time.toLocaleDateString();
  };

  const filteredActivities = activities.filter(activity => {
    const activityDate = new Date(activity.timestamp);
    const now = new Date();
    
    switch (filter) {
      case 'today':
        return activityDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return activityDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return activityDate >= monthAgo;
      default:
        return true;
    }
  });

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
                  <p className="text-gray-500">Track all your lab work and experiments</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Filter Tabs */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                {(['all', 'today', 'week', 'month'] as const).map((filterOption) => (
                  <button
                    key={filterOption}
                    onClick={() => setFilter(filterOption)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      filter === filterOption
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                  </button>
                ))}
              </div>

              {/* Activity Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center space-x-3">
                    <Upload className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {activities.filter(a => a.type === 'upload').length}
                      </p>
                      <p className="text-sm text-gray-500">Uploads</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🧪</div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {activities.filter(a => a.type === 'experiment').length}
                      </p>
                      <p className="text-sm text-gray-500">Experiments</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {activities.filter(a => a.type === 'chart' || a.type === 'analysis').length}
                      </p>
                      <p className="text-sm text-gray-500">Analysis</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {activities.filter(a => a.type === 'note').length}
                      </p>
                      <p className="text-sm text-gray-500">Notes</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Activity Timeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg border border-gray-200"
              >
                <div className="border-b border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                    <span className="text-sm text-gray-500">
                      {filteredActivities.length} activities
                    </span>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {filteredActivities.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No activities found for the selected time period.</p>
                    </div>
                  ) : (
                    filteredActivities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3">
                              <p className="font-medium text-gray-900">{activity.title}</p>
                              {activity.project && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  {activity.project}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 mt-1">{activity.description}</p>
                            
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatTimeAgo(activity.timestamp)}</span>
                              </div>
                              {activity.user && (
                                <div className="flex items-center space-x-1">
                                  <User className="w-3 h-3" />
                                  <span>{activity.user}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}