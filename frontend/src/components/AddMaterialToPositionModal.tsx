'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  X, 
  MapPin,
  Dna,
  Microscope,
  FlaskConical,
  Package
} from 'lucide-react';
import { MaterialType, MATERIAL_TEMPLATES } from '@/types/materials';
import { MaterialPosition } from '@/types/storage';

interface AddMaterialToPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: string;
  onAdd: (material: MaterialPosition) => void;
  storageBoxName: string;
}

export function AddMaterialToPositionModal({ 
  isOpen, 
  onClose, 
  position, 
  onAdd, 
  storageBoxName 
}: AddMaterialToPositionModalProps) {
  const [selectedType, setSelectedType] = useState<MaterialType>('plasmid');
  const [formData, setFormData] = useState({
    name: '',
    amount: 1,
    unit: 'µg',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const template = MATERIAL_TEMPLATES[selectedType];
    const newMaterial: MaterialPosition = {
      materialId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      materialName: formData.name,
      materialType: selectedType,
      position: position,
      amount: formData.amount,
      unit: formData.unit,
      notes: formData.notes || undefined,
      addedDate: new Date().toISOString()
    };
    
    onAdd(newMaterial);
    onClose();
    
    // Reset form
    setFormData({
      name: '',
      amount: 1,
      unit: 'µg',
      notes: ''
    });
  };

  const handleTypeChange = (newType: MaterialType) => {
    setSelectedType(newType);
    const template = MATERIAL_TEMPLATES[newType];
    setFormData(prev => ({
      ...prev,
      unit: template.stockInfo?.unit || 'units',
      amount: template.stockInfo?.minimumAmount || 1
    }));
  };

  const getTypeIcon = (type: MaterialType) => {
    switch (type) {
      case 'plasmid': return <Dna className="w-4 h-4 text-blue-600" />;
      case 'cell_line': return <div className="text-sm">🦠</div>;
      case 'antibody': return <Microscope className="w-4 h-4 text-purple-600" />;
      case 'enzyme': return <div className="text-sm">⚗️</div>;
      case 'media': return <FlaskConical className="w-4 h-4 text-green-600" />;
      case 'chemical': return <div className="text-sm">🧪</div>;
      default: return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Add Material</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                  <MapPin className="w-3 h-3" />
                  <span>Position {position} in {storageBoxName}</span>
                </div>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Material Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Material Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(MATERIAL_TEMPLATES).map(([type, template]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type as MaterialType)}
                  className={`p-4 text-left border rounded-lg transition-colors ${
                    selectedType === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {getTypeIcon(type as MaterialType)}
                    <span className="font-medium text-sm capitalize">{type.replace('_', ' ')}</span>
                  </div>
                  <div className="text-xs text-gray-500 capitalize">{template.category}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Material Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Material Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`e.g., ${selectedType === 'plasmid' ? 'pCMV-GFP' : selectedType === 'cell_line' ? 'HEK293T' : selectedType === 'antibody' ? 'Anti-GFP' : 'Material name'}`}
            />
          </div>

          {/* Amount and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({...prev, amount: parseFloat(e.target.value) || 1}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({...prev, unit: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="µg">µg</option>
                <option value="mg">mg</option>
                <option value="g">g</option>
                <option value="µl">µl</option>
                <option value="ml">ml</option>
                <option value="l">l</option>
                <option value="units">units</option>
                <option value="vials">vials</option>
                <option value="aliquots">aliquots</option>
                <option value="reactions">reactions</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional information about this material..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Add to Position {position}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}