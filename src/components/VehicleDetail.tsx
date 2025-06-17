import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { mockVehicles } from '../data/mockVehicles';
import { Vehicle, InspectionStatus, TeamNote, getStockNumber } from '../types/vehicle';
import StatusBadge from './StatusBadge';
import InspectionChecklist from './InspectionChecklist';
import TeamNotes from './TeamNotes';
import { InspectionSettingsManager } from '../utils/inspectionSettingsManager';
import { 
  ArrowLeft, 
  Car, 
  Calendar, 
  MapPin, 
  Gauge, 
  DollarSign, 
  Hash, 
  Palette,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Circle,
  Filter,
  X,
  Archive,
  Pause,
  FileText,
  MessageSquare,
  ClipboardList,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Edit3,
  Check
} from 'lucide-react';

const VehicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, dealership } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [activeTab, setActiveTab] = useState<'inspection' | 'notes'>('inspection');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showVehicleNotes, setShowVehicleNotes] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [customSections, setCustomSections] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadVehicle(id);
    }
  }, [id]);

  // Load custom sections from settings
  useEffect(() => {
    if (dealership) {
      const settings = InspectionSettingsManager.getSettings(dealership.id);
      if (settings) {
        const customSections = settings.sections
          .filter(section => section.isActive && section.key !== 'emissions' && section.key !== 'cosmetic' && 
                  section.key !== 'mechanical' && section.key !== 'cleaning' && section.key !== 'photos')
          .sort((a, b) => a.order - b.order);
        setCustomSections(customSections);
      }
    }
  }, [dealership]);

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

    const foundVehicle = allVehicles.find(v => v.id === vehicleId);
    
    // If we found a vehicle, ensure it has status entries for all custom sections
    if (foundVehicle && dealership) {
      const settings = InspectionSettingsManager.getSettings(dealership.id);
      if (settings) {
        const customSections = settings.sections
          .filter(section => section.isActive && section.key !== 'emissions' && section.key !== 'cosmetic' && 
                  section.key !== 'mechanical' && section.key !== 'cleaning' && section.key !== 'photos');
        
        // Add status entries for custom sections if they don't exist
        if (customSections.length > 0) {
          const updatedStatus = { ...foundVehicle.status };
          let needsUpdate = false;
          
          customSections.forEach(section => {
            if (!(section.key in updatedStatus)) {
              updatedStatus[section.key] = 'not-started';
              needsUpdate = true;
            }
          });
          
          if (needsUpdate) {
            foundVehicle.status = updatedStatus;
            
            // Save the updated vehicle
            const savedUpdates = localStorage.getItem('vehicleUpdates');
            const existingUpdates = savedUpdates ? JSON.parse(savedUpdates) : {};
            existingUpdates[foundVehicle.id] = foundVehicle;
            localStorage.setItem('vehicleUpdates', JSON.stringify(existingUpdates));
          }
        }
      }
    }
    
    setVehicle(foundVehicle || null);
    setEditedNotes(foundVehicle?.notes || '');
    setIsLoading(false);
  };

  const updateVehicle = (updates: Partial<Vehicle>) => {
    if (!vehicle) return;

    const updatedVehicle = { ...vehicle, ...updates };
    setVehicle(updatedVehicle);

    // Save to localStorage
    const savedUpdates = localStorage.getItem('vehicleUpdates');
    const existingUpdates = savedUpdates ? JSON.parse(savedUpdates) : {};
    existingUpdates[vehicle.id] = updatedVehicle;
    localStorage.setItem('vehicleUpdates', JSON.stringify(existingUpdates));

    // Trigger storage event for other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'vehicleUpdates',
      newValue: JSON.stringify(existingUpdates)
    }));
  };

  const handleStatusUpdate = (section: keyof Vehicle['status'], status: InspectionStatus) => {
    if (!vehicle) return;

    const newStatus = { ...vehicle.status, [section]: status };
    updateVehicle({ status: newStatus });
  };

  const handleSectionComplete = (section: keyof Vehicle['status'], userInitials: string) => {
    handleStatusUpdate(section, 'completed');
    
    // Add completion note
    handleAddTeamNote({
      text: `${section.charAt(0).toUpperCase() + section.slice(1)} section completed and verified.`,
      userInitials,
      category: section === 'cleaned' ? 'cleaning' : section,
      isCertified: true
    });
  };

  // Handle adding team notes from inspection
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

  // 🎯 COMPLETELY FIXED: Handle vehicle notes editing with proper state management
  const handleSaveNotes = () => {
    if (!vehicle) return;

    const userInitials = prompt('Enter your initials to save notes:');
    if (!userInitials?.trim()) return;

    const trimmedNotes = editedNotes.trim();
    
    // 🎯 CRITICAL FIX: Update the vehicle state FIRST, then save to localStorage
    const updatedVehicle = { ...vehicle, notes: trimmedNotes || undefined };
    
    // Update local state immediately - this is what makes the yellow section show the notes
    setVehicle(updatedVehicle);
    
    // Save to localStorage using the updateVehicle function
    updateVehicle({ notes: trimmedNotes || undefined });

    // Add team note about the change
    if (trimmedNotes !== (vehicle.notes || '')) {
      const teamNote: TeamNote = {
        id: (Date.now() + Math.random()).toString(),
        text: trimmedNotes 
          ? `Vehicle notes updated: "${trimmedNotes.length > 100 ? trimmedNotes.substring(0, 100) + '...' : trimmedNotes}"`
          : 'Vehicle notes cleared.',
        userInitials: userInitials.trim().toUpperCase(),
        timestamp: new Date().toISOString(),
        category: 'general'
      };

      // Update team notes in the already updated vehicle
      const finalVehicle = {
        ...updatedVehicle,
        teamNotes: [...(updatedVehicle.teamNotes || []), teamNote]
      };
      
      setVehicle(finalVehicle);
      
      // Save the final vehicle with team notes
      const savedUpdates = localStorage.getItem('vehicleUpdates');
      const existingUpdates = savedUpdates ? JSON.parse(savedUpdates) : {};
      existingUpdates[vehicle.id] = finalVehicle;
      localStorage.setItem('vehicleUpdates', JSON.stringify(existingUpdates));
    }

    setIsEditingNotes(false);
    
    console.log('🎯 Notes saved successfully:', {
      oldNotes: vehicle.notes,
      newNotes: trimmedNotes,
      vehicleId: vehicle.id
    });
  };

  const handleCancelEdit = () => {
    setEditedNotes(vehicle?.notes || '');
    setIsEditingNotes(false);
  };

  // Handle location change
  const handleLocationChange = () => {
    if (!vehicle || !newLocation.trim()) return;

    const userInitials = prompt('Enter your initials to change vehicle location:');
    if (!userInitials?.trim()) return;

    const oldLocation = vehicle.location;
    const updatedVehicle = {
      ...vehicle,
      location: newLocation.trim(),
      locationChangedBy: userInitials.trim().toUpperCase(),
      locationChangedDate: new Date().toISOString(),
      locationHistory: [
        ...(vehicle.locationHistory || []),
        {
          location: oldLocation,
          changedBy: userInitials.trim().toUpperCase(),
          changedDate: new Date().toISOString(),
          timestamp: new Date().toISOString()
        }
      ]
    };

    // Add team note about location change
    const locationNote: TeamNote = {
      id: Date.now().toString(),
      text: `Vehicle location changed from "${oldLocation}" to "${newLocation.trim()}".`,
      userInitials: userInitials.trim().toUpperCase(),
      timestamp: new Date().toISOString(),
      category: 'general'
    };

    updatedVehicle.teamNotes = [...(vehicle.teamNotes || []), locationNote];

    updateVehicle(updatedVehicle);
    setShowLocationModal(false);
    setNewLocation('');
  };

  // Handle clicking on status badges to navigate to inspection section
  const handleStatusBadgeClick = (section: keyof Vehicle['status']) => {
    // Only allow navigation if not completed (to avoid accidental changes)
    if (vehicle?.status[section] === 'completed') return;
    
    // Switch to inspection tab
    setActiveTab('inspection');
    
    // Set the filter to focus on this section
    setActiveFilter(section);
    
    // Scroll to the inspection content (with a small delay to ensure tab switch completes)
    setTimeout(() => {
      const inspectionContent = document.getElementById('inspection-content');
      if (inspectionContent) {
        inspectionContent.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  const handleSellVehicle = () => {
    if (!vehicle) return;

    const userInitials = prompt('Enter your initials to mark this vehicle as sold:');
    if (!userInitials?.trim()) return;

    const soldPrice = prompt('Enter the sold price:');
    if (!soldPrice) return;

    const soldNotes = prompt('Enter any notes about the sale (optional):') || '';

    const soldVehicle: Vehicle = {
      ...vehicle,
      isSold: true,
      soldBy: userInitials.trim().toUpperCase(),
      soldDate: new Date().toISOString(),
      soldPrice: parseFloat(soldPrice) || vehicle.price,
      soldNotes: soldNotes.trim() || undefined,
      teamNotes: [
        ...(vehicle.teamNotes || []),
        {
          id: (Date.now() + Math.random()).toString(),
          text: `Vehicle sold for ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(soldPrice) || vehicle.price)}. ${soldNotes ? `Notes: ${soldNotes}` : ''}`,
          userInitials: userInitials.trim().toUpperCase(),
          timestamp: new Date().toISOString(),
          category: 'general',
          isCertified: true
        }
      ]
    };

    // Remove from active vehicles and add to sold vehicles
    const savedSoldVehicles = localStorage.getItem('soldVehicles');
    const soldVehicles = savedSoldVehicles ? JSON.parse(savedSoldVehicles) : [];
    soldVehicles.unshift(soldVehicle);
    localStorage.setItem('soldVehicles', JSON.stringify(soldVehicles));

    // Remove from vehicle updates
    const savedUpdates = localStorage.getItem('vehicleUpdates');
    if (savedUpdates) {
      const updates = JSON.parse(savedUpdates);
      delete updates[vehicle.id];
      localStorage.setItem('vehicleUpdates', JSON.stringify(updates));
    }

    // Trigger storage events
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'soldVehicles',
      newValue: JSON.stringify(soldVehicles)
    }));

    alert('Vehicle marked as sold successfully!');
    navigate('/');
  };

  const handleMarkPending = () => {
    if (!vehicle) return;

    const userInitials = prompt('Enter your initials to mark this vehicle as pending:');
    if (!userInitials?.trim()) return;

    const pendingNotes = prompt('Enter reason for pending status:') || '';

    const pendingVehicle: Vehicle = {
      ...vehicle,
      isPending: true,
      pendingBy: userInitials.trim().toUpperCase(),
      pendingDate: new Date().toISOString(),
      pendingNotes: pendingNotes.trim() || undefined,
      teamNotes: [
        ...(vehicle.teamNotes || []),
        {
          id: (Date.now() + Math.random()).toString(),
          text: `Vehicle marked as pending. ${pendingNotes ? `Reason: ${pendingNotes}` : ''}`,
          userInitials: userInitials.trim().toUpperCase(),
          timestamp: new Date().toISOString(),
          category: 'general'
        }
      ]
    };

    // Remove from active vehicles and add to pending vehicles
    const savedPendingVehicles = localStorage.getItem('pendingVehicles');
    const pendingVehicles = savedPendingVehicles ? JSON.parse(savedPendingVehicles) : [];
    pendingVehicles.unshift(pendingVehicle);
    localStorage.setItem('pendingVehicles', JSON.stringify(pendingVehicles));

    // Remove from vehicle updates
    const savedUpdates = localStorage.getItem('vehicleUpdates');
    if (savedUpdates) {
      const updates = JSON.parse(savedUpdates);
      delete updates[vehicle.id];
      localStorage.setItem('vehicleUpdates', JSON.stringify(updates));
    }

    // Trigger storage events
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'pendingVehicles',
      newValue: JSON.stringify(pendingVehicles)
    }));

    alert('Vehicle marked as pending successfully!');
    navigate('/');
  };

  const handleReactivateVehicle = () => {
    if (!vehicle) return;

    const userInitials = prompt('Enter your initials to reactivate this vehicle:');
    if (!userInitials?.trim()) return;

    const reactivatedVehicle: Vehicle = {
      ...vehicle,
      isSold: false,
      isPending: false,
      reactivatedBy: userInitials.trim().toUpperCase(),
      reactivatedDate: new Date().toISOString(),
      reactivatedFrom: vehicle.isSold ? 'sold' : 'pending',
      teamNotes: [
        ...(vehicle.teamNotes || []),
        {
          id: (Date.now() + Math.random()).toString(),
          text: `Vehicle reactivated from ${vehicle.isSold ? 'sold' : 'pending'} status and returned to active inventory.`,
          userInitials: userInitials.trim().toUpperCase(),
          timestamp: new Date().toISOString(),
          category: 'general'
        }
      ]
    };

    // Update vehicle
    updateVehicle(reactivatedVehicle);

    // Remove from sold/pending lists
    if (vehicle.isSold) {
      const savedSoldVehicles = localStorage.getItem('soldVehicles');
      if (savedSoldVehicles) {
        const soldVehicles = JSON.parse(savedSoldVehicles);
        const updatedSoldVehicles = soldVehicles.filter((v: Vehicle) => v.id !== vehicle.id);
        localStorage.setItem('soldVehicles', JSON.stringify(updatedSoldVehicles));
      }
    }

    if (vehicle.isPending) {
      const savedPendingVehicles = localStorage.getItem('pendingVehicles');
      if (savedPendingVehicles) {
        const pendingVehicles = JSON.parse(savedPendingVehicles);
        const updatedPendingVehicles = pendingVehicles.filter((v: Vehicle) => v.id !== vehicle.id);
        localStorage.setItem('pendingVehicles', JSON.stringify(updatedPendingVehicles));
      }
    }

    alert('Vehicle successfully reactivated!');
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

  const getDaysInInventory = () => {
    if (!vehicle) return 0;
    const acquiredDate = new Date(vehicle.dateAcquired);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - acquiredDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Enhanced location type detection and color coding
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
    
    // Check for GREEN indicators (On-site) - DEFAULT
    if (locationLower.includes('lot') || 
        locationLower.includes('indoor') || 
        locationLower.includes('showroom') || 
        locationLower.includes('service') ||
        locationLower.includes('display') ||
        locationLower.includes('demo')) {
      return {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-200'
      };
    }
    
    // Default to on-site (green) for most locations
    return {
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200'
    };
  };

  const getSummaryNotes = () => {
    if (!vehicle?.teamNotes) return [];
    return vehicle.teamNotes.filter(note => note.category === 'summary');
  };

  // 🎯 NEW: Get truncated notes for display
  const getTruncatedNotes = (text: string, maxLength: number = 60) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Enhanced StatusBadge component with click handler for mobile
  const ClickableStatusBadge: React.FC<{
    status: InspectionStatus;
    label: string;
    section: keyof Vehicle['status'];
    size?: 'sm' | 'md' | 'lg';
  }> = ({ status, label, section, size = 'md' }) => {
    const isCompleted = status === 'completed';
    const isMobile = window.innerWidth < 1024; // lg breakpoint
    
    return (
      <button
        onClick={() => !isCompleted && isMobile ? handleStatusBadgeClick(section) : undefined}
        disabled={isCompleted}
        className={`${
          !isCompleted && isMobile 
            ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-150' 
            : isCompleted 
              ? 'cursor-default' 
              : 'cursor-default'
        }`}
        title={!isCompleted && isMobile ? `Tap to work on ${label}` : undefined}
      >
        <StatusBadge status={status} label={label} section={section} size={size} />
      </button>
    );
  };

  // Vehicle Information Card Component with Mark Pending and Mark Sold buttons
  const VehicleInformationCard = () => (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Car className="w-5 h-5" />
        Vehicle Information
      </h3>

      {/* Vehicle Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h2>
        {vehicle.trim && (
          <p className="text-lg text-gray-600 font-medium">{vehicle.trim}</p>
        )}
      </div>

      {/* Key Details Grid - CLEAN WITHOUT COLOR ICONS */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm text-gray-500">Stock Number</p>
            <p className="font-bold text-gray-900">{getStockNumber(vehicle.vin)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm text-gray-500">Mileage</p>
            <p className="font-bold text-gray-900">{vehicle.mileage.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm text-gray-500">Color</p>
            <p className="font-bold text-gray-900">{vehicle.color}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="font-bold text-gray-900">{formatPrice(vehicle.price)}</p>
          </div>
        </div>
      </div>

      {/* Location and Timeline - CLEAN DESIGN */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm text-gray-500">Current Location</p>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium border ${getLocationStyle(vehicle.location).bgColor} ${getLocationStyle(vehicle.location).textColor} ${getLocationStyle(vehicle.location).borderColor}`}>
              <MapPin className="w-4 h-4" />
              <span>{vehicle.location}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm text-gray-500">Days in Inventory</p>
            <p className="font-bold text-gray-900">{getDaysInInventory()} days</p>
            <p className="text-xs text-gray-500">Acquired {formatDate(vehicle.dateAcquired)}</p>
          </div>
        </div>
      </div>

      {/* VIN Information - CLEAN DESIGN */}
      <div className="mt-6 pt-4 border-t border-gray-200/60">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm text-gray-500">VIN Number</p>
            <p className="font-mono text-sm text-gray-900 font-medium">{vehicle.vin}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons Section - Mark Pending and Mark Sold */}
      {!vehicle.isSold && !vehicle.isPending && (
        <div className="mt-6 pt-4 border-t border-gray-200/60">
          <p className="text-sm font-medium text-gray-700 mb-3">Vehicle Actions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleMarkPending}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium text-sm shadow-lg"
            >
              <Pause className="w-4 h-4" />
              Mark Pending
            </button>
            <button
              onClick={handleSellVehicle}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm shadow-lg"
            >
              <Archive className="w-4 h-4" />
              Mark Sold
            </button>
          </div>
        </div>
      )}

      {/* Status Display for Sold/Pending Vehicles */}
      {(vehicle.isSold || vehicle.isPending) && (
        <div className="mt-6 pt-4 border-t border-gray-200/60">
          <p className="text-sm font-medium text-gray-700 mb-3">Vehicle Status</p>
          
          {vehicle.isSold && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Archive className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-800">SOLD</span>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Sold by:</strong> {vehicle.soldBy}</p>
                <p><strong>Date:</strong> {formatDate(vehicle.soldDate!)}</p>
                {vehicle.soldPrice && (
                  <p><strong>Price:</strong> {formatPrice(vehicle.soldPrice)}</p>
                )}
                {vehicle.soldNotes && (
                  <p><strong>Notes:</strong> {vehicle.soldNotes}</p>
                )}
              </div>
            </div>
          )}

          {vehicle.isPending && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Pause className="w-4 h-4 text-yellow-600" />
                <span className="font-semibold text-yellow-800">PENDING</span>
              </div>
              <div className="text-sm text-yellow-700 space-y-1">
                <p><strong>Marked by:</strong> {vehicle.pendingBy}</p>
                <p><strong>Date:</strong> {formatDate(vehicle.pendingDate!)}</p>
                {vehicle.pendingNotes && (
                  <p><strong>Reason:</strong> {vehicle.pendingNotes}</p>
                )}
              </div>
            </div>
          )}

          {/* Reactivate Button */}
          <button
            onClick={handleReactivateVehicle}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
            Reactivate Vehicle
          </button>
        </div>
      )}
    </div>
  );

  // Location Change Modal
  const LocationChangeModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full border border-white/20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Change Vehicle Location</h3>
            <button
              onClick={() => {
                setShowLocationModal(false);
                setNewLocation('');
              }}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Location
              </label>
              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${getLocationStyle(vehicle.location).bgColor} ${getLocationStyle(vehicle.location).textColor} ${getLocationStyle(vehicle.location).borderColor}`}>
                <MapPin className="w-4 h-4" />
                <span>{vehicle.location}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Location *
              </label>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Enter new location (e.g., Lot B-05, Indoor-02)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>

            {/* Common Locations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Select
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Lot A', 'Lot B', 'Lot C', 'Indoor Showroom', 'Service Bay', 'Demo Fleet', 'Test Drive', 'In-Transit'].map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setNewLocation(loc)}
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-left"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleLocationChange}
              disabled={!newLocation.trim()}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Update Location
            </button>
            <button
              onClick={() => {
                setShowLocationModal(false);
                setNewLocation('');
              }}
              className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
          <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Vehicle Not Found</h2>
          <p className="text-gray-600 mb-6">The vehicle you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Inventory
          </Link>
        </div>
      </div>
    );
  }

  const stockNumber = getStockNumber(vehicle.vin);
  const daysInInventory = getDaysInInventory();
  const overallProgress = getOverallProgress();
  const readyForSale = isReadyForSale();
  const locationStyle = getLocationStyle(vehicle.location);
  const summaryNotes = getSummaryNotes();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 sm:py-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                to="/"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
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

            {/* Clickable Location Status - Show REAL location title on mobile */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setNewLocation(vehicle.location);
                  setShowLocationModal(true);
                }}
                className={`inline-flex items-center gap-1 sm:gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium border transition-all duration-200 hover:scale-105 active:scale-95 ${locationStyle.bgColor} ${locationStyle.textColor} ${locationStyle.borderColor} hover:shadow-md`}
                title="Click to change location"
              >
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{vehicle.location}</span>
                <Edit3 className="w-3 h-3 opacity-60" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Status & Progress */}
          <div className="lg:col-span-1 space-y-6">
            {/* Much More Condensed Vehicle Status Card on Mobile */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 lg:p-6">
              <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">Reconditioning Progress</h3>
              
              {/* Status Indicators - More compact on mobile */}
              <div className="flex flex-wrap items-center gap-2 mb-3 lg:mb-6">
                {readyForSale && (
                  <div className="flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1 lg:py-2 bg-emerald-100 text-emerald-700 rounded-full text-xs lg:text-sm font-semibold border border-emerald-200">
                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-emerald-500 rounded-full"></span>
                    Ready for Sale
                  </div>
                )}
                
                {vehicle.isSold && (
                  <div className="flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1 lg:py-2 bg-green-100 text-green-700 rounded-full text-xs lg:text-sm font-semibold border border-green-200">
                    <Archive className="w-3 h-3 lg:w-4 lg:h-4" />
                    SOLD
                  </div>
                )}
                
                {vehicle.isPending && (
                  <div className="flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1 lg:py-2 bg-yellow-100 text-yellow-700 rounded-full text-xs lg:text-sm font-semibold border border-yellow-200">
                    <Pause className="w-3 h-3 lg:w-4 lg:h-4" />
                    PENDING
                  </div>
                )}
              </div>
              
              {/* More compact progress section */}
              <div className="mb-4 lg:mb-6">
                <div className="flex justify-between items-center mb-2 lg:mb-3">
                  <span className="text-xs lg:text-sm font-semibold text-gray-700">Overall Completion</span>
                  <span className="text-base lg:text-lg font-bold text-gray-900">{Math.round(overallProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3">
                  <div 
                    className={`h-2 lg:h-3 rounded-full transition-all duration-500 ${
                      overallProgress === 100 
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600' 
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                    }`}
                    style={{ width: `${overallProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* 3 badges per row on mobile, more compact spacing */}
              <div className="space-y-2 lg:space-y-3">
                <div className="grid grid-cols-3 lg:grid-cols-2 gap-1 lg:gap-2">
                  <ClickableStatusBadge status={vehicle.status.emissions} label="Emissions" section="emissions" size="sm" />
                  <ClickableStatusBadge status={vehicle.status.cosmetic} label="Cosmetic" section="cosmetic" size="sm" />
                  <ClickableStatusBadge status={vehicle.status.mechanical} label="Mechanical" section="mechanical" size="sm" />
                </div>
                <div className="grid grid-cols-3 lg:grid-cols-2 gap-1 lg:gap-2">
                  <ClickableStatusBadge status={vehicle.status.cleaned} label="Cleaned" section="cleaned" size="sm" />
                  <ClickableStatusBadge status={vehicle.status.photos} label="Photos" section="photos" size="sm" />
                  
                  {/* 🎯 NEW: Custom sections from settings */}
                  {customSections.map(section => {
                    // Check if this custom section exists in vehicle status
                    const status = vehicle.status[section.key as keyof typeof vehicle.status] || 'not-started';
                    return (
                      <ClickableStatusBadge 
                        key={section.key} 
                        status={status} 
                        label={section.label} 
                        section={section.key as any} 
                        size="sm" 
                      />
                    );
                  })}
                </div>
              </div>

              {/* Quick Filter Buttons - Desktop Only */}
              <div className="hidden lg:block mt-6 pt-4 border-t border-gray-200/60">
                <p className="text-sm font-medium text-gray-700 mb-3">Quick Focus</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(vehicle.status).map(([section, status]) => {
                    if (status === 'completed') return null;
                    
                    // Get section label from custom sections if applicable
                    let sectionLabel = section.charAt(0).toUpperCase() + section.slice(1);
                    if (section === 'cleaned') sectionLabel = 'Cleaning';
                    
                    // Check if this is a custom section
                    const customSection = customSections.find(s => s.key === section);
                    if (customSection) {
                      sectionLabel = customSection.label;
                    }
                    
                    return (
                      <button
                        key={section}
                        onClick={() => {
                          setActiveFilter(activeFilter === section ? null : section);
                          setActiveTab('inspection');
                        }}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          activeFilter === section
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Filter className="w-3 h-3" />
                        {sectionLabel}
                      </button>
                    );
                  })}
                  {activeFilter && (
                    <button
                      onClick={() => setActiveFilter(null)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      <X className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 🎯 COMPLETELY FIXED: Vehicle Notes Section - Now shows updated notes immediately */}
            {(vehicle.notes || summaryNotes.length > 0 || isEditingNotes || !showVehicleNotes) && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Vehicle Notes
                  </h3>
                  <div className="flex items-center gap-2">
                    {!isEditingNotes && (
                      <button
                        onClick={() => setIsEditingNotes(true)}
                        className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                        title="Edit notes"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setShowVehicleNotes(!showVehicleNotes)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showVehicleNotes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {showVehicleNotes && (
                  <div className="space-y-4">
                    {/* 🎯 NEW: Editable Vehicle Notes */}
                    {isEditingNotes ? (
                      <div className="p-4 bg-blue-50/80 backdrop-blur-sm rounded-lg border border-blue-200/60">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-blue-800 mb-2">
                              Edit Vehicle Notes
                            </label>
                            <textarea
                              value={editedNotes}
                              onChange={(e) => setEditedNotes(e.target.value)}
                              placeholder="Enter key issues, observations, or important information about this vehicle..."
                              rows={4}
                              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                              maxLength={500}
                            />
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-xs text-blue-600">
                                {editedNotes.length}/500 characters
                              </p>
                              <p className="text-xs text-blue-600">
                                First 60 chars shown in cards
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveNotes}
                              className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              <Check className="w-4 h-4" />
                              Save Notes
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* 🎯 COMPLETELY FIXED: Original Vehicle Notes - Now shows updated notes immediately */}
                        {vehicle.notes && (
                          <div className="p-4 bg-amber-50/80 backdrop-blur-sm rounded-lg border border-amber-200/60">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-amber-600 text-xs font-bold">!</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1">Vehicle Issues & Notes</p>
                                <p className="text-sm text-amber-700 font-medium leading-relaxed">{vehicle.notes}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Summary Notes from Team */}
                        {summaryNotes.map((note) => (
                          <div key={note.id} className="p-4 bg-indigo-50/80 backdrop-blur-sm rounded-lg border border-indigo-200/60">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <FileText className="w-3 h-3 text-indigo-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-xs font-semibold text-indigo-800 uppercase tracking-wide">Summary by {note.userInitials}</p>
                                  <span className="text-xs text-indigo-600">
                                    {new Date(note.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm text-indigo-700 font-medium leading-relaxed">{note.text}</p>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Add Notes Button if no notes exist */}
                        {!vehicle.notes && summaryNotes.length === 0 && (
                          <div className="text-center py-6">
                            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 mb-3">No vehicle notes yet</p>
                            <button
                              onClick={() => setIsEditingNotes(true)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              <Edit3 className="w-4 h-4" />
                              Add Vehicle Notes
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Vehicle Information Card - Desktop Only (below Vehicle Notes) */}
            <div className="hidden lg:block">
              <VehicleInformationCard />
            </div>
          </div>

          {/* Right Column - Inspection & Notes */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-1.5 shadow-lg border border-white/20 mb-6">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('inspection')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    activeTab === 'inspection'
                      ? 'bg-white text-blue-600 shadow-md border border-blue-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <ClipboardList className="w-5 h-5" />
                  <span className="hidden sm:inline">Inspection Checklist</span>
                  <span className="sm:hidden">Inspection</span>
                  {activeFilter && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      <Filter className="w-3 h-3" />
                      Focused
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    activeTab === 'notes'
                      ? 'bg-white text-blue-600 shadow-md border border-blue-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="hidden sm:inline">Team Notes</span>
                  <span className="sm:hidden">Notes</span>
                  {vehicle.teamNotes && vehicle.teamNotes.length > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
                      {vehicle.teamNotes.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Tab Content with ID for scrolling */}
            <div id="inspection-content">
              {activeTab === 'inspection' ? (
                <InspectionChecklist
                  vehicle={vehicle}
                  onStatusUpdate={handleStatusUpdate}
                  onSectionComplete={handleSectionComplete}
                  onAddTeamNote={handleAddTeamNote}
                  activeFilter={activeFilter}
                />
              ) : (
                <TeamNotes
                  notes={vehicle.teamNotes || []}
                  onAddNote={handleAddTeamNote}
                />
              )}
            </div>

            {/* Vehicle Information Card - Mobile Only (at the bottom) */}
            <div className="lg:hidden mt-6">
              <VehicleInformationCard />
            </div>
          </div>
        </div>
      </div>

      {/* Location Change Modal */}
      {showLocationModal && <LocationChangeModal />}
    </div>
  );
};

export default VehicleDetail;