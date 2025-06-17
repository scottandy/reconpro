export interface Vehicle {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  mileage: number;
  color: string;
  dateAcquired: string;
  targetSaleDate?: string;
  price: number;
  location: string;
  locationChangedBy?: string;
  locationChangedDate?: string;
  locationHistory?: LocationHistoryEntry[];
  status: {
    emissions: InspectionStatus;
    cosmetic: InspectionStatus;
    mechanical: InspectionStatus;
    cleaned: InspectionStatus;
    photos: InspectionStatus;
    [key: string]: InspectionStatus; // Allow for custom sections
  };
  inspection?: VehicleInspection;
  notes?: string;
  teamNotes?: TeamNote[];
  // Sold vehicle properties
  isSold?: boolean;
  soldBy?: string;
  soldDate?: string;
  soldPrice?: number;
  soldNotes?: string;
  // Pending vehicle properties
  isPending?: boolean;
  pendingBy?: string;
  pendingDate?: string;
  pendingNotes?: string;
  // Reactivation tracking
  reactivatedBy?: string;
  reactivatedDate?: string;
  reactivatedFrom?: 'sold' | 'pending';
}

export interface LocationHistoryEntry {
  location: string;
  changedBy: string;
  changedDate: string;
  timestamp: string;
}

export interface TeamNote {
  id: string;
  text: string;
  userInitials: string;
  timestamp: string;
  category?: 'general' | 'summary' | 'emissions' | 'cosmetic' | 'mechanical' | 'cleaning' | 'photos' | string;
  isCertified?: boolean; // New field to mark important/verified actions
}

export type InspectionStatus = 'completed' | 'pending' | 'needs-attention' | 'not-started';

export interface VehicleInspection {
  id: string;
  vehicleId: string;
  inspectorName: string;
  inspectionDate: string;
  completedDate?: string;
  emissions: EmissionsInspection;
  cosmetic: CosmeticInspection;
  mechanical: MechanicalInspection;
  cleaning: CleaningInspection;
  photos: PhotoInspection;
  overallNotes?: string;
}

export interface EmissionsInspection {
  smokeTest: boolean;
  obd2Scan: boolean;
  catalyticConverter: boolean;
  exhaustSystem: boolean;
  evapSystem: boolean;
  notes?: string;
  completedBy?: string;
  completedDate?: string;
}

export interface CosmeticInspection {
  exteriorPaint: boolean;
  bumperCondition: boolean;
  windowsGlass: boolean;
  lightsFunction: boolean;
  tiresCondition: boolean;
  wheelsCondition: boolean;
  interiorCleanliness: boolean;
  seatCondition: boolean;
  dashboardCondition: boolean;
  notes?: string;
  completedBy?: string;
  completedDate?: string;
}

export interface MechanicalInspection {
  engineOperation: boolean;
  transmissionFunction: boolean;
  brakesCondition: boolean;
  suspensionCheck: boolean;
  steeringAlignment: boolean;
  fluidsLevels: boolean;
  batteryCondition: boolean;
  electricalSystems: boolean;
  notes?: string;
  completedBy?: string;
  completedDate?: string;
}

export interface CleaningInspection {
  exteriorWash: boolean;
  interiorVacuum: boolean;
  windowsCleaned: boolean;
  detailComplete: boolean;
  engineBayClean: boolean;
  notes?: string;
  completedBy?: string;
  completedDate?: string;
}

export interface PhotoInspection {
  exteriorPhotos: boolean;
  interiorPhotos: boolean;
  engineBayPhotos: boolean;
  underCarriagePhotos: boolean;
  damagePhotos: boolean;
  featuresPhotos: boolean;
  notes?: string;
  completedBy?: string;
  completedDate?: string;
}

// Utility function to get stock number from VIN
export const getStockNumber = (vin: string): string => {
  return vin.slice(-6);
};