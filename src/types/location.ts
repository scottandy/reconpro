export interface Location {
  id: string;
  name: string;
  type: LocationType;
  description?: string;
  isActive: boolean;
  capacity?: number;
  createdAt: string;
  updatedAt: string;
}

export type LocationType = 
  | 'on-site'
  | 'off-site'
  | 'test-drive'
  | 'demo'
  | 'service'
  | 'storage'
  | 'display'
  | 'sold'
  | 'pending'
  | 'in-transit'
  | 'other';

export interface LocationSettings {
  defaultLocationType: LocationType;
  allowCustomLocations: boolean;
  requireLocationForVehicles: boolean;
  autoAssignLocation: boolean;
  locationCapacityTracking: boolean;
}

export const LOCATION_TYPE_CONFIGS = {
  'on-site': {
    label: 'On-Site',
    description: 'Vehicles on dealership premises',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '🏢'
  },
  'off-site': {
    label: 'Off-Site',
    description: 'Vehicles at external locations',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: '📍'
  },
  'test-drive': {
    label: 'Test Drive',
    description: 'Vehicles currently on test drives',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: '🚗'
  },
  'demo': {
    label: 'Demo',
    description: 'Demo vehicles for customer use',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '🎯'
  },
  'service': {
    label: 'Service',
    description: 'Vehicles in service department',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '🔧'
  },
  'storage': {
    label: 'Storage',
    description: 'Long-term storage locations',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '📦'
  },
  'display': {
    label: 'Display',
    description: 'Showroom display vehicles',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '✨'
  },
  'sold': {
    label: 'Sold',
    description: 'Vehicles that have been sold',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: '💰'
  },
  'pending': {
    label: 'Pending',
    description: 'Vehicles with pending status',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: '⏳'
  },
  'in-transit': {
    label: 'In-Transit',
    description: 'Vehicles being transported or moved',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: '🚛'
  },
  'other': {
    label: 'Other',
    description: 'Custom location type',
    color: 'bg-slate-100 text-slate-800 border-slate-200',
    icon: '📋'
  }
} as const;