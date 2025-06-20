import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { mockVehicles } from '../data/mockVehicles';
import { Vehicle, TeamNote, InspectionStatus } from '../types/vehicle';
import { AnalyticsManager } from '../utils/analytics';
import StatusBadge from './StatusBadge';
import InspectionChecklist from './InspectionChecklist';
import TeamNotes from './TeamNotes';
import CustomerInspectionPDF from './CustomerInspectionPDF';
import { ProgressCalculator } from '../utils/progressCalculator';
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
  Circle,
  FileText,
  Eye,
  MessageSquare,
  ClipboardList,
  Download,
  Printer
} from 'lucide-react';

const VehicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [rightPanelView, setRightPanelView] = useState<'inspection' | 'team-notes'>('inspection');
  const [showPdfModal, setShowPdfModal] = useState(false);
  
  // NEW: Location editing state
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [editedLocation, setEditedLocation] = useState('');

  useEffect(() => {
    if (id) {
      loadVehicle(id);
    }
  }, [id]);

  const loadVehicle = (vehicleId: string) => {
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

    const foundVehicle = allVehicles.find(v => v.id === vehicleId);
    setVehicle(foundVehicle || null);
    
    if (foundVehicle) {
      setEditedNotes(foundVehicle.notes || '');
      setEditedLocation(foundVehicle.location);
    }
    
    setIsLoading(false);
  };

  const handleStatusUpdate = (section: keyof Vehicle['status'], status: InspectionStatus) => {
    if (!vehicle) return;

    const updatedVehicle = {
      ...vehicle,
      status: {
        ...vehicle.status,
        [section]: status
      }
    };

    setVehicle(updatedVehicle);
    saveVehicleUpdate(updatedVehicle);
  };

  const handleSectionComplete = (section: keyof Vehicle['status'], userInitials: string) => {
    if (!vehicle) return;

    const updatedVehicle = {
      ...vehicle,
      status: {
        ...vehicle.status,
        [section]: 'completed' as InspectionStatus
      }
    };

    setVehicle(updatedVehicle);
    saveVehicleUpdate(updatedVehicle);

    // Record analytics
    const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    AnalyticsManager.recordCompletion(
      vehicle.id, 
      vehicleName, 
      section as any, 
      userInitials
    );
  };

  const handleAddTeamNote = (note: Omit<TeamNote, 'id' | 'timestamp'>) => {
    if (!vehicle) return;

    const newNote: TeamNote = {
      ...note,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };

    const updatedVehicle = {
      ...vehicle,
      teamNotes: [newNote, ...(vehicle.teamNotes || [])]
    };

    setVehicle(updatedVehicle);
    saveVehicleUpdate(updatedVehicle);
  };

  const handleSaveNotes = () => {
    if (!vehicle) return;

    const updatedVehicle = {
      ...vehicle,
      notes: editedNotes.trim() || undefined
    };

    setVehicle(updatedVehicle);
    saveVehicleUpdate(updatedVehicle);
    setIsEditingNotes(false);
  };

  const handleCancelEditNotes = () => {
    setEditedNotes(vehicle?.notes || '');
    setIsEditingNotes(false);
  };

  // NEW: Location update handlers
  const handleSaveLocation = () => {
    if (!vehicle || !user) return;

    const oldLocation = vehicle.location;
    const newLocation = editedLocation.trim();
    
    if (oldLocation === newLocation) {
      setIsEditingLocation(false);
      return;
    }

    const updatedVehicle = {
      ...vehicle,
      location: newLocation,
      locationChangedBy: user.initials,
      locationChangedDate: new Date().toISOString()
    };

    // Add team note about location change
    const locationNote: TeamNote = {
      id: Date.now().toString(),
      text: `Vehicle location changed from "${oldLocation}" to "${newLocation}".`,
      userInitials: user.initials,
      timestamp: new Date().toISOString(),
      category: 'general'
    };

    updatedVehicle.teamNotes = [locationNote, ...(vehicle.teamNotes || [])];

    setVehicle(updatedVehicle);
    saveVehicleUpdate(updatedVehicle);
    setIsEditingLocation(false);
  };

  const handleCancelEditLocation = () => {
    setEditedLocation(vehicle?.location || '');
    setIsEditingLocation(false);
  };

  const saveVehicleUpdate = (updatedVehicle: Vehicle) => {
    const savedUpdates = localStorage.getItem('vehicleUpdates');
    const updates = savedUpdates ? JSON.parse(savedUpdates) : {};
    updates[updatedVehicle.id] = updatedVehicle;
    localStorage.setItem('vehicleUpdates', JSON.stringify(updates));

    // Trigger storage event for other components to listen to
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'vehicleUpdates',
      newValue: JSON.stringify(updates)
    }));
  };

  // 🎯 NEW: Mobile scroll to section functionality
  const handleMobileSectionClick = (section: string) => {
    // Set the active filter
    setActiveFilter(activeFilter === section ? null : section);
    
    // Switch to inspection view if not already there
    if (rightPanelView !== 'inspection') {
      setRightPanelView('inspection');
    }
    
    // Scroll to the inspection content area on mobile
    setTimeout(() => {
      const inspectionElement = document.getElementById('mobile-inspection-content');
      if (inspectionElement) {
        inspectionElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100); // Small delay to ensure state updates are processed
  };

  const getOverallProgress = () => {
    if (!vehicle) return 0;
    
    // Use the new detailed progress calculator
    return ProgressCalculator.calculateDetailedProgress(vehicle.id, vehicle);
  };

  const getStockNumber = (vin: string): string => {
    return vin.slice(-6);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getSummaryNotes = () => {
    if (!vehicle?.teamNotes) return [];
    return vehicle.teamNotes.filter(note => note.category === 'summary');
  };

  // NEW: Get location style for visual indication
  const getLocationStyle = (location: string) => {
    const locationLower = location.toLowerCase();
    
    // Check for RED indicators (Transit/Transport)
    if (locationLower.includes('transit') ||
        locationLower.includes('transport')) {
      return {
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-200'
      };
    }
    
    // Check for YELLOW indicators (Off-site)
    if (locationLower.includes('off-site') || 
        locationLower.includes('storage') || 
        locationLower.includes('external')) {
      return {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-200'
      };
    }
    
    // Default to GREEN (On-site)
    return {
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200'
    };
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
          <div className="w-16 h-16 bg-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Vehicle Not Found</h2>
          <p className="text-gray-600 mb-6">The vehicle you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const summaryNotes = getSummaryNotes();
  const isReadyForSale = Object.values(vehicle.status).every(status => status === 'completed');
  const locationStyle = getLocationStyle(vehicle.location);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                  {vehicle.trim && <span className="text-gray-600 font-normal"> {vehicle.trim}</span>}
                </h1>
                <p className="text-sm text-gray-600">Stock #{getStockNumber(vehicle.vin)}</p>
                
                {/* Mobile Status Badges - Below Stock Number */}
                <div className="flex flex-wrap items-center gap-2 mt-1 lg:hidden">
                  {isEditingLocation ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editedLocation}
                        onChange={(e) => setEditedLocation(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs min-w-[120px]"
                        placeholder="Enter location"
                        autoFocus
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveLocation();
                          } else if (e.key === 'Escape') {
                            handleCancelEditLocation();
                          }
                        }}
                      />
                      <button
                        onClick={handleSaveLocation}
                        className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Save location"
                      >
                        <Save className="w-3 h-3" />
                      </button>
                      <button
                        onClick={handleCancelEditLocation}
                        className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditingLocation(true)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium border transition-all duration-200 ${locationStyle.bgColor} ${locationStyle.textColor} ${locationStyle.borderColor}`}
                      title="Click to edit location"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>{vehicle.location}</span>
                      <Edit3 className="w-2 h-2 opacity-60" />
                    </button>
                  )}
                  
                  {isReadyForSale && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Ready for Sale
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Desktop Status Badges - Right Side */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Editable Location Status */}
              <div className="flex items-center gap-2">
                {isEditingLocation ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedLocation}
                      onChange={(e) => setEditedLocation(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-[120px]"
                      placeholder="Enter location"
                      autoFocus
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveLocation();
                        } else if (e.key === 'Escape') {
                          handleCancelEditLocation();
                        }
                      }}
                    />
                    <button
                      onClick={handleSaveLocation}
                      className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="Save location"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEditLocation}
                      className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingLocation(true)}
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium border transition-all duration-200 hover:shadow-md ${locationStyle.bgColor} ${locationStyle.textColor} ${locationStyle.borderColor}`}
                    title="Click to edit location"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>{vehicle.location}</span>
                    <Edit3 className="w-3 h-3 opacity-60" />
                  </button>
                )}
              </div>

              {isReadyForSale && (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" />
                  Ready for Sale
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile Layout */}
        <div className="lg:hidden space-y-6">
          {/* Mobile Reconditioning Progress */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Reconditioning Progress</h2>
              <span className="text-2xl font-bold text-gray-900">{Math.round(getOverallProgress())}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  getOverallProgress() === 100 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                }`}
                style={{ width: `${getOverallProgress()}%` }}
              ></div>
            </div>

            {/* Status Buttons in Two Columns - Mobile with Scroll */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => handleMobileSectionClick('emissions')}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  activeFilter === 'emissions'
                    ? 'border-green-300 bg-green-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <StatusBadge status={vehicle.status.emissions} label="Emissions" section="emissions" size="sm" />
              </button>
              
              <button
                onClick={() => handleMobileSectionClick('cosmetic')}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  activeFilter === 'cosmetic'
                    ? 'border-purple-300 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <StatusBadge status={vehicle.status.cosmetic} label="Cosmetic" section="cosmetic" size="sm" />
              </button>
              
              <button
                onClick={() => handleMobileSectionClick('mechanical')}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  activeFilter === 'mechanical'
                    ? 'border-blue-300 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <StatusBadge status={vehicle.status.mechanical} label="Mechanical" section="mechanical" size="sm" />
              </button>
              
              <button
                onClick={() => handleMobileSectionClick('cleaned')}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  activeFilter === 'cleaned'
                    ? 'border-cyan-300 bg-cyan-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <StatusBadge status={vehicle.status.cleaned} label="Cleaned" section="cleaned" size="sm" />
              </button>
              
              <button
                onClick={() => handleMobileSectionClick('photos')}
                className={`p-3 rounded-lg border transition-all duration-200 col-span-2 ${
                  activeFilter === 'photos'
                    ? 'border-orange-300 bg-orange-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <StatusBadge status={vehicle.status.photos} label="Photos" section="photos" size="sm" />
              </button>
            </div>

            {/* Vehicle Notes Section - SMALLER HEADER */}
            {(vehicle.notes || summaryNotes.length > 0 || isEditingNotes) && (
              <div className="border-t border-gray-200/60 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-medium text-gray-700 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Vehicle Notes
                  </h3>
                  {!isEditingNotes && (
                    <button
                      onClick={() => setIsEditingNotes(true)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Notes"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Summary Notes from Team Notes */}
                {summaryNotes.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {summaryNotes.map((note) => (
                      <div key={note.id} className="p-3 bg-indigo-50/80 backdrop-blur-sm rounded-lg border border-indigo-200/60">
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FileText className="w-2 h-2 text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-indigo-800">{note.userInitials}</span>
                              <span className="text-xs text-indigo-600">
                                {new Date(note.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-indigo-900 font-medium leading-relaxed">{note.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Regular Notes */}
                {isEditingNotes ? (
                  <div className="space-y-3">
                    <textarea
                      value={editedNotes}
                      onChange={(e) => setEditedNotes(e.target.value)}
                      placeholder="Add notes about this vehicle's condition, issues, or important information..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveNotes}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={handleCancelEditNotes}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : vehicle.notes ? (
                  <div className="p-3 bg-amber-50/80 backdrop-blur-sm rounded-lg border border-amber-200/60">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AlertTriangle className="w-2 h-2 text-amber-600" />
                      </div>
                      <p className="text-xs text-amber-800 font-medium leading-relaxed">{vehicle.notes}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/60 text-center">
                    <p className="text-xs text-gray-600">No notes added yet</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Right Panel Toggle */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setRightPanelView('inspection')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                  rightPanelView === 'inspection'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                Inspection
              </button>
              <button
                onClick={() => setRightPanelView('team-notes')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                  rightPanelView === 'team-notes'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Team Notes
              </button>
            </div>
          </div>

          {/* Mobile Content with ID for scrolling */}
          <div id="mobile-inspection-content">
            {rightPanelView === 'inspection' ? (
              <InspectionChecklist
                vehicle={vehicle}
                onStatusUpdate={handleStatusUpdate}
                onSectionComplete={handleSectionComplete}
                onAddTeamNote={handleAddTeamNote}
                activeFilter={activeFilter}
                onGeneratePdf={() => setShowPdfModal(true)}
              />
            ) : (
              <TeamNotes
                notes={vehicle.teamNotes || []}
                onAddNote={handleAddTeamNote}
              />
            )}
          </div>

          {/* Mobile Vehicle Information - At Bottom */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Car className="w-6 h-6" />
              Vehicle Information
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">VIN</label>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded border">{vehicle.vin}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <p className="text-sm text-gray-900">{vehicle.year}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                <p className="text-sm text-gray-900">{vehicle.make}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <p className="text-sm text-gray-900">{vehicle.model}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trim</label>
                <p className="text-sm text-gray-900">{vehicle.trim || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mileage</label>
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-900">{vehicle.mileage.toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-900">{vehicle.color}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-900">{formatPrice(vehicle.price)}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-900">{vehicle.location}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Acquired</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-900">{formatDate(vehicle.dateAcquired)}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Number</label>
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-900">{getStockNumber(vehicle.vin)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex gap-8">
          {/* Left Column - 1/3 width */}
          <div className="w-1/3 space-y-6">
            {/* Desktop Reconditioning Progress */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Reconditioning Progress</h2>
                <span className="text-2xl font-bold text-gray-900">{Math.round(getOverallProgress())}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    getOverallProgress() === 100 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}
                  style={{ width: `${getOverallProgress()}%` }}
                ></div>
              </div>

              {/* Status Buttons in Two Columns */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setActiveFilter(activeFilter === 'emissions' ? null : 'emissions')}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    activeFilter === 'emissions'
                      ? 'border-green-300 bg-green-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <StatusBadge status={vehicle.status.emissions} label="Emissions" section="emissions" size="sm" />
                </button>
                
                <button
                  onClick={() => setActiveFilter(activeFilter === 'cosmetic' ? null : 'cosmetic')}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    activeFilter === 'cosmetic'
                      ? 'border-purple-300 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <StatusBadge status={vehicle.status.cosmetic} label="Cosmetic" section="cosmetic" size="sm" />
                </button>
                
                <button
                  onClick={() => setActiveFilter(activeFilter === 'mechanical' ? null : 'mechanical')}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    activeFilter === 'mechanical'
                      ? 'border-blue-300 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <StatusBadge status={vehicle.status.mechanical} label="Mechanical" section="mechanical" size="sm" />
                </button>
                
                <button
                  onClick={() => setActiveFilter(activeFilter === 'cleaned' ? null : 'cleaned')}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    activeFilter === 'cleaned'
                      ? 'border-cyan-300 bg-cyan-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <StatusBadge status={vehicle.status.cleaned} label="Cleaned" section="cleaned" size="sm" />
                </button>
                
                <button
                  onClick={() => setActiveFilter(activeFilter === 'photos' ? null : 'photos')}
                  className={`p-3 rounded-lg border transition-all duration-200 col-span-2 ${
                    activeFilter === 'photos'
                      ? 'border-orange-300 bg-orange-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <StatusBadge status={vehicle.status.photos} label="Photos" section="photos" size="sm" />
                </button>
              </div>

              {/* Vehicle Notes Section - SMALLER HEADER */}
              {(vehicle.notes || summaryNotes.length > 0 || isEditingNotes) && (
                <div className="border-t border-gray-200/60 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-medium text-gray-700 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Vehicle Notes
                    </h3>
                    {!isEditingNotes && (
                      <button
                        onClick={() => setIsEditingNotes(true)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Notes"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Summary Notes from Team Notes */}
                  {summaryNotes.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {summaryNotes.map((note) => (
                        <div key={note.id} className="p-3 bg-indigo-50/80 backdrop-blur-sm rounded-lg border border-indigo-200/60">
                          <div className="flex items-start gap-2">
                            <div className="w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <FileText className="w-2 h-2 text-indigo-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-indigo-800">{note.userInitials}</span>
                                <span className="text-xs text-indigo-600">
                                  {new Date(note.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs text-indigo-900 font-medium leading-relaxed">{note.text}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Regular Notes */}
                  {isEditingNotes ? (
                    <div className="space-y-3">
                      <textarea
                        value={editedNotes}
                        onChange={(e) => setEditedNotes(e.target.value)}
                        placeholder="Add notes about this vehicle's condition, issues, or important information..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveNotes}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={handleCancelEditNotes}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : vehicle.notes ? (
                    <div className="p-3 bg-amber-50/80 backdrop-blur-sm rounded-lg border border-amber-200/60">
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <AlertTriangle className="w-2 h-2 text-amber-600" />
                        </div>
                        <p className="text-xs text-amber-800 font-medium leading-relaxed">{vehicle.notes}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/60 text-center">
                      <p className="text-xs text-gray-600">No notes added yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Vehicle Information */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Car className="w-6 h-6" />
                Vehicle Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">VIN</label>
                  <p className="text-sm font-mono bg-gray-50 p-2 rounded border">{vehicle.vin}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <p className="text-sm text-gray-900">{vehicle.year}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                    <p className="text-sm text-gray-900">{vehicle.make}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <p className="text-sm text-gray-900">{vehicle.model}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trim</label>
                    <p className="text-sm text-gray-900">{vehicle.trim || 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mileage</label>
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-900">{vehicle.mileage.toLocaleString()}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-900">{vehicle.color}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-900">{formatPrice(vehicle.price)}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-900">{vehicle.location}</p>
                    {vehicle.locationChangedBy && (
                      <span className="text-xs text-gray-500">
                        (Updated by {vehicle.locationChangedBy})
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Acquired</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-900">{formatDate(vehicle.dateAcquired)}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Number</label>
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-900">{getStockNumber(vehicle.vin)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - 2/3 width */}
          <div className="flex-1 space-y-6">
            {/* Desktop Toggle */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setRightPanelView('inspection')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    rightPanelView === 'inspection'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  Mechanical Inspection
                </button>
                <button
                  onClick={() => setRightPanelView('team-notes')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    rightPanelView === 'team-notes'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Team Notes
                </button>
              </div>
            </div>

            {/* Desktop Content */}
            {rightPanelView === 'inspection' ? (
              <InspectionChecklist
                vehicle={vehicle}
                onStatusUpdate={handleStatusUpdate}
                onSectionComplete={handleSectionComplete}
                onAddTeamNote={handleAddTeamNote}
                activeFilter={activeFilter}
                onGeneratePdf={() => setShowPdfModal(true)}
              />
            ) : (
              <TeamNotes
                notes={vehicle.teamNotes || []}
                onAddNote={handleAddTeamNote}
              />
            )}
          </div>
        </div>
      </div>

      {/* Customer Inspection PDF Modal */}
      <CustomerInspectionPDF
        vehicle={vehicle}
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
      />
    </div>
  );
};

export default VehicleDetail;