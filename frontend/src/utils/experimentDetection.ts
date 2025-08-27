export interface ExperimentType {
  id: string;
  name: string;
  confidence: number;
  template: ExperimentTemplate;
  keywords: string[];
}

export interface ExperimentTemplate {
  title: string;
  description: string;
  essentialFields: TemplateField[];
  optionalFields: TemplateField[];
  suggestedTags: string[];
}

export interface TemplateField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'time' | 'select' | 'multiselect' | 'textarea';
  required: boolean;
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// Comprehensive experiment type definitions
export const EXPERIMENT_TEMPLATES: Record<string, ExperimentTemplate> = {
  cell_culture_plate: {
    title: 'Cell Culture Plate',
    description: '6-well, 12-well, or 96-well plate experiments',
    essentialFields: [
      {
        id: 'plate_type',
        label: 'Plate Type',
        type: 'select',
        required: true,
        options: ['6-well', '12-well', '24-well', '96-well', '384-well'],
        defaultValue: '6-well'
      },
      {
        id: 'cell_line',
        label: 'Cell Line',
        type: 'text',
        required: true,
        placeholder: 'e.g., HEK293, HeLa, primary fibroblasts'
      },
      {
        id: 'treatment',
        label: 'Treatment/Condition',
        type: 'textarea',
        required: true,
        placeholder: 'Describe treatments, concentrations, controls'
      },
      {
        id: 'time_point',
        label: 'Time Point',
        type: 'text',
        required: true,
        placeholder: 'e.g., 24h, 48h, Day 3'
      }
    ],
    optionalFields: [
      {
        id: 'passage_number',
        label: 'Passage Number',
        type: 'number',
        required: false,
        placeholder: 'P3, P10, etc.'
      },
      {
        id: 'confluence',
        label: 'Confluence',
        type: 'text',
        required: false,
        placeholder: 'e.g., 80%, confluent'
      },
      {
        id: 'media',
        label: 'Media',
        type: 'text',
        required: false,
        placeholder: 'DMEM, RPMI, custom media'
      }
    ],
    suggestedTags: ['cell-culture', 'treatment', 'time-course', 'viability']
  },

  pcr_gel: {
    title: 'PCR/Gel Electrophoresis',
    description: 'Agarose gel, PAGE, or PCR product analysis',
    essentialFields: [
      {
        id: 'gel_type',
        label: 'Gel Type',
        type: 'select',
        required: true,
        options: ['Agarose', 'PAGE', 'Urea-PAGE', 'Bis-Tris', 'Tricine'],
        defaultValue: 'Agarose'
      },
      {
        id: 'gel_percentage',
        label: 'Gel Percentage',
        type: 'text',
        required: true,
        placeholder: 'e.g., 1%, 2%, 4-12%'
      },
      {
        id: 'samples',
        label: 'Sample Description',
        type: 'textarea',
        required: true,
        placeholder: 'Lane 1: ladder, Lane 2: sample A, etc.'
      },
      {
        id: 'expected_size',
        label: 'Expected Product Size',
        type: 'text',
        required: false,
        placeholder: 'e.g., 500bp, 2kb'
      }
    ],
    optionalFields: [
      {
        id: 'ladder',
        label: 'Ladder/Marker',
        type: 'text',
        required: false,
        placeholder: '1kb ladder, 100bp ladder, protein marker'
      },
      {
        id: 'primers',
        label: 'Primers Used',
        type: 'text',
        required: false,
        placeholder: 'Forward and reverse primer names'
      },
      {
        id: 'pcr_conditions',
        label: 'PCR Conditions',
        type: 'textarea',
        required: false,
        placeholder: 'Annealing temp, cycles, polymerase'
      }
    ],
    suggestedTags: ['PCR', 'gel-electrophoresis', 'DNA', 'amplification']
  },

  western_blot: {
    title: 'Western Blot',
    description: 'Protein detection and analysis',
    essentialFields: [
      {
        id: 'primary_antibody',
        label: 'Primary Antibody',
        type: 'text',
        required: true,
        placeholder: 'e.g., anti-β-actin, anti-GFP'
      },
      {
        id: 'protein_target',
        label: 'Target Protein',
        type: 'text',
        required: true,
        placeholder: 'Expected protein name and size'
      },
      {
        id: 'sample_source',
        label: 'Sample Source',
        type: 'textarea',
        required: true,
        placeholder: 'Cell lysate, tissue extract, treatment conditions'
      },
      {
        id: 'loading_control',
        label: 'Loading Control',
        type: 'text',
        required: false,
        placeholder: 'β-actin, GAPDH, tubulin'
      }
    ],
    optionalFields: [
      {
        id: 'protein_amount',
        label: 'Protein Amount',
        type: 'text',
        required: false,
        placeholder: 'μg loaded per lane'
      },
      {
        id: 'secondary_antibody',
        label: 'Secondary Antibody',
        type: 'text',
        required: false,
        placeholder: 'HRP-conjugated, fluorescent'
      },
      {
        id: 'exposure_time',
        label: 'Exposure Time',
        type: 'text',
        required: false,
        placeholder: '30s, 2min, overnight'
      }
    ],
    suggestedTags: ['western-blot', 'protein', 'antibody', 'expression']
  },

  microscopy: {
    title: 'Microscopy',
    description: 'Fluorescence, brightfield, or confocal microscopy',
    essentialFields: [
      {
        id: 'microscope_type',
        label: 'Microscopy Type',
        type: 'select',
        required: true,
        options: ['Brightfield', 'Fluorescence', 'Confocal', 'Phase contrast', 'DIC'],
        defaultValue: 'Fluorescence'
      },
      {
        id: 'magnification',
        label: 'Magnification',
        type: 'select',
        required: true,
        options: ['4x', '10x', '20x', '40x', '63x', '100x'],
        defaultValue: '20x'
      },
      {
        id: 'sample_prep',
        label: 'Sample Preparation',
        type: 'textarea',
        required: true,
        placeholder: 'Fixation, staining, mounting details'
      }
    ],
    optionalFields: [
      {
        id: 'fluorophores',
        label: 'Fluorophores/Stains',
        type: 'text',
        required: false,
        placeholder: 'DAPI, GFP, Alexa 488, H&E'
      },
      {
        id: 'exposure_settings',
        label: 'Exposure Settings',
        type: 'text',
        required: false,
        placeholder: 'Exposure time, gain, filters'
      },
      {
        id: 'objective',
        label: 'Objective Lens',
        type: 'text',
        required: false,
        placeholder: 'Plan-Apochromat, oil immersion'
      }
    ],
    suggestedTags: ['microscopy', 'imaging', 'fluorescence', 'morphology']
  },

  chromatography: {
    title: 'Chromatography',
    description: 'HPLC, column chromatography, or TLC results',
    essentialFields: [
      {
        id: 'chromatography_type',
        label: 'Chromatography Type',
        type: 'select',
        required: true,
        options: ['HPLC', 'Column', 'TLC', 'GC', 'LC-MS'],
        defaultValue: 'HPLC'
      },
      {
        id: 'mobile_phase',
        label: 'Mobile Phase/Solvent',
        type: 'text',
        required: true,
        placeholder: 'Buffer composition, gradient'
      },
      {
        id: 'sample_info',
        label: 'Sample Information',
        type: 'textarea',
        required: true,
        placeholder: 'Sample preparation, concentration, volume'
      }
    ],
    optionalFields: [
      {
        id: 'stationary_phase',
        label: 'Column/Stationary Phase',
        type: 'text',
        required: false,
        placeholder: 'C18, silica, resin type'
      },
      {
        id: 'detection_method',
        label: 'Detection Method',
        type: 'text',
        required: false,
        placeholder: 'UV, fluorescence, MS'
      },
      {
        id: 'retention_time',
        label: 'Retention Time',
        type: 'text',
        required: false,
        placeholder: 'Peak retention times'
      }
    ],
    suggestedTags: ['chromatography', 'purification', 'separation', 'analysis']
  },

  general_lab: {
    title: 'General Lab Work',
    description: 'General experiment or lab procedure',
    essentialFields: [
      {
        id: 'experiment_title',
        label: 'Experiment Title',
        type: 'text',
        required: true,
        placeholder: 'Brief description of what you did'
      },
      {
        id: 'procedure',
        label: 'Procedure/Method',
        type: 'textarea',
        required: true,
        placeholder: 'Key steps or protocol used'
      },
      {
        id: 'observations',
        label: 'Key Observations',
        type: 'textarea',
        required: true,
        placeholder: 'What did you observe or measure?'
      }
    ],
    optionalFields: [
      {
        id: 'materials',
        label: 'Key Materials/Reagents',
        type: 'textarea',
        required: false,
        placeholder: 'Important reagents, equipment used'
      },
      {
        id: 'next_steps',
        label: 'Next Steps',
        type: 'textarea',
        required: false,
        placeholder: 'What to do next or follow-up needed'
      }
    ],
    suggestedTags: ['experiment', 'protocol', 'procedure']
  }
};

// Image analysis keywords for each experiment type
const DETECTION_KEYWORDS: Record<string, string[]> = {
  cell_culture_plate: [
    'well', 'plate', '6-well', '12-well', '96-well', 'culture', 'cells',
    'confluent', 'confluence', 'passage', 'media', 'dish', 'flask'
  ],
  pcr_gel: [
    'gel', 'ladder', 'band', 'lane', 'PCR', 'DNA', 'agarose', 'PAGE',
    'electrophoresis', 'marker', 'bp', 'kb', 'primer', 'amplicon'
  ],
  western_blot: [
    'western', 'blot', 'protein', 'antibody', 'kDa', 'marker', 'lane',
    'membrane', 'transfer', 'detection', 'chemiluminescent', 'HRP'
  ],
  microscopy: [
    'microscope', 'fluorescence', 'DAPI', 'GFP', 'confocal', 'brightfield',
    'magnification', '10x', '20x', '40x', 'objective', 'field', 'cell'
  ],
  chromatography: [
    'HPLC', 'chromatography', 'column', 'peak', 'retention', 'gradient',
    'mobile phase', 'UV', 'detection', 'fraction', 'purification'
  ],
  general_lab: ['experiment', 'lab', 'procedure', 'protocol', 'method']
};

/**
 * Analyzes image and returns most likely experiment types
 */
export function detectExperimentType(
  imageData: File | string,
  ocrText?: string,
  filename?: string
): ExperimentType[] {
  const detectedTypes: ExperimentType[] = [];
  
  // Analysis text sources
  const analysisText = [
    ocrText || '',
    filename || '',
    // In a real implementation, you'd also analyze the actual image
  ].join(' ').toLowerCase();

  // Score each experiment type based on keyword matches
  Object.entries(DETECTION_KEYWORDS).forEach(([typeId, keywords]) => {
    let score = 0;
    let matchedKeywords: string[] = [];

    keywords.forEach(keyword => {
      if (analysisText.includes(keyword.toLowerCase())) {
        score += 1;
        matchedKeywords.push(keyword);
      }
    });

    // Bonus scoring for filename patterns
    if (filename) {
      const filenameScore = calculateFilenameScore(filename.toLowerCase(), typeId);
      score += filenameScore;
    }

    // Calculate confidence (normalize to 0-100)
    const confidence = Math.min(100, (score / keywords.length) * 100);

    if (confidence > 10) { // Only include if some confidence
      detectedTypes.push({
        id: typeId,
        name: EXPERIMENT_TEMPLATES[typeId].title,
        confidence,
        template: EXPERIMENT_TEMPLATES[typeId],
        keywords: matchedKeywords
      });
    }
  });

  // Sort by confidence, highest first
  detectedTypes.sort((a, b) => b.confidence - a.confidence);

  // Always include general_lab as fallback if no strong matches
  if (detectedTypes.length === 0 || detectedTypes[0].confidence < 50) {
    detectedTypes.push({
      id: 'general_lab',
      name: EXPERIMENT_TEMPLATES.general_lab.title,
      confidence: 25,
      template: EXPERIMENT_TEMPLATES.general_lab,
      keywords: ['experiment']
    });
  }

  return detectedTypes.slice(0, 3); // Return top 3 matches
}

/**
 * Calculate additional score based on filename patterns
 */
function calculateFilenameScore(filename: string, typeId: string): number {
  const patterns: Record<string, RegExp[]> = {
    cell_culture_plate: [
      /\d+\s*well/i,
      /(cell|culture|plate|confluent)/i,
      /(treatment|condition|passage)/i
    ],
    pcr_gel: [
      /(pcr|gel|dna|ladder)/i,
      /\d+bp/i,
      /(agarose|page)/i
    ],
    western_blot: [
      /(western|blot|protein|antibody)/i,
      /\d+kda/i,
      /(wb|wt)/i
    ],
    microscopy: [
      /(microscope|fluorescence|confocal)/i,
      /\d+x/i,
      /(dapi|gfp|brightfield)/i
    ],
    chromatography: [
      /(hplc|column|chromatography)/i,
      /(retention|peak|fraction)/i
    ]
  };

  const typePatterns = patterns[typeId] || [];
  let score = 0;

  typePatterns.forEach(pattern => {
    if (pattern.test(filename)) {
      score += 2; // Filename matches are weighted higher
    }
  });

  return score;
}

/**
 * Get suggested tags based on detected experiment type and content
 */
export function getSuggestedTags(
  experimentType: string,
  ocrText?: string,
  projectContext?: any
): string[] {
  const baseTags = EXPERIMENT_TEMPLATES[experimentType]?.suggestedTags || [];
  const contextTags: string[] = [];

  // Add project-specific tags if available
  if (projectContext?.tags) {
    contextTags.push(...projectContext.tags);
  }

  // Add content-based tags from OCR
  if (ocrText) {
    const commonLabTerms = [
      'control', 'treatment', 'positive', 'negative', 'baseline',
      'replicate', 'duplicate', 'triplicate', 'preliminary', 'optimization'
    ];

    commonLabTerms.forEach(term => {
      if (ocrText.toLowerCase().includes(term)) {
        contextTags.push(term);
      }
    });
  }

  // Combine and deduplicate
  return [...new Set([...baseTags, ...contextTags])];
}