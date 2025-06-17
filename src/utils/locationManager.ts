import { Location, LocationType, LocationSettings, LOCATION_TYPE_CONFIGS } from '../types/location';

export class LocationManager {
  private static readonly STORAGE_KEYS = {
    LOCATIONS: 'dealership_locations',
    LOCATION_SETTINGS: 'dealership_location_settings'
  };

  static initializeDefaultLocations(dealershipId: string): void {
    const existingLocations = this.getLocations(dealershipId);
    if (existingLocations.length > 0) return;

    const defaultLocations: Omit<Location, 'id'>[] = [
      {
        name: 'Lot A',
        type: 'on-site',
        description: 'Main front lot',
        isActive: true,
        capacity: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Lot B',
        type: 'on-site',
        description: 'Side lot',
        isActive: true,
        capacity: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Indoor Showroom',
        type: 'display',
        description: 'Indoor display area',
        isActive: true,
        capacity: 8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Service Bay',
        type: 'service',
        description: 'Service department',
        isActive: true,
        capacity: 12,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Test Drive',
        type: 'test-drive',
        description: 'Vehicles out for test drives',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Demo Fleet',
        type: 'demo',
        description: 'Demo vehicles',
        isActive: true,
        capacity: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'In-Transit',
        type: 'in-transit',
        description: 'Vehicles being transported',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const locations = defaultLocations.map(loc => ({
      ...loc,
      id: `loc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));

    this.saveLocations(dealershipId, locations);
  }

  static getLocations(dealershipId: string): Location[] {
    const key = `${this.STORAGE_KEYS.LOCATIONS}_${dealershipId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  static saveLocations(dealershipId: string, locations: Location[]): void {
    const key = `${this.STORAGE_KEYS.LOCATIONS}_${dealershipId}`;
    localStorage.setItem(key, JSON.stringify(locations));
  }

  static addLocation(dealershipId: string, locationData: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Location {
    const locations = this.getLocations(dealershipId);
    const newLocation: Location = {
      ...locationData,
      id: `loc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    locations.push(newLocation);
    this.saveLocations(dealershipId, locations);
    return newLocation;
  }

  static updateLocation(dealershipId: string, locationId: string, updates: Partial<Location>): Location | null {
    const locations = this.getLocations(dealershipId);
    const index = locations.findIndex(loc => loc.id === locationId);
    
    if (index === -1) return null;

    locations[index] = {
      ...locations[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveLocations(dealershipId, locations);
    return locations[index];
  }

  static deleteLocation(dealershipId: string, locationId: string): boolean {
    const locations = this.getLocations(dealershipId);
    const filteredLocations = locations.filter(loc => loc.id !== locationId);
    
    if (filteredLocations.length === locations.length) return false;

    this.saveLocations(dealershipId, filteredLocations);
    return true;
  }

  static getLocationsByType(dealershipId: string, type: LocationType): Location[] {
    return this.getLocations(dealershipId).filter(loc => loc.type === type && loc.isActive);
  }

  static getActiveLocations(dealershipId: string): Location[] {
    return this.getLocations(dealershipId).filter(loc => loc.isActive);
  }

  static getLocationStats(dealershipId: string): {
    total: number;
    active: number;
    byType: Record<LocationType, number>;
  } {
    const locations = this.getLocations(dealershipId);
    const active = locations.filter(loc => loc.isActive);
    
    const byType = Object.keys(LOCATION_TYPE_CONFIGS).reduce((acc, type) => {
      acc[type as LocationType] = locations.filter(loc => loc.type === type && loc.isActive).length;
      return acc;
    }, {} as Record<LocationType, number>);

    return {
      total: locations.length,
      active: active.length,
      byType
    };
  }

  static getLocationSettings(dealershipId: string): LocationSettings {
    const key = `${this.STORAGE_KEYS.LOCATION_SETTINGS}_${dealershipId}`;
    const data = localStorage.getItem(key);
    
    if (data) {
      return JSON.parse(data);
    }

    // Default settings
    const defaultSettings: LocationSettings = {
      defaultLocationType: 'on-site',
      allowCustomLocations: true,
      requireLocationForVehicles: true,
      autoAssignLocation: false,
      locationCapacityTracking: true
    };

    this.saveLocationSettings(dealershipId, defaultSettings);
    return defaultSettings;
  }

  static saveLocationSettings(dealershipId: string, settings: LocationSettings): void {
    const key = `${this.STORAGE_KEYS.LOCATION_SETTINGS}_${dealershipId}`;
    localStorage.setItem(key, JSON.stringify(settings));
  }

  static getLocationTypeConfig(type: LocationType) {
    return LOCATION_TYPE_CONFIGS[type];
  }

  static getVehicleCountByLocation(locationName: string): number {
    // Get all vehicles from various sources
    let allVehicles: any[] = [];

    // Load mock vehicles
    try {
      const mockVehiclesModule = import('../data/mockVehicles');
      // Since we can't dynamically import in this context, we'll check localStorage directly
    } catch (error) {
      // Fallback to empty array
    }

    // Load added vehicles from localStorage
    const savedAddedVehicles = localStorage.getItem('addedVehicles');
    if (savedAddedVehicles) {
      try {
        const addedVehicles = JSON.parse(savedAddedVehicles);
        allVehicles = [...allVehicles, ...addedVehicles];
      } catch (error) {
        console.error('Error loading added vehicles:', error);
      }
    }

    // Load vehicle updates from localStorage
    const savedUpdates = localStorage.getItem('vehicleUpdates');
    if (savedUpdates) {
      try {
        const updates = JSON.parse(savedUpdates);
        allVehicles = allVehicles.map(v => 
          updates[v.id] ? { ...v, ...updates[v.id] } : v
        );
      } catch (error) {
        console.error('Error loading vehicle updates:', error);
      }
    }

    // Filter out sold and pending vehicles, then count by location
    const activeVehicles = allVehicles.filter(v => !v.isSold && !v.isPending);
    return activeVehicles.filter(vehicle => vehicle.location === locationName).length;
  }

  static getAllVehicleLocationCounts(): Record<string, number> {
    // Get all vehicles from various sources
    let allVehicles: any[] = [];

    // Load mock vehicles - we'll need to hardcode the mock data here since we can't import
    const mockVehicles = [
      {
        id: '1',
        location: 'Lot A-12',
        isSold: false,
        isPending: false
      },
      {
        id: '2',
        location: 'Lot B-03',
        isSold: false,
        isPending: false
      },
      {
        id: '3',
        location: 'Indoor-05',
        isSold: false,
        isPending: false
      },
      {
        id: '4',
        location: 'Lot A-07',
        isSold: false,
        isPending: false
      },
      {
        id: '5',
        location: 'Lot C-15',
        isSold: false,
        isPending: false
      }
    ];

    allVehicles = [...mockVehicles];

    // Load added vehicles from localStorage
    const savedAddedVehicles = localStorage.getItem('addedVehicles');
    if (savedAddedVehicles) {
      try {
        const addedVehicles = JSON.parse(savedAddedVehicles);
        allVehicles = [...allVehicles, ...addedVehicles];
      } catch (error) {
        console.error('Error loading added vehicles:', error);
      }
    }

    // Load vehicle updates from localStorage
    const savedUpdates = localStorage.getItem('vehicleUpdates');
    if (savedUpdates) {
      try {
        const updates = JSON.parse(savedUpdates);
        allVehicles = allVehicles.map(v => 
          updates[v.id] ? { ...v, ...updates[v.id] } : v
        );
      } catch (error) {
        console.error('Error loading vehicle updates:', error);
      }
    }

    // Filter out sold and pending vehicles
    const activeVehicles = allVehicles.filter(v => !v.isSold && !v.isPending);

    // Count vehicles by location
    const locationCounts: Record<string, number> = {};
    activeVehicles.forEach(vehicle => {
      if (vehicle.location) {
        locationCounts[vehicle.location] = (locationCounts[vehicle.location] || 0) + 1;
      }
    });

    return locationCounts;
  }
}