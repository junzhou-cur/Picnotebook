/**
 * Common laboratory terms, units, and suggestions for autocomplete
 * Organized by category for better user experience
 */

export interface LabTerm {
  term: string;
  category: string;
  description?: string;
  commonUnits?: string[];
  aliases?: string[];
}

export const LAB_TERMS: LabTerm[] = [
  // Chemical compounds and reagents
  { term: 'NaCl', category: 'Chemical', description: 'Sodium chloride', commonUnits: ['M', 'mM', 'mg/mL', 'g/L'] },
  { term: 'HCl', category: 'Chemical', description: 'Hydrochloric acid', commonUnits: ['M', 'mM', 'N'] },
  { term: 'NaOH', category: 'Chemical', description: 'Sodium hydroxide', commonUnits: ['M', 'mM', 'N'] },
  { term: 'KCl', category: 'Chemical', description: 'Potassium chloride', commonUnits: ['M', 'mM', 'mg/mL'] },
  { term: 'CaCl2', category: 'Chemical', description: 'Calcium chloride', commonUnits: ['M', 'mM', 'mg/mL'] },
  { term: 'MgSO4', category: 'Chemical', description: 'Magnesium sulfate', commonUnits: ['M', 'mM', 'mg/mL'] },
  { term: 'EDTA', category: 'Chemical', description: 'Ethylenediaminetetraacetic acid', commonUnits: ['M', 'mM', 'mg/mL'] },
  { term: 'Tris', category: 'Buffer', description: 'Tris(hydroxymethyl)aminomethane', commonUnits: ['M', 'mM'] },
  { term: 'HEPES', category: 'Buffer', description: '4-(2-hydroxyethyl)-1-piperazineethanesulfonic acid', commonUnits: ['M', 'mM'] },
  
  // Biological materials
  { term: 'BSA', category: 'Protein', description: 'Bovine serum albumin', commonUnits: ['mg/mL', 'μg/mL', '%'] },
  { term: 'DNA', category: 'Nucleic Acid', description: 'Deoxyribonucleic acid', commonUnits: ['ng/μL', 'μg/mL', 'mg/mL'] },
  { term: 'RNA', category: 'Nucleic Acid', description: 'Ribonucleic acid', commonUnits: ['ng/μL', 'μg/mL'] },
  { term: 'ATP', category: 'Nucleotide', description: 'Adenosine triphosphate', commonUnits: ['M', 'mM', 'μM'] },
  { term: 'GTP', category: 'Nucleotide', description: 'Guanosine triphosphate', commonUnits: ['M', 'mM', 'μM'] },
  
  // Units and measurements
  { term: 'mL', category: 'Volume', description: 'Milliliter' },
  { term: 'μL', category: 'Volume', description: 'Microliter', aliases: ['uL', 'ul'] },
  { term: 'L', category: 'Volume', description: 'Liter' },
  { term: 'mg', category: 'Mass', description: 'Milligram' },
  { term: 'μg', category: 'Mass', description: 'Microgram', aliases: ['ug'] },
  { term: 'ng', category: 'Mass', description: 'Nanogram' },
  { term: 'g', category: 'Mass', description: 'Gram' },
  { term: 'kg', category: 'Mass', description: 'Kilogram' },
  { term: 'M', category: 'Concentration', description: 'Molar' },
  { term: 'mM', category: 'Concentration', description: 'Millimolar' },
  { term: 'μM', category: 'Concentration', description: 'Micromolar', aliases: ['uM'] },
  { term: 'nM', category: 'Concentration', description: 'Nanomolar' },
  { term: 'mg/mL', category: 'Concentration', description: 'Milligrams per milliliter' },
  { term: 'μg/mL', category: 'Concentration', description: 'Micrograms per milliliter', aliases: ['ug/mL'] },
  { term: 'ng/μL', category: 'Concentration', description: 'Nanograms per microliter', aliases: ['ng/uL'] },
  
  // Temperature units
  { term: '°C', category: 'Temperature', description: 'Degrees Celsius', aliases: ['C', 'celsius'] },
  { term: '°F', category: 'Temperature', description: 'Degrees Fahrenheit', aliases: ['F', 'fahrenheit'] },
  { term: 'K', category: 'Temperature', description: 'Kelvin' },
  
  // Time units
  { term: 'min', category: 'Time', description: 'Minutes' },
  { term: 'hr', category: 'Time', description: 'Hours', aliases: ['h', 'hour', 'hours'] },
  { term: 'sec', category: 'Time', description: 'Seconds', aliases: ['s', 'second', 'seconds'] },
  { term: 'day', category: 'Time', description: 'Days', aliases: ['d', 'days'] },
  
  // Lab procedures
  { term: 'incubate', category: 'Procedure', description: 'Maintain at specific temperature' },
  { term: 'centrifuge', category: 'Procedure', description: 'Separate by spinning' },
  { term: 'vortex', category: 'Procedure', description: 'Mix by rapid agitation' },
  { term: 'pipette', category: 'Procedure', description: 'Transfer liquid using pipette' },
  { term: 'dilute', category: 'Procedure', description: 'Reduce concentration' },
  { term: 'aliquot', category: 'Procedure', description: 'Divide into portions' },
  { term: 'lyse', category: 'Procedure', description: 'Break down cells/tissues' },
  { term: 'precipitate', category: 'Procedure', description: 'Form solid from solution' },
  { term: 'resuspend', category: 'Procedure', description: 'Re-dissolve or remix' },
  { term: 'wash', category: 'Procedure', description: 'Clean with solvent' },
  
  // Equipment
  { term: 'PCR', category: 'Equipment', description: 'Polymerase chain reaction' },
  { term: 'gel electrophoresis', category: 'Equipment', description: 'Separate molecules by size' },
  { term: 'spectrophotometer', category: 'Equipment', description: 'Measure light absorption' },
  { term: 'pH meter', category: 'Equipment', description: 'Measure acidity/alkalinity' },
  { term: 'autoclave', category: 'Equipment', description: 'Sterilize with steam' },
  { term: 'balance', category: 'Equipment', description: 'Weigh samples' },
  { term: 'microscope', category: 'Equipment', description: 'Magnify small objects' },
  { term: 'incubator', category: 'Equipment', description: 'Maintain temperature' },
  { term: 'water bath', category: 'Equipment', description: 'Heat at constant temperature' },
  { term: 'shaker', category: 'Equipment', description: 'Agitate samples' },
  
  // Conditions and parameters
  { term: 'room temperature', category: 'Condition', description: 'Ambient temperature', aliases: ['RT', 'rt'] },
  { term: 'on ice', category: 'Condition', description: 'Kept at 0°C' },
  { term: 'sterile', category: 'Condition', description: 'Free from microorganisms' },
  { term: 'pH', category: 'Parameter', description: 'Acidity/alkalinity measure' },
  { term: 'OD600', category: 'Parameter', description: 'Optical density at 600nm' },
  { term: 'A260/A280', category: 'Parameter', description: 'Nucleic acid purity ratio' },
  
  // Common lab reagents
  { term: 'ethanol', category: 'Solvent', description: 'Ethyl alcohol', aliases: ['EtOH'] },
  { term: 'methanol', category: 'Solvent', description: 'Methyl alcohol', aliases: ['MeOH'] },
  { term: 'acetone', category: 'Solvent', description: 'Organic solvent' },
  { term: 'chloroform', category: 'Solvent', description: 'Organic solvent' },
  { term: 'DMSO', category: 'Solvent', description: 'Dimethyl sulfoxide' },
  { term: 'ddH2O', category: 'Solvent', description: 'Double-distilled water', aliases: ['ddH₂O', 'distilled water'] },
  
  // Biological buffers
  { term: 'PBS', category: 'Buffer', description: 'Phosphate-buffered saline' },
  { term: 'TBS', category: 'Buffer', description: 'Tris-buffered saline' },
  { term: 'TBST', category: 'Buffer', description: 'TBS with Tween-20' },
  { term: 'lysis buffer', category: 'Buffer', description: 'Cell/tissue disruption buffer' },
  { term: 'loading buffer', category: 'Buffer', description: 'Sample preparation buffer' },
  
  // Molecular biology
  { term: 'primer', category: 'Molecular Biology', description: 'Short DNA sequence for PCR' },
  { term: 'probe', category: 'Molecular Biology', description: 'Detection sequence' },
  { term: 'vector', category: 'Molecular Biology', description: 'DNA carrier molecule' },
  { term: 'plasmid', category: 'Molecular Biology', description: 'Circular DNA molecule' },
  { term: 'enzyme', category: 'Molecular Biology', description: 'Biological catalyst' },
  { term: 'substrate', category: 'Molecular Biology', description: 'Enzyme target molecule' },
];

// Common lab measurement ranges for validation
export const MEASUREMENT_RANGES = {
  pH: { min: 0, max: 14, common: [7.0, 7.4, 6.8, 8.0] },
  temperature: { min: -80, max: 100, common: [4, 25, 37, 65, 95] },
  volume: { min: 0.1, max: 1000, common: [1, 5, 10, 50, 100, 500] },
  concentration: { min: 0.001, max: 10, common: [0.1, 0.5, 1.0, 2.0, 5.0] },
  time: { min: 1, max: 1440, common: [5, 10, 15, 30, 60, 120] }, // in minutes
};

// Search and filter lab terms
export function searchLabTerms(query: string, category?: string, maxResults: number = 10): LabTerm[] {
  const queryLower = query.toLowerCase();
  
  let filtered = LAB_TERMS.filter(term => {
    const matchesTerm = term.term.toLowerCase().includes(queryLower);
    const matchesAlias = term.aliases?.some(alias => alias.toLowerCase().includes(queryLower));
    const matchesDescription = term.description?.toLowerCase().includes(queryLower);
    const matchesCategory = !category || term.category === category;
    
    return matchesCategory && (matchesTerm || matchesAlias || matchesDescription);
  });
  
  // Sort by relevance (exact matches first, then starts with, then contains)
  filtered.sort((a, b) => {
    const aExact = a.term.toLowerCase() === queryLower ? 3 : 0;
    const bExact = b.term.toLowerCase() === queryLower ? 3 : 0;
    const aStarts = a.term.toLowerCase().startsWith(queryLower) ? 2 : 0;
    const bStarts = b.term.toLowerCase().startsWith(queryLower) ? 2 : 0;
    const aContains = a.term.toLowerCase().includes(queryLower) ? 1 : 0;
    const bContains = b.term.toLowerCase().includes(queryLower) ? 1 : 0;
    
    const aScore = aExact + aStarts + aContains;
    const bScore = bExact + bStarts + bContains;
    
    return bScore - aScore;
  });
  
  return filtered.slice(0, maxResults);
}

// Get terms by category
export function getTermsByCategory(category: string): LabTerm[] {
  return LAB_TERMS.filter(term => term.category === category);
}

// Get all categories
export function getCategories(): string[] {
  return [...new Set(LAB_TERMS.map(term => term.category))].sort();
}

// Validate measurement value against common ranges
export function validateMeasurement(type: string, value: number): {
  isValid: boolean;
  warning?: string;
  suggestion?: string;
} {
  const normalizedType = type.toLowerCase();
  
  if (normalizedType.includes('ph')) {
    const range = MEASUREMENT_RANGES.pH;
    if (value < range.min || value > range.max) {
      return {
        isValid: false,
        warning: `pH values are typically between ${range.min} and ${range.max}`,
        suggestion: `Common pH values: ${range.common.join(', ')}`
      };
    }
  }
  
  if (normalizedType.includes('temp')) {
    const range = MEASUREMENT_RANGES.temperature;
    if (value < range.min || value > range.max) {
      return {
        isValid: false,
        warning: `Temperature values are typically between ${range.min}°C and ${range.max}°C`,
        suggestion: `Common temperatures: ${range.common.join('°C, ')}°C`
      };
    }
  }
  
  return { isValid: true };
}

// Get suggested units for a measurement type
export function getSuggestedUnits(measurementType: string): string[] {
  const normalizedType = measurementType.toLowerCase();
  
  if (normalizedType.includes('ph')) return [''];
  if (normalizedType.includes('temp')) return ['°C', '°F', 'K'];
  if (normalizedType.includes('volume')) return ['μL', 'mL', 'L'];
  if (normalizedType.includes('mass') || normalizedType.includes('weight')) return ['ng', 'μg', 'mg', 'g', 'kg'];
  if (normalizedType.includes('concentration') || normalizedType.includes('conc')) return ['M', 'mM', 'μM', 'nM', 'mg/mL', 'μg/mL'];
  if (normalizedType.includes('time')) return ['sec', 'min', 'hr', 'day'];
  
  return [];
}