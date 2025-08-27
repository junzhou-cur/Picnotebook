export interface StorageBox {
  id: string;
  name: string;
  description?: string;
  location: {
    freezer: string;
    shelf?: string;
    room?: string;
    building?: string;
  };
  layout: {
    rows: number;
    columns: number;
    labelStyle: 'numbers' | 'letters' | 'mixed'; // A1, 1A, or just numbers
  };
  materials: Record<string, MaterialPosition>; // position -> material
  created: string;
  lastUpdated: string;
  createdBy: string;
}

export interface MaterialPosition {
  materialId: string;
  materialName: string;
  materialType: string;
  position: string; // e.g., "A1", "B3"
  amount?: number;
  unit?: string;
  notes?: string;
  addedDate: string;
}

export interface GridPosition {
  row: number;
  column: number;
  label: string; // "A1", "B2", etc.
  material?: MaterialPosition;
  isEmpty: boolean;
}

// Enhanced material location to include box reference
export interface EnhancedMaterialLocation {
  freezer?: string;
  shelf?: string;
  box?: string;
  boxId?: string; // Reference to StorageBox
  position?: string; // Grid position within box
  room?: string;
  building?: string;
  notes?: string;
}

// Common lab storage box templates
export const STORAGE_BOX_TEMPLATES = {
  '81_slot_freezer_box': {
    name: '81-Slot Freezer Box',
    layout: { rows: 9, columns: 9, labelStyle: 'mixed' as const },
    description: 'Standard 81-slot freezer box for -20°C/-80°C storage'
  },
  '100_slot_freezer_box': {
    name: '100-Slot Freezer Box', 
    layout: { rows: 10, columns: 10, labelStyle: 'mixed' as const },
    description: 'Large 100-slot freezer box for high-capacity storage'
  },
  '49_slot_freezer_box': {
    name: '49-Slot Freezer Box',
    layout: { rows: 7, columns: 7, labelStyle: 'mixed' as const },
    description: 'Compact 49-slot freezer box for smaller collections'
  },
  '64_slot_freezer_box': {
    name: '64-Slot Freezer Box',
    layout: { rows: 8, columns: 8, labelStyle: 'mixed' as const },
    description: 'Medium 64-slot freezer box'
  },
  'custom': {
    name: 'Custom Layout',
    layout: { rows: 8, columns: 9, labelStyle: 'mixed' as const },
    description: 'Custom storage box layout'
  }
};

// Sample storage boxes for demo
export const SAMPLE_STORAGE_BOXES: StorageBox[] = [
  {
    id: 'box1',
    name: 'Plasmids Box 1',
    description: 'Primary plasmid collection for current projects',
    location: {
      freezer: 'Freezer A',
      shelf: 'Top',
      room: 'Lab 201',
      building: 'Science Building'
    },
    layout: {
      rows: 9,
      columns: 9,
      labelStyle: 'mixed'
    },
    materials: {
      'A1': {
        materialId: '1',
        materialName: 'pCMV-GFP',
        materialType: 'plasmid',
        position: 'A1',
        amount: 25,
        unit: 'µg',
        addedDate: '2024-01-15T10:00:00Z'
      },
      'B3': {
        materialId: '2',
        materialName: 'pUC19',
        materialType: 'plasmid',
        position: 'B3',
        amount: 15,
        unit: 'µg',
        addedDate: '2024-01-20T14:30:00Z'
      },
      'C5': {
        materialId: '3',
        materialName: 'pET-28a',
        materialType: 'plasmid',
        position: 'C5',
        amount: 30,
        unit: 'µg',
        addedDate: '2024-02-01T09:15:00Z'
      }
    },
    created: '2024-01-15T10:00:00Z',
    lastUpdated: '2024-08-01T15:30:00Z',
    createdBy: 'Current User'
  },
  {
    id: 'box2',
    name: 'Cell Lines Cryo Box 1',
    description: 'Frozen cell line stocks for tissue culture',
    location: {
      freezer: 'LN2 Tank 1',
      shelf: 'Rack B',
      room: 'Cell Culture Room',
      building: 'Science Building'
    },
    layout: {
      rows: 10,
      columns: 10,
      labelStyle: 'mixed'
    },
    materials: {
      'A1': {
        materialId: '4',
        materialName: 'HEK293T',
        materialType: 'cell_line',
        position: 'A1',
        amount: 5,
        unit: 'vials',
        addedDate: '2024-07-15T14:20:00Z'
      },
      'B2': {
        materialId: '5',
        materialName: 'HeLa',
        materialType: 'cell_line',
        position: 'B2',
        amount: 3,
        unit: 'vials',
        addedDate: '2024-07-20T11:45:00Z'
      }
    },
    created: '2024-07-15T14:20:00Z',
    lastUpdated: '2024-08-01T09:15:00Z',
    createdBy: 'Current User'
  }
];

// Utility functions for grid positioning
export class GridUtils {
  static generateGridLabel(row: number, col: number, style: 'numbers' | 'letters' | 'mixed'): string {
    switch (style) {
      case 'letters':
        return `${String.fromCharCode(65 + row)}${String.fromCharCode(65 + col)}`;
      case 'numbers':
        return `${row + 1}${col + 1}`;
      case 'mixed':
      default:
        return `${String.fromCharCode(65 + row)}${col + 1}`;
    }
  }

  static parseGridLabel(label: string): { row: number; col: number } | null {
    // Handle mixed format (A1, B2, etc.)
    const mixedMatch = label.match(/^([A-Z])(\d+)$/);
    if (mixedMatch) {
      return {
        row: mixedMatch[1].charCodeAt(0) - 65,
        col: parseInt(mixedMatch[2]) - 1
      };
    }
    
    // Handle numeric format (11, 23, etc.)
    const numMatch = label.match(/^(\d)(\d+)$/);
    if (numMatch) {
      return {
        row: parseInt(numMatch[1]) - 1,
        col: parseInt(numMatch[2]) - 1
      };
    }
    
    return null;
  }

  static generateGridPositions(rows: number, columns: number, labelStyle: 'numbers' | 'letters' | 'mixed'): GridPosition[] {
    const positions: GridPosition[] = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        positions.push({
          row,
          column: col,
          label: this.generateGridLabel(row, col, labelStyle),
          isEmpty: true
        });
      }
    }
    
    return positions;
  }

  static getAdjacentPositions(position: string, rows: number, columns: number): string[] {
    const parsed = this.parseGridLabel(position);
    if (!parsed) return [];
    
    const { row, col } = parsed;
    const adjacent: string[] = [];
    
    // Check all 8 directions
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    
    for (const [dRow, dCol] of directions) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      
      if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < columns) {
        adjacent.push(this.generateGridLabel(newRow, newCol, 'mixed'));
      }
    }
    
    return adjacent;
  }
}