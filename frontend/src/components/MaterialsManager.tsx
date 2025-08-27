'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  User,
  Package,
  FlaskConical,
  Dna,
  Microscope,
  X,
  ChevronDown,
  Calendar,
  TrendingDown,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Material, MaterialType, SAMPLE_MATERIALS, MATERIAL_TEMPLATES } from '@/types/materials';
import { ExcelMaterialImport } from './ExcelMaterialImport';

interface MaterialsManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MaterialsManager({ isOpen, onClose }: MaterialsManagerProps) {
  const [materials, setMaterials] = useState<Material[]>(SAMPLE_MATERIALS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<MaterialType | 'all'>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'stock' | 'updated'>('name');

  // Filter and search materials
  const filteredMaterials = useMemo(() => {
    let filtered = materials;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(material =>
        material.name.toLowerCase().includes(query) ||
        material.description?.toLowerCase().includes(query) ||
        material.properties.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(material => material.type === selectedType);
    }

    // Sort materials
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'stock':
          return a.stockInfo.currentAmount - b.stockInfo.currentAmount;
        case 'updated':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [materials, searchQuery, selectedType, sortBy]);

  // Get low stock materials
  const lowStockMaterials = materials.filter(
    material => material.stockInfo.currentAmount <= material.stockInfo.minimumAmount
  );

  // Get material type icon
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

  // Get storage condition color
  const getStorageColor = (storage?: string) => {
    switch (storage) {
      case '-80°C': return 'text-blue-600 bg-blue-100';
      case '-20°C': return 'text-indigo-600 bg-indigo-100';
      case '4°C': return 'text-green-600 bg-green-100';
      case 'RT': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FlaskConical className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Materials Inventory</h2>
                <p className="text-sm text-gray-500">
                  {materials.length} items • {lowStockMaterials.length} low stock alerts
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowExcelImport(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Import Excel</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Material</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-full">
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search and Filters */}
            <div className="border-b border-gray-200 p-4 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search materials by name, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Filters and Sort */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center space-x-2 px-3 py-1.5 border rounded-lg transition-colors ${
                      showFilters ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Type Filter Pills */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedType('all')}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        selectedType === 'all' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All ({materials.length})
                    </button>
                    {Object.keys(MATERIAL_TEMPLATES).slice(0, 5).map((type) => {
                      const count = materials.filter(m => m.type === type).length;
                      return (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type as MaterialType)}
                          className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                            selectedType === type 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {type.replace('_', ' ')} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="name">Name</option>
                    <option value="type">Type</option>
                    <option value="stock">Stock Level</option>
                    <option value="updated">Last Updated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Low Stock Alert */}
            {lowStockMaterials.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4 rounded-r-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">
                      {lowStockMaterials.length} item(s) running low on stock
                    </p>
                    <p className="text-sm text-red-700">
                      {lowStockMaterials.map(m => m.name).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Materials Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMaterials.map((material) => {
                  const isLowStock = material.stockInfo.currentAmount <= material.stockInfo.minimumAmount;
                  const usagePercentage = (material.stockInfo.currentAmount / (material.stockInfo.maximumAmount || material.stockInfo.currentAmount + 50)) * 100;
                  
                  return (
                    <motion.div
                      key={material.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedMaterial(material)}
                      className={`bg-white border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        isLowStock ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {getTypeIcon(material.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{material.name}</h3>
                            <p className="text-sm text-gray-500 capitalize">{material.type.replace('_', ' ')}</p>
                          </div>
                        </div>
                        {isLowStock && (
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        )}
                      </div>

                      {/* Description */}
                      {material.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{material.description}</p>
                      )}

                      {/* Stock Information */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Stock Level</span>
                          <span className={`text-sm font-bold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                            {material.stockInfo.currentAmount} {material.stockInfo.unit}
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all ${
                              isLowStock ? 'bg-red-500' : usagePercentage > 70 ? 'bg-green-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${Math.max(usagePercentage, 5)}%` }}
                          />
                        </div>
                      </div>

                      {/* Properties */}
                      <div className="space-y-2">
                        {/* Location */}
                        {material.location.freezer && (
                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <MapPin className="w-3 h-3" />
                            <span>{material.location.freezer}</span>
                            {material.location.box && <span>• {material.location.box}</span>}
                          </div>
                        )}

                        {/* Storage Conditions */}
                        {material.properties.storage && (
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStorageColor(material.properties.storage)}`}>
                            {material.properties.storage}
                          </span>
                        )}

                        {/* Tags */}
                        {material.properties.tags && material.properties.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {material.properties.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                            {material.properties.tags.length > 3 && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                +{material.properties.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Last Updated */}
                        <div className="flex items-center space-x-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                          <Clock className="w-3 h-3" />
                          <span>Updated {new Date(material.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {filteredMaterials.length === 0 && (
                <div className="text-center py-12">
                  <FlaskConical className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No materials found</p>
                  <p className="text-gray-400">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Excel Import Modal */}
        <AnimatePresence>
          {showExcelImport && (
            <ExcelMaterialImport
              isOpen={showExcelImport}
              onClose={() => setShowExcelImport(false)}
              onImport={(importedMaterials) => {
                const materialsWithIds = importedMaterials.map(material => ({
                  ...material,
                  id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
                }));
                setMaterials([...materials, ...materialsWithIds]);
                setShowExcelImport(false);
              }}
            />
          )}
        </AnimatePresence>

        {/* Add Material Modal */}
        <AnimatePresence>
          {showAddModal && (
            <AddMaterialModal 
              isOpen={showAddModal}
              onClose={() => setShowAddModal(false)}
              onAdd={(newMaterial) => {
                setMaterials([...materials, { ...newMaterial, id: Date.now().toString() }]);
                setShowAddModal(false);
              }}
            />
          )}
        </AnimatePresence>

        {/* Material Detail Modal */}
        <AnimatePresence>
          {selectedMaterial && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getTypeIcon(selectedMaterial.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{selectedMaterial.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{selectedMaterial.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedMaterial(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Description */}
                  {selectedMaterial.description && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-700">{selectedMaterial.description}</p>
                    </div>
                  )}

                  {/* Stock Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Stock Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Current Amount</span>
                        <p className="font-medium">{selectedMaterial.stockInfo.currentAmount} {selectedMaterial.stockInfo.unit}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Minimum Stock</span>
                        <p className="font-medium">{selectedMaterial.stockInfo.minimumAmount} {selectedMaterial.stockInfo.unit}</p>
                      </div>
                      {selectedMaterial.stockInfo.concentration && (
                        <div>
                          <span className="text-sm text-gray-500">Concentration</span>
                          <p className="font-medium">{selectedMaterial.stockInfo.concentration}</p>
                        </div>
                      )}
                      {selectedMaterial.stockInfo.expiryDate && (
                        <div>
                          <span className="text-sm text-gray-500">Expiry Date</span>
                          <p className="font-medium">{new Date(selectedMaterial.stockInfo.expiryDate).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Location</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedMaterial.location.freezer && (
                        <div>
                          <span className="text-sm text-gray-500">Freezer</span>
                          <p className="font-medium">{selectedMaterial.location.freezer}</p>
                        </div>
                      )}
                      {selectedMaterial.location.box && (
                        <div>
                          <span className="text-sm text-gray-500">Box</span>
                          <p className="font-medium">{selectedMaterial.location.box}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Properties */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Properties</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(selectedMaterial.properties)
                        .filter(([key, value]) => value && key !== 'tags' && key !== 'notes')
                        .map(([key, value]) => (
                          <div key={key}>
                            <span className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <p className="font-medium">{String(value)}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// Add Material Modal Component
interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (material: Omit<Material, 'id'>) => void;
}

function AddMaterialModal({ isOpen, onClose, onAdd }: AddMaterialModalProps) {
  const [selectedType, setSelectedType] = useState<MaterialType>('plasmid');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    currentAmount: 0,
    unit: 'µg',
    minimumAmount: 1,
    concentration: '',
    freezer: '',
    shelf: '',
    box: '',
    position: '',
    supplier: '',
    catalogNumber: '',
    storage: 'RT',
    tags: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const template = MATERIAL_TEMPLATES[selectedType];
    const newMaterial: Omit<Material, 'id'> = {
      name: formData.name,
      type: selectedType,
      category: template.category!,
      description: formData.description || undefined,
      location: {
        freezer: formData.freezer || undefined,
        shelf: formData.shelf || undefined,
        box: formData.box || undefined,
        position: formData.position || undefined
      },
      stockInfo: {
        currentAmount: formData.currentAmount,
        unit: formData.unit,
        minimumAmount: formData.minimumAmount,
        concentration: formData.concentration || undefined,
        supplier: formData.supplier || undefined,
        catalogNumber: formData.catalogNumber || undefined
      },
      properties: {
        storage: formData.storage,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        ...template.properties
      },
      usage: [],
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      createdBy: 'Current User'
    };
    
    onAdd(newMaterial);
  };

  const handleTypeChange = (newType: MaterialType) => {
    setSelectedType(newType);
    const template = MATERIAL_TEMPLATES[newType];
    setFormData(prev => ({
      ...prev,
      unit: template.stockInfo?.unit || 'units',
      minimumAmount: template.stockInfo?.minimumAmount || 1,
      storage: template.properties?.storage || 'RT'
    }));
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
              <div className="p-2 bg-green-100 rounded-lg">
                <Plus className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Add New Material</h2>
                <p className="text-sm text-gray-500">Add a new material to your lab inventory</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Material Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(MATERIAL_TEMPLATES).map(([type, template]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type as MaterialType)}
                  className={`p-3 text-left border rounded-lg transition-colors ${
                    selectedType === type
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium text-sm capitalize">{type.replace('_', ' ')}</div>
                  <div className="text-xs text-gray-500 capitalize">{template.category}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., pCMV-GFP, HEK293T"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Brief description"
              />
            </div>
          </div>

          {/* Stock Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Stock Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData(prev => ({...prev, currentAmount: parseFloat(e.target.value) || 0}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({...prev, unit: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minimumAmount}
                  onChange={(e) => setFormData(prev => ({...prev, minimumAmount: parseFloat(e.target.value) || 0}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Concentration</label>
              <input
                type="text"
                value={formData.concentration}
                onChange={(e) => setFormData(prev => ({...prev, concentration: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., 1 mg/ml, 10 mM"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Storage Condition</label>
              <select
                value={formData.storage}
                onChange={(e) => setFormData(prev => ({...prev, storage: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="RT">Room Temperature</option>
                <option value="4°C">4°C</option>
                <option value="-20°C">-20°C</option>
                <option value="-80°C">-80°C</option>
              </select>
            </div>
          </div>

          {/* Location Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Location</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Freezer/Fridge</label>
                <input
                  type="text"
                  value={formData.freezer}
                  onChange={(e) => setFormData(prev => ({...prev, freezer: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Freezer A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shelf</label>
                <input
                  type="text"
                  value={formData.shelf}
                  onChange={(e) => setFormData(prev => ({...prev, shelf: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Top, Middle, Bottom"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Box</label>
                <input
                  type="text"
                  value={formData.box}
                  onChange={(e) => setFormData(prev => ({...prev, box: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Plasmids Box 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({...prev, position: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="A1, B2, etc."
                />
              </div>
            </div>
          </div>

          {/* Supplier Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData(prev => ({...prev, supplier: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., Thermo Fisher, Sigma"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catalog Number</label>
              <input
                type="text"
                value={formData.catalogNumber}
                onChange={(e) => setFormData(prev => ({...prev, catalogNumber: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Catalog/Part number"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({...prev, tags: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Comma-separated tags (e.g., fluorescent, transfection)"
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
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Add Material
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}