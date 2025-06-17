import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LocationManager } from '../utils/locationManager';
import { Location, LocationType, LOCATION_TYPE_CONFIGS } from '../types/location';
import { Vehicle } from '../types/vehicle';
import { mockVehicles } from '../data/mockVehicles';
import { 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  Settings, 
  Eye, 
  EyeOff,
  Building2,
  Car,
  BarChart3,
  Filter,
  Search,
  X,
  Users,
  ArrowLeft,
  Calendar,
  Gauge,
  DollarSign,
  Hash,
  ArrowRight,
  Palette,
  Save
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface LocationDetailModalProps {
  location: Location;
  vehicles: Vehicle[];
  onClose: () => void;
}

const LocationDetailModal: React.FC<LocationDetailModalProps> = ({ location, vehicles, onClose }) => {
  const typeConfig = LOCATION_TYPE_CONFIGS[location.type];
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStockNumber = (vin: string): string => {
    return vin.slice(-6);
  };

  const getOverallProgress = (vehicle: Vehicle) => {
    const statuses = Object.values(vehicle.status);
    const completed = statuses.filter(status => status === 'completed').length;
    return (completed / statuses.length) * 100;
  };

  const totalValue = vehicles.reduce((sum, vehicle) => sum + vehicle.price, 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-white/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200/60 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                {typeConfig.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{location.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${typeConfig.color}`}>
                    {typeConfig.label}
                  </span>
                  <span className="text-sm text-gray-600">{vehicles.length} vehicles</span>
                  {location.capacity && (
                    <span className="text-sm text-gray-600">
                      • Capacity: {vehicles.length}/{location.capacity}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-200/60">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{vehicles.length}</div>
              <div className="text-sm text-gray-600">Total Vehicles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatPrice(totalValue)}</div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {vehicles.filter(v => Object.values(v.status).every(s => s === 'completed')).length}
              </div>
              <div className="text-sm text-gray-600">Ready for Sale</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(vehicles.reduce((sum, v) => sum + getOverallProgress(v), 0) / (vehicles.length || 1))}%
              </div>
              <div className="text-sm text-gray-600">Avg Progress</div>
            </div>
          </div>
        </div>

        {/* Vehicle List */}
        <div className="flex-1 overflow-y-auto p-6">
          {vehicles.length === 0 ? (
            <div className="text-center py-12">
              <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Vehicles at This Location</h3>
              <p className="text-gray-600">This location currently has no vehicles assigned to it.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vehicles.map((vehicle) => {
                const progress = getOverallProgress(vehicle);
                const isReadyForSale = Object.values(vehicle.status).every(status => status === 'completed');
                
                return (
                  <Link
                    key={vehicle.id}
                    to={`/vehicle/${vehicle.id}`}
                    className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:scale-[1.02] group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Vehicle Header */}
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </h3>
                          {vehicle.trim && (
                            <span className="text-gray-600 font-medium">{vehicle.trim}</span>
                          )}
                          {isReadyForSale && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                              Ready
                            </span>
                          )}
                        </div>

                        {/* Vehicle Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Stock #</p>
                              <p className="font-semibold text-gray-900">{getStockNumber(vehicle.vin)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Gauge className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Mileage</p>
                              <p className="font-semibold text-gray-900">{vehicle.mileage.toLocaleString()}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Palette className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Color</p>
                              <p className="font-semibold text-gray-900">{vehicle.color}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Price</p>
                              <p className="font-semibold text-gray-900">{formatPrice(vehicle.price)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Reconditioning Progress</span>
                            <span className="text-sm font-bold text-gray-900">{Math.round(progress)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                progress === 100 
                                  ? 'bg-gradient-to-r from-emerald-500 to-green-600' 
                                  : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                              }`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {Object.entries(vehicle.status).map(([section, status]) => {
                            const getStatusColor = (status: string) => {
                              switch (status) {
                                case 'completed':
                                  return 'bg-emerald-100 text-emerald-800 border-emerald-200';
                                case 'pending':
                                  return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                                case 'needs-attention':
                                  return 'bg-red-100 text-red-800 border-red-200';
                                default:
                                  return 'bg-gray-100 text-gray-600 border-gray-200';
                              }
                            };

                            const getSectionLabel = (section: string) => {
                              const labels = {
                                emissions: 'Emissions',
                                cosmetic: 'Cosmetic',
                                mechanical: 'Mechanical',
                                cleaned: 'Cleaned',
                                photos: 'Photos'
                              };
                              return labels[section as keyof typeof labels] || section;
                            };

                            return (
                              <span
                                key={section}
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}
                              >
                                {getSectionLabel(section)}
                              </span>
                            );
                          })}
                        </div>

                        {/* Notes */}
                        {vehicle.notes && (
                          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 mb-3">
                            <p className="text-sm text-amber-800 font-medium">{vehicle.notes}</p>
                          </div>
                        )}

                        {/* Click to view indicator */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2 text-blue-600 font-medium text-sm">
                          <span>Click to view details and start working</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Right side info */}
                      <div className="text-right text-sm text-gray-500 ml-4 flex-shrink-0">
                        <div className="flex items-center gap-1 mb-2">
                          <Calendar className="w-3 h-3" />
                          <span>Acquired {formatDate(vehicle.dateAcquired)}</span>
                        </div>
                        
                        {/* Progress indicator */}
                        <div className="text-right">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            progress === 100 
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : progress > 50
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}>
                            {progress === 100 ? '✓ Complete' : `${Math.round(progress)}% Done`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200/60 px-6 py-4 bg-gray-50/80">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {location.description && (
                <span>{location.description} • </span>
              )}
              Created {formatDate(location.createdAt)}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// NEW: Location Color Settings Component for Admin Users
const LocationColorSettings: React.FC = () => {
  const [colorSettings, setColorSettings] = useState({
    onSiteKeywords: ['lot', 'indoor', 'showroom', 'service', 'display', 'demo'],
    offSiteKeywords: ['off-site', 'storage', 'external'],
    transitKeywords: ['transit', 'transport']
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load saved settings
    const saved = localStorage.getItem('locationColorSettings');
    if (saved) {
      try {
        setColorSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading location color settings:', error);
      }
    }
  }, []);

  const handleKeywordChange = (category: keyof typeof colorSettings, keywords: string[]) => {
    setColorSettings(prev => ({ ...prev, [category]: keywords }));
    setHasChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem('locationColorSettings', JSON.stringify(colorSettings));
    setHasChanges(false);
    alert('Location color settings saved successfully!');
  };

  const addKeyword = (category: keyof typeof colorSettings, keyword: string) => {
    if (keyword.trim() && !colorSettings[category].includes(keyword.trim().toLowerCase())) {
      const updated = [...colorSettings[category], keyword.trim().toLowerCase()];
      handleKeywordChange(category, updated);
    }
  };

  const removeKeyword = (category: keyof typeof colorSettings, keyword: string) => {
    const updated = colorSettings[category].filter(k => k !== keyword);
    handleKeywordChange(category, updated);
  };

  const KeywordManager: React.FC<{
    title: string;
    color: string;
    keywords: string[];
    onAdd: (keyword: string) => void;
    onRemove: (keyword: string) => void;
  }> = ({ title, color, keywords, onAdd, onRemove }) => {
    const [newKeyword, setNewKeyword] = useState('');

    return (
      <div className={`p-4 rounded-lg border ${color}`}>
        <h4 className="font-semibold mb-3">{title}</h4>
        <div className="flex flex-wrap gap-2 mb-3">
          {keywords.map((keyword) => (
            <span
              key={keyword}
              className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-md text-sm border"
            >
              {keyword}
              <button
                onClick={() => onRemove(keyword)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Add keyword..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                onAdd(newKeyword);
                setNewKeyword('');
              }
            }}
          />
          <button
            onClick={() => {
              onAdd(newKeyword);
              setNewKeyword('');
            }}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Add
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <Palette className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Location Color Settings</h3>
          <p className="text-gray-600">Configure which keywords determine location colors</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <KeywordManager
          title="🟢 Green (On-Site Locations)"
          color="bg-green-50 border-green-200"
          keywords={colorSettings.onSiteKeywords}
          onAdd={(keyword) => addKeyword('onSiteKeywords', keyword)}
          onRemove={(keyword) => removeKeyword('onSiteKeywords', keyword)}
        />

        <KeywordManager
          title="🟡 Yellow (Off-Site Locations)"
          color="bg-yellow-50 border-yellow-200"
          keywords={colorSettings.offSiteKeywords}
          onAdd={(keyword) => addKeyword('offSiteKeywords', keyword)}
          onRemove={(keyword) => removeKeyword('offSiteKeywords', keyword)}
        />

        <KeywordManager
          title="🔴 Red (Transit/Transport Locations)"
          color="bg-red-50 border-red-200"
          keywords={colorSettings.transitKeywords}
          onAdd={(keyword) => addKeyword('transitKeywords', keyword)}
          onRemove={(keyword) => removeKeyword('transitKeywords', keyword)}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Location names are checked against these keywords (case-insensitive)</li>
          <li>• <strong>Red</strong> takes priority over yellow and green</li>
          <li>• <strong>Yellow</strong> takes priority over green</li>
          <li>• <strong>Green</strong> is the default for most locations</li>
          <li>• Keywords are matched anywhere in the location name</li>
        </ul>
      </div>

      {hasChanges && (
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
          <button
            onClick={() => {
              setColorSettings({
                onSiteKeywords: ['lot', 'indoor', 'showroom', 'service', 'display', 'demo'],
                offSiteKeywords: ['off-site', 'storage', 'external'],
                transitKeywords: ['transit', 'transport']
              });
              setHasChanges(false);
            }}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            Reset to Defaults
          </button>
        </div>
      )}
    </div>
  );
};

const LocationManagement: React.FC = () => {
  const { dealership, user } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [vehicleLocationCounts, setVehicleLocationCounts] = useState<Record<string, number>>({});
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<LocationType | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showColorSettings, setShowColorSettings] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'on-site' as LocationType,
    description: '',
    capacity: ''
  });

  useEffect(() => {
    if (dealership) {
      LocationManager.initializeDefaultLocations(dealership.id);
      loadLocations();
      loadVehicles();
    }
  }, [dealership]);

  useEffect(() => {
    filterLocations();
  }, [locations, searchTerm, typeFilter]);

  // Listen for vehicle updates to refresh location counts
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'vehicleUpdates' || e.key === 'addedVehicles' || e.key === 'soldVehicles' || e.key === 'pendingVehicles') {
        loadVehicles();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadLocations = () => {
    if (dealership) {
      const locs = LocationManager.getLocations(dealership.id);
      setLocations(locs);
    }
  };

  const loadVehicles = () => {
    // Load all vehicles from various sources
    let vehicles = [...mockVehicles];

    // Load added vehicles from localStorage
    const savedAddedVehicles = localStorage.getItem('addedVehicles');
    if (savedAddedVehicles) {
      try {
        const addedVehicles = JSON.parse(savedAddedVehicles);
        vehicles = [...addedVehicles, ...vehicles];
      } catch (error) {
        console.error('Error loading added vehicles:', error);
      }
    }

    // Load vehicle updates from localStorage
    const savedUpdates = localStorage.getItem('vehicleUpdates');
    if (savedUpdates) {
      try {
        const updates = JSON.parse(savedUpdates);
        vehicles = vehicles.map(v => 
          updates[v.id] ? { ...v, ...updates[v.id] } : v
        );
      } catch (error) {
        console.error('Error loading vehicle updates:', error);
      }
    }

    // Filter out sold and pending vehicles
    const activeVehicles = vehicles.filter(v => !v.isSold && !v.isPending);
    setAllVehicles(activeVehicles);

    // Calculate location counts
    const counts: Record<string, number> = {};
    activeVehicles.forEach(vehicle => {
      if (vehicle.location) {
        counts[vehicle.location] = (counts[vehicle.location] || 0) + 1;
      }
    });
    setVehicleLocationCounts(counts);
  };

  const filterLocations = () => {
    let filtered = locations;

    if (searchTerm) {
      filtered = filtered.filter(loc =>
        loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(loc => loc.type === typeFilter);
    }

    setFilteredLocations(filtered);
  };

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleAddLocation = () => {
    if (!dealership || !formData.name.trim()) return;

    const locationData = {
      name: formData.name.trim(),
      type: formData.type,
      description: formData.description.trim() || undefined,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      isActive: true
    };

    LocationManager.addLocation(dealership.id, locationData);
    loadLocations();
    resetForm();
    setShowAddModal(false);
  };

  const handleEditLocation = () => {
    if (!dealership || !editingLocation || !formData.name.trim()) return;

    const updates = {
      name: formData.name.trim(),
      type: formData.type,
      description: formData.description.trim() || undefined,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined
    };

    LocationManager.updateLocation(dealership.id, editingLocation.id, updates);
    loadLocations();
    resetForm();
    setEditingLocation(null);
  };

  const handleToggleActive = (location: Location) => {
    if (!dealership) return;

    LocationManager.updateLocation(dealership.id, location.id, {
      isActive: !location.isActive
    });
    loadLocations();
  };

  const handleDeleteLocation = (location: Location) => {
    if (!dealership) return;

    const vehicleCount = vehicleLocationCounts[location.name] || 0;
    if (vehicleCount > 0) {
      alert(`Cannot delete "${location.name}" because it has ${vehicleCount} vehicle${vehicleCount !== 1 ? 's' : ''} assigned to it. Please move the vehicles to another location first.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${location.name}"?`)) {
      LocationManager.deleteLocation(dealership.id, location.id);
      loadLocations();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'on-site',
      description: '',
      capacity: ''
    });
  };

  const openEditModal = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      type: location.type,
      description: location.description || '',
      capacity: location.capacity?.toString() || ''
    });
  };

  const getLocationStats = () => {
    const active = locations.filter(loc => loc.isActive).length;
    const inactive = locations.filter(loc => !loc.isActive).length;
    const totalVehicles = Object.values(vehicleLocationCounts).reduce((sum, count) => sum + count, 0);
    const byType = Object.keys(LOCATION_TYPE_CONFIGS).reduce((acc, type) => {
      acc[type as LocationType] = locations.filter(loc => loc.type === type && loc.isActive).length;
      return acc;
    }, {} as Record<LocationType, number>);

    return { active, inactive, totalVehicles, byType };
  };

  const getCapacityStatus = (location: Location) => {
    const vehicleCount = vehicleLocationCounts[location.name] || 0;
    if (!location.capacity) return null;
    
    const percentage = (vehicleCount / location.capacity) * 100;
    if (percentage >= 100) return 'full';
    if (percentage >= 80) return 'warning';
    return 'normal';
  };

  const getCapacityColor = (status: string | null) => {
    switch (status) {
      case 'full': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'normal': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const stats = getLocationStats();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Location Management</h2>
              <p className="text-gray-600">Manage vehicle locations and track occupancy</p>
            </div>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <button
                onClick={() => setShowColorSettings(!showColorSettings)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                <Palette className="w-4 h-4" />
                Color Settings
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Location
            </button>
          </div>
        </div>
      </div>

      {/* Admin Color Settings */}
      {isAdmin && showColorSettings && (
        <LocationColorSettings />
      )}

      {/* Filters */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="lg:w-64">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as LocationType | 'all')}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {Object.entries(LOCATION_TYPE_CONFIGS).map(([type, config]) => (
                <option key={type} value={type}>
                  {config.icon} {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Individual Location Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredLocations.map((location) => {
          const typeConfig = LOCATION_TYPE_CONFIGS[location.type];
          const vehicleCount = vehicleLocationCounts[location.name] || 0;
          const capacityStatus = getCapacityStatus(location);
          
          return (
            <div 
              key={location.id} 
              onClick={() => handleLocationClick(location)}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 hover:shadow-xl hover:bg-white/90 transition-all duration-300 hover:scale-[1.02] group cursor-pointer"
            >
              <div className="p-6">
                {/* Location Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {typeConfig.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    {!location.isActive && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        Inactive
                      </span>
                    )}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(location);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          location.isActive
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={location.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {location.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(location);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLocation(location);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Location Name */}
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{location.name}</h3>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${typeConfig.color}`}>
                    {typeConfig.label}
                  </span>
                </div>

                {/* Description */}
                {location.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{location.description}</p>
                )}

                {/* Vehicle Count - Main Focus */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200/60 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Vehicles</p>
                      <p className="text-2xl font-bold text-blue-900">{vehicleCount}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                      <Car className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                {/* Capacity Information */}
                {location.capacity && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Capacity</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getCapacityColor(capacityStatus)}`}>
                        {Math.round((vehicleCount / location.capacity) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          capacityStatus === 'full' ? 'bg-red-500' :
                          capacityStatus === 'warning' ? 'bg-amber-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((vehicleCount / location.capacity) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{vehicleCount} vehicles</span>
                      <span>{location.capacity} max</span>
                    </div>
                  </div>
                )}

                {/* No Capacity Set */}
                {!location.capacity && (
                  <div className="text-center py-2">
                    <p className="text-xs text-gray-500">No capacity limit set</p>
                  </div>
                )}

                {/* Created Date */}
                <div className="mt-4 pt-4 border-t border-gray-200/60">
                  <p className="text-xs text-gray-500">
                    Created: {new Date(location.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Click indicator */}
                <div className="mt-3 pt-3 border-t border-gray-200/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="text-center text-sm text-blue-600 font-medium">Click to view vehicles →</p>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Add New Location Card */}
        <div 
          onClick={() => setShowAddModal(true)}
          className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-white/80 transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
        >
          <div className="p-6 flex flex-col items-center justify-center h-full min-h-[280px]">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Add New Location</h3>
            <p className="text-sm text-gray-500 text-center">Create a new location to organize your vehicle inventory</p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredLocations.length === 0 && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Locations Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || typeFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Add your first location to get started organizing your vehicle inventory.'
            }
          </p>
          {!searchTerm && typeFilter === 'all' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Your First Location
            </button>
          )}
        </div>
      )}

      {/* Summary Stats Footer */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{locations.length}</p>
            <p className="text-sm text-gray-600">Total Locations</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            <p className="text-sm text-gray-600">Active Locations</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{stats.totalVehicles}</p>
            <p className="text-sm text-gray-600">Total Vehicles</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">
              {Object.values(stats.byType).filter(count => count > 0).length}
            </p>
            <p className="text-sm text-gray-600">Location Types</p>
          </div>
        </div>
      </div>

      {/* Location Detail Modal */}
      {selectedLocation && (
        <LocationDetailModal
          location={selectedLocation}
          vehicles={allVehicles.filter(vehicle => vehicle.location === selectedLocation.name)}
          onClose={() => setSelectedLocation(null)}
        />
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingLocation) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full border border-white/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingLocation ? 'Edit Location' : 'Add New Location'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingLocation(null);
                    resetForm();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Lot A-12, Indoor Showroom"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as LocationType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(LOCATION_TYPE_CONFIGS).map(([type, config]) => (
                      <option key={type} value={type}>
                        {config.icon} {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="Maximum number of vehicles"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={editingLocation ? handleEditLocation : handleAddLocation}
                  disabled={!formData.name.trim()}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {editingLocation ? 'Update Location' : 'Add Location'}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingLocation(null);
                    resetForm();
                  }}
                  className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationManagement;