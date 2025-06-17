export interface Contact {
  id: string;
  name: string;
  company?: string;
  title?: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  category: ContactCategory;
  specialties?: string[];
  notes?: string;
  isFavorite?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastContacted?: string;
}

export type ContactCategory = 
  | 'body-shop'
  | 'mechanic'
  | 'detailing'
  | 'parts-supplier'
  | 'towing'
  | 'inspection'
  | 'transport'
  | 'vendor'
  | 'other';

export interface ContactSettings {
  defaultCategory: ContactCategory;
  autoSaveContacts: boolean;
  showFavoritesFirst: boolean;
  enableCallLogging: boolean;
}

export const CONTACT_CATEGORY_CONFIGS = {
  'body-shop': {
    label: 'Body Shop',
    description: 'Paint, bodywork, and collision repair',
    color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
    icon: '🔧'
  },
  'mechanic': {
    label: 'Mechanic',
    description: 'Engine, transmission, and mechanical repairs',
    color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
    icon: '⚙️'
  },
  'detailing': {
    label: 'Detailing',
    description: 'Cleaning, waxing, and interior services',
    color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
    icon: '✨'
  },
  'parts-supplier': {
    label: 'Parts Supplier',
    description: 'Auto parts and accessories',
    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
    icon: '📦'
  },
  'towing': {
    label: 'Towing',
    description: 'Vehicle towing and recovery services',
    color: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
    icon: '🚛'
  },
  'inspection': {
    label: 'Inspection',
    description: 'Vehicle inspection and certification',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
    icon: '🔍'
  },
  'transport': {
    label: 'Transport',
    description: 'Vehicle transportation services',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700',
    icon: '🚚'
  },
  'vendor': {
    label: 'Vendor',
    description: 'General vendors and suppliers',
    color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/30 dark:text-gray-300 dark:border-gray-600',
    icon: '🏢'
  },
  'other': {
    label: 'Other',
    description: 'Other service providers',
    color: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700/30 dark:text-slate-300 dark:border-slate-600',
    icon: '📋'
  }
} as const;