import React, { useState, useEffect } from 'react';
import { Vehicle, InspectionStatus, TeamNote } from '../types/vehicle';
import { useAuth } from '../contexts/AuthContext';
import { AnalyticsManager } from '../utils/analytics';
import { InspectionSettingsManager } from '../utils/inspectionSettingsManager';
import { InspectionSettings, InspectionSection, InspectionItem, RatingLabel } from '../types/inspectionSettings';
import { CheckCircle2, Circle, Save, Star, AlertTriangle, CheckCircle, Clock, Filter, X, ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface InspectionChecklistProps {
  vehicle: Vehicle;
  onStatusUpdate: (section: keyof Vehicle['status'], status: InspectionStatus) => void;
  onSectionComplete: (section: keyof Vehicle['status'], userInitials: string) => void;
  onAddTeamNote: (note: Omit<TeamNote, 'id' | 'timestamp'>) => void;
  activeFilter?: string | null;
  onGeneratePdf?: () => void;
}

type ItemRating = 'great' | 'fair' | 'needs-attention' | 'not-checked';

interface InspectionItem {
  key: string;
  label: string;
  rating: ItemRating;
  notes?: string;
}

interface InspectionData {
  [key: string]: InspectionItem[]; // Dynamic sections
  sectionNotes: {
    [key: string]: string; // Dynamic section notes
  };
  overallNotes: string;
  lastSaved?: string;
}

// Default inspection data structure - will be overridden by settings
const DEFAULT_INSPECTION_DATA: InspectionData = {
  emissions: [
    { key: 'emissionsTest', label: 'Pass Emissions Test', rating: 'not-checked' },
    { key: 'obd2Scan', label: 'OBD2 Diagnostic Scan', rating: 'not-checked' },
    { key: 'catalyticConverter', label: 'Catalytic Converter Check', rating: 'not-checked' }
  ],
  cosmetic: [
    { key: 'exteriorPaint', label: 'Exterior Paint Condition', rating: 'not-checked' },
    { key: 'bumperCondition', label: 'Bumper Condition', rating: 'not-checked' },
    { key: 'windowsGlass', label: 'Windows & Glass', rating: 'not-checked' },
    { key: 'lightsFunction', label: 'All Lights Functioning', rating: 'not-checked' },
    { key: 'tiresCondition', label: 'Tire Condition & Tread', rating: 'not-checked' },
    { key: 'interiorCleanliness', label: 'Interior Cleanliness', rating: 'not-checked' }
  ],
  mechanical: [
    { key: 'engineOperation', label: 'Engine Operation', rating: 'not-checked' },
    { key: 'transmissionFunction', label: 'Transmission Function', rating: 'not-checked' },
    { key: 'brakesCondition', label: 'Brakes Condition', rating: 'not-checked' },
    { key: 'suspensionCheck', label: 'Suspension Check', rating: 'not-checked' },
    { key: 'steeringAlignment', label: 'Steering & Alignment', rating: 'not-checked' },
    { key: 'fluidsLevels', label: 'Fluid Levels Check', rating: 'not-checked' }
  ],
  cleaning: [
    { key: 'exteriorWash', label: 'Exterior Wash & Wax', rating: 'not-checked' },
    { key: 'interiorVacuum', label: 'Interior Vacuum', rating: 'not-checked' },
    { key: 'windowsCleaned', label: 'Windows Cleaned', rating: 'not-checked' },
    { key: 'detailComplete', label: 'Detail Complete', rating: 'not-checked' }
  ],
  photos: [
    { key: 'exteriorPhotos', label: 'Exterior Photos (All Angles)', rating: 'not-checked' },
    { key: 'interiorPhotos', label: 'Interior Photos', rating: 'not-checked' },
    { key: 'engineBayPhotos', label: 'Engine Bay Photos', rating: 'not-checked' },
    { key: 'damagePhotos', label: 'Any Damage Photos', rating: 'not-checked' }
  ],
  sectionNotes: {
    emissions: '',
    cosmetic: '',
    mechanical: '',
    cleaning: '',
    photos: ''
  },
  overallNotes: ''
};

// CRITICAL: Section key mapping to vehicle status
const SECTION_TO_STATUS_MAP: Record<string, keyof Vehicle['status']> = {
  'emissions': 'emissions',
  'cosmetic': 'cosmetic', 
  'mechanical': 'mechanical',
  'cleaning': 'cleaned',  // 🎯 FIXED: cleaning maps to 'cleaned'
  'photos': 'photos'
  // Custom sections will be handled dynamically
};

// Helper function to get the status key for any section
const getStatusKeyForSection = (sectionKey: string): keyof Vehicle['status'] => {
  // Handle the cleaning -> cleaned mapping
  if (sectionKey === 'cleaning') return 'cleaned';
  
  // Check if it's a standard section
  const standardSections = ['emissions', 'cosmetic', 'mechanical', 'photos'];
  if (standardSections.includes(sectionKey)) {
    return sectionKey as keyof Vehicle['status'];
  }
  
  // For custom sections, return the key as-is
  return sectionKey as keyof Vehicle['status'];
};

const ItemRatingButton: React.FC<{
  rating: ItemRating;
  onClick: () => void;
  isSelected: boolean;
  compact?: boolean;
  ratingLabels?: RatingLabel[];
}> = ({ rating, onClick, isSelected, compact = false, ratingLabels = [] }) => {
  const getRatingConfig = (rating: ItemRating) => {
    // First check if we have custom rating labels
    const customLabel = ratingLabels.find(label => label.key === rating);
    
    if (customLabel) {
      return {
        icon: rating === 'great' ? Star : 
              rating === 'fair' ? CheckCircle : 
              rating === 'needs-attention' ? AlertTriangle : Circle,
        label: customLabel.label,
        shortLabel: customLabel.label.charAt(0).toUpperCase(),
        selectedColor: customLabel.color,
        unselectedColor: `bg-gray-100 text-${customLabel.color.split(' ')[0].replace('bg-', '')} border border-${customLabel.color.split(' ')[0].replace('bg-', '')}-200 hover:bg-${customLabel.color.split(' ')[0].replace('bg-', '')}-50`
      };
    }
    
    // Default configurations if no custom labels
    switch (rating) {
      case 'great':
        return {
          icon: Star,
          label: 'Great',
          shortLabel: 'G',
          selectedColor: 'bg-emerald-600 text-white ring-2 ring-emerald-300',
          unselectedColor: 'bg-gray-100 text-emerald-600 border border-emerald-200 hover:bg-emerald-50'
        };
      case 'fair':
        return {
          icon: CheckCircle,
          label: 'Fair',
          shortLabel: 'F',
          selectedColor: 'bg-yellow-600 text-white ring-2 ring-yellow-300',
          unselectedColor: 'bg-gray-100 text-yellow-600 border border-yellow-200 hover:bg-yellow-50'
        };
      case 'needs-attention':
        return {
          icon: AlertTriangle,
          label: 'Needs Attention',
          shortLabel: 'N',
          selectedColor: 'bg-red-600 text-white ring-2 ring-red-300',
          unselectedColor: 'bg-gray-100 text-red-600 border border-red-200 hover:bg-red-50'
        };
      default:
        return {
          icon: Circle,
          label: 'Not Checked',
          shortLabel: '?',
          selectedColor: 'bg-gray-500 text-white',
          unselectedColor: 'bg-gray-100 text-gray-500 border border-gray-200'
        };
    }
  };

  const config = getRatingConfig(rating);
  const Icon = config.icon;

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`
          flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold transition-all duration-200
          ${isSelected ? config.selectedColor : config.unselectedColor}
          ${isSelected ? 'shadow-md' : 'shadow-sm'}
        `}
        title={config.label}
      >
        {config.shortLabel}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200
        ${isSelected ? config.selectedColor : config.unselectedColor}
        ${isSelected ? 'shadow-md' : 'shadow-sm'}
      `}
    >
      <Icon className="w-3 h-3" />
      <span className="hidden sm:inline">{config.label}</span>
    </button>
  );
};

const CompactInspectionItem: React.FC<{
  item: InspectionItem;
  onRatingChange: (rating: ItemRating) => void;
  ratingLabels?: RatingLabel[];
}> = ({ item, onRatingChange, ratingLabels = [] }) => {
  const ratings: ItemRating[] = ['great', 'fair', 'needs-attention'];

  // Get custom label for a rating if available
  const getCustomLabel = (rating: ItemRating) => {
    const customLabel = ratingLabels.find(label => label.key === rating);
    return customLabel ? customLabel.label : 
           rating === 'great' ? 'Great' : 
           rating === 'fair' ? 'Fair' : 
           rating === 'needs-attention' ? 'Needs Attention' : 'Not Checked';
  };

  // Get custom color for a rating badge if available
  const getCustomColor = (rating: ItemRating) => {
    const customLabel = ratingLabels.find(label => label.key === rating);
    if (!customLabel) {
      return rating === 'great' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
             rating === 'fair' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
             'bg-red-100 text-red-700 border border-red-200';
    }
    
    // Extract the base color from the custom color classes
    const baseColor = customLabel.color.split(' ')[0].replace('bg-', '');
    return `bg-${baseColor}-100 text-${baseColor}-700 border border-${baseColor}-200`;
  };

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-white/50 rounded-lg border border-gray-200">
      <div className="flex-1 min-w-0 mr-3">
        <h4 className="font-medium text-gray-900 text-sm truncate">{item.label}</h4>
        {item.rating !== 'not-checked' && (
          <div className="mt-1">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getCustomColor(item.rating)}`}>
              {getCustomLabel(item.rating)}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex gap-1">
        {ratings.map((rating) => (
          <ItemRatingButton
            key={rating}
            rating={rating}
            isSelected={item.rating === rating}
            onClick={() => onRatingChange(rating)}
            compact={true}
            ratingLabels={ratingLabels}
          />
        ))}
      </div>
    </div>
  );
};

const ChecklistSection: React.FC<{
  title: string;
  sectionKey: string;
  items: InspectionItem[];
  notes: string;
  onItemChange: (key: string, rating: ItemRating) => void;
  onNotesChange: (notes: string) => void;
  onStatusUpdate: (sectionKey: string, status: InspectionStatus) => void;
  isFiltered?: boolean;
  ratingLabels?: RatingLabel[];
}> = ({ title, sectionKey, items, notes, onItemChange, onNotesChange, onStatusUpdate, isFiltered = false, ratingLabels = [] }) => {
  const [isExpanded, setIsExpanded] = useState(isFiltered || false);
  
  // 🎯 BULLETPROOF STATUS CALCULATION
  const calculateSectionStatus = (): InspectionStatus => {
    const checkedItems = items.filter(item => item.rating !== 'not-checked');
    
    // No items checked = not started
    if (checkedItems.length === 0) {
      return 'not-started';
    }
    
    // Any item needs attention = needs attention
    const hasNeedsAttention = items.some(item => item.rating === 'needs-attention');
    if (hasNeedsAttention) {
      return 'needs-attention';
    }
    
    // Any item is fair = pending (yellow)
    const hasFair = items.some(item => item.rating === 'fair');
    if (hasFair) {
      return 'pending';
    }
    
    // All items checked and all are great = completed
    const allItemsChecked = items.every(item => item.rating !== 'not-checked');
    const allGreat = items.every(item => item.rating === 'great');
    
    if (allItemsChecked && allGreat) {
      return 'completed';
    }
    
    // Default to pending if some items are checked but not all great
    return 'pending';
  };

  // 🎯 IMMEDIATE STATUS UPDATE ON ITEM CHANGE
  useEffect(() => {
    const newStatus = calculateSectionStatus();
    onStatusUpdate(sectionKey, newStatus);
  }, [items, sectionKey]);

  // Auto-expand if filtered
  useEffect(() => {
    if (isFiltered) {
      setIsExpanded(true);
    }
  }, [isFiltered]);

  const currentStatus = calculateSectionStatus();
  const checkedItems = items.filter(item => item.rating !== 'not-checked').length;
  const totalItems = items.length;
  const progress = (checkedItems / totalItems) * 100;

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border transition-all duration-300 ${
      isFiltered 
        ? 'border-blue-300 ring-2 ring-blue-100 shadow-xl' 
        : 'border-white/30 hover:shadow-xl hover:border-white/50'
    } overflow-hidden`}>
      {/* 🎯 FIXED: Compact Header - Prevents overlapping on mobile */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 sm:p-4 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 truncate">{title}</h3>
              {isFiltered && (
                <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium border border-blue-200 flex-shrink-0">
                  <Filter className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="hidden sm:inline">Focused</span>
                </div>
              )}
            </div>
            
            {/* 🎯 FIXED: Compact Status Info - Better mobile spacing */}
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm flex-shrink-0">
              <span className="text-gray-600 hidden sm:inline">{checkedItems}/{totalItems}</span>
              <div className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                currentStatus === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                currentStatus === 'needs-attention' ? 'bg-red-100 text-red-800 border border-red-200' :
                currentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                'bg-gray-100 text-gray-600 border border-gray-200'
              }`}>
                {currentStatus === 'completed' && <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                {currentStatus === 'needs-attention' && <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                {currentStatus === 'pending' && <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                {currentStatus === 'not-started' && <Circle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                <span className="hidden sm:inline">
                  {currentStatus === 'completed' ? 'Done' :
                   currentStatus === 'needs-attention' ? 'Issues' :
                   currentStatus === 'pending' ? 'Working' : 'Start'}
                </span>
              </div>
            </div>
          </div>
          
          {/* 🎯 FIXED: Progress Section - Compact mobile layout */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2">
            {/* 🎯 FIXED: Percentage Display - Smaller on mobile, positioned correctly */}
            <div className="text-right">
              <div className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900">{Math.round(progress)}%</div>
              <div className="text-xs text-gray-500 hidden sm:block">complete</div>
            </div>
            
            {/* 🎯 FIXED: Progress Circle - Smaller on mobile */}
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${progress * 1.005} 100.5`}
                  className={
                    currentStatus === 'completed' ? 'text-emerald-500' :
                    currentStatus === 'needs-attention' ? 'text-red-500' :
                    currentStatus === 'pending' ? 'text-yellow-500' : 'text-gray-400'
                  }
                  strokeLinecap="round"
                />
              </svg>
              {/* Status Icon in Center of Circle - Smaller on mobile */}
              <div className="absolute inset-0 flex items-center justify-center">
                {currentStatus === 'completed' && <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-emerald-600" />}
                {currentStatus === 'needs-attention' && <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-red-600" />}
                {currentStatus === 'pending' && <Clock className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-yellow-600" />}
                {currentStatus === 'not-started' && <Circle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-400" />}
              </div>
            </div>
            
            {/* Expand/Collapse Icon */}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            )}
          </div>
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
            <div 
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                currentStatus === 'completed' ? 'bg-emerald-600' :
                currentStatus === 'needs-attention' ? 'bg-red-500' :
                currentStatus === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Status Message */}
          <div className={`p-3 rounded-lg border text-sm ${
            currentStatus === 'completed' ? 'bg-emerald-50/80 border-emerald-200/60 text-emerald-700' :
            currentStatus === 'needs-attention' ? 'bg-red-50/80 border-red-200/60 text-red-700' :
            currentStatus === 'pending' ? 'bg-yellow-50/80 border-yellow-200/60 text-yellow-700' :
            'bg-blue-50/80 border-blue-200/60 text-blue-700'
          }`}>
            <strong>Status:</strong> {
              currentStatus === 'completed' ? '✅ Section completed! All items rated as Great.' :
              currentStatus === 'needs-attention' ? '⚠️ Some items need attention - address issues to proceed.' :
              currentStatus === 'pending' ? '🔄 Section in progress - continue rating items.' :
              '📝 Rate all items to proceed.'
            }
          </div>

          {/* Compact Inspection Items */}
          <div className="space-y-2">
            {items.map((item) => (
              <CompactInspectionItem
                key={item.key}
                item={item}
                onRatingChange={(rating) => onItemChange(item.key, rating)}
                ratingLabels={ratingLabels}
              />
            ))}
          </div>

          {/* Section Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section Notes</label>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Add any overall observations or notes for this section..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const InspectionChecklist: React.FC<InspectionChecklistProps> = ({ 
  vehicle, 
  onStatusUpdate, 
  onSectionComplete, 
  onAddTeamNote, 
  activeFilter,
  onGeneratePdf 
}) => {
  const { user, dealership } = useAuth();
  const [inspectionData, setInspectionData] = useState<InspectionData>(DEFAULT_INSPECTION_DATA);
  const [isLoaded, setIsLoaded] = useState(false);
  const [inspectionSettings, setInspectionSettings] = useState<InspectionSettings | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Load inspection settings when component mounts
  useEffect(() => {
    if (dealership) {
      // Initialize default settings if needed
      InspectionSettingsManager.initializeDefaultSettings(dealership.id);
      
      // Load settings
      const settings = InspectionSettingsManager.getSettings(dealership.id);
      setInspectionSettings(settings);
      
      // Listen for settings changes
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === `dealership_inspection_settings_${dealership.id}`) {
          const updatedSettings = InspectionSettingsManager.getSettings(dealership.id);
          setInspectionSettings(updatedSettings);
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [dealership]);

  // 🎯 BULLETPROOF DATA LOADING - ONLY RUNS ONCE
  useEffect(() => {
    const loadInspectionData = () => {
      try {
        const savedInspections = localStorage.getItem('vehicleInspections');
        if (savedInspections) {
          const inspections = JSON.parse(savedInspections);
          const vehicleInspection = inspections[vehicle.id];
          
          if (vehicleInspection) {
            setInspectionData(vehicleInspection);
          } else {
            // Initialize with default data
            setInspectionData(DEFAULT_INSPECTION_DATA);
          }
        } else {
          setInspectionData(DEFAULT_INSPECTION_DATA);
        }
      } catch (error) {
        console.error('Error loading inspection data:', error);
        setInspectionData(DEFAULT_INSPECTION_DATA);
      } finally {
        setIsLoaded(true);
      }
    };

    loadInspectionData();
  }, [vehicle.id]);

  // 🎯 ENHANCED AUTO-SAVE - Debounced to prevent excessive saves
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    // Clear any existing timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    // Set a new timer to save after 500ms of inactivity
    const timer = setTimeout(() => {
      saveInspectionData();
    }, 500);

    setAutoSaveTimer(timer);

    // Cleanup on unmount
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [inspectionData, isLoaded]);

  // Save inspection data to localStorage
  const saveInspectionData = () => {
    try {
      const savedInspections = localStorage.getItem('vehicleInspections');
      const inspections = savedInspections ? JSON.parse(savedInspections) : {};
      
      const dataToSave = {
        ...inspectionData,
        lastSaved: new Date().toISOString()
      };
      
      inspections[vehicle.id] = dataToSave;
      localStorage.setItem('vehicleInspections', JSON.stringify(inspections));
      
      // Trigger storage event for real-time updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'vehicleInspections',
        newValue: JSON.stringify(inspections)
      }));
      
      console.log(`✅ Inspection data auto-saved for vehicle ${vehicle.id}`);
    } catch (error) {
      console.error('Error saving inspection data:', error);
    }
  };

  // 🎯 ENHANCED: Auto-use logged-in user's initials
  const updateInspectionItem = (section: keyof InspectionData, key: string, rating: ItemRating) => {
    // Get custom rating labels if available
    const ratingLabels = inspectionSettings?.ratingLabels || [];
    
    // Get the label for the rating
    const getRatingLabel = (rating: ItemRating) => {
      const customLabel = ratingLabels.find(label => label.key === rating);
      return customLabel ? customLabel.label : 
             rating === 'great' ? 'Great' : 
             rating === 'fair' ? 'Fair' : 
             rating === 'needs-attention' ? 'Needs Attention' : 'Not Checked';
    };
    
    // 🎯 SIMPLIFIED: Use logged-in user's initials automatically
    const userInitials = user?.initials || 'Unknown';

    const oldItem = inspectionData[section].find(item => item.key === key);
    const oldRating = oldItem?.rating || 'not-checked';
    
    setInspectionData(prev => {
      const newData = {
        ...prev,
        [section]: prev[section].map(item =>
          item.key === key ? { ...item, rating } : item
        )
      };
      
      return newData;
    });

    // Create descriptive team note
    if (oldRating !== rating && rating !== 'not-checked') {
      const itemLabel = inspectionData[section].find(item => item.key === key)?.label || key;
      const sectionName = section === 'cleaning' ? 'cleaned' : section;
      
      // Create descriptive team note
      let noteText = '';
      const oldRatingLabel = getRatingLabel(oldRating);
      const newRatingLabel = getRatingLabel(rating);
      
      if (oldRating === 'not-checked') {
        noteText = `${itemLabel} rated as "${newRatingLabel}" during ${sectionName} inspection.`;
      } else {
        noteText = `${itemLabel} updated from "${oldRatingLabel}" to "${newRatingLabel}" during ${sectionName} inspection.`;
      }

      // Add special notes for issues
      if (rating === 'needs-attention') {
        noteText += ' ⚠️ Requires attention before completion.';
      } else if (rating === 'great' && oldRating === 'needs-attention') {
        noteText += ' ✅ Issue resolved.';
      }

      // Add team note
      onAddTeamNote({
        text: noteText,
        userInitials: userInitials,
        category: sectionName as any
      });

      // Record analytics
      const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
      AnalyticsManager.recordTaskUpdate(
        vehicle.id, 
        vehicleName, 
        sectionName as any, 
        userInitials,
        itemLabel,
        oldRating,
        rating
      );
      
      console.log(`✅ Team note and analytics recorded: ${userInitials} updated ${itemLabel} in ${section} from ${oldRating} to ${rating}`);
    }
  };

  // 🎯 BULLETPROOF SECTION NOTES UPDATE
  const updateSectionNotes = (section: keyof InspectionData['sectionNotes'], notes: string) => {
    setInspectionData(prev => ({
      ...prev,
      sectionNotes: {
        ...prev.sectionNotes,
        [section]: notes
      }
    }));
  };

  // 🎯 BULLETPROOF STATUS UPDATE WITH CORRECT MAPPING
  const handleSectionStatusUpdate = (sectionKey: string, status: InspectionStatus) => {
    // Get the correct vehicle status key for this section
    const vehicleStatusKey = getStatusKeyForSection(sectionKey);
    
    // Update the vehicle status
    onStatusUpdate(vehicleStatusKey, status);
  };

  const handleSave = () => {
    saveInspectionData();
    alert('✅ Inspection data saved successfully!');
  };

  // Convert inspection settings to inspection data format
  const getInspectionDataFromSettings = (settings: InspectionSettings): InspectionData => {
    const data: InspectionData = {
      emissions: [],
      cosmetic: [],
      mechanical: [],
      cleaning: [],
      photos: [],
      sectionNotes: {
        emissions: '',
        cosmetic: '',
        mechanical: '',
        cleaning: '',
        photos: ''
      },
      overallNotes: ''
    };
    
    // Map active sections and their items to the inspection data
    settings.sections.filter(section => section.isActive).forEach(section => {
      const sectionKey = section.key as keyof InspectionData;
      
      // Only process if it's one of our known section keys
      if (sectionKey in data) {
        // Map active items to inspection items
        data[sectionKey] = section.items
          .filter(item => item.isActive)
          .map(item => ({
            key: item.id,
            label: item.label,
            rating: 'not-checked' as ItemRating
          }));
      }
    });
    
    return data;
  };

  // Show loading state until data is loaded
  if (!isLoaded) {
    return (
      <div className="space-y-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 text-center">
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-blue-200 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto"></div>
          </div>
          <p className="text-sm text-gray-600 mt-4">Loading inspection data...</p>
        </div>
      </div>
    );
  }

  // Get sections from settings if available, otherwise use default
  const getSections = () => {
    if (inspectionSettings) {
      // Get all active sections from settings
      return inspectionSettings.sections
        .filter(section => section.isActive)
        .sort((a, b) => a.order - b.order)
        .map(section => {
          // Get the corresponding items from inspection data or initialize empty
          const sectionKey = section.key;
          
          // Initialize section in inspectionData if it doesn't exist
          if (!inspectionData[sectionKey]) {
            setInspectionData(prev => ({
              ...prev,
              [sectionKey]: [],
              sectionNotes: {
                ...prev.sectionNotes,
                [sectionKey]: ''
              }
            }));
          }
          
          const sectionItems = inspectionData[sectionKey] || [];
          
          // If we have settings items but no inspection data items yet, initialize them
          if (section.items.length > 0 && sectionItems.length === 0) {
            const newItems = section.items
              .filter(item => item.isActive)
              .map(item => ({
                key: item.id,
                label: item.label,
                rating: 'not-checked' as ItemRating
              }));
            
            // Update inspection data with these new items
            setInspectionData(prev => ({
              ...prev,
              [sectionKey]: newItems,
              sectionNotes: {
                ...prev.sectionNotes,
                [sectionKey]: prev.sectionNotes[sectionKey] || ''
              }
            }));
            
            return {
              key: section.key,
              title: section.label,
              data: newItems,
              notes: inspectionData.sectionNotes[sectionKey] || ''
            };
          }
          
          return {
            key: section.key,
            title: section.label,
            data: sectionItems,
            notes: inspectionData.sectionNotes[sectionKey] || ''
          };
        });
    }
    
    // Default sections if no settings
    return [
      { key: 'emissions', title: 'Emissions & Environmental', data: inspectionData.emissions, notes: inspectionData.sectionNotes.emissions },
      { key: 'cosmetic', title: 'Cosmetic Inspection', data: inspectionData.cosmetic, notes: inspectionData.sectionNotes.cosmetic },
      { key: 'mechanical', title: 'Mechanical Inspection', data: inspectionData.mechanical, notes: inspectionData.sectionNotes.mechanical },
      { key: 'cleaning', title: 'Cleaning & Detailing', data: inspectionData.cleaning, notes: inspectionData.sectionNotes.cleaning },
      { key: 'photos', title: 'Photography Documentation', data: inspectionData.photos, notes: inspectionData.sectionNotes.photos }
    ];
  };

  // Get sections and filter based on activeFilter
  const sections = getSections();
  const filteredSections = activeFilter 
    ? sections.filter(section => {
        // Map the filter to section key
        const filterMap: Record<string, string> = {
          'emissions': 'emissions',
          'cosmetic': 'cosmetic',
          'mechanical': 'mechanical',
          'cleaned': 'cleaning', // Note: cleaned maps to cleaning section
          'photos': 'photos'
        };
        return section.key === filterMap[activeFilter];
      })
    : sections;

  return (
    <div className="space-y-4">
      {/* Filter Indicator */}
      {activeFilter && (
        <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                <Filter className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-800">Focused Inspection Mode</h4>
                <p className="text-xs text-blue-700">
                  Showing only {activeFilter === 'cleaned' ? 'cleaning' : activeFilter} section for faster completion
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Info Display */}
      {user && (
        <div className="bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-700 font-bold text-sm">{user.initials}</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-green-800">Working as: {user.firstName} {user.lastName}</h4>
              <p className="text-xs text-green-700">
                All task updates will be automatically recorded with your initials
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Compact Inspection Section Cards */}
      <div className="space-y-3">
        {filteredSections.map((section) => (
          <ChecklistSection
            key={section.key}
            title={section.title}
            sectionKey={section.key}
            items={section.data}
            notes={section.notes}
            onItemChange={(key, rating) => updateInspectionItem(section.key as keyof InspectionData, key, rating)}
            onNotesChange={(notes) => updateSectionNotes(section.key as keyof InspectionData['sectionNotes'], notes)}
            onStatusUpdate={handleSectionStatusUpdate}
            isFiltered={!!activeFilter}
            ratingLabels={inspectionSettings?.ratingLabels}
          />
        ))}
      </div>

      {/* Overall Notes */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-4">
        <h3 className="text-base font-bold text-gray-900 mb-3">Overall Inspection Notes</h3>
        <textarea
          value={inspectionData.overallNotes}
          onChange={(e) => setInspectionData(prev => ({ ...prev, overallNotes: e.target.value }))}
          placeholder="Add any overall observations or notes about the vehicle inspection..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
          rows={3}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        {/* Generate PDF Button - Now positioned to the left of Save */}
        {onGeneratePdf && (
          <button
            onClick={onGeneratePdf}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <FileText className="w-4 h-4" />
            Generate Customer PDF
          </button>
        )}
        
        {/* Save Button */}
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          <Save className="w-4 h-4" />
          Save Inspection
        </button>
      </div>
    </div>
  );
};

export default InspectionChecklist;