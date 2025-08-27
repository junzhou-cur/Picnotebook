'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Search, 
  MapPin, 
  Thermometer,
  Calendar,
  Beaker,
  Dna,
  Microscope,
  FlaskConical,
  X,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Zap,
  Camera,
  Share2
} from 'lucide-react';
import { StorageBox, GridPosition, MaterialPosition, GridUtils } from '@/types/storage';
import { MaterialType } from '@/types/materials';
import { StorageBoxImageParser } from './StorageBoxImageParser';
import { AddMaterialToPositionModal } from './AddMaterialToPositionModal';
import { StorageBoxSharingManager } from './StorageBoxSharingManager';
import { AddStorageBoxModal } from './AddStorageBoxModal';

interface StorageBoxGridProps {
  storageBox: StorageBox;
  onMaterialClick?: (material: MaterialPosition, position: string) => void;
  onEmptyPositionClick?: (position: string) => void;
  onUpdateBox?: (updatedBox: StorageBox) => void;
  className?: string;
  showLabels?: boolean;
  highlightedPositions?: string[];
  searchQuery?: string;
}

export function StorageBoxGrid({ 
  storageBox, 
  onMaterialClick,
  onEmptyPositionClick,
  onUpdateBox,
  className = '',
  showLabels = true,
  highlightedPositions = [],
  searchQuery = ''
}: StorageBoxGridProps) {
  const [hoveredPosition, setHoveredPosition] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  // Generate grid positions
  const gridPositions = useMemo(() => {
    const positions = GridUtils.generateGridPositions(
      storageBox.layout.rows,
      storageBox.layout.columns,
      storageBox.layout.labelStyle
    );

    // Map materials to positions
    return positions.map(pos => ({
      ...pos,
      material: storageBox.materials[pos.label],
      isEmpty: !storageBox.materials[pos.label]
    }));
  }, [storageBox]);

  // Filter positions based on search
  const filteredPositions = useMemo(() => {
    if (!searchQuery) return gridPositions;
    
    return gridPositions.filter(pos => {
      if (pos.isEmpty) return false;
      const material = pos.material!;
      return material.materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
             material.materialType.toLowerCase().includes(searchQuery.toLowerCase()) ||
             pos.label.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [gridPositions, searchQuery]);

  // Get color for material type
  const getMaterialColor = (materialType?: string): string => {
    switch (materialType) {
      case 'plasmid': return 'bg-blue-500';
      case 'cell_line': return 'bg-purple-500';
      case 'antibody': return 'bg-green-500';
      case 'enzyme': return 'bg-yellow-500';
      case 'chemical': return 'bg-red-500';
      case 'media': return 'bg-teal-500';
      case 'buffer': return 'bg-indigo-500';
      case 'primer': return 'bg-pink-500';
      case 'kit': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  // Get icon for material type
  const getMaterialIcon = (materialType?: string) => {
    switch (materialType) {
      case 'plasmid': return <Dna className="w-3 h-3 text-white" />;
      case 'cell_line': return <div className="text-xs text-white">🦠</div>;
      case 'antibody': return <Microscope className="w-3 h-3 text-white" />;
      case 'enzyme': return <div className="text-xs text-white">⚗️</div>;
      case 'media': return <FlaskConical className="w-3 h-3 text-white" />;
      case 'chemical': return <div className="text-xs text-white">🧪</div>;
      default: return <Package className="w-3 h-3 text-white" />;
    }
  };

  // Calculate grid dimensions for responsive layout
  const gridStyle = {
    gridTemplateColumns: `repeat(${storageBox.layout.columns}, 1fr)`,
    gridTemplateRows: `repeat(${storageBox.layout.rows}, 1fr)`,
  };

  // Handle position click
  const handlePositionClick = (position: GridPosition) => {
    if (position.material) {
      onMaterialClick?.(position.material, position.label);
    } else {
      onEmptyPositionClick?.(position.label);
    }
    setSelectedPosition(position.label);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{storageBox.name}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{storageBox.location.freezer}</span>
                </span>
                <span>{storageBox.layout.rows}×{storageBox.layout.columns} grid</span>
                <span>{Object.keys(storageBox.materials).length} items</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="p-4">
        <div 
          className="grid gap-1 bg-gray-100 p-2 rounded-lg mx-auto"
          style={{
            ...gridStyle,
            maxWidth: 'min(600px, 90vw)',
            aspectRatio: `${storageBox.layout.columns}/${storageBox.layout.rows}`
          }}
        >
          {gridPositions.map((position) => {
            const isHighlighted = highlightedPositions.includes(position.label);
            const isFiltered = searchQuery && !filteredPositions.some(fp => fp.label === position.label);
            const isHovered = hoveredPosition === position.label;
            const isSelected = selectedPosition === position.label;
            
            return (
              <motion.div
                key={position.label}
                className={`
                  relative aspect-square rounded border-2 cursor-pointer transition-all
                  ${position.isEmpty 
                    ? 'bg-white border-gray-300 hover:border-gray-400 hover:bg-gray-50' 
                    : `${getMaterialColor(position.material?.materialType)} border-transparent`
                  }
                  ${isHighlighted ? 'ring-2 ring-yellow-400' : ''}
                  ${isFiltered ? 'opacity-30' : ''}
                  ${isHovered ? 'scale-105 z-10' : ''}
                  ${isSelected ? 'ring-2 ring-blue-500' : ''}
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => setHoveredPosition(position.label)}
                onMouseLeave={() => setHoveredPosition(null)}
                onClick={() => handlePositionClick(position)}
              >
                {/* Position Label */}
                {showLabels && (
                  <div className={`absolute -top-1 -left-1 text-xs font-mono rounded px-1 ${
                    position.isEmpty ? 'bg-gray-200 text-gray-600' : 'bg-black bg-opacity-20 text-white'
                  }`}>
                    {position.label}
                  </div>
                )}

                {/* Material Content */}
                {!position.isEmpty && position.material && (
                  <div className="w-full h-full flex items-center justify-center">
                    {getMaterialIcon(position.material.materialType)}
                  </div>
                )}

                {/* Empty Slot Plus */}
                {position.isEmpty && (
                  <div className="w-full h-full flex items-center justify-center">
                    <Plus className="w-4 h-4 text-gray-400" />
                  </div>
                )}

                {/* Hover/Selection Tooltip */}
                <AnimatePresence>
                  {(isHovered || isSelected) && position.material && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-20"
                    >
                      <div className="bg-black text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap">
                        <div className="font-medium">{position.material.materialName}</div>
                        <div className="text-gray-300">
                          {position.material.amount} {position.material.unit} • {position.label}
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                          <div className="border-4 border-transparent border-t-black"></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Grid Statistics */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>
              <strong>{Object.keys(storageBox.materials).length}</strong> of <strong>{storageBox.layout.rows * storageBox.layout.columns}</strong> positions occupied
            </span>
            <span>
              <strong>{Math.round((Object.keys(storageBox.materials).length / (storageBox.layout.rows * storageBox.layout.columns)) * 100)}%</strong> full
            </span>
          </div>
          
          <div className="text-xs text-gray-400">
            Updated {new Date(storageBox.lastUpdated).toLocaleDateString()}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs font-medium text-gray-700 mb-2">Material Types</div>
          <div className="flex flex-wrap gap-2">
            {['plasmid', 'cell_line', 'antibody', 'enzyme', 'chemical', 'media'].map(type => (
              <div key={type} className="flex items-center space-x-1 text-xs">
                <div className={`w-3 h-3 rounded ${getMaterialColor(type)}`}></div>
                <span className="text-gray-600 capitalize">{type.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Storage Box Manager Component
interface StorageBoxManagerProps {
  storageBoxes: StorageBox[];
  onUpdateBoxes?: (boxes: StorageBox[]) => void;
  selectedBoxId?: string;
  onSelectBox?: (boxId: string) => void;
}

export function StorageBoxManager({ 
  storageBoxes, 
  onUpdateBoxes, 
  selectedBoxId,
  onSelectBox 
}: StorageBoxManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialPosition | null>(null);
  const [showImageParser, setShowImageParser] = useState(false);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showSharing, setShowSharing] = useState(false);
  const [showAddBox, setShowAddBox] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string>('');

  const selectedBox = storageBoxes.find(box => box.id === selectedBoxId) || storageBoxes[0];

  // Handle storage box update
  const handleUpdateBox = (updatedBox: StorageBox) => {
    if (onUpdateBoxes) {
      const updatedBoxes = storageBoxes.map(box => 
        box.id === updatedBox.id ? updatedBox : box
      );
      onUpdateBoxes(updatedBoxes);
    }
  };

  const handleMaterialClick = (material: MaterialPosition, position: string) => {
    setSelectedMaterial(material);
  };

  const handleEmptyPositionClick = (position: string) => {
    setSelectedPosition(position);
    setShowAddMaterial(true);
  };

  // Handle adding material to position
  const handleAddMaterial = (material: MaterialPosition) => {
    const updatedMaterials = {
      ...selectedBox.materials,
      [material.position]: material
    };

    const updatedBox = {
      ...selectedBox,
      materials: updatedMaterials,
      lastUpdated: new Date().toISOString()
    };

    handleUpdateBox(updatedBox);
    setShowAddMaterial(false);
  };

  // Handle adding new storage box
  const handleAddNewBox = (boxData: { name: string; location: string; rows: number; columns: number; temperature: string }) => {
    const newBox: StorageBox = {
      id: `box-${Date.now()}`,
      name: boxData.name,
      location: {
        freezer: boxData.location,
        shelf: '1',
        rack: 'A',
        position: '1'
      },
      layout: {
        rows: boxData.rows,
        columns: boxData.columns,
        labelStyle: 'A1'
      },
      materials: {},
      temperature: boxData.temperature as any,
      capacity: boxData.rows * boxData.columns,
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    if (onUpdateBoxes) {
      const updatedBoxes = [...storageBoxes, newBox];
      onUpdateBoxes(updatedBoxes);
      onSelectBox?.(newBox.id); // Auto-select the new box
    }

    setShowAddBox(false);
  };

  // Get color for material type (duplicated from above for this component)
  const getMaterialColor = (materialType?: string): string => {
    switch (materialType) {
      case 'plasmid': return 'bg-blue-500';
      case 'cell_line': return 'bg-purple-500';
      case 'antibody': return 'bg-green-500';
      case 'enzyme': return 'bg-yellow-500';
      case 'chemical': return 'bg-red-500';
      case 'media': return 'bg-teal-500';
      case 'buffer': return 'bg-indigo-500';
      case 'primer': return 'bg-pink-500';
      case 'kit': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  // Get icon for material type (duplicated from above for this component)
  const getMaterialIcon = (materialType?: string) => {
    switch (materialType) {
      case 'plasmid': return <Dna className="w-3 h-3 text-white" />;
      case 'cell_line': return <div className="text-xs text-white">🦠</div>;
      case 'antibody': return <Microscope className="w-3 h-3 text-white" />;
      case 'enzyme': return <div className="text-xs text-white">⚗️</div>;
      case 'media': return <FlaskConical className="w-3 h-3 text-white" />;
      case 'chemical': return <div className="text-xs text-white">🧪</div>;
      default: return <Package className="w-3 h-3 text-white" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Box Selector and Controls */}
      <div className="flex items-end space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Storage Box</label>
          <select
            value={selectedBoxId || selectedBox.id}
            onChange={(e) => onSelectBox?.(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {storageBoxes.map(box => (
              <option key={box.id} value={box.id}>
                {box.name} ({box.location.freezer})
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Materials</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, type, or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddBox(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Box</span>
          </button>

          <button
            onClick={() => setShowSharing(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
          
          <button
            onClick={() => setShowImageParser(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <Zap className="w-4 h-4" />
            <span>Smart Import</span>
          </button>
        </div>
      </div>

      {/* Storage Box Grid */}
      <StorageBoxGrid
        storageBox={selectedBox}
        onMaterialClick={handleMaterialClick}
        onEmptyPositionClick={handleEmptyPositionClick}
        searchQuery={searchQuery}
        showLabels={true}
      />

      {/* Material Detail Modal */}
      <AnimatePresence>
        {selectedMaterial && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getMaterialColor(selectedMaterial.materialType)}`}>
                      {getMaterialIcon(selectedMaterial.materialType)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedMaterial.materialName}</h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {selectedMaterial.materialType.replace('_', ' ')} • Position {selectedMaterial.position}
                      </p>
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

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Amount:</span>
                    <p className="text-gray-700">{selectedMaterial.amount} {selectedMaterial.unit}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Position:</span>
                    <p className="text-gray-700">{selectedMaterial.position}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Added:</span>
                    <p className="text-gray-700">{new Date(selectedMaterial.addedDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Box:</span>
                    <p className="text-gray-700">{selectedBox.name}</p>
                  </div>
                </div>
                
                {selectedMaterial.notes && (
                  <div>
                    <span className="font-medium text-gray-900">Notes:</span>
                    <p className="text-gray-700">{selectedMaterial.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Edit
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Smart Image Parser Modal */}
      <AnimatePresence>
        {showImageParser && (
          <StorageBoxImageParser
            isOpen={showImageParser}
            onClose={() => setShowImageParser(false)}
            storageBox={selectedBox}
            onUpdateBox={handleUpdateBox}
          />
        )}
      </AnimatePresence>

      {/* Add Material to Position Modal */}
      <AnimatePresence>
        {showAddMaterial && (
          <AddMaterialToPositionModal
            isOpen={showAddMaterial}
            onClose={() => setShowAddMaterial(false)}
            position={selectedPosition}
            onAdd={handleAddMaterial}
            storageBoxName={selectedBox.name}
          />
        )}
      </AnimatePresence>

      {/* Sharing Manager Modal */}
      <AnimatePresence>
        {showSharing && (
          <StorageBoxSharingManager
            isOpen={showSharing}
            onClose={() => setShowSharing(false)}
            storageBox={selectedBox}
          />
        )}
      </AnimatePresence>

      {/* Add New Storage Box Modal */}
      <AnimatePresence>
        {showAddBox && (
          <AddStorageBoxModal
            isOpen={showAddBox}
            onClose={() => setShowAddBox(false)}
            onAdd={handleAddNewBox}
          />
        )}
      </AnimatePresence>
    </div>
  );
}