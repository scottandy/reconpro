import React from 'react';
import { Link } from 'react-router-dom';
import { Vehicle, getStockNumber } from '../types/vehicle';
import StatusBadge from './StatusBadge';
import { MapPin, Gauge, Clock, FileText, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { InspectionSettingsManager } from '../utils/inspectionSettingsManager';
import { ProgressCalculator } from '../utils/progressCalculator';

interface VehicleCardProps {
  vehicle: Vehicle;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const { dealership } = useAuth();
  
  const getOverallProgress = () => {
    // Use the new detailed progress calculator
    return ProgressCalculator.calculateDetailedProgress(vehicle.id, vehicle);
  };

  const getDaysInInventory = () => {
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

  // 🎯 NEW: Get truncated notes for display
  const getTruncatedNotes = (text: string, maxLength: number = 60) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // 🎯 NEW: Get custom sections from settings
  const getCustomSections = () => {
    if (!dealership) return [];
    
    const settings = InspectionSettingsManager.getSettings(dealership.id);
    if (!settings) return [];
    
    return settings.sections
      .filter(section => section.isActive && section.key !== 'emissions' && section.key !== 'cosmetic' && 
              section.key !== 'mechanical' && section.key !== 'cleaning' && section.key !== 'photos')
      .sort((a, b) => a.order - b.order);
  };

  const stockNumber = getStockNumber(vehicle.vin);
  const daysInInventory = getDaysInInventory();
  const isReadyForSale = Object.values(vehicle.status).every(status => status === 'completed');
  const locationStyle = getLocationStyle(vehicle.location);
  const truncatedNotes = getTruncatedNotes(vehicle.notes || '');
  const customSections = getCustomSections();

  return (
    <Link 
      to={`/vehicle/${vehicle.id}`}
      className="block bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 hover:shadow-xl hover:bg-white/90 transition-all duration-300 hover:scale-[1.02] group"
    >
      <div className="p-6">
        {/* Header Section - Vehicle Title */}
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900 leading-tight">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
          </div>
          
          {/* Subtitle with Trim and Color */}
          <div className="text-base text-gray-600 font-medium mb-3">
            {vehicle.trim && (
              <span>{vehicle.trim} - </span>
            )}
            <span>{vehicle.color}</span>
          </div>
          
          {/* Clean Info Row: Stock # - Mileage - Days */}
          <div className="flex items-center gap-6 text-sm mb-3">
            <div>
              <span className="font-bold text-black">{stockNumber}</span>
            </div>
            <div className="flex items-center gap-1">
              <Gauge className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{vehicle.mileage.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{daysInInventory} day{daysInInventory !== 1 ? 's' : ''}</span>
            </div>
          </div>
          
          {/* Ready for Sale Badge + Location Row */}
          <div className="flex items-center gap-3">
            {/* Ready for Sale Badge - LEFT */}
            {isReadyForSale && (
              <div className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-200 flex-shrink-0">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                Ready for Sale
              </div>
            )}
            
            {/* Location Box - RIGHT */}
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium border ${locationStyle.bgColor} ${locationStyle.textColor} ${locationStyle.borderColor}`}>
              <MapPin className="w-4 h-4" />
              <span>{vehicle.location}</span>
            </div>
          </div>
        </div>

        {/* 🎯 NEW: Vehicle Notes Section - Shows first 60 characters */}
        {truncatedNotes && (
          <div className="mb-5 p-3 bg-amber-50/80 backdrop-blur-sm rounded-lg border border-amber-200/60">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-3 h-3 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Issues</span>
                </div>
                <p className="text-sm text-amber-700 font-medium leading-relaxed">
                  {truncatedNotes}
                  {vehicle.notes && vehicle.notes.length > 60 && (
                    <span className="text-amber-600 font-semibold ml-1">Click to read more</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Section */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-700">Reconditioning Progress</span>
            <span className="text-sm font-bold text-gray-900">{Math.round(getOverallProgress())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4 shadow-inner">
            <div 
              className={`h-3 rounded-full transition-all duration-500 shadow-sm ${
                getOverallProgress() === 100 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600'
              }`}
              style={{ width: `${getOverallProgress()}%` }}
            ></div>
          </div>
          
          {/* Status Badges - Now Read-Only */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={vehicle.status.emissions} label="Emissions" section="emissions" size="sm" />
              <StatusBadge status={vehicle.status.cosmetic} label="Cosmetic" section="cosmetic" size="sm" />
              <StatusBadge status={vehicle.status.mechanical} label="Mechanical" section="mechanical" size="sm" />
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={vehicle.status.cleaned} label="Cleaned" section="cleaned" size="sm" />
              <StatusBadge status={vehicle.status.photos} label="Photos" section="photos" size="sm" />
              
              {/* 🎯 NEW: Custom sections from settings */}
              {customSections.map(section => {
                // Check if this custom section exists in vehicle status
                const status = vehicle.status[section.key as keyof typeof vehicle.status] || 'not-started';
                return (
                  <StatusBadge 
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
        </div>

        {/* Hover Effect Indicator */}
        <div className="mt-4 pt-4 border-t border-gray-200/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <p className="text-center text-sm text-blue-600 font-medium">Click to view details →</p>
        </div>
      </div>
    </Link>
  );
};

export default VehicleCard;