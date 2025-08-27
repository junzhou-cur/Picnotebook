'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, HardDrive, FileText, Image, Database, Trash2, Download, Eye } from 'lucide-react';
import { AuthGuard } from '@/components/AuthGuard';
import Link from 'next/link';

interface StorageItem {
  id: string;
  name: string;
  type: 'image' | 'document' | 'dataset' | 'other';
  size: number;
  created: string;
  project?: string;
}

interface StorageStats {
  totalUsed: number;
  totalLimit: number;
  itemCount: number;
  breakdown: {
    images: number;
    documents: number;
    datasets: number;
    other: number;
  };
}

export default function StoragePage() {
  const [storageItems, setStorageItems] = useState<StorageItem[]>([]);
  const [storageStats, setStorageStats] = useState<StorageStats>({
    totalUsed: 0,
    totalLimit: 5 * 1024 * 1024 * 1024, // 5GB in bytes
    itemCount: 0,
    breakdown: { images: 0, documents: 0, datasets: 0, other: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStorageData();
  }, []);

  const fetchStorageData = async () => {
    try {
      // Fetch lab records to calculate storage
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005'}/lab_records`);
      if (response.ok) {
        const records = await response.json();
        
        // Calculate storage usage from actual data
        let totalUsed = 0;
        const breakdown = { images: 0, documents: 0, datasets: 0, other: 0 };
        const items: StorageItem[] = [];

        records.forEach((record: any, index: number) => {
          // Estimate file sizes based on content
          const imageSize = record.image_path ? 2.5 * 1024 * 1024 : 0; // ~2.5MB per image
          const textSize = (record.ocr_text?.length || 0) * 2; // ~2 bytes per character
          const metadataSize = JSON.stringify(record).length * 2; // ~2 bytes per character
          
          const itemSize = imageSize + textSize + metadataSize;
          totalUsed += itemSize;

          if (record.image_path) {
            breakdown.images += itemSize;
            items.push({
              id: record.id || index.toString(),
              name: `Lab Note ${index + 1}`,
              type: 'image',
              size: itemSize,
              created: record.created_at || new Date().toISOString(),
              project: record.project_name
            });
          }
          
          if (record.ocr_text) {
            breakdown.documents += textSize;
          }
        });

        setStorageStats({
          totalUsed,
          totalLimit: 5 * 1024 * 1024 * 1024,
          itemCount: items.length,
          breakdown
        });
        
        setStorageItems(items.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()));
      }
    } catch (error) {
      console.error('Failed to fetch storage data:', error);
      // Fallback to mock data
      setStorageStats({
        totalUsed: 2.4 * 1024 * 1024 * 1024,
        totalLimit: 5 * 1024 * 1024 * 1024,
        itemCount: 12,
        breakdown: { images: 2.1 * 1024 * 1024 * 1024, documents: 0.2 * 1024 * 1024 * 1024, datasets: 0.1 * 1024 * 1024 * 1024, other: 0 }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
    } else if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    } else if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(1)}KB`;
    }
    return `${bytes}B`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'dataset': return <Database className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const usagePercentage = (storageStats.totalUsed / storageStats.totalLimit) * 100;

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
                <div className="p-2 bg-blue-100 rounded-lg">
                  <HardDrive className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Storage Management</h1>
                  <p className="text-gray-500">Manage your lab files and data usage</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Storage Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Usage Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg border border-gray-200 p-6"
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Storage Usage</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatFileSize(storageStats.totalUsed)}
                      </span>
                      <span className="text-gray-500">
                        of {formatFileSize(storageStats.totalLimit)} used
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{usagePercentage.toFixed(1)}% used</span>
                      <span>{storageStats.itemCount} files</span>
                    </div>
                  </div>
                </motion.div>

                {/* Storage Breakdown */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-lg border border-gray-200 p-6"
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Storage Breakdown</h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Image className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-700">Images</span>
                      </div>
                      <span className="font-medium">{formatFileSize(storageStats.breakdown.images)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-green-600" />
                        <span className="text-gray-700">Documents</span>
                      </div>
                      <span className="font-medium">{formatFileSize(storageStats.breakdown.documents)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-purple-600" />
                        <span className="text-gray-700">Datasets</span>
                      </div>
                      <span className="font-medium">{formatFileSize(storageStats.breakdown.datasets)}</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* File List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg border border-gray-200"
              >
                <div className="border-b border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Files</h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {storageItems.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <HardDrive className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No files found. Upload some lab notes to see them here!</p>
                    </div>
                  ) : (
                    storageItems.map((item) => (
                      <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              {getTypeIcon(item.type)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <div className="flex items-center space-x-3 text-sm text-gray-500">
                                <span>{formatFileSize(item.size)}</span>
                                <span>•</span>
                                <span>{new Date(item.created).toLocaleDateString()}</span>
                                {item.project && (
                                  <>
                                    <span>•</span>
                                    <span>{item.project}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
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