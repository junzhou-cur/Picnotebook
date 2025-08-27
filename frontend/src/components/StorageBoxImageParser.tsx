'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Camera, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Eye, 
  Grid,
  Zap,
  MapPin,
  Table,
  Clipboard
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { StorageBox, MaterialPosition, GridUtils } from '@/types/storage';
import { MaterialType, MATERIAL_TEMPLATES } from '@/types/materials';

interface StorageBoxImageParserProps {
  isOpen: boolean;
  onClose: () => void;
  storageBox: StorageBox;
  onUpdateBox: (updatedBox: StorageBox) => void;
}

interface DetectedMaterial {
  position: string;
  text: string;
  confidence: number;
  parsedMaterial: Omit<MaterialPosition, 'addedDate'> | null;
  warnings: string[];
}

interface ParseResult {
  detectedMaterials: DetectedMaterial[];
  processingTime: number;
  totalDetected: number;
  successfulParsed: number;
}

export function StorageBoxImageParser({ isOpen, onClose, storageBox, onUpdateBox }: StorageBoxImageParserProps) {
  const [uploadMode, setUploadMode] = useState<'image' | 'excel' | 'paste' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [selectedDetections, setSelectedDetections] = useState<Set<string>>(new Set());
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [pasteData, setPasteData] = useState<string>('');

  // Detect material type from name
  const detectMaterialType = useCallback((name: string): MaterialType => {
    const lowerName = name.toLowerCase();
    
    // Plasmid detection
    if (lowerName.includes('plasmid') || lowerName.includes('pcmv') || lowerName.includes('pgfp') || 
        lowerName.includes('puc') || lowerName.includes('pcdna') || lowerName.startsWith('p')) {
      return 'plasmid';
    }
    
    // Cell line detection
    if (lowerName.includes('hek') || lowerName.includes('hela') || lowerName.includes('293') || 
        lowerName.includes('cell') || lowerName.includes('line') || lowerName.includes('cff') ||
        lowerName.includes('ips') || lowerName.includes('cftr')) {
      return 'cell_line';
    }
    
    // Antibody detection
    if (lowerName.includes('antibody') || lowerName.includes('anti-') || lowerName.includes('ab') ||
        lowerName.includes('igg') || lowerName.includes('mouse') || lowerName.includes('rabbit')) {
      return 'antibody';
    }
    
    // Enzyme detection
    if (lowerName.includes('ase') || lowerName.includes('ecori') || lowerName.includes('bamhi') ||
        lowerName.includes('hindiii') || lowerName.includes('enzyme')) {
      return 'enzyme';
    }
    
    // Media detection
    if (lowerName.includes('dmem') || lowerName.includes('rpmi') || lowerName.includes('media') ||
        lowerName.includes('fbs') || lowerName.includes('serum')) {
      return 'media';
    }
    
    // Chemical detection
    if (lowerName.includes('nacl') || lowerName.includes('tris') || lowerName.includes('edta') ||
        lowerName.includes('mgcl') || lowerName.includes('kcl')) {
      return 'chemical';
    }
    
    return 'cell_line'; // Default for lab cell lines
  }, []);

  // Simulate intelligent material detection from image
  const simulateImageParsing = useCallback(async (imageFile: File): Promise<ParseResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate OCR detection of materials in grid positions
        const mockDetectedMaterials: DetectedMaterial[] = [
          {
            position: 'A1',
            text: 'pCMV-GFP 25μg',
            confidence: 0.95,
            parsedMaterial: {
              materialId: 'parsed-1',
              materialName: 'pCMV-GFP',
              materialType: 'plasmid',
              position: 'A1',
              amount: 25,
              unit: 'μg'
            },
            warnings: []
          },
          {
            position: 'B3',
            text: 'HEK293T P45',
            confidence: 0.88,
            parsedMaterial: {
              materialId: 'parsed-2',
              materialName: 'HEK293T',
              materialType: 'cell_line',
              position: 'B3',
              amount: 5,
              unit: 'vials'
            },
            warnings: ['Passage number detected but amount estimated']
          }
        ];

        const successfulParsed = mockDetectedMaterials.filter(m => m.parsedMaterial).length;

        resolve({
          detectedMaterials: mockDetectedMaterials,
          processingTime: 2.3,
          totalDetected: mockDetectedMaterials.length,
          successfulParsed
        });
      }, 2500);
    });
  }, []);

  // Check if data is in grid format
  const isGridBasedLayout = useCallback((data: any[][]): boolean => {
    if (data.length < 2 || !data[0]) return false;
    
    const firstRow = data[0];
    const hasNumericHeaders = firstRow.slice(1).some(cell => 
      !isNaN(parseInt(String(cell || ''))));
    
    const hasLetterRowHeaders = data.slice(1).some(row => 
      row && row[0] && /^[A-Z]$/i.test(String(row[0]).trim()));
    
    return hasNumericHeaders && hasLetterRowHeaders;
  }, []);

  // Parse grid-based layout (like user's Excel format)
  const parseGridLayout = useCallback((data: any[][]): ParseResult => {
    const detectedMaterials: DetectedMaterial[] = [];
    
    for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
      const row = data[rowIdx];
      if (!row || !row[0]) continue;
      
      const rowLabel = String(row[0]).trim().toUpperCase();
      if (!/^[A-Z]$/i.test(rowLabel)) continue;
      
      for (let colIdx = 1; colIdx < row.length; colIdx++) {
        const cellContent = row[colIdx];
        if (!cellContent || String(cellContent).trim() === '') continue;
        
        const position = `${rowLabel}${colIdx}`;
        const materialName = String(cellContent).trim();
        const materialType = detectMaterialType(materialName);
        
        let amount = 1;
        let unit = 'vials';
        
        const amountMatch = materialName.match(/(?:P|p)(\d+)/);
        if (amountMatch) {
          amount = parseInt(amountMatch[1]);
        }
        
        const template = MATERIAL_TEMPLATES[materialType];
        unit = template.stockInfo?.unit || 'vials';
        
        detectedMaterials.push({
          position,
          text: materialName,
          confidence: 0.90,
          parsedMaterial: {
            materialId: `parsed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            materialName,
            materialType,
            position,
            amount,
            unit
          },
          warnings: []
        });
      }
    }
    
    return {
      detectedMaterials,
      processingTime: 0.3,
      totalDetected: detectedMaterials.length,
      successfulParsed: detectedMaterials.length
    };
  }, [detectMaterialType]);

  // Parse traditional tabular layout
  const parseTabularLayout = useCallback((data: any[][]): ParseResult => {
    if (data.length < 1) {
      throw new Error('No data found to parse');
    }

    const headers = data[0].map((h: any) => String(h || '').toLowerCase().trim());
    const rows = data.slice(1).filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''));

    const findColumn = (keywords: string[]) => {
      return headers.findIndex(header => 
        keywords.some(keyword => header.includes(keyword))
      );
    };

    const positionCol = findColumn(['position', 'pos', 'slot', 'well', 'tube', 'loc', 'place', 'grid', 'coordinate']);
    const nameCol = findColumn(['name', 'material', 'item', 'product', 'reagent', 'clone', 'construct', 'plasmid', 'sample', 'id']);
    const typeCol = findColumn(['type', 'category', 'class', 'kind']);
    const amountCol = findColumn(['amount', 'quantity', 'qty', 'stock', 'vol', 'volume', 'mass', 'conc', 'concentration', 'number', 'count']);
    const unitCol = findColumn(['unit', 'units', 'u', 'measurement']);

    const detectedMaterials: DetectedMaterial[] = rows.map((row, index) => {
      const warnings: string[] = [];
      
      let position = '';
      if (positionCol >= 0 && row[positionCol]) {
        position = String(row[positionCol]).toUpperCase().trim();
      } else {
        const gridPattern = /^[A-Z]?\d+[A-Z]?$|^[A-Z]+\d+$/;
        for (let i = 0; i < row.length; i++) {
          const cell = String(row[i] || '').trim();
          if (gridPattern.test(cell.toUpperCase())) {
            position = cell.toUpperCase();
            break;
          }
        }
        
        if (!position) {
          position = `ROW${index + 1}`;
          warnings.push('No position found - using row number');
        }
      }

      let name = 'Unknown Material';
      if (nameCol >= 0 && row[nameCol]) {
        name = String(row[nameCol]).trim();
      } else {
        for (let i = 0; i < row.length; i++) {
          if (i === positionCol) continue;
          const cell = String(row[i] || '').trim();
          if (cell && isNaN(parseFloat(cell))) {
            name = cell;
            break;
          }
        }
      }

      let materialType: MaterialType = 'other';
      if (typeCol >= 0 && row[typeCol]) {
        const typeHint = String(row[typeCol]).toLowerCase();
        materialType = typeHint as MaterialType;
      } else {
        materialType = detectMaterialType(name);
      }

      let amount = 1;
      let unit = 'units';
      
      if (amountCol >= 0 && row[amountCol]) {
        const amountText = String(row[amountCol]);
        const numMatch = amountText.match(/[\d.,]+/);
        if (numMatch) {
          amount = parseFloat(numMatch[0].replace(',', ''));
        }
        
        const unitMatch = amountText.match(/[a-zA-Zμµ°]+/);
        if (unitMatch) {
          unit = unitMatch[0];
        }
      }

      if (unitCol >= 0 && row[unitCol]) {
        unit = String(row[unitCol]).trim();
      }

      const template = MATERIAL_TEMPLATES[materialType];
      if (!unit || unit === 'units') {
        unit = template.stockInfo?.unit || 'units';
      }

      return {
        position,
        text: `${name} ${amount}${unit}`,
        confidence: name !== 'Unknown Material' ? 0.90 : 0.60,
        parsedMaterial: {
          materialId: `parsed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          materialName: name,
          materialType: materialType,
          position,
          amount,
          unit
        },
        warnings
      };
    });

    return {
      detectedMaterials,
      processingTime: 0.3,
      totalDetected: detectedMaterials.length,
      successfulParsed: detectedMaterials.filter(m => m.parsedMaterial).length
    };
  }, [detectMaterialType]);

  // Flexible parsing function
  const parseFlexibleData = useCallback((data: any[][]): ParseResult => {
    if (data.length < 1) {
      throw new Error('No data found to parse');
    }

    const isGridLayout = isGridBasedLayout(data);
    
    if (isGridLayout) {
      return parseGridLayout(data);
    } else {
      return parseTabularLayout(data);
    }
  }, [isGridBasedLayout, parseGridLayout, parseTabularLayout]);

  // Parse Excel file
  const parseExcelForPositions = useCallback(async (file: File): Promise<ParseResult> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          const result = parseFlexibleData(jsonData as any[][]);
          resolve(result);
          
        } catch (error) {
          reject(error);
        }
      };
      
      reader.readAsArrayBuffer(file);
    });
  }, [parseFlexibleData]);

  // Parse pasted data
  const parsePastedData = useCallback((): ParseResult => {
    if (!pasteData.trim()) {
      throw new Error('No data pasted');
    }

    const lines = pasteData.trim().split('\n');
    const data = lines.map(line => {
      if (line.includes('\t')) {
        return line.split('\t');
      } else if (line.includes(',')) {
        return line.split(',');
      } else {
        return line.split(/\s+/);
      }
    });

    return parseFlexibleData(data);
  }, [pasteData, parseFlexibleData]);

  // Handle file upload
  const handleFileUpload = async (file: File, mode: 'image' | 'excel') => {
    setIsProcessing(true);
    
    if (mode === 'image') {
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
    }
    
    try {
      let result: ParseResult;
      
      if (mode === 'image') {
        result = await simulateImageParsing(file);
      } else {
        result = await parseExcelForPositions(file);
      }
      
      setParseResult(result);
      setSelectedDetections(new Set(
        result.detectedMaterials
          .filter(m => m.parsedMaterial && m.confidence > 0.7)
          .map(m => m.position)
      ));
      
    } catch (error) {
      console.error('Parsing error:', error);
      alert('Error processing file. Please check the format and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Apply parsed results to storage box
  const applyParsedResults = () => {
    if (!parseResult) return;
    
    const updatedMaterials = { ...storageBox.materials };
    
    const selectedMaterials = parseResult.detectedMaterials
      .filter(m => selectedDetections.has(m.position) && m.parsedMaterial);
    
    selectedMaterials.forEach(detection => {
      updatedMaterials[detection.position] = {
        ...detection.parsedMaterial!,
        addedDate: new Date().toISOString()
      };
    });
    
    const updatedBox: StorageBox = {
      ...storageBox,
      materials: updatedMaterials,
      lastUpdated: new Date().toISOString()
    };
    
    console.log(`Importing ${selectedMaterials.length} materials to storage box:`, updatedBox);
    
    onUpdateBox(updatedBox);
    
    // Show success message
    alert(`Successfully imported ${selectedMaterials.length} materials to ${storageBox.name}!`);
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Smart Storage Box Parser</h2>
                <p className="text-sm text-gray-500">
                  Upload an image, Excel file, or paste data to automatically detect and import materials
                </p>
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

        <div className="flex flex-1 min-h-0">
          {/* Upload Section */}
          {!parseResult && (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-lg text-center">
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Input Method</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {/* Image Upload */}
                    <div 
                      onClick={() => setUploadMode('image')}
                      className={`p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                        uploadMode === 'image' ? 'border-purple-400 bg-purple-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-center">
                        <Camera className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                        <h4 className="font-medium text-gray-900">Photo of Storage Box</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Take a photo of your labeled storage box
                        </p>
                      </div>
                    </div>

                    {/* Excel Upload */}
                    <div 
                      onClick={() => setUploadMode('excel')}
                      className={`p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                        uploadMode === 'excel' ? 'border-purple-400 bg-purple-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-center">
                        <FileSpreadsheet className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                        <h4 className="font-medium text-gray-900">Excel File</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Upload Excel with flexible format
                        </p>
                      </div>
                    </div>

                    {/* Paste Table */}
                    <div 
                      onClick={() => setUploadMode('paste')}
                      className={`p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                        uploadMode === 'paste' ? 'border-purple-400 bg-purple-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-center">
                        <Clipboard className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                        <h4 className="font-medium text-gray-900">Paste Table</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Copy & paste from Excel or spreadsheet
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Input */}
                {uploadMode && uploadMode !== 'paste' && (
                  <div className="space-y-4">
                    <input
                      type="file"
                      accept={uploadMode === 'image' ? 'image/*' : '.xlsx,.xls,.csv'}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, uploadMode);
                      }}
                      className="hidden"
                      id="smart-upload"
                      disabled={isProcessing}
                    />
                    <label
                      htmlFor="smart-upload"
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
                    >
                      <Upload className="w-5 h-5" />
                      <span>
                        {isProcessing 
                          ? 'Processing...' 
                          : `Upload ${uploadMode === 'image' ? 'Photo' : 'Excel File'}`
                        }
                      </span>
                    </label>

                    {isProcessing && (
                      <div className="text-center">
                        <div className="inline-flex items-center space-x-2 text-purple-600">
                          <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm">
                            {uploadMode === 'image' 
                              ? 'Analyzing image and detecting materials...' 
                              : 'Parsing Excel data...'
                            }
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Paste Interface */}
                {uploadMode === 'paste' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Paste your table data below:
                      </label>
                      <textarea
                        value={pasteData}
                        onChange={(e) => setPasteData(e.target.value)}
                        placeholder="You can paste in two formats:

1. Grid Layout (like your Excel):
	1	2	3	4
A		CFF iPS G542X	DYP0250 df/G551D pG 8/2/20	
B	CFF-iPSC-CFTR (WT); batch 2	CFF-iPS CFTR G542X; batch 5	CFF-iPS CFTR W1282X; batch 3	CFF-iPS-NKX2.1(GFP)
C	CFF-16HBEge CFTR G542X; p21	CFF-16HBEge CFTR G542X; p21	CFF-16HBEge CFTR G542X; p21	

2. Traditional Table:
Position	Name	Type	Amount	Unit
A1	pCMV-GFP	plasmid	25	μg
B3	HEK293T	cell_line	5	vials"
                        rows={12}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Paste data from Excel, Google Sheets, or any spreadsheet. Tab, comma, or space-separated formats are supported.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsProcessing(true);
                        try {
                          const result = parsePastedData();
                          setParseResult(result);
                          setSelectedDetections(new Set(
                            result.detectedMaterials
                              .filter(m => m.parsedMaterial && m.confidence > 0.7)
                              .map(m => m.position)
                          ));
                        } catch (error) {
                          console.error('Parsing error:', error);
                          alert('Error parsing data. Please check the format and try again.');
                        } finally {
                          setIsProcessing(false);
                        }
                      }}
                      disabled={!pasteData.trim() || isProcessing}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Table className="w-5 h-5" />
                      <span>
                        {isProcessing ? 'Processing...' : 'Parse Table Data'}
                      </span>
                    </button>

                    {isProcessing && (
                      <div className="text-center">
                        <div className="inline-flex items-center space-x-2 text-purple-600">
                          <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm">Parsing pasted data...</span>
                        </div>
                      </div>
                    )}

                    {/* Instructions */}
                    <div className="mt-6 text-left bg-gray-50 rounded-lg p-4 text-sm">
                      <h4 className="font-semibold text-gray-900 mb-2">Paste Tips:</h4>
                      <ul className="text-gray-600 space-y-1">
                        <li><strong>Grid Layout</strong>: Copy directly from your Excel with rows A-Z and columns 1-9</li>
                        <li><strong>Table Format</strong>: Use explicit Position, Name, Type, Amount, Unit columns</li>
                        <li>• System automatically detects which format you're using</li>
                        <li>• Grid positions are automatically mapped (A1, B2, C3, etc.)</li>
                        <li>• Material types are auto-detected from names</li>
                        <li>• Tab, comma, or space-separated data all work</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results Section */}
          {parseResult && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Results Header */}
              <div className="border-b border-gray-200 p-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Detection Results ({parseResult.totalDetected} positions found)
                    </h3>
                    <p className="text-sm text-gray-500">
                      {parseResult.successfulParsed} successfully parsed • {selectedDetections.size} selected for import
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Processed in {parseResult.processingTime}s
                  </div>
                </div>
              </div>

              {/* Detection List - Scrollable Area */}
              <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-3 pb-4">
                    {parseResult.detectedMaterials.map((detection, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`border rounded-lg p-4 transition-colors ${
                          detection.parsedMaterial
                            ? selectedDetections.has(detection.position)
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                            : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {detection.parsedMaterial && (
                            <input
                              type="checkbox"
                              checked={selectedDetections.has(detection.position)}
                              onChange={() => {
                                const newSelection = new Set(selectedDetections);
                                if (newSelection.has(detection.position)) {
                                  newSelection.delete(detection.position);
                                } else {
                                  newSelection.add(detection.position);
                                }
                                setSelectedDetections(newSelection);
                              }}
                              className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                          )}
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {detection.position}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {Math.round(detection.confidence * 100)}% confidence
                                </span>
                              </div>
                              {detection.parsedMaterial ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mt-1">
                              <strong>Detected:</strong> "{detection.text}"
                            </p>
                            
                            {detection.parsedMaterial && (
                              <div className="mt-2 p-2 bg-white rounded border text-xs">
                                <div className="font-medium text-gray-900">{detection.parsedMaterial.materialName}</div>
                                <div className="text-gray-600 mt-1">
                                  Type: {detection.parsedMaterial.materialType} • 
                                  Amount: {detection.parsedMaterial.amount} {detection.parsedMaterial.unit}
                                </div>
                              </div>
                            )}
                            
                            {detection.warnings.length > 0 && (
                              <div className="mt-2 text-xs text-yellow-700">
                                <strong>Warnings:</strong>
                                <ul className="mt-1">
                                  {detection.warnings.map((warning, i) => (
                                    <li key={i}>• {warning}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
              </div>

              {/* Action Buttons - Fixed at Bottom */}
              <div className="border-t border-gray-200 p-4 flex-shrink-0 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        setParseResult(null);
                        setPreviewImage(null);
                        setUploadMode(null);
                      }}
                      className="text-gray-600 hover:text-gray-700"
                    >
                      ← Try Different File
                    </button>
                    <button
                      onClick={() => {
                        const allValid = parseResult.detectedMaterials
                          .filter(m => m.parsedMaterial)
                          .map(m => m.position);
                        setSelectedDetections(new Set(allValid));
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Select All Valid
                    </button>
                    <button
                      onClick={() => setSelectedDetections(new Set())}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear Selection
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">
                      {selectedDetections.size} materials to import
                    </span>
                    <button
                      onClick={applyParsedResults}
                      disabled={selectedDetections.size === 0}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Import to Storage Box
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}