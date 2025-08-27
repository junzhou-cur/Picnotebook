'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Download, 
  Eye,
  Trash2,
  Edit3
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Material, MaterialType, MATERIAL_TEMPLATES } from '@/types/materials';

interface ExcelMaterialImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (materials: Omit<Material, 'id'>[]) => void;
}

interface ParsedMaterial {
  original: any;
  parsed: Omit<Material, 'id'>;
  warnings: string[];
  isValid: boolean;
}

export function ExcelMaterialImport({ isOpen, onClose, onImport }: ExcelMaterialImportProps) {
  const [dragActive, setDragActive] = useState(false);
  const [parsedMaterials, setParsedMaterials] = useState<ParsedMaterial[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  // Column mapping for flexible parsing
  const COLUMN_MAPPINGS = {
    name: ['name', 'material name', 'item', 'product', 'reagent'],
    type: ['type', 'material type', 'category', 'class'],
    description: ['description', 'desc', 'details', 'notes'],
    currentAmount: ['amount', 'current amount', 'stock', 'quantity', 'qty'],
    unit: ['unit', 'units', 'measurement'],
    minimumAmount: ['min', 'minimum', 'min amount', 'threshold'],
    concentration: ['concentration', 'conc', 'strength'],
    freezer: ['freezer', 'location', 'storage location', 'fridge'],
    shelf: ['shelf', 'rack'],
    box: ['box', 'container'],
    position: ['position', 'pos', 'slot'],
    supplier: ['supplier', 'vendor', 'company', 'source'],
    catalogNumber: ['catalog', 'cat no', 'catalog number', 'part number', 'sku'],
    expiryDate: ['expiry', 'expiry date', 'exp date', 'expires'],
    storage: ['storage', 'storage temp', 'temperature', 'temp'],
    tags: ['tags', 'keywords', 'labels']
  };

  // Intelligent type detection
  const detectMaterialType = (name: string, description: string = '', type: string = ''): MaterialType => {
    const text = `${name} ${description} ${type}`.toLowerCase();
    
    // Plasmid detection
    if (text.match(/\bp[A-Z]\w+|plasmid|vector|pcmv|pgex|puc|pbr322/)) return 'plasmid';
    
    // Cell line detection
    if (text.match(/cells?|line|hek|hela|293|cos|cho|nih3t3|mcf|jurkat/)) return 'cell_line';
    
    // Antibody detection
    if (text.match(/antibody|ab|anti-|primary|secondary|igg|igm|monoclonal|polyclonal/)) return 'antibody';
    
    // Enzyme detection
    if (text.match(/enzyme|ase$|ecori|bamhi|hindiii|taq|pfu|dnase|rnase|kinase|phosphatase/)) return 'enzyme';
    
    // Media detection
    if (text.match(/media|medium|dmem|rpmi|mem|luria|lb|agar|broth|fbs|serum/)) return 'media';
    
    // Buffer detection
    if (text.match(/buffer|tris|hepes|pbs|tbe|tae|loading/)) return 'buffer';
    
    // Chemical detection
    if (text.match(/chemical|salt|acid|base|nacl|kcl|mgcl2|cacl2|edta|egta/)) return 'chemical';
    
    // Primer detection
    if (text.match(/primer|oligo|forward|reverse|f1|r1/)) return 'primer';
    
    // Kit detection
    if (text.match(/kit|system|reagent set|pcr kit|extraction kit/)) return 'kit';
    
    return 'other';
  };

  // Parse Excel file
  const parseExcelFile = useCallback((file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          alert('Excel file must contain at least a header row and one data row');
          setIsProcessing(false);
          return;
        }
        
        const headers = (jsonData[0] as string[]).map(h => h?.toLowerCase().trim() || '');
        const rows = jsonData.slice(1) as any[][];
        
        // Create column mapping
        const columnMap: Record<string, number> = {};
        headers.forEach((header, index) => {
          for (const [field, aliases] of Object.entries(COLUMN_MAPPINGS)) {
            if (aliases.some(alias => header.includes(alias))) {
              columnMap[field] = index;
              break;
            }
          }
        });
        
        // Parse each row
        const parsed: ParsedMaterial[] = rows
          .filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
          .map((row, index) => {
            const warnings: string[] = [];
            const original = Object.fromEntries(headers.map((h, i) => [h, row[i]]));
            
            // Extract basic information
            const name = row[columnMap.name] || row[0] || `Material ${index + 1}`;
            const description = row[columnMap.description] || '';
            const typeHint = row[columnMap.type] || '';
            
            // Detect material type
            const detectedType = detectMaterialType(name, description, typeHint);
            const template = MATERIAL_TEMPLATES[detectedType];
            
            // Parse stock information
            let currentAmount = 0;
            let unit = template.stockInfo?.unit || 'units';
            
            if (columnMap.currentAmount !== undefined) {
              const amountValue = row[columnMap.currentAmount];
              if (typeof amountValue === 'string') {
                const match = amountValue.match(/([\d.,]+)\s*([a-zA-Zµ°]+)?/);
                if (match) {
                  currentAmount = parseFloat(match[1].replace(',', ''));
                  if (match[2]) unit = match[2];
                }
              } else if (typeof amountValue === 'number') {
                currentAmount = amountValue;
              }
            }
            
            if (columnMap.unit !== undefined && row[columnMap.unit]) {
              unit = row[columnMap.unit];
            }
            
            // Parse minimum amount
            let minimumAmount = template.stockInfo?.minimumAmount || Math.max(1, currentAmount * 0.1);
            if (columnMap.minimumAmount !== undefined && row[columnMap.minimumAmount]) {
              const minValue = parseFloat(row[columnMap.minimumAmount]);
              if (!isNaN(minValue)) minimumAmount = minValue;
            }
            
            // Parse concentration
            let concentration = undefined;
            if (columnMap.concentration !== undefined && row[columnMap.concentration]) {
              concentration = String(row[columnMap.concentration]);
            }
            
            // Parse location
            const location = {
              freezer: row[columnMap.freezer] || undefined,
              shelf: row[columnMap.shelf] || undefined,
              box: row[columnMap.box] || undefined,
              position: row[columnMap.position] || undefined
            };
            
            // Parse supplier info
            const supplier = row[columnMap.supplier] || undefined;
            const catalogNumber = row[columnMap.catalogNumber] || undefined;
            const expiryDate = row[columnMap.expiryDate] || undefined;
            
            // Parse storage conditions
            let storage = template.properties?.storage || 'RT';
            if (columnMap.storage !== undefined && row[columnMap.storage]) {
              const storageValue = String(row[columnMap.storage]).toLowerCase();
              if (storageValue.includes('-80') || storageValue.includes('liquid nitrogen')) storage = '-80°C';
              else if (storageValue.includes('-20') || storageValue.includes('freezer')) storage = '-20°C';
              else if (storageValue.includes('4') || storageValue.includes('fridge')) storage = '4°C';
              else if (storageValue.includes('rt') || storageValue.includes('room')) storage = 'RT';
            }
            
            // Parse tags
            let tags: string[] = [];
            if (columnMap.tags !== undefined && row[columnMap.tags]) {
              tags = String(row[columnMap.tags])
                .split(/[,;|]/)
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);
            }
            
            // Add warnings for missing critical data
            if (!name || name === `Material ${index + 1}`) {
              warnings.push('No name provided - using default');
            }
            if (currentAmount === 0) {
              warnings.push('No amount specified - defaulted to 0');
            }
            if (!location.freezer && !location.shelf && !location.box) {
              warnings.push('No location information provided');
            }
            
            const parsedMaterial: Omit<Material, 'id'> = {
              name: String(name).trim(),
              type: detectedType,
              category: template.category!,
              description: description ? String(description).trim() : undefined,
              location,
              stockInfo: {
                currentAmount,
                unit,
                minimumAmount,
                concentration,
                supplier,
                catalogNumber,
                expiryDate
              },
              properties: {
                storage,
                tags,
                ...template.properties
              },
              usage: [],
              created: new Date().toISOString(),
              lastUpdated: new Date().toISOString(),
              createdBy: 'Excel Import'
            };
            
            return {
              original,
              parsed: parsedMaterial,
              warnings,
              isValid: name.trim().length > 0
            };
          });
        
        setParsedMaterials(parsed);
        setSelectedItems(new Set(parsed.map((_, index) => index).filter(index => parsed[index].isValid)));
        
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        alert('Error parsing Excel file. Please check the format and try again.');
      } finally {
        setIsProcessing(false);
      }
    };
    
    reader.readAsArrayBuffer(file);
  }, []);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        parseExcelFile(file);
      } else {
        alert('Please upload an Excel file (.xlsx, .xls) or CSV file');
      }
    }
  }, [parseExcelFile]);

  // Handle file input
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      parseExcelFile(files[0]);
    }
  }, [parseExcelFile]);

  // Toggle item selection
  const toggleItemSelection = (index: number) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedItems(newSelection);
  };

  // Import selected materials
  const handleImport = () => {
    const materialsToImport = Array.from(selectedItems)
      .map(index => parsedMaterials[index].parsed);
    
    onImport(materialsToImport);
    onClose();
  };

  // Download template
  const downloadTemplate = () => {
    const templateData = [
      ['Name', 'Type', 'Description', 'Amount', 'Unit', 'Min Amount', 'Concentration', 'Freezer', 'Shelf', 'Box', 'Position', 'Supplier', 'Catalog Number', 'Storage', 'Tags'],
      ['pCMV-GFP', 'plasmid', 'CMV promoter driven GFP vector', '25', 'µg', '5', '1 µg/µl', 'Freezer A', '2', 'Plasmids Box 1', 'A1', 'Addgene', '11153', '-20°C', 'fluorescent,expression'],
      ['HEK293T', 'cell_line', 'Human embryonic kidney cells', '5', 'vials', '2', '1x10⁶ cells/ml', 'LN2 Tank 1', '', 'Cell Lines', '3-4', 'ATCC', 'CRL-3216', '-80°C', 'adherent,transfection'],
      ['Anti-GFP', 'antibody', 'Monoclonal anti-GFP antibody', '50', 'µl', '10', '1 mg/ml', 'Fridge B', 'Top', 'Antibodies', '', 'Santa Cruz', 'sc-9996', '4°C', 'western,IF'],
      ['DMEM', 'media', 'Complete DMEM with FBS', '500', 'ml', '50', '', 'Media Fridge', 'Middle', '', '', 'Gibco', '11965092', '4°C', 'complete-media']
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Materials');
    XLSX.writeFile(workbook, 'materials_template.xlsx');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Excel Material Import</h2>
                <p className="text-sm text-gray-500">
                  Bulk import materials from Excel/CSV files with intelligent parsing
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={downloadTemplate}
                className="flex items-center space-x-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Template</span>
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
          {/* Upload Section */}
          {parsedMaterials.length === 0 && (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-lg text-center">
                {/* Upload Area */}
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  className={`border-2 border-dashed rounded-xl p-12 transition-colors ${
                    dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      {isProcessing ? (
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Upload className="w-8 h-8 text-blue-600" />
                      )}
                    </div>
                    
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {isProcessing ? 'Processing Excel file...' : 'Upload Materials Excel File'}
                      </p>
                      <p className="text-gray-500 mt-2">
                        Drag and drop your Excel file, or click to browse
                      </p>
                    </div>
                    
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileInput}
                      className="hidden"
                      id="excel-upload"
                      disabled={isProcessing}
                    />
                    <label
                      htmlFor="excel-upload"
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <FileSpreadsheet className="w-5 h-5" />
                      <span>Choose File</span>
                    </label>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mt-8 text-left bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Excel Format Guidelines:</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• <strong>Name</strong> - Material name (required)</li>
                    <li>• <strong>Type</strong> - Material type (auto-detected if not provided)</li>
                    <li>• <strong>Amount & Unit</strong> - Current stock amount</li>
                    <li>• <strong>Location</strong> - Freezer, shelf, box, position</li>
                    <li>• <strong>Supplier Info</strong> - Vendor and catalog numbers</li>
                    <li>• <strong>Storage</strong> - Temperature conditions</li>
                    <li>• <strong>Tags</strong> - Comma-separated keywords</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-3">
                    Column names are flexible - the system will auto-detect common variations
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Results Section */}
          {parsedMaterials.length > 0 && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Results Header */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Parsed Materials ({parsedMaterials.length} found)
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedItems.size} selected for import
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedItems(new Set(parsedMaterials.map((_, i) => i).filter(i => parsedMaterials[i].isValid)))}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Select All Valid
                    </button>
                    <button
                      onClick={() => setSelectedItems(new Set())}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              </div>

              {/* Materials List */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  {parsedMaterials.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border rounded-lg p-4 transition-colors ${
                        item.isValid
                          ? selectedItems.has(index)
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(index)}
                          onChange={() => toggleItemSelection(index)}
                          disabled={!item.isValid}
                          className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{item.parsed.name}</h4>
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded capitalize">
                                {item.parsed.type.replace('_', ' ')}
                              </span>
                              {item.isValid ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                          </div>
                          
                          {item.parsed.description && (
                            <p className="text-sm text-gray-600 mt-1">{item.parsed.description}</p>
                          )}
                          
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>
                              {item.parsed.stockInfo.currentAmount} {item.parsed.stockInfo.unit}
                            </span>
                            {item.parsed.location.freezer && (
                              <span>📍 {item.parsed.location.freezer}</span>
                            )}
                            {item.parsed.properties.storage && (
                              <span>🌡️ {item.parsed.properties.storage}</span>
                            )}
                          </div>
                          
                          {item.warnings.length > 0 && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                              <strong className="text-yellow-800">Warnings:</strong>
                              <ul className="text-yellow-700 mt-1">
                                {item.warnings.map((warning, i) => (
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

              {/* Action Buttons */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setParsedMaterials([])}
                    className="text-gray-600 hover:text-gray-700"
                  >
                    ← Upload Different File
                  </button>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">
                      {selectedItems.size} materials selected
                    </span>
                    <button
                      onClick={handleImport}
                      disabled={selectedItems.size === 0}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Import Selected Materials
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