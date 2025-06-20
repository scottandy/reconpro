import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { mockVehicles } from '../data/mockVehicles';
import { Vehicle, InspectionStatus, TeamNote, getStockNumber } from '../types/vehicle';
import { AnalyticsManager } from '../utils/analytics';
import InspectionChecklist from './InspectionChecklist';
import TeamNotes from './TeamNotes';
import StatusBadge from './StatusBadge';
import { 
  ArrowLeft, 
  Car, 
  Calendar, 
  MapPin, 
  Gauge, 
  DollarSign, 
  Hash, 
  Palette,
  Edit3,
  Save,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Archive,
  RotateCcw,
  FileText,
  Filter,
  Eye,
  EyeOff,
  Leaf,
  Wrench,
  Sparkles,
  Camera,
  Building2,
  Info
} from 'lucide-react';

const VehicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editData, setEditData] = useState<Partial<Vehicle>>({});
  const [editNotes, setEditNotes] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [soldData, setSoldData] = useState({ price: '', notes: '' });
  const [pendingData, setPendingData] = useState({ notes: '' });

  useEffect(() => {
    loadVehicle();
  }, [id]);

  const loadVehicle = () => {
    if (!id) return;

    setIsLoading(true);
    
    // Start with mock vehicles
    let allVehicles = [...mockVehicles];

    // Load added vehicles from localStorage
    const savedAddedVehicles = localStorage.getItem('addedVehicles');
    if (savedAddedVehicles) {
      try {
        const addedVehicles = JSON.parse(savedAddedVehicles);
        allVehicles = [...addedVehicles, ...allVehicles];
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

    // Also check sold vehicles
    const savedSoldVehicles = localStorage.getItem('soldVehicles');
    if (savedSoldVehicles) {
      try {
        const soldVehicles = JSON.parse(savedSoldVehicles);
        allVehicles = [...allVehicles, ...soldVehicles];
      } catch (error) {
        console.error('Error loading sold vehicles:', error);
      }
    }

    // Also check pending vehicles
    const savedPendingVehicles = localStorage.getItem('pendingVehicles');
    if (savedPendingVehicles) {
      try {
        const pendingVehicles = JSON.parse(savedPendingVehicles);
        allVehicles = [...allVehicles, ...pendingVehicles];
      } catch (error) {
        console.error('Error loading pending vehicles:', error);
      }
    }

    const foundVehicle = allVehicles.find(v => v.id === id);
    setVehicle(foundVehicle || null);
    setIsLoading(false);
  };

  const updateVehicle = (updates: Partial<Vehicle>) => {
    if (!vehicle) return;

    const updatedVehicle = { ...vehicle, ...updates };
    setVehicle(updatedVehicle);

    // Save to localStorage
    const savedUpdates = localStorage.getItem('vehicleUpdates');
    const allUpdates = savedUpdates ? JSON.parse(savedUpdates) : {};
    allUpdates[vehicle.id] = updatedVehicle;
    localStorage.setItem('vehicleUpdates', JSON.stringify(allUpdates));

    // Trigger storage event for other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'vehicleUpdates',
      newValue: JSON.stringify(allUpdates)
    }));
  };

  const handleStatusUpdate = (section: keyof Vehicle['status'], status: InspectionStatus) => {
    if (!vehicle) return;

    const updates = {
      status: {
        ...vehicle.status,
        [section]: status
      }
    };

    updateVehicle(updates);
  };

  const handleSectionComplete = (section: keyof Vehicle['status'], userInitials: string) => {
    if (!vehicle) return;

    const sectionName = section === 'cleaned' ? 'cleaning' : section;
    const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    
    // Record completion in analytics
    AnalyticsManager.recordCompletion(
      vehicle.id,
      vehicleName,
      sectionName as any,
      userInitials
    );

    // Add team note
    const teamNote: Omit<TeamNote, 'id' | 'timestamp'> = {
      text: `${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)} section completed.`,
      userInitials,
      category: sectionName as any,
      isCertified: true
    };

    handleAddTeamNote(teamNote);
  };

  const handleAddTeamNote = (note: Omit<TeamNote, 'id' | 'timestamp'>) => {
    if (!vehicle) return;

    const newNote: TeamNote = {
      ...note,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };

    const updatedNotes = [...(vehicle.teamNotes || []), newNote];
    updateVehicle({ teamNotes: updatedNotes });
  };

  const handleEditSave = () => {
    if (!vehicle) return;

    updateVehicle(editData);
    setIsEditing(false);
    setEditData({});
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleEditNotesSave = () => {
    if (!vehicle) return;

    updateVehicle({ notes: editNotes });
    setIsEditingNotes(false);
  };

  const handleEditNotesCancel = () => {
    setIsEditingNotes(false);
    setEditNotes('');
  };

  const handleSoldVehicle = () => {
    if (!vehicle || !user?.initials) return;

    const soldPrice = parseFloat(soldData.price) || vehicle.price;
    const soldVehicle = {
      ...vehicle,
      isSold: true,
      soldBy: user.initials,
      soldDate: new Date().toISOString(),
      soldPrice,
      soldNotes: soldData.notes.trim() || undefined
    };

    // Remove from active vehicles and add to sold vehicles
    const savedUpdates = localStorage.getItem('vehicleUpdates');
    const allUpdates = savedUpdates ? JSON.parse(savedUpdates) : {};
    delete allUpdates[vehicle.id];
    localStorage.setItem('vehicleUpdates', JSON.stringify(allUpdates));

    // Add to sold vehicles
    const savedSoldVehicles = localStorage.getItem('soldVehicles');
    const soldVehicles = savedSoldVehicles ? JSON.parse(savedSoldVehicles) : [];
    soldVehicles.unshift(soldVehicle);
    localStorage.setItem('soldVehicles', JSON.stringify(soldVehicles));

    // Add team note
    const teamNote: Omit<TeamNote, 'id' | 'timestamp'> = {
      text: `Vehicle sold for $${soldPrice.toLocaleString()}. ${soldData.notes ? soldData.notes : ''}`,
      userInitials: user.initials,
      category: 'general',
      isCertified: true
    };

    handleAddTeamNote(teamNote);

    // Trigger storage events
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'soldVehicles',
      newValue: JSON.stringify(soldVehicles)
    }));

    setShowSoldModal(false);
    setSoldData({ price: '', notes: '' });
    navigate('/');
  };

  const handlePendingVehicle = () => {
    if (!vehicle || !user?.initials) return;

    const pendingVehicle = {
      ...vehicle,
      isPending: true,
      pendingBy: user.initials,
      pendingDate: new Date().toISOString(),
      pendingNotes: pendingData.notes.trim() || undefined
    };

    // Remove from active vehicles and add to pending vehicles
    const savedUpdates = localStorage.getItem('vehicleUpdates');
    const allUpdates = savedUpdates ? JSON.parse(savedUpdates) : {};
    delete allUpdates[vehicle.id];
    localStorage.setItem('vehicleUpdates', JSON.stringify(allUpdates));

    // Add to pending vehicles
    const savedPendingVehicles = localStorage.getItem('pendingVehicles');
    const pendingVehicles = savedPendingVehicles ? JSON.parse(savedPendingVehicles) : [];
    pendingVehicles.unshift(pendingVehicle);
    localStorage.setItem('pendingVehicles', JSON.stringify(pendingVehicles));

    // Add team note
    const teamNote: Omit<TeamNote, 'id' | 'timestamp'> = {
      text: `Vehicle moved to pending status. ${pendingData.notes ? pendingData.notes : ''}`,
      userInitials: user.initials,
      category: 'general',
      isCertified: true
    };

    handleAddTeamNote(teamNote);

    // Trigger storage events
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'pendingVehicles',
      newValue: JSON.stringify(pendingVehicles)
    }));

    setShowPendingModal(false);
    setPendingData({ notes: '' });
    navigate('/');
  };

  const getOverallProgress = () => {
    if (!vehicle) return 0;
    const statuses = Object.values(vehicle.status);
    const completed = statuses.filter(status => status === 'completed').length;
    return (completed / statuses.length) * 100;
  };

  const isReadyForSale = () => {
    if (!vehicle) return false;
    return Object.values(vehicle.status).every(status => status === 'completed');
  };

  const getSummaryNotes = () => {
    if (!vehicle?.teamNotes) return [];
    return vehicle.teamNotes.filter(note => note.category === 'summary');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'emissions':
        return Leaf;
      case 'cosmetic':
        return Palette;
      case 'mechanical':
        return Wrench;
      case 'cleaned':
        return Sparkles;
      case 'photos':
        return Camera;
      default:
        return CheckCircle2;
    }
  };

  const getSectionLabel = (section: string) => {
    switch (section) {
      case 'emissions':
        return 'Emissions';
      case 'cosmetic':
        return 'Cosmetic';
      case 'mechanical':
        return 'Mechanical';
      case 'cleaned':
        return 'Cleaning';
      case 'photos':
        return 'Photos';
      default:
        return section;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Car className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Vehicle Not Found</h2>
          <p className="text-gray-600 mb-4">The vehicle you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const stockNumber = getStockNumber(vehicle.vin);
  const progress = getOverallProgress();
  const readyForSale = isReadyForSale();
  const summaryNotes = getSummaryNotes();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 sm:py-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Car className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">Stock #{stockNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Status Filter Buttons */}
              <div className="hidden sm:flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-white/20">
                {Object.entries(vehicle.status).map(([section, status]) => {
                  const SectionIcon = getSectionIcon(section);
                  const isActive = activeFilter === section;
                  
                  return (
                    <button
                      key={section}
                      onClick={() => setActiveFilter(isActive ? null : section)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : status === 'needs-attention'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={`Filter to ${getSectionLabel(section)} section`}
                    >
                      <SectionIcon className="w-3 h-3" />
                      <span className="hidden lg:inline">{getSectionLabel(section)}</span>
                    </button>
                  );
                })}
                {activeFilter && (
                  <button
                    onClick={() => setActiveFilter(null)}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                    title="Clear filter"
                  >
                    <X className="w-3 h-3" />
                    <span className="hidden lg:inline">Clear</span>
                  </button>
                )}
              </div>

              {/* Mobile Filter Toggle */}
              <div className="sm:hidden">
                <button
                  onClick={() => setActiveFilter(activeFilter ? null : 'emissions')}
                  className={`p-2 rounded-lg transition-colors ${
                    activeFilter 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons */}
              {!vehicle.isSold && !vehicle.isPending && (
                <>
                  <button
                    onClick={() => setShowSoldModal(true)}
                    className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm font-medium"
                  >
                    <Archive className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Mark Sold</span>
                  </button>
                  <button
                    onClick={() => setShowPendingModal(true)}
                    className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-xs sm:text-sm font-medium"
                  >
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Mark Pending</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="space-y-6 lg:space-y-8">
          {/* Vehicle Status Banner */}
          {(vehicle.isSold || vehicle.isPending) && (
            <div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border ${
              vehicle.isSold 
                ? 'bg-green-50/80 border-green-200 text-green-800' 
                : 'bg-yellow-50/80 border-yellow-200 text-yellow-800'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${
                  vehicle.isSold ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  {vehicle.isSold ? (
                    <Archive className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  ) : (
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold">
                    {vehicle.isSold ? 'Vehicle Sold' : 'Vehicle Pending'}
                  </h3>
                  <p className="text-xs sm:text-sm">
                    {vehicle.isSold 
                      ? `Sold by ${vehicle.soldBy} on ${formatDate(vehicle.soldDate!)} for ${formatPrice(vehicle.soldPrice!)}`
                      : `Marked pending by ${vehicle.pendingBy} on ${formatDate(vehicle.pendingDate!)}`
                    }
                  </p>
                  {((vehicle.isSold && vehicle.soldNotes) || (vehicle.isPending && vehicle.pendingNotes)) && (
                    <p className="text-xs sm:text-sm mt-1 font-medium">
                      {vehicle.soldNotes || vehicle.pendingNotes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Vehicle Information Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                Vehicle Information
              </h3>
              {!isEditing ? (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditData({
                      price: vehicle.price,
                      location: vehicle.location
                    });
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Details
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEditSave}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleEditCancel}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6">
              {/* Vehicle Info */}
              <div className="flex-1">
                <div className="mb-4">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                    {vehicle.trim && <span className="text-gray-600 ml-2">{vehicle.trim}</span>}
                  </h2>
                  {readyForSale && (
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" />
                      Ready for Sale
                    </div>
                  )}
                </div>

                {/* Vehicle Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Hash className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Stock #</p>
                      <p className="font-semibold text-gray-900">{stockNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Gauge className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Mileage</p>
                      <p className="font-semibold text-gray-900">{vehicle.mileage.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Palette className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Color</p>
                      <p className="font-semibold text-gray-900">{vehicle.color}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Acquired</p>
                      <p className="font-semibold text-gray-900">{formatDate(vehicle.dateAcquired)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editData.price}
                          onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      ) : (
                        <p className="font-semibold text-gray-900">{formatPrice(vehicle.price)}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.location}
                          onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      ) : (
                        <p className="font-semibold text-gray-900">{vehicle.location}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">VIN</p>
                      <p className="font-semibold text-gray-900 font-mono">{vehicle.vin}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reconditioning Progress Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Reconditioning Progress</h3>
            
            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Completion</span>
                <span className="text-sm font-bold text-gray-900">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    progress === 100 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Status Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
              {Object.entries(vehicle.status).map(([section, status]) => {
                const SectionIcon = getSectionIcon(section);
                
                return (
                  <button
                    key={section}
                    onClick={() => setActiveFilter(activeFilter === section ? null : section)}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                      activeFilter === section
                        ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                        : status === 'completed'
                          ? 'bg-emerald-50/50 border-emerald-200/60 hover:bg-emerald-50'
                          : status === 'needs-attention'
                            ? 'bg-red-50/50 border-red-200/60 hover:bg-red-50'
                            : status === 'pending'
                              ? 'bg-yellow-50/50 border-yellow-200/60 hover:bg-yellow-50'
                              : 'bg-gray-50/50 border-gray-200/60 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        status === 'completed' ? 'bg-emerald-100' :
                        status === 'needs-attention' ? 'bg-red-100' :
                        status === 'pending' ? 'bg-yellow-100' :
                        'bg-gray-100'
                      }`}>
                        <SectionIcon className={`w-4 h-4 ${
                          status === 'completed' ? 'text-emerald-600' :
                          status === 'needs-attention' ? 'text-red-600' :
                          status === 'pending' ? 'text-yellow-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                      <span className="font-medium text-gray-900">{getSectionLabel(section)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {activeFilter === section ? (
                        <Eye className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Filter className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Vehicle Notes Section */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Vehicle Notes
                </h4>
                {!isEditingNotes ? (
                  <button
                    onClick={() => {
                      setIsEditingNotes(true);
                      setEditNotes(vehicle.notes || '');
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleEditNotesSave}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                    >
                      <Save className="w-3 h-3" />
                      Save
                    </button>
                    <button
                      onClick={handleEditNotesCancel}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-xs font-medium"
                    >
                      <X className="w-3 h-3" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              
              {isEditingNotes ? (
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add notes about this vehicle..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                  rows={3}
                />
              ) : (
                <>
                  {/* Summary Notes */}
                  {summaryNotes.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {summaryNotes.map(note => (
                        <div key={note.id} className="p-3 bg-indigo-50/80 rounded-lg border border-indigo-200/60">
                          <div className="flex items-start gap-2">
                            <div className="w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <FileText className="w-2.5 h-2.5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-sm text-indigo-900 font-medium">{note.text}</p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-indigo-600">
                                <span>{note.userInitials}</span>
                                <span>•</span>
                                <span>{new Date(note.timestamp).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Regular Notes */}
                  {vehicle.notes ? (
                    <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-200/60">
                      <p className="text-sm text-amber-800 font-medium">{vehicle.notes}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No notes available for this vehicle.</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Inspection Checklist */}
          <InspectionChecklist
            vehicle={vehicle}
            onStatusUpdate={handleStatusUpdate}
            onSectionComplete={handleSectionComplete}
            onAddTeamNote={handleAddTeamNote}
            activeFilter={activeFilter}
          />

          {/* Team Notes */}
          <TeamNotes
            notes={vehicle.teamNotes || []}
            onAddNote={handleAddTeamNote}
          />
        </div>
      </div>

      {/* Mark Sold Modal */}
      {showSoldModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full border border-white/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Mark Vehicle as Sold</h3>
                <button
                  onClick={() => setShowSoldModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sale Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={soldData.price}
                      onChange={(e) => setSoldData({ ...soldData, price: e.target.value })}
                      placeholder={vehicle.price.toString()}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sale Notes
                  </label>
                  <textarea
                    value={soldData.notes}
                    onChange={(e) => setSoldData({ ...soldData, notes: e.target.value })}
                    placeholder="Add any notes about the sale..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">i</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">Important Information</p>
                      <p className="text-xs text-blue-700">
                        Marking a vehicle as sold will move it from active inventory to sold inventory. This action is recorded in the system.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSoldVehicle}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Mark as Sold
                  </button>
                  <button
                    onClick={() => setShowSoldModal(false)}
                    className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mark Pending Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full border border-white/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Mark Vehicle as Pending</h3>
                <button
                  onClick={() => setShowPendingModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pending Notes
                  </label>
                  <textarea
                    value={pendingData.notes}
                    onChange={(e) => setPendingData({ ...pendingData, notes: e.target.value })}
                    placeholder="Add any notes about why this vehicle is pending..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">i</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-yellow-900 mb-1">Important Information</p>
                      <p className="text-xs text-yellow-700">
                        Marking a vehicle as pending will move it from active inventory to pending inventory. This is typically used for vehicles with a deposit or pending sale.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handlePendingVehicle}
                    className="flex-1 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                  >
                    Mark as Pending
                  </button>
                  <button
                    onClick={() => setShowPendingModal(false)}
                    className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetail;