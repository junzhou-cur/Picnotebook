export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  category: MaterialCategory;
  description?: string;
  location: MaterialLocation;
  stockInfo: StockInfo;
  properties: MaterialProperties;
  usage: UsageRecord[];
  created: string;
  lastUpdated: string;
  createdBy: string;
}

export type MaterialType = 
  | 'plasmid'
  | 'cell_line' 
  | 'antibody'
  | 'chemical'
  | 'enzyme'
  | 'media'
  | 'buffer'
  | 'primer'
  | 'kit'
  | 'other';

export type MaterialCategory = 
  | 'molecular_biology'
  | 'cell_culture'
  | 'protein'
  | 'chemistry'
  | 'consumable';

export interface MaterialLocation {
  freezer?: string;
  shelf?: string;
  box?: string;
  position?: string;
  room?: string;
  building?: string;
  notes?: string;
}

export interface StockInfo {
  currentAmount: number;
  unit: string; // µl, ml, mg, g, units, aliquots
  minimumAmount: number;
  maximumAmount?: number;
  concentration?: string;
  expiryDate?: string;
  batchNumber?: string;
  supplier?: string;
  catalogNumber?: string;
  cost?: number;
  currency?: string;
}

export interface MaterialProperties {
  // Plasmid specific
  size?: number; // bp
  resistance?: string;
  vector?: string;
  insert?: string;
  
  // Cell line specific
  species?: string;
  tissue?: string;
  passage?: number;
  freezingDate?: string;
  viability?: number;
  
  // Antibody specific
  host?: string;
  clonality?: 'monoclonal' | 'polyclonal';
  isotype?: string;
  dilution?: string;
  applications?: string[];
  
  // Chemical/Enzyme specific
  purity?: string;
  molarity?: number;
  storage?: string; // -20°C, 4°C, RT
  hazardous?: boolean;
  
  // Generic properties
  tags?: string[];
  notes?: string;
}

export interface UsageRecord {
  id: string;
  date: string;
  projectId?: string;
  experimentId?: string;
  amountUsed: number;
  unit: string;
  purpose: string;
  user: string;
  notes?: string;
}

// Material templates for common lab materials
export const MATERIAL_TEMPLATES: Record<MaterialType, Partial<Material>> = {
  plasmid: {
    type: 'plasmid',
    category: 'molecular_biology',
    stockInfo: { 
      currentAmount: 0, 
      unit: 'µg', 
      minimumAmount: 1,
      storage: '-20°C' 
    },
    properties: {
      resistance: 'Ampicillin',
      storage: '-20°C'
    }
  },
  
  cell_line: {
    type: 'cell_line',
    category: 'cell_culture',
    stockInfo: { 
      currentAmount: 0, 
      unit: 'vials', 
      minimumAmount: 2,
      storage: '-80°C' 
    },
    properties: {
      species: 'Human',
      storage: '-80°C'
    }
  },
  
  antibody: {
    type: 'antibody',
    category: 'protein',
    stockInfo: { 
      currentAmount: 0, 
      unit: 'µl', 
      minimumAmount: 10,
      storage: '4°C' 
    },
    properties: {
      clonality: 'monoclonal',
      storage: '4°C',
      applications: ['Western Blot', 'IF']
    }
  },
  
  chemical: {
    type: 'chemical',
    category: 'chemistry',
    stockInfo: { 
      currentAmount: 0, 
      unit: 'g', 
      minimumAmount: 1,
      storage: 'RT' 
    },
    properties: {
      storage: 'RT',
      hazardous: false
    }
  },
  
  enzyme: {
    type: 'enzyme',
    category: 'molecular_biology',
    stockInfo: { 
      currentAmount: 0, 
      unit: 'units', 
      minimumAmount: 100,
      storage: '-20°C' 
    },
    properties: {
      storage: '-20°C'
    }
  },
  
  media: {
    type: 'media',
    category: 'cell_culture',
    stockInfo: { 
      currentAmount: 0, 
      unit: 'ml', 
      minimumAmount: 50,
      storage: '4°C' 
    },
    properties: {
      storage: '4°C'
    }
  },
  
  buffer: {
    type: 'buffer',
    category: 'chemistry',
    stockInfo: { 
      currentAmount: 0, 
      unit: 'ml', 
      minimumAmount: 10,
      storage: '4°C' 
    },
    properties: {
      storage: '4°C'
    }
  },
  
  primer: {
    type: 'primer',
    category: 'molecular_biology',
    stockInfo: { 
      currentAmount: 0, 
      unit: 'µl', 
      minimumAmount: 5,
      storage: '-20°C' 
    },
    properties: {
      storage: '-20°C'
    }
  },
  
  kit: {
    type: 'kit',
    category: 'consumable',
    stockInfo: { 
      currentAmount: 0, 
      unit: 'reactions', 
      minimumAmount: 10,
      storage: 'RT' 
    },
    properties: {
      storage: 'RT'
    }
  },
  
  other: {
    type: 'other',
    category: 'consumable',
    stockInfo: { 
      currentAmount: 0, 
      unit: 'units', 
      minimumAmount: 1,
      storage: 'RT' 
    },
    properties: {
      storage: 'RT'
    }
  }
};

// Sample materials for demo
export const SAMPLE_MATERIALS: Material[] = [
  {
    id: '1',
    name: 'pCMV-GFP',
    type: 'plasmid',
    category: 'molecular_biology',
    description: 'CMV promoter driven GFP expression vector',
    location: {
      freezer: 'Freezer A',
      shelf: '2',
      box: 'Plasmids Box 1',
      position: 'A1'
    },
    stockInfo: {
      currentAmount: 25,
      unit: 'µg',
      minimumAmount: 5,
      concentration: '1 µg/µl',
      supplier: 'Addgene',
      catalogNumber: '11153'
    },
    properties: {
      size: 5400,
      resistance: 'Neomycin',
      vector: 'pCMV',
      insert: 'eGFP',
      storage: '-20°C',
      tags: ['fluorescent', 'transfection', 'expression']
    },
    usage: [],
    created: '2024-01-15T10:00:00Z',
    lastUpdated: '2024-08-01T15:30:00Z',
    createdBy: 'Current User'
  },
  {
    id: '2',
    name: 'HEK293T',
    type: 'cell_line',
    category: 'cell_culture',
    description: 'Human embryonic kidney cells with SV40 T-antigen',
    location: {
      freezer: 'LN2 Tank 1',
      box: 'Cell Lines',
      position: '3-4'
    },
    stockInfo: {
      currentAmount: 5,
      unit: 'vials',
      minimumAmount: 2,
      concentration: '1x10⁶ cells/ml'
    },
    properties: {
      species: 'Human',
      tissue: 'Embryonic kidney',
      passage: 45,
      freezingDate: '2024-07-15',
      viability: 95,
      storage: '-80°C',
      tags: ['adherent', 'transfection', '293']
    },
    usage: [],
    created: '2024-07-15T14:20:00Z',
    lastUpdated: '2024-08-01T09:15:00Z',
    createdBy: 'Current User'
  },
  {
    id: '3',
    name: 'Anti-GFP (Mouse)',
    type: 'antibody',
    category: 'protein',
    description: 'Monoclonal anti-GFP antibody for Western blot and IF',
    location: {
      freezer: 'Fridge B',
      shelf: 'Top',
      box: 'Primary Antibodies'
    },
    stockInfo: {
      currentAmount: 45,
      unit: 'µl',
      minimumAmount: 10,
      concentration: '1 mg/ml',
      supplier: 'Santa Cruz',
      catalogNumber: 'sc-9996'
    },
    properties: {
      host: 'Mouse',
      clonality: 'monoclonal',
      isotype: 'IgG1',
      dilution: '1:1000 (WB), 1:200 (IF)',
      applications: ['Western Blot', 'Immunofluorescence'],
      storage: '4°C',
      tags: ['GFP', 'western', 'IF']
    },
    usage: [],
    created: '2024-02-01T11:30:00Z',
    lastUpdated: '2024-08-01T16:45:00Z',
    createdBy: 'Current User'
  },
  {
    id: '4',
    name: 'DMEM + 10% FBS',
    type: 'media',
    category: 'cell_culture',
    description: 'Complete DMEM media with 10% FBS and antibiotics',
    location: {
      freezer: 'Media Fridge',
      shelf: 'Middle',
      position: 'Front'
    },
    stockInfo: {
      currentAmount: 150,
      unit: 'ml',
      minimumAmount: 50,
      expiryDate: '2024-09-15',
      supplier: 'Gibco'
    },
    properties: {
      storage: '4°C',
      tags: ['complete-media', 'FBS', 'antibiotics']
    },
    usage: [],
    created: '2024-08-01T08:00:00Z',
    lastUpdated: '2024-08-01T08:00:00Z',
    createdBy: 'Current User'
  },
  {
    id: '5',
    name: 'EcoRI',
    type: 'enzyme',
    category: 'molecular_biology',
    description: 'Restriction endonuclease - cuts at GAATTC sites',
    location: {
      freezer: 'Enzyme Freezer',
      shelf: '1',
      box: 'Restriction Enzymes',
      position: 'A5'
    },
    stockInfo: {
      currentAmount: 2500,
      unit: 'units',
      minimumAmount: 500,
      concentration: '20,000 U/ml',
      supplier: 'NEB',
      catalogNumber: 'R3101S'
    },
    properties: {
      storage: '-20°C',
      tags: ['restriction', 'cloning', 'NEB']
    },
    usage: [],
    created: '2024-06-10T13:15:00Z',
    lastUpdated: '2024-08-01T12:30:00Z',
    createdBy: 'Current User'
  }
];