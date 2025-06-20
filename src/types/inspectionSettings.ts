export interface InspectionItem {
  id: string;
  label: string;
  description?: string;
  isRequired: boolean;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionSection {
  id: string;
  key: string; // emissions, cosmetic, mechanical, cleaning, photos
  label: string;
  description?: string;
  icon: string; // emoji or icon name
  color: string; // CSS classes for styling
  isActive: boolean;
  isCustomerVisible: boolean; // NEW: Controls if section appears in customer PDF
  order: number;
  items: InspectionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface RatingLabel {
  key: 'great' | 'fair' | 'needs-attention' | 'not-checked';
  label: string;
  description?: string;
  color: string; // CSS classes for styling
  icon?: string;
}

export interface InspectionSettings {
  id: string;
  dealershipId: string;
  sections: InspectionSection[];
  ratingLabels: RatingLabel[];
  globalSettings: {
    requireUserInitials: boolean;
    allowSkipItems: boolean;
    autoSaveProgress: boolean;
    showProgressPercentage: boolean;
    enableTeamNotes: boolean;
  };
  customerPdfSettings: {
    includeVehiclePhotos: boolean;
    includeCustomerComments: boolean;
    showDetailedRatings: boolean;
    companyLogo?: string;
    footerText?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Default inspection configuration
export const DEFAULT_INSPECTION_SETTINGS: Omit<InspectionSettings, 'id' | 'dealershipId' | 'createdAt' | 'updatedAt'> = {
  sections: [
    {
      id: 'emissions',
      key: 'emissions',
      label: 'Emissions & Environmental',
      description: 'Environmental compliance and emissions testing',
      icon: '🌱',
      color: 'bg-green-100 text-green-800 border-green-200',
      isActive: true,
      isCustomerVisible: true,
      order: 1,
      items: [
        {
          id: 'emissions-test',
          label: 'Pass Emissions Test',
          description: 'Vehicle passes required emissions testing',
          isRequired: true,
          order: 1,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'obd2-scan',
          label: 'OBD2 Diagnostic Scan',
          description: 'Complete OBD2 system diagnostic scan',
          isRequired: true,
          order: 2,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'catalytic-converter',
          label: 'Catalytic Converter Check',
          description: 'Inspect catalytic converter condition',
          isRequired: false,
          order: 3,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cosmetic',
      key: 'cosmetic',
      label: 'Cosmetic Inspection',
      description: 'Visual appearance and cosmetic condition',
      icon: '🎨',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      isActive: true,
      isCustomerVisible: true,
      order: 2,
      items: [
        {
          id: 'exterior-paint',
          label: 'Exterior Paint Condition',
          description: 'Check paint for scratches, chips, and overall condition',
          isRequired: true,
          order: 1,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'bumper-condition',
          label: 'Bumper Condition',
          description: 'Inspect front and rear bumpers',
          isRequired: true,
          order: 2,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'windows-glass',
          label: 'Windows & Glass',
          description: 'Check all windows and glass for damage',
          isRequired: true,
          order: 3,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'lights-function',
          label: 'All Lights Functioning',
          description: 'Test headlights, taillights, and signals',
          isRequired: true,
          order: 4,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'tires-condition',
          label: 'Tire Condition & Tread',
          description: 'Inspect tire condition and tread depth',
          isRequired: true,
          order: 5,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'interior-cleanliness',
          label: 'Interior Cleanliness',
          description: 'Check interior condition and cleanliness',
          isRequired: true,
          order: 6,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'mechanical',
      key: 'mechanical',
      label: 'Mechanical Inspection',
      description: 'Engine, transmission, and mechanical systems',
      icon: '🔧',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      isActive: true,
      isCustomerVisible: true,
      order: 3,
      items: [
        {
          id: 'engine-operation',
          label: 'Engine Operation',
          description: 'Test engine performance and operation',
          isRequired: true,
          order: 1,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'transmission-function',
          label: 'Transmission Function',
          description: 'Check transmission operation and shifting',
          isRequired: true,
          order: 2,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'brakes-condition',
          label: 'Brakes Condition',
          description: 'Inspect brake system and performance',
          isRequired: true,
          order: 3,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'suspension-check',
          label: 'Suspension Check',
          description: 'Test suspension system and components',
          isRequired: true,
          order: 4,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'steering-alignment',
          label: 'Steering & Alignment',
          description: 'Check steering and wheel alignment',
          isRequired: true,
          order: 5,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'fluids-levels',
          label: 'Fluid Levels Check',
          description: 'Check all fluid levels and condition',
          isRequired: true,
          order: 6,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cleaning',
      key: 'cleaning',
      label: 'Cleaning & Detailing',
      description: 'Vehicle cleaning and detailing services',
      icon: '✨',
      color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      isActive: true,
      isCustomerVisible: false, // Hidden from customer by default
      order: 4,
      items: [
        {
          id: 'exterior-wash',
          label: 'Exterior Wash & Wax',
          description: 'Complete exterior wash and wax service',
          isRequired: true,
          order: 1,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'interior-vacuum',
          label: 'Interior Vacuum',
          description: 'Thorough interior vacuuming',
          isRequired: true,
          order: 2,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'windows-cleaned',
          label: 'Windows Cleaned',
          description: 'Clean all interior and exterior windows',
          isRequired: true,
          order: 3,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'detail-complete',
          label: 'Detail Complete',
          description: 'Full detail service completed',
          isRequired: true,
          order: 4,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'photos',
      key: 'photos',
      label: 'Photography Documentation',
      description: 'Vehicle photography and documentation',
      icon: '📸',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      isActive: true,
      isCustomerVisible: false, // Hidden from customer by default
      order: 5,
      items: [
        {
          id: 'exterior-photos',
          label: 'Exterior Photos (All Angles)',
          description: 'Complete exterior photography from all angles',
          isRequired: true,
          order: 1,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'interior-photos',
          label: 'Interior Photos',
          description: 'Comprehensive interior photography',
          isRequired: true,
          order: 2,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'engine-bay-photos',
          label: 'Engine Bay Photos',
          description: 'Engine compartment photography',
          isRequired: true,
          order: 3,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'damage-photos',
          label: 'Any Damage Photos',
          description: 'Document any existing damage or issues',
          isRequired: true,
          order: 4,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  ratingLabels: [
    {
      key: 'great',
      label: 'Excellent',
      description: 'Excellent condition, no issues',
      color: 'bg-emerald-600 text-white ring-2 ring-emerald-300',
      icon: '⭐'
    },
    {
      key: 'fair',
      label: 'Good',
      description: 'Good condition, minor wear',
      color: 'bg-yellow-600 text-white ring-2 ring-yellow-300',
      icon: '✓'
    },
    {
      key: 'needs-attention',
      label: 'Needs Attention',
      description: 'Requires work or attention',
      color: 'bg-red-600 text-white ring-2 ring-red-300',
      icon: '⚠️'
    },
    {
      key: 'not-checked',
      label: 'Not Inspected',
      description: 'Not yet inspected',
      color: 'bg-gray-500 text-white',
      icon: '?'
    }
  ],
  globalSettings: {
    requireUserInitials: true,
    allowSkipItems: false,
    autoSaveProgress: true,
    showProgressPercentage: true,
    enableTeamNotes: true
  },
  customerPdfSettings: {
    includeVehiclePhotos: false,
    includeCustomerComments: true,
    showDetailedRatings: true,
    footerText: 'This inspection was performed by certified technicians using industry-standard procedures.'
  }
};