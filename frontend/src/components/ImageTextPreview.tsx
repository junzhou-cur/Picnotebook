'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ZoomIn,
  ZoomOut,
  RotateCw,
  Eye,
  EyeOff,
  Square,
  MousePointer,
  Type,
  Maximize2,
  Minimize2,
  Copy,
  Edit3,
  Layers,
  Info
} from 'lucide-react';
import { useAppStore } from '@/stores/app';

interface TextRegion {
  id: string;
  text: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  wordLevel?: boolean;
}

interface ImageTextPreviewProps {
  imageUrl: string;
  extractedText: string;
  confidence: number;
  textRegions?: TextRegion[];
  onTextEdit?: (newText: string) => void;
  onRegionSelect?: (region: TextRegion) => void;
  className?: string;
  showConfidenceColors?: boolean;
  enableRegionHighlight?: boolean;
}

export function ImageTextPreview({
  imageUrl,
  extractedText,
  confidence,
  textRegions = [],
  onTextEdit,
  onRegionSelect,
  className = '',
  showConfidenceColors = true,
  enableRegionHighlight = true
}: ImageTextPreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showOverlay, setShowOverlay] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editingText, setEditingText] = useState(false);
  const [textValue, setTextValue] = useState(extractedText);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useAppStore();

  // Update text value when prop changes
  useEffect(() => {
    setTextValue(extractedText);
  }, [extractedText]);

  // Generate mock text regions if none provided (for demo purposes)
  const mockTextRegions: TextRegion[] = textRegions.length > 0 ? textRegions : [
    {
      id: 'region1',
      text: 'Experiment ID: EXP-2025-001',
      confidence: 95,
      bbox: { x: 50, y: 30, width: 200, height: 25 }
    },
    {
      id: 'region2', 
      text: 'Date: 2025-08-04',
      confidence: 92,
      bbox: { x: 50, y: 70, width: 150, height: 25 }
    },
    {
      id: 'region3',
      text: 'Methods: Mixed 10ml Solution A with 5ml Solution B',
      confidence: 87,
      bbox: { x: 50, y: 120, width: 350, height: 50 }
    },
    {
      id: 'region4',
      text: 'Heated to 50°C for 30min',
      confidence: 90,
      bbox: { x: 50, y: 180, width: 200, height: 25 }
    },
    {
      id: 'region5',
      text: 'Results: Color change observed to blue',
      confidence: 85,
      bbox: { x: 50, y: 230, width: 280, height: 25 }
    }
  ];

  const handleZoom = useCallback((delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 3));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left click
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleRegionClick = useCallback((region: TextRegion) => {
    setSelectedRegion(region.id);
    onRegionSelect?.(region);
    
    // Auto-scroll to corresponding text in the text panel
    const textElement = document.getElementById(`text-${region.id}`);
    if (textElement) {
      textElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [onRegionSelect]);

  const handleTextSave = useCallback(() => {
    onTextEdit?.(textValue);
    setEditingText(false);
    addNotification({
      type: 'success',
      title: 'Text Updated',
      message: 'OCR text has been updated successfully',
    });
  }, [textValue, onTextEdit, addNotification]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'border-green-500 bg-green-500';
    if (confidence >= 75) return 'border-yellow-500 bg-yellow-500';
    return 'border-red-500 bg-red-500';
  };

  const getConfidenceTextColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-700 bg-green-100';
    if (confidence >= 75) return 'text-yellow-700 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addNotification({
        type: 'success',
        title: 'Copied',
        message: 'Text copied to clipboard',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Copy Failed',
        message: 'Unable to copy text to clipboard',
      });
    }
  }, [addNotification]);

  return (
    <div className={`h-full flex flex-col lg:flex-row bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Image Panel */}
      <div className="flex-1 relative bg-gray-100 min-h-[400px] lg:min-h-0">
        {/* Image Container */}
        <div 
          ref={containerRef}
          className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="relative transition-transform duration-200 ease-out"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center'
            }}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Lab note"
              className="max-w-full h-auto select-none"
              draggable={false}
            />
            
            {/* Text Region Overlays */}
            {enableRegionHighlight && showOverlay && (
              <div className="absolute inset-0">
                {mockTextRegions.map((region) => (
                  <motion.div
                    key={region.id}
                    className={`absolute border-2 cursor-pointer transition-all duration-200 ${
                      showConfidenceColors 
                        ? getConfidenceColor(region.confidence)
                        : 'border-lab-primary bg-lab-primary'
                    } ${
                      selectedRegion === region.id 
                        ? 'border-4 shadow-lg' 
                        : hoveredRegion === region.id 
                        ? 'border-3 shadow-md' 
                        : 'border-2'
                    }`}
                    style={{
                      left: `${region.bbox.x}px`,
                      top: `${region.bbox.y}px`,
                      width: `${region.bbox.width}px`,
                      height: `${region.bbox.height}px`,
                      backgroundColor: selectedRegion === region.id 
                        ? 'rgba(59, 130, 246, 0.2)' 
                        : hoveredRegion === region.id
                        ? 'rgba(59, 130, 246, 0.1)'
                        : 'rgba(59, 130, 246, 0.05)'
                    }}
                    onClick={() => handleRegionClick(region)}
                    onMouseEnter={() => setHoveredRegion(region.id)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Confidence Badge */}
                    {showConfidenceColors && (
                      <div className={`absolute -top-6 -left-1 px-1 py-0.5 text-xs font-medium rounded ${
                        getConfidenceTextColor(region.confidence)
                      }`}>
                        {region.confidence}%
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Image Controls */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          <div className="bg-white rounded-lg shadow-md p-2 flex space-x-2">
            <button
              onClick={() => handleZoom(0.2)}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom(-0.2)}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="border-l border-gray-300"></div>
            <button
              onClick={() => setShowOverlay(!showOverlay)}
              className={`p-2 rounded transition-colors ${
                showOverlay ? 'bg-lab-primary text-white' : 'hover:bg-gray-100'
              }`}
              title={showOverlay ? 'Hide Regions' : 'Show Regions'}
            >
              {showOverlay ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-2 text-xs text-gray-600">
            Zoom: {Math.round(zoom * 100)}%
          </div>
        </div>

        {/* Region Info */}
        {selectedRegion && (
          <div className="absolute bottom-4 left-4 right-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg p-4"
            >
              {(() => {
                const region = mockTextRegions.find(r => r.id === selectedRegion);
                return region ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">Selected Text</span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          getConfidenceTextColor(region.confidence)
                        }`}>
                          {region.confidence}% confidence
                        </span>
                        <button
                          onClick={() => copyToClipboard(region.text)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Copy text"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">
                      {region.text}
                    </p>
                  </div>
                ) : null;
              })()}
            </motion.div>
          </div>
        )}
      </div>

      {/* Text Panel */}
      <div className="w-full lg:w-1/2 flex flex-col border-t lg:border-t-0 lg:border-l border-gray-200">
        {/* Text Panel Header */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Type className="w-5 h-5" />
              <span>Extracted Text</span>
            </h3>
            
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 text-sm font-medium rounded-full ${
                getConfidenceTextColor(confidence)
              }`}>
                {confidence.toFixed(1)}% Overall
              </div>
              
              <button
                onClick={() => setEditingText(!editingText)}
                className={`p-2 rounded transition-colors ${
                  editingText ? 'bg-lab-primary text-white' : 'hover:bg-gray-200'
                }`}
                title="Edit text"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => copyToClipboard(textValue)}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Copy all text"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{textValue.length} characters</span>
            <span>{textValue.split(/\s+/).length} words</span>
            <span>{mockTextRegions.length} regions</span>
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {editingText ? (
            <div className="space-y-4">
              <textarea
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                className="w-full h-64 border border-gray-300 rounded-md p-3 focus:ring-lab-primary focus:border-lab-primary font-mono text-sm"
                placeholder="Edit the extracted text..."
              />
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setTextValue(extractedText);
                    setEditingText(false);
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTextSave}
                  className="btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {mockTextRegions.map((region, index) => (
                <motion.div
                  key={region.id}
                  id={`text-${region.id}`}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                    selectedRegion === region.id
                      ? 'border-lab-primary bg-lab-primary/5'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleRegionClick(region)}
                  onMouseEnter={() => setHoveredRegion(region.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-gray-500 font-medium">
                      Region {index + 1}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        getConfidenceTextColor(region.confidence)
                      }`}>
                        {region.confidence}%
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(region.text);
                        }}
                        className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {region.text}
                  </p>
                </motion.div>
              ))}
              
              {mockTextRegions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Info className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No text regions detected</p>
                  <p className="text-sm">Try uploading a clearer image</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Text Panel Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4 text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>High confidence (≥90%)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Medium (75-89%)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Low (&lt;75%)</span>
              </div>
            </div>
            
            <div className="text-gray-400">
              Click regions to highlight • Drag to pan • Scroll to zoom
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}