import React, { useState } from 'react';
import { Vehicle, InspectionStatus } from '../types/vehicle';
import { X, Car, Calendar, MapPin, Gauge, Palette } from 'lucide-react';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
}

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose, onAddVehicle }) => {
  const [formData, setFormData] = useState({
    vin: '',
    year: new Date().getFullYear(),
    make: '',
    model: '',
    trim: '',
    mileage: 0,
    color: '',
    dateAcquired: new Date().toISOString().split('T')[0],
    location: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.vin.trim()) newErrors.vin = 'VIN is required';
    if (formData.vin.length !== 17) newErrors.vin = 'VIN must be 17 characters';
    if (!formData.make.trim()) newErrors.make = 'Make is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.color.trim()) newErrors.color = 'Color is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Please enter a valid year';
    }
    if (formData.mileage < 0) newErrors.mileage = 'Mileage cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const newVehicle: Omit<Vehicle, 'id'> = {
      ...formData,
      vin: formData.vin.toUpperCase(),
      make: formData.make.trim(),
      model: formData.model.trim(),
      trim: formData.trim.trim() || undefined,
      color: formData.color.trim(),
      location: formData.location.trim(),
      notes: formData.notes.trim() || undefined,
      price: 0, // Default price to 0 when not specified
      status: {
        emissions: 'not-started' as InspectionStatus,
        cosmetic: 'not-started' as InspectionStatus,
        mechanical: 'not-started' as InspectionStatus,
        cleaned: 'not-started' as InspectionStatus,
        photos: 'not-started' as InspectionStatus
      },
      teamNotes: []
    };

    onAddVehicle(newVehicle);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      vin: '',
      year: new Date().getFullYear(),
      make: '',
      model: '',
      trim: '',
      mileage: 0,
      color: '',
      dateAcquired: new Date().toISOString().split('T')[0],
      location: '',
      notes: ''
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const popularMakes = [
    'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge',
    'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jeep', 'Kia', 'Lexus',
    'Lincoln', 'Mazda', 'Mercedes-Benz', 'Mitsubishi', 'Nissan', 'Ram', 'Subaru',
    'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
  ];

  const popularColors = [
    'Black', 'White', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Brown',
    'Gold', 'Orange', 'Yellow', 'Purple', 'Pearl White', 'Metallic Silver',
    'Midnight Black', 'Deep Blue', 'Forest Green', 'Burgundy'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200/60 px-4 sm:px-6 py-4 rounded-t-xl sm:rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <Car className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Add New Vehicle</h2>
                <p className="text-sm text-gray-600">Enter vehicle details to add to inventory</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Vehicle Identification */}
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Car className="w-4 h-4 sm:w-5 sm:h-5" />
              Vehicle Identification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  VIN Number *
                </label>
                <input
                  type="text"
                  value={formData.vin}
                  onChange={(e) => handleInputChange('vin', e.target.value.toUpperCase())}
                  placeholder="Enter 17-character VIN"
                  maxLength={17}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                    errors.vin ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.vin && <p className="text-red-600 text-sm mt-1">{errors.vin}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                    errors.year ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.year && <p className="text-red-600 text-sm mt-1">{errors.year}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Make *
                </label>
                <input
                  type="text"
                  value={formData.make}
                  onChange={(e) => handleInputChange('make', e.target.value)}
                  placeholder="e.g., Honda"
                  list="makes"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                    errors.make ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <datalist id="makes">
                  {popularMakes.map(make => (
                    <option key={make} value={make} />
                  ))}
                </datalist>
                {errors.make && <p className="text-red-600 text-sm mt-1">{errors.make}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="e.g., Accord"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                    errors.model ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.model && <p className="text-red-600 text-sm mt-1">{errors.model}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trim Level
                </label>
                <input
                  type="text"
                  value={formData.trim}
                  onChange={(e) => handleInputChange('trim', e.target.value)}
                  placeholder="e.g., Sport, LX, EX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Gauge className="w-4 h-4 sm:w-5 sm:h-5" />
              Vehicle Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mileage *
                </label>
                <input
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => handleInputChange('mileage', parseInt(e.target.value) || 0)}
                  min="0"
                  placeholder="Enter mileage"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                    errors.mileage ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.mileage && <p className="text-red-600 text-sm mt-1">{errors.mileage}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Palette className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                  Color *
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="e.g., Pearl White"
                  list="colors"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                    errors.color ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <datalist id="colors">
                  {popularColors.map(color => (
                    <option key={color} value={color} />
                  ))}
                </datalist>
                {errors.color && <p className="text-red-600 text-sm mt-1">{errors.color}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Lot A-12, Indoor-05"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                    errors.location ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
              </div>
            </div>
          </div>

          {/* Date Acquired */}
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              Acquisition Date
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Acquired *
                </label>
                <input
                  type="date"
                  value={formData.dateAcquired}
                  onChange={(e) => handleInputChange('dateAcquired', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any initial observations or notes about the vehicle..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200/60">
            <button
              type="submit"
              className="flex-1 px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg text-sm sm:text-base"
            >
              Add Vehicle to Inventory
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 sm:px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-semibold text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicleModal;