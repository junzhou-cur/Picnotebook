'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Share2,
  Edit3,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Calendar,
  User,
  Tag,
  Folder,
  Copy,
  ExternalLink,
  BookOpen,
  X,
  Mail
} from 'lucide-react';

interface Protocol {
  id: string;
  title: string;
  description: string;
  category: 'Cell Culture' | 'Molecular Biology' | 'Protein Analysis' | 'NGS' | 'General';
  tags: string[];
  status: 'draft' | 'active' | 'archived';
  version: string;
  author: string;
  created_at: string;
  updated_at: string;
  steps: ProtocolStep[];
  materials: string[];
  safety_notes?: string;
  estimated_time: string;
}

interface ProtocolStep {
  id: number;
  title: string;
  description: string;
  duration?: string;
  critical?: boolean;
  notes?: string;
  day?: number;
  stage?: string;
}

interface ProtocolFormData {
  title: string;
  description: string;
  category: 'Cell Culture' | 'Molecular Biology' | 'Protein Analysis' | 'NGS' | 'General';
  tags: string[];
  materials: string[];
  safety_notes: string;
  estimated_time: string;
  steps: ProtocolStep[];
}

export function OrganizedProtocol() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<ProtocolFormData>({
    title: '',
    description: '',
    category: 'General',
    tags: [],
    materials: [''],
    safety_notes: '',
    estimated_time: '',
    steps: [{ id: 1, title: '', description: '', duration: '', critical: false, notes: '', day: 1, stage: 'Day 1' }]
  });
  const [newTag, setNewTag] = useState('');
  const [protocolText, setProtocolText] = useState('');
  const [showTextImport, setShowTextImport] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [includePDF, setIncludePDF] = useState(true);
  const [editingProtocol, setEditingProtocol] = useState<Protocol | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockProtocols: Protocol[] = [
      {
        id: '1',
        title: 'CRISPR Gene Editing Protocol',
        description: 'Standard protocol for CRISPR-Cas9 gene editing in mammalian cells',
        category: 'Molecular Biology',
        tags: ['CRISPR', 'Gene Editing', 'Transfection'],
        status: 'active',
        version: '2.1',
        author: 'Dr. Sarah Chen',
        created_at: '2025-07-15',
        updated_at: '2025-08-10',
        estimated_time: '72 hours',
        materials: ['Cas9 protein', 'sgRNA', 'Transfection reagent', 'Culture medium'],
        steps: [
          {
            id: 1,
            title: 'Design sgRNA',
            description: 'Design and order sgRNA targeting your gene of interest',
            duration: '2 hours',
            critical: true,
            day: 1,
            stage: 'Day 1 - Preparation'
          },
          {
            id: 2,
            title: 'Prepare cells',
            description: 'Seed cells at 70% confluency 24h before transfection',
            duration: '30 minutes',
            day: 1,
            stage: 'Day 1 - Preparation'
          },
          {
            id: 3,
            title: 'Transfection',
            description: 'Transfect cells with Cas9 and sgRNA using lipofectamine',
            duration: '1 hour',
            critical: true,
            day: 2,
            stage: 'Day 2 - Transfection'
          },
          {
            id: 4,
            title: 'Analysis',
            description: 'Harvest cells and analyze editing efficiency by sequencing',
            duration: '3 hours',
            day: 5,
            stage: 'Day 5 - Analysis'
          }
        ],
        safety_notes: 'Work in BSL-2 facility. Use appropriate PPE.'
      },
      {
        id: '2',
        title: 'Western Blot Protocol',
        description: 'Protein detection and quantification using Western blot',
        category: 'Protein Analysis',
        tags: ['Western Blot', 'Protein', 'Antibody'],
        status: 'active',
        version: '1.5',
        author: 'Dr. Mike Johnson',
        created_at: '2025-06-20',
        updated_at: '2025-08-05',
        estimated_time: '3 days',
        materials: ['SDS-PAGE gel', 'Transfer buffer', 'Primary antibody', 'Secondary antibody'],
        steps: [
          {
            id: 1,
            title: 'Sample preparation',
            description: 'Prepare protein samples with loading buffer',
            duration: '30 minutes',
            day: 1,
            stage: 'Day 1 - Sample Prep'
          },
          {
            id: 2,
            title: 'Run SDS-PAGE',
            description: 'Load samples and run gel electrophoresis',
            duration: '90 minutes',
            day: 1,
            stage: 'Day 1 - Sample Prep'
          },
          {
            id: 3,
            title: 'Transfer',
            description: 'Transfer proteins to PVDF membrane',
            duration: '60 minutes',
            critical: true,
            day: 1,
            stage: 'Day 1 - Sample Prep'
          },
          {
            id: 4,
            title: 'Blocking',
            description: 'Block membrane overnight in 5% milk solution',
            duration: '12 hours',
            day: 1,
            stage: 'Day 1 - Sample Prep'
          },
          {
            id: 5,
            title: 'Primary antibody',
            description: 'Incubate with primary antibody',
            duration: '2 hours',
            day: 2,
            stage: 'Day 2 - Detection'
          },
          {
            id: 6,
            title: 'Secondary antibody',
            description: 'Incubate with HRP-conjugated secondary antibody',
            duration: '1 hour',
            day: 2,
            stage: 'Day 2 - Detection'
          },
          {
            id: 7,
            title: 'Development',
            description: 'Develop blot using chemiluminescent substrate',
            duration: '30 minutes',
            day: 2,
            stage: 'Day 2 - Detection'
          }
        ],
        safety_notes: 'Handle methanol and chemicals in fume hood. Wear gloves when handling membranes.'
      },
      {
        id: '3',
        title: 'Cell Culture Maintenance',
        description: 'Standard protocol for maintaining adherent cell lines',
        category: 'Cell Culture',
        tags: ['Cell Culture', 'Maintenance', 'Passaging'],
        status: 'active',
        version: '3.0',
        author: 'Lab Manager',
        created_at: '2025-05-10',
        updated_at: '2025-08-12',
        estimated_time: '45 minutes',
        materials: ['Culture medium', 'Trypsin', 'PBS', 'Culture flasks'],
        steps: [
          {
            id: 1,
            title: 'Check confluence',
            description: 'Observe cells under microscope to assess confluence',
            duration: '5 minutes',
            day: 1,
            stage: 'Every 2-3 Days'
          },
          {
            id: 2,
            title: 'Remove media',
            description: 'Aspirate old culture medium completely',
            duration: '2 minutes',
            day: 1,
            stage: 'Every 2-3 Days'
          },
          {
            id: 3,
            title: 'Wash cells',
            description: 'Wash with PBS twice to remove debris',
            duration: '5 minutes',
            day: 1,
            stage: 'Every 2-3 Days'
          },
          {
            id: 4,
            title: 'Trypsinize',
            description: 'Add trypsin and incubate until cells detach',
            duration: '5 minutes',
            day: 1,
            stage: 'Every 2-3 Days'
          },
          {
            id: 5,
            title: 'Neutralize and split',
            description: 'Add complete medium and split cells 1:3 into new flasks',
            duration: '10 minutes',
            day: 1,
            stage: 'Every 2-3 Days'
          }
        ],
        safety_notes: 'Work in sterile laminar flow hood. Maintain aseptic technique throughout.'
      },
      {
        id: '4',
        title: 'mRNA Delivery into 293/HAP1/Hela Cells',
        description: 'Protocol for mRNA electroporation into mammalian cell lines using Neon transfection system',
        category: 'Molecular Biology',
        tags: ['mRNA', 'Electroporation', 'Transfection', 'Cell Culture'],
        status: 'active',
        version: '1.0',
        author: 'ZH',
        created_at: '2023-07-17',
        updated_at: '2023-07-17',
        estimated_time: '5 days',
        materials: [
          'Cell culture media appropriate for your cells',
          'TrypLE™ Express Enzyme (Gibco 12605010)',
          'Albumin human (Sigma A9731) - 50 mg/mL stock in 1x DPBS',
          'Neon™ Transfection System',
          'Neon™ Transfection System 10 μL Kit (Invitrogen MPK1096)',
          'DPBS, no calcium, no magnesium (Gibco 14190144)',
          'RNase free Eppendorf tubes',
          'RNase free filtered pipet tips',
          'mRNA for Cas genes',
          'Chemically modified crRNA, resuspended to 100 μM'
        ],
        steps: [
          {
            id: 1,
            title: 'Split cells for preparation',
            description: 'Split a 70-80% confluent well of cells with ratio 1:3 (Hela) or 1:6 (293 or HAP1). You want the cells to be ~ 70-80% confluent two days after split.',
            duration: '30 minutes',
            critical: false,
            day: -2,
            stage: 'Day -2 - Preparation'
          },
          {
            id: 2,
            title: 'Feed cells',
            description: 'Feed cells with regular media',
            duration: '10 minutes',
            critical: false,
            day: -1,
            stage: 'Day -1 - Maintenance'
          },
          {
            id: 3,
            title: 'Check cell state',
            description: 'Check on the state of your cells. Your cells need to be happily growing for you to get optimal electroporation efficiency. Ideally, they should be at 70-80% confluency. Lower cell density is OK as long as you have enough cells.',
            duration: '5 minutes',
            critical: true,
            day: 0,
            stage: 'Day 0 - Electroporation'
          },
          {
            id: 4,
            title: 'Wash cells',
            description: 'Aspirate media off plate. Wash cells once with 1xPBS (~1 mL per well of a 6-well plate).',
            duration: '5 minutes',
            critical: false,
            day: 0,
            stage: 'Day 0 - Electroporation'
          },
          {
            id: 5,
            title: 'Trypsinize cells',
            description: 'Treat cells with TrypLE Express at 37°C for 3-5 min (~0.5 mL per well of a 6-well plate). The cells should detach from the plate after treatment. Stop the protease reaction by adding 1.5 mL of 1X PBS with 50 μg/mL albumin. Resuspend cells and transfer to a 15 mL conical tube.',
            duration: '5 minutes',
            critical: true,
            day: 0,
            stage: 'Day 0 - Electroporation'
          },
          {
            id: 6,
            title: 'First centrifugation',
            description: 'Spin cells down at 300g for 5 min. Aspirate supernatant.',
            duration: '5 minutes',
            critical: false,
            day: 0,
            stage: 'Day 0 - Electroporation'
          },
          {
            id: 7,
            title: 'PBS wash',
            description: 'Resuspend pelleted cells with 10 mL of 1X PBS with 50 μg/mL albumin. This PBS wash step removes residue RNase from the cell media and is very critical for the success of mRNA electroporation. Do not skip!',
            duration: '5 minutes',
            critical: true,
            day: 0,
            stage: 'Day 0 - Electroporation'
          },
          {
            id: 8,
            title: 'Count cells',
            description: 'Count cells with a hemocytometer. You need 2X10⁵ cell per electroporation in general. You might need more or less cells dependent on the experiments.',
            duration: '10 minutes',
            critical: false,
            day: 0,
            stage: 'Day 0 - Electroporation'
          },
          {
            id: 9,
            title: 'Second centrifugation',
            description: 'Spin cells down at 300g for 5 min. Aspirate supernatant. Put the cells on ice until use.',
            duration: '5 minutes',
            critical: false,
            day: 0,
            stage: 'Day 0 - Electroporation'
          },
          {
            id: 10,
            title: 'Prepare plates',
            description: 'Add 0.5 mL of media to desired number of wells of a 24 well plate. You need one well per electroporation condition and one extra well for un-electroporated control.',
            duration: '5 minutes',
            critical: false,
            day: 0,
            stage: 'Day 0 - Electroporation'
          },
          {
            id: 11,
            title: 'Prepare mRNA',
            description: 'Add desired amount of mRNA to a 1.5 mL RNase free tube for each reaction. Bring the volume to 6 μL using buffer R. Keep tubes on ice after setup.',
            duration: '10 minutes',
            critical: true,
            day: 0,
            stage: 'Day 0 - Electroporation'
          },
          {
            id: 12,
            title: 'Resuspend cells',
            description: 'Carefully remove leftover PBS in the tube from step 7 and resuspend cells in Buffer R to a concentration of 4x10⁷ cells per ml. This will give you 2x10⁵ cells per 5 μL. If you need more cells per electroporation, resuspend to a different concentration.',
            duration: '5 minutes',
            critical: true,
            day: 0,
            stage: 'Day 0 - Electroporation'
          },
          {
            id: 13,
            title: 'Setup electroporator',
            description: 'Set up your Neon electroporator. Choose the right program for your specific cell type.',
            duration: '5 minutes',
            critical: false,
            day: 0,
            stage: 'Day 0 - Electroporation'
          },
          {
            id: 14,
            title: 'Perform electroporation',
            description: 'Add 5 μL of cells to the tube containing mRNA. Mix by pipetting up and down gently without introducing air bubbles. Perform electroporation right after mixing using a 10 μL Neon tip. After electroporation, put the entire volume of electroporated cells into a well of the 24-well plate from step 6. Mix cells in the well by gently rocking the plate.',
            duration: '10 minutes',
            critical: true,
            day: 0,
            stage: 'Day 0 - Electroporation'
          },
          {
            id: 15,
            title: 'Complete all conditions',
            description: 'Repeat step 12 until all conditions are finished. Put cells back in a regular incubator.',
            duration: '30 minutes',
            critical: false,
            day: 0,
            stage: 'Day 0 - Electroporation'
          },
          {
            id: 16,
            title: 'Media change and observation',
            description: 'Change media. Observe under the microscope for excessive cell death. Depending on the experiments, you might see 10 to 70% cell death. Record your observation. For Nla I-C mRNA electroporation into HAP1 or 293T cells, we normally see <20% cell death.',
            duration: '20 minutes',
            critical: false,
            day: 1,
            stage: 'Day 1 - Recovery'
          },
          {
            id: 17,
            title: 'Split and collect',
            description: 'Split cells as needed. Collect cells for analysis on day 4.',
            duration: '1 hour',
            critical: false,
            day: 2,
            stage: 'Day 2-4 - Analysis'
          }
        ],
        safety_notes: 'Work in sterile laminar flow hood. Handle RNase-free materials carefully. Follow electroporation safety protocols.'
      }
    ];
    
    setTimeout(() => {
      setProtocols(mockProtocols);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredProtocols = protocols.filter(protocol => {
    const matchesSearch = protocol.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          protocol.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          protocol.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || protocol.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'Cell Culture', 'Molecular Biology', 'Protein Analysis', 'NGS', 'General'];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Cell Culture': return 'bg-blue-100 text-blue-700';
      case 'Molecular Biology': return 'bg-green-100 text-green-700';
      case 'Protein Analysis': return 'bg-purple-100 text-purple-700';
      case 'NGS': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'draft': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'archived': return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default: return null;
    }
  };

  // Helper functions for protocol creation
  const handleSaveProtocol = () => {
    if (!formData.title.trim()) {
      alert('Please enter a protocol title');
      return;
    }

    if (formData.steps.some(step => !step.title.trim() || !step.description.trim())) {
      alert('Please fill in all step titles and descriptions');
      return;
    }

    const now = new Date().toISOString().split('T')[0];
    const newProtocol: Protocol = {
      id: `protocol_${Date.now()}`,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      tags: formData.tags,
      status: 'draft',
      version: '1.0',
      author: 'Current User',
      created_at: now,
      updated_at: now,
      steps: formData.steps,
      materials: formData.materials.filter(m => m.trim()),
      safety_notes: formData.safety_notes,
      estimated_time: formData.estimated_time
    };
    
    setProtocols(prev => [newProtocol, ...prev]);
    setShowCreateModal(false);
    alert('Protocol created successfully!');
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      category: 'General',
      tags: [],
      materials: [''],
      safety_notes: '',
      estimated_time: '',
      steps: [{ id: 1, title: '', description: '', duration: '', critical: false, notes: '', day: 1, stage: 'Day 1' }]
    });
  };

  const addStep = () => {
    const lastStep = formData.steps[formData.steps.length - 1];
    const newDay = lastStep?.day || 1;
    const newStep: ProtocolStep = {
      id: formData.steps.length + 1,
      title: '',
      description: '',
      duration: '',
      critical: false,
      notes: '',
      day: newDay,
      stage: `Day ${newDay}`
    };
    setFormData(prev => ({ ...prev, steps: [...prev.steps, newStep] }));
  };

  const removeStep = (stepId: number) => {
    if (formData.steps.length > 1) {
      setFormData(prev => ({ 
        ...prev, 
        steps: prev.steps.filter(s => s.id !== stepId).map((s, i) => ({ ...s, id: i + 1 }))
      }));
    }
  };

  const updateStep = (stepId: number, field: keyof ProtocolStep, value: any) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map(s => s.id === stepId ? { ...s, [field]: value } : s)
    }));
  };

  const addMaterial = () => {
    setFormData(prev => ({ ...prev, materials: [...prev.materials, ''] }));
  };

  const removeMaterial = (index: number) => {
    if (formData.materials.length > 1) {
      setFormData(prev => ({ 
        ...prev, 
        materials: prev.materials.filter((_, i) => i !== index)
      }));
    }
  };

  const updateMaterial = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.map((m, i) => i === index ? value : m)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  // Intelligent text parsing function
  const parseProtocolText = (text: string): ProtocolFormData => {
    // Don't collapse all whitespace - preserve line breaks for proper parsing
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Extract title
    const extractTitle = () => {
      const titlePatterns = [
        /^(?:protocol|procedure|method)\s*:?\s*(.+)$/i,
        /^title\s*:?\s*(.+)$/i,
        /^(.+?)\s+protocol$/i,
        /^(.{1,80})$/
      ];
      
      for (const line of lines.slice(0, 5)) {
        for (const pattern of titlePatterns) {
          const match = line.match(pattern);
          if (match && match[1] && match[1].length > 3 && match[1].length < 100) {
            return match[1].trim();
          }
        }
      }
      return lines[0] || 'Imported Protocol';
    };
    
    // Detect category
    const detectCategory = () => {
      const categoryKeywords = {
        'Cell Culture': ['cell', 'culture', 'passage', 'confluent', 'medium', 'incubator', 'co2', 'hela', 'hap1', '293'],
        'Molecular Biology': ['pcr', 'dna', 'rna', 'gene', 'plasmid', 'vector', 'cloning', 'crispr', 'transfection', 'mrna', 'electroporation'],
        'Protein Analysis': ['protein', 'western', 'blot', 'antibody', 'sds-page', 'bradford', 'elisa'],
        'NGS': ['sequencing', 'ngs', 'library', 'illumina', 'fastq', 'reads', 'mapping']
      };
      
      const textLower = lines.join(' ').toLowerCase();
      let maxScore = 0;
      let bestCategory: keyof typeof categoryKeywords = 'General';
      
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        const score = keywords.reduce((acc, keyword) => {
          const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
          const matches = textLower.match(regex);
          return acc + (matches ? matches.length : 0);
        }, 0);
        
        if (score > maxScore) {
          maxScore = score;
          bestCategory = category as keyof typeof categoryKeywords;
        }
      }
      
      return bestCategory as 'Cell Culture' | 'Molecular Biology' | 'Protein Analysis' | 'NGS' | 'General';
    };
    
    // Extract materials
    const extractMaterials = () => {
      const materials: string[] = [];
      const materialPatterns = [
        /(?:materials?|reagents?|supplies?|equipment)\s*:?\s*([^\n]+)/i,
        /(?:you\s+will\s+need|required)\s*:?\s*([^\n]+)/i
      ];
      
      const materialSections = [];
      let inMaterialSection = false;
      
      for (const line of lines) {
        if (/^(?:materials?|reagents?|supplies?|equipment|you\s+will\s+need)\s*:?/i.test(line)) {
          inMaterialSection = true;
          const match = line.match(/^[^:]*:?\s*(.+)/);
          if (match && match[1].trim()) {
            materialSections.push(match[1].trim());
          }
          continue;
        }
        
        if (inMaterialSection) {
          if (/^(?:steps?|procedure|protocol|method|instructions?)\s*:?/i.test(line)) {
            inMaterialSection = false;
          } else if (line.match(/^[-•*]\s*(.+)/) || line.match(/^\d+\.?\s*(.+)/)) {
            const match = line.match(/^[-•*\d.]*\s*(.+)/);
            if (match) materialSections.push(match[1].trim());
          } else if (line.length > 5 && line.length < 100) {
            materialSections.push(line);
          }
        }
      }
      
      // Split by common separators and clean up
      materialSections.forEach(section => {
        const items = section.split(/[,;\n]/).map(item => item.trim()).filter(item => item.length > 2);
        materials.push(...items);
      });
      
      // Remove duplicates and filter
      const uniqueMaterials = Array.from(new Set(materials))
        .filter(m => m.length > 2 && m.length < 100)
        .slice(0, 20);
        
      return uniqueMaterials.length > 0 ? uniqueMaterials : [''];
    };
    
    // Extract steps with enhanced day detection and automatic organization
    const extractSteps = () => {
      const steps: ProtocolStep[] = [];
      let currentDay = 0;
      let currentStage = 'Day 0';
      let stepId = 1;
      let lastTimepoint = 0; // Track cumulative time in hours
      
      // Enhanced day detection patterns - now handles negative days and ranges
      const dayPatterns = [
        /^day\s+(-?\d+(?:\s*-\s*\d+)?)/i,  // Matches "Day -2", "Day 0", "Day 2-4"
        /^d(-?\d+)/i,
        /^(-?\d+)(?:st|nd|rd|th)\s+day/i,
        /after\s+(\d+)\s+days?/i,
        /(\d+)\s+days?\s+(?:later|after|post)/i
      ];
      
      // Time patterns for automatic day assignment
      const timePatterns = {
        hours: /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/i,
        minutes: /(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|m)\b/i,
        days: /(\d+(?:\.\d+)?)\s*(?:days?|d)\b/i,
        overnight: /overnight|o\/n|16-24\s*h/i,
        incubation: /incubate\s+(?:for\s+)?(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|minutes?|mins?|days?)/i
      };
      
      // Time-based stage detection with expanded keywords
      const stagePatterns = {
        preparation: ['prep', 'prepare', 'setup', 'ready', 'start', 'seed', 'thaw', 'culture', 'grow'],
        treatment: ['treat', 'add', 'apply', 'incubate', 'transfect', 'infect', 'stimulate', 'expose', 'mix'],
        collection: ['collect', 'harvest', 'extract', 'isolate', 'purify', 'separate', 'centrifuge'],
        analysis: ['analyz', 'measure', 'detect', 'quantify', 'result', 'assess', 'evaluate', 'test', 'sequence'],
        maintenance: ['maintain', 'feed', 'change', 'wash', 'clean', 'passage', 'split', 'replace']
      };
      
      const stepPatterns = [
        /^(\d+)\s*[.)]\s*(.+)$/,  // Numbered steps like "1. Do something"
        /^step\s+(\d+)\s*:?\s*(.+)$/i,
        /^[-•*]\s*(.+)$/,  // Bullet points
        /^(?:first|then|next|finally|lastly),?\s*(.+)$/i
      ];
      
      // Function to calculate day from cumulative time
      const calculateDayFromTime = (hours: number): number => {
        if (hours <= 8) return 1; // Same day operations
        if (hours <= 24) return 2; // Next day
        return Math.ceil(hours / 24) + 1;
      };
      
      // Function to extract time duration in hours
      const extractTimeInHours = (text: string): number => {
        let hours = 0;
        
        // Check for days
        const dayMatch = text.match(timePatterns.days);
        if (dayMatch) {
          hours += parseFloat(dayMatch[1]) * 24;
        }
        
        // Check for hours
        const hourMatch = text.match(timePatterns.hours);
        if (hourMatch) {
          hours += parseFloat(hourMatch[1]);
        }
        
        // Check for minutes
        const minuteMatch = text.match(timePatterns.minutes);
        if (minuteMatch) {
          hours += parseFloat(minuteMatch[1]) / 60;
        }
        
        // Check for overnight
        if (timePatterns.overnight.test(text)) {
          hours += 16; // Assume overnight is ~16 hours
        }
        
        return hours;
      };
      
      // Function to determine stage type from text
      const determineStageType = (text: string): string => {
        const textLower = text.toLowerCase();
        let maxScore = 0;
        let bestStage = '';
        
        for (const [stage, keywords] of Object.entries(stagePatterns)) {
          const score = keywords.filter(keyword => textLower.includes(keyword)).length;
          if (score > maxScore) {
            maxScore = score;
            bestStage = stage.charAt(0).toUpperCase() + stage.slice(1);
          }
        }
        
        return bestStage;
      };
      
      let previousStageType = '';
      let currentDayContent: string[] = [];
      let isCollectingDayContent = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Check for day headers (e.g., "Day -2", "Day 0", "Day 2-4")
        let dayMatch = null;
        for (const pattern of dayPatterns) {
          dayMatch = line.match(pattern);
          if (dayMatch) break;
        }
        
        if (dayMatch) {
          // Process any accumulated content from the previous day
          if (isCollectingDayContent && currentDayContent.length > 0) {
            processDayContent(currentDayContent, currentDay, currentStage);
            currentDayContent = [];
          }
          
          // Parse the day number(s)
          const dayStr = dayMatch[1];
          if (dayStr.includes('-') && !dayStr.startsWith('-')) {
            // Day range like "2-4"
            const [start, end] = dayStr.split('-').map(d => parseInt(d.trim()));
            currentDay = start;
            currentStage = `Day ${dayStr}`;
          } else {
            // Single day (including negative days)
            currentDay = parseInt(dayStr);
            currentStage = `Day ${dayStr}`;
          }
          
          // Check if there's additional text on the same line as the day header
          const remainingText = line.substring(dayMatch.index! + dayMatch[0].length).trim();
          if (remainingText) {
            // Add stage description if present
            if (remainingText.startsWith('-') || remainingText.startsWith(':')) {
              const stageDesc = remainingText.substring(1).trim();
              if (stageDesc) {
                currentStage = `Day ${dayStr} - ${stageDesc}`;
              }
            } else {
              currentDayContent.push(remainingText);
            }
          }
          
          isCollectingDayContent = true;
          continue;
        }
        
        // If we're collecting content for a day, add this line
        if (isCollectingDayContent) {
          currentDayContent.push(line);
        }
      }
      
      // Process any remaining content
      if (currentDayContent.length > 0) {
        processDayContent(currentDayContent, currentDay, currentStage);
      }
      
      // Helper function to process content for a specific day
      function processDayContent(content: string[], day: number, stage: string) {
        let localStepId = stepId;
        
        // Join content and look for numbered steps
        const fullContent = content.join('\n');
        const stepLines: Array<{text: string, isNumbered: boolean, number?: number}> = [];
        
        for (const line of content) {
          // Check for numbered steps
          const numberedMatch = line.match(/^(\d+)\s*[.)]\s*(.+)$/);
          if (numberedMatch) {
            stepLines.push({
              text: numberedMatch[2].trim(),
              isNumbered: true,
              number: parseInt(numberedMatch[1])
            });
          } else if (line.match(/^[-•*]\s*(.+)$/)) {
            // Bullet point
            const bulletMatch = line.match(/^[-•*]\s*(.+)$/);
            if (bulletMatch) {
              stepLines.push({
                text: bulletMatch[1].trim(),
                isNumbered: false
              });
            }
          } else if (stepLines.length > 0 && line.match(/^\s+/)) {
            // Continuation of previous step (indented)
            const lastStep = stepLines[stepLines.length - 1];
            lastStep.text += ' ' + line.trim();
          } else if (line.length > 10 && !line.match(/^(reagents|materials|appendix|notes?)/i)) {
            // Regular text that might be a step description
            if (stepLines.length === 0 || !stepLines[stepLines.length - 1].isNumbered) {
              stepLines.push({
                text: line,
                isNumbered: false
              });
            } else {
              // Append to previous step
              stepLines[stepLines.length - 1].text += ' ' + line;
            }
          }
        }
        
        // If we found numbered steps or bullet points, process them
        if (stepLines.length > 0) {
          for (const stepLine of stepLines) {
            const stepText = stepLine.text;
            
            // Extract duration
            const durationMatch = stepText.match(/(\d+(?:\.\d+)?\s*(?:hours?|hrs?|minutes?|mins?|seconds?|secs?|days?))/i);
            const duration = durationMatch ? durationMatch[1] : '';
            
            // Check if critical
            const critical = /\b(?:critical|important|essential|crucial|must|do not skip|very critical)/i.test(stepText);
            
            // Determine stage type if not already specified
            let finalStage = stage;
            const stageType = determineStageType(stepText);
            if (stageType && !stage.includes('-')) {
              finalStage = `${stage} - ${stageType}`;
            }
            
            // Create title and description
            let title = '';
            let description = stepText;
            
            // Try to create a concise title
            const sentences = stepText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 3);
            if (sentences.length > 1) {
              title = sentences[0];
              if (title.length > 60) {
                title = title.substring(0, 57) + '...';
              }
              description = sentences.join('. ');
            } else {
              // Create title from first part of text
              const words = stepText.split(/\s+/);
              if (words.length > 6) {
                title = words.slice(0, 5).join(' ') + '...';
              } else {
                title = stepText.length > 60 ? stepText.substring(0, 57) + '...' : stepText;
              }
            }
            
            steps.push({
              id: localStepId++,
              title: title,
              description: description,
              duration: duration,
              critical: critical,
              notes: '',
              day: day,
              stage: finalStage
            });
          }
        } else if (fullContent.trim().length > 20) {
          // If no numbered steps found but there's content, create a single step
          const stageType = determineStageType(fullContent);
          const finalStage = stageType && !stage.includes('-') ? `${stage} - ${stageType}` : stage;
          
          steps.push({
            id: localStepId++,
            title: fullContent.substring(0, 60) + (fullContent.length > 60 ? '...' : ''),
            description: fullContent,
            duration: '',
            critical: false,
            notes: '',
            day: day,
            stage: finalStage
          });
        }
        
        stepId = localStepId;
      }
      
      // Post-process: Sort steps by day (handling negative days)
      if (steps.length > 0) {
        // Sort steps by day number
        steps.sort((a, b) => {
          // Handle day property which can be negative
          const dayA = a.day ?? 0;
          const dayB = b.day ?? 0;
          if (dayA !== dayB) {
            return dayA - dayB;
          }
          return a.id - b.id;
        });
        
        // Renumber step IDs after sorting
        steps.forEach((step, index) => {
          step.id = index + 1;
        });
      }
      
      return steps.length > 0 ? steps : [{
        id: 1,
        title: 'Protocol step',
        description: 'Please add your protocol steps here',
        duration: '',
        critical: false,
        notes: '',
        day: 1,
        stage: 'Day 1 - Preparation'
      }];
    };
    
    // Extract time estimate
    const extractTime = () => {
      const timePatterns = [
        /(?:total\s+time|duration|takes?)\s*:?\s*([^\n]+)/i,
        /(\d+(?:\.\d+)?\s*(?:hours?|hrs?|minutes?|mins?|days?))/i
      ];
      
      for (const line of lines) {
        for (const pattern of timePatterns) {
          const match = line.match(pattern);
          if (match && match[1]) {
            return match[1].trim();
          }
        }
      }
      return '';
    };
    
    // Extract safety notes
    const extractSafety = () => {
      const safetyPatterns = [
        /(?:safety|caution|warning|important|note)\s*:?\s*([^\n]+)/i
      ];
      
      const safetyNotes = [];
      for (const line of lines) {
        for (const pattern of safetyPatterns) {
          const match = line.match(pattern);
          if (match && match[1]) {
            safetyNotes.push(match[1].trim());
          }
        }
      }
      
      return safetyNotes.join('. ');
    };
    
    // Extract description
    const extractDescription = () => {
      const descriptionPatterns = [
        /(?:description|summary|overview|purpose)\s*:?\s*([^\n]+)/i
      ];
      
      for (const line of lines) {
        for (const pattern of descriptionPatterns) {
          const match = line.match(pattern);
          if (match && match[1]) {
            return match[1].trim();
          }
        }
      }
      
      // Fallback: use first few sentences as description
      const fullText = lines.join(' ');
      const sentences = fullText.split(/[.!?]+/).map(s => s.trim());
      const meaningfulSentences = sentences.filter(s => s.length > 20 && s.length < 200);
      return meaningfulSentences.slice(0, 2).join('. ');
    };
    
    // Generate tags
    const generateTags = () => {
      const scientificTerms = ['PCR', 'DNA', 'RNA', 'protein', 'cell', 'CRISPR', 'antibody', 'enzyme', 'buffer', 'gel', 'mRNA', 'electroporation', 'transfection'];
      const textLower = lines.join(' ').toLowerCase();
      
      const foundTerms = scientificTerms.filter(term => 
        new RegExp(`\\b${term.toLowerCase()}\\b`).test(textLower)
      );
      
      const allWords = textLower.match(/\b[a-z]{4,}\b/g) || [];
      const reagentNames = allWords.filter(word => 
        word.endsWith('ase') || word.endsWith('ine') || word.endsWith('ide')
      );
      
      return Array.from(new Set([...foundTerms, ...reagentNames.slice(0, 3)])).slice(0, 5);
    };
    
    const title = extractTitle();
    const category = detectCategory();
    const materials = extractMaterials();
    const steps = extractSteps();
    const estimated_time = extractTime();
    const safety_notes = extractSafety();
    const description = extractDescription();
    const tags = generateTags();
    
    return {
      title,
      description,
      category,
      tags,
      materials,
      safety_notes,
      estimated_time,
      steps
    };
  };
  
  const handleTextImport = () => {
    if (!protocolText.trim()) {
      alert('Please enter protocol text to import');
      return;
    }
    
    setIsProcessing(true);
    
    setTimeout(() => {
      const parsedData = parseProtocolText(protocolText);
      setFormData(parsedData);
      setProtocolText('');
      setShowTextImport(false);
      setIsProcessing(false);
      alert('Protocol text has been parsed and imported successfully!');
    }, 1500);
  };

  // Edit functionality
  const handleEditProtocol = (protocol: Protocol) => {
    setEditingProtocol(protocol);
    setFormData({
      title: protocol.title,
      description: protocol.description,
      category: protocol.category,
      tags: protocol.tags,
      materials: protocol.materials,
      safety_notes: protocol.safety_notes || '',
      estimated_time: protocol.estimated_time,
      steps: protocol.steps
    });
    setShowCreateModal(true);
  };

  const handleUpdateProtocol = () => {
    if (!editingProtocol || !formData.title.trim()) {
      alert('Please enter a protocol title');
      return;
    }

    const now = new Date().toISOString().split('T')[0];
    const updatedProtocol: Protocol = {
      ...editingProtocol,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      tags: formData.tags,
      materials: formData.materials.filter(m => m.trim()),
      safety_notes: formData.safety_notes,
      estimated_time: formData.estimated_time,
      steps: formData.steps,
      updated_at: now,
      version: `${parseFloat(editingProtocol.version) + 0.1}`
    };
    
    setProtocols(prev => prev.map(p => p.id === editingProtocol.id ? updatedProtocol : p));
    setEditingProtocol(null);
    setShowCreateModal(false);
    alert('Protocol updated successfully!');
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      category: 'General',
      tags: [],
      materials: [''],
      safety_notes: '',
      estimated_time: '',
      steps: [{ id: 1, title: '', description: '', duration: '', critical: false, notes: '', day: 1, stage: 'Day 1' }]
    });
  };

  // Delete functionality
  const handleDeleteProtocol = (protocol: Protocol) => {
    if (window.confirm(`Are you sure you want to delete protocol "${protocol.title}"?`)) {
      setProtocols(prev => prev.filter(p => p.id !== protocol.id));
      if (selectedProtocol?.id === protocol.id) {
        setSelectedProtocol(null);
      }
      alert('Protocol deleted successfully!');
    }
  };

  // Export PDF functionality
  const handleExportPDF = (protocol: Protocol) => {
    // Create a simplified PDF content object
    const pdfContent = {
      title: protocol.title,
      description: protocol.description,
      category: protocol.category,
      version: protocol.version,
      author: protocol.author,
      estimated_time: protocol.estimated_time,
      materials: protocol.materials,
      safety_notes: protocol.safety_notes,
      steps: protocol.steps
    };

    // In a real implementation, you would use a library like jsPDF
    // For now, we'll create a downloadable JSON file as a placeholder
    const dataStr = JSON.stringify(pdfContent, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${protocol.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('Protocol exported successfully! (Note: In production, this would be a PDF file)');
  };

  // Share functionality
  const handleShareProtocol = (protocol: Protocol) => {
    setSelectedProtocol(protocol);
    setShowShareModal(true);
  };

  const handleSubmitShare = () => {
    if (!selectedProtocol || !shareEmail.trim()) {
      alert('Please enter a valid email address');
      return;
    }

    // In a real implementation, this would make an API call
    setTimeout(() => {
      setShowShareModal(false);
      setShareEmail('');
      setShareMessage('');
      alert(`Protocol "${selectedProtocol.title}" shared successfully with ${shareEmail}!`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-lab-primary rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Organized Protocols</h1>
                <p className="text-sm text-gray-500">Manage and share lab protocols</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Protocol</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search protocols..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lab-primary focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lab-primary focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Protocol Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lab-primary"></div>
          </div>
        ) : filteredProtocols.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No protocols found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProtocols.map((protocol) => (
              <motion.div
                key={protocol.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedProtocol(protocol)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {protocol.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {protocol.description}
                      </p>
                    </div>
                    {getStatusIcon(protocol.status)}
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(protocol.category)}`}>
                      {protocol.category}
                    </span>
                    <span className="text-xs text-gray-500">v{protocol.version}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {protocol.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                    {protocol.tags.length > 3 && (
                      <span className="px-2 py-1 text-gray-500 text-xs">
                        +{protocol.tags.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{protocol.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{protocol.estimated_time}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {protocol.steps.length} steps
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProtocol(protocol);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                        title="Edit Protocol"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportPDF(protocol);
                        }}
                        className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors"
                        title="Export PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareProtocol(protocol);
                        }}
                        className="p-1 text-gray-400 hover:text-purple-600 rounded transition-colors"
                        title="Share Protocol"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProtocol(protocol);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                        title="Delete Protocol"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Protocol Detail Modal */}
        <AnimatePresence>
          {selectedProtocol && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              >
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedProtocol.title}</h2>
                      <p className="text-gray-600 mt-1">{selectedProtocol.description}</p>
                    </div>
                    <button
                      onClick={() => setSelectedProtocol(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  {/* Protocol Metadata */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Category</p>
                      <p className="text-sm font-medium text-gray-900">{selectedProtocol.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Version</p>
                      <p className="text-sm font-medium text-gray-900">{selectedProtocol.version}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Author</p>
                      <p className="text-sm font-medium text-gray-900">{selectedProtocol.author}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Est. Time</p>
                      <p className="text-sm font-medium text-gray-900">{selectedProtocol.estimated_time}</p>
                    </div>
                  </div>

                  {/* Materials */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Materials Required</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <ul className="list-disc list-inside space-y-1">
                        {selectedProtocol.materials.map((material, index) => (
                          <li key={index} className="text-sm text-gray-700">{material}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Safety Notes */}
                  {selectedProtocol.safety_notes && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Safety Notes</h3>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">{selectedProtocol.safety_notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Protocol Steps - Day-based Grouping */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Protocol Steps</h3>
                    <div className="space-y-6">
                      {(() => {
                        // Group steps by day and stage
                        const groupedSteps = selectedProtocol.steps.reduce((acc, step) => {
                          const key = step.stage || `Day ${step.day || 1}`;
                          if (!acc[key]) {
                            acc[key] = [];
                          }
                          acc[key].push(step);
                          return acc;
                        }, {} as Record<string, typeof selectedProtocol.steps>);

                        const sortedGroups = Object.entries(groupedSteps).sort((a, b) => {
                          // Extract day numbers for sorting
                          const getDayNum = (stage: string) => {
                            const match = stage.match(/day\s*(\d+)/i);
                            return match ? parseInt(match[1]) : 999;
                          };
                          return getDayNum(a[0]) - getDayNum(b[0]);
                        });

                        return sortedGroups.map(([stage, steps]) => (
                          <div key={stage} className="border border-gray-300 rounded-lg overflow-hidden">
                            {/* Day/Stage Header */}
                            <div className="bg-gradient-to-r from-lab-primary to-blue-600 px-4 py-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                  <Calendar className="w-4 h-4 text-white" />
                                </div>
                                <h4 className="font-semibold text-white">{stage}</h4>
                                <span className="text-white/80 text-sm">({steps.length} step{steps.length > 1 ? 's' : ''})</span>
                              </div>
                            </div>
                            
                            {/* Steps within this day/stage */}
                            <div className="bg-white divide-y divide-gray-200">
                              {steps.map((step) => (
                                <div key={step.id} className="p-4 hover:bg-gray-50 transition-colors">
                                  <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-lab-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                      {step.id}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <h5 className="font-semibold text-gray-900">{step.title}</h5>
                                        {step.critical && (
                                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                                            Critical
                                          </span>
                                        )}
                                        {step.duration && (
                                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                            {step.duration}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-700 leading-relaxed">{step.description}</p>
                                      {step.notes && (
                                        <p className="text-xs text-gray-500 mt-2 italic bg-gray-50 rounded px-2 py-1">Note: {step.notes}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Create Protocol Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              >
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {editingProtocol ? 'Edit Protocol' : 'Create New Protocol'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        setEditingProtocol(null);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                  <div className="space-y-6">
                    {/* Text Import Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-medium text-blue-900">🤖 Smart Protocol Import</h4>
                        <button
                          onClick={() => setShowTextImport(!showTextImport)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {showTextImport ? 'Hide Import' : 'Import from Text'}
                        </button>
                      </div>
                      
                      {showTextImport && (
                        <div className="space-y-3">
                          <p className="text-sm text-blue-700">
                            Paste any protocol text (from papers, manuals, or notes) and our AI will automatically extract and organize the information.
                          </p>
                          <textarea
                            value={protocolText}
                            onChange={(e) => setProtocolText(e.target.value)}
                            rows={6}
                            className="w-full border border-blue-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            placeholder="Paste your protocol text here... For example:

CRISPR Gene Editing Protocol
Day 1: Design sgRNA and prepare cells at 70% confluency
Day 2: Transfect with Cas9 and sgRNA using lipofectamine (critical step)
Day 5: Analyze editing efficiency

Materials: Cas9 protein, sgRNA, transfection reagent..."
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-blue-600">
                              {protocolText.length} characters • Supports any format
                            </span>
                            <button
                              onClick={handleTextImport}
                              disabled={!protocolText.trim() || isProcessing}
                              className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                                isProcessing
                                  ? 'bg-gradient-to-r from-blue-400 to-purple-500 text-white cursor-not-allowed'
                                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                              }`}
                            >
                              {isProcessing ? (
                                <div className="flex items-center space-x-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                  <span>Parsing...</span>
                                </div>
                              ) : (
                                '✨ Parse & Organize'
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Basic Information */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Protocol Title *
                          </label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
                            placeholder="Enter protocol title"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                          </label>
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
                          >
                            <option value="Cell Culture">Cell Culture</option>
                            <option value="Molecular Biology">Molecular Biology</option>
                            <option value="Protein Analysis">Protein Analysis</option>
                            <option value="NGS">NGS</option>
                            <option value="General">General</option>
                          </select>
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
                            placeholder="Describe the protocol purpose and overview"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estimated Time
                          </label>
                          <input
                            type="text"
                            value={formData.estimated_time}
                            onChange={(e) => setFormData(prev => ({ ...prev, estimated_time: e.target.value }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
                            placeholder="e.g., 2 hours, 3 days"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Tags</h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-lab-primary text-white text-sm rounded-full flex items-center space-x-1"
                          >
                            <span>{tag}</span>
                            <button
                              onClick={() => removeTag(tag)}
                              className="hover:bg-lab-primary/80 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addTag()}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
                          placeholder="Add a tag and press Enter"
                        />
                        <button
                          onClick={addTag}
                          className="px-4 py-2 bg-lab-primary text-white rounded-md hover:bg-lab-primary/90 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Materials */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Materials Required</h4>
                      <div className="space-y-2">
                        {formData.materials.map((material, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={material}
                              onChange={(e) => updateMaterial(index, e.target.value)}
                              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
                              placeholder="Enter material or reagent"
                            />
                            {formData.materials.length > 1 && (
                              <button
                                onClick={() => removeMaterial(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={addMaterial}
                          className="flex items-center space-x-2 text-lab-primary hover:text-lab-primary/80"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Material</span>
                        </button>
                      </div>
                    </div>

                    {/* Safety Notes */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Safety Notes</h4>
                      <textarea
                        value={formData.safety_notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, safety_notes: e.target.value }))}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
                        placeholder="Important safety considerations and warnings"
                      />
                    </div>

                    {/* Protocol Steps */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Protocol Steps</h4>
                      <div className="space-y-4">
                        {formData.steps.map((step) => (
                          <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-medium text-gray-900">Step {step.id}</span>
                              {formData.steps.length > 1 && (
                                <button
                                  onClick={() => removeStep(step.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Step Title *
                                </label>
                                <input
                                  type="text"
                                  value={step.title}
                                  onChange={(e) => updateStep(step.id, 'title', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
                                  placeholder="Step title"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Duration
                                </label>
                                <input
                                  type="text"
                                  value={step.duration}
                                  onChange={(e) => updateStep(step.id, 'duration', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
                                  placeholder="e.g., 30 minutes"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Day
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={step.day || 1}
                                  onChange={(e) => {
                                    const day = parseInt(e.target.value) || 1;
                                    updateStep(step.id, 'day', day);
                                    updateStep(step.id, 'stage', `Day ${day}`);
                                  }}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
                                  placeholder="1"
                                />
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stage Description
                              </label>
                              <input
                                type="text"
                                value={step.stage || ''}
                                onChange={(e) => updateStep(step.id, 'stage', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
                                placeholder="e.g., Day 1 - Preparation, Day 2 - Treatment"
                              />
                            </div>
                            
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description *
                              </label>
                              <textarea
                                value={step.description}
                                onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                                rows={2}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
                                placeholder="Detailed step instructions"
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Notes
                                </label>
                                <input
                                  type="text"
                                  value={step.notes}
                                  onChange={(e) => updateStep(step.id, 'notes', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
                                  placeholder="Additional notes"
                                />
                              </div>
                              
                              <div className="flex items-center space-x-3 pt-6">
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={step.critical}
                                    onChange={(e) => updateStep(step.id, 'critical', e.target.checked)}
                                    className="rounded border-gray-300 text-lab-primary focus:ring-lab-primary"
                                  />
                                  <span className="text-sm text-gray-700">Critical Step</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <button
                          onClick={addStep}
                          className="flex items-center space-x-2 text-lab-primary hover:text-lab-primary/80"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Step</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        setEditingProtocol(null);
                      }}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={editingProtocol ? handleUpdateProtocol : handleSaveProtocol}
                      className="px-6 py-2 bg-lab-primary text-white text-sm rounded-lg hover:bg-lab-primary/90 transition-colors"
                    >
                      {editingProtocol ? 'Update Protocol' : 'Create Protocol'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Share Modal */}
        <AnimatePresence>
          {showShareModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-60">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl max-w-md w-full p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-lab-primary" />
                    <h3 className="text-lg font-semibold text-gray-900">Share Protocol</h3>
                  </div>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {selectedProtocol && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{selectedProtocol.title}</p>
                    <p className="text-xs text-gray-500">Version {selectedProtocol.version} • {selectedProtocol.author}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
                      placeholder="Enter recipient email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      value={shareMessage}
                      onChange={(e) => setShareMessage(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-lab-primary focus:border-lab-primary"
                      placeholder="Add a personal message..."
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={includePDF}
                        onChange={(e) => setIncludePDF(e.target.checked)}
                        className="rounded border-gray-300 text-lab-primary focus:ring-lab-primary"
                      />
                      <span className="text-sm text-gray-700">Include PDF attachment</span>
                    </label>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setShowShareModal(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitShare}
                      disabled={!shareEmail.trim()}
                      className="px-6 py-2 bg-lab-primary text-white rounded-lg hover:bg-lab-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}