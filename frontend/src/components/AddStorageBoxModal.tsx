'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Package, MapPin, Grid, Thermometer } from 'lucide-react';

interface AddStorageBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (boxData: { name: string; location: string; rows: number; columns: number; temperature: string }) => void;
}

export function AddStorageBoxModal({ isOpen, onClose, onAdd }: AddStorageBoxModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    rows: 8,
    columns: 12,
    temperature: '-80°C'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.location.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    onAdd(formData);
    
    // Reset form
    setFormData({
      name: '',
      location: '',
      rows: 8,
      columns: 12,
      temperature: '-80°C'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Add New Storage Box</h2>
                <p className="text-sm text-gray-500">Create a new storage box for your lab materials</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Box Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Box Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Plasmids Box 1, Cell Lines -80°C"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Freezer/Location *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., -80°C Freezer A, Liquid Nitrogen Tank 2"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Grid Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rows
              </label>
              <div className="relative">
                <Grid className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={formData.rows}
                  onChange={(e) => setFormData(prev => ({ ...prev, rows: parseInt(e.target.value) }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Array.from({ length: 16 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num} rows</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Columns
              </label>
              <select
                value={formData.columns}
                onChange={(e) => setFormData(prev => ({ ...prev, columns: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({ length: 24 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num} cols</option>
                ))}
              </select>
            </div>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Storage Temperature
            </label>
            <div className="relative">
              <Thermometer className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={formData.temperature}
                onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="-80°C">-80°C (Ultra-low freezer)</option>
                <option value="-20°C">-20°C (Standard freezer)</option>
                <option value="4°C">4°C (Refrigerator)</option>
                <option value="-196°C">-196°C (Liquid nitrogen)</option>
                <option value="RT">Room Temperature</option>
              </select>
            </div>
          </div>

          {/* Grid Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
            <div className="text-sm text-gray-600">
              <p><strong>Grid Size:</strong> {formData.rows} × {formData.columns} = {formData.rows * formData.columns} positions</p>
              <p><strong>Labels:</strong> A1 to {String.fromCharCode(64 + formData.rows)}{formData.columns}</p>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              You can add materials to positions later using Smart Import or manual entry
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Storage Box
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}