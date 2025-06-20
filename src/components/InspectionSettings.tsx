import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { InspectionSettingsManager } from '../utils/inspectionSettingsManager';
import { InspectionSettings as InspectionSettingsType, InspectionSection, InspectionItem, RatingLabel } from '../types/inspectionSettings';
import { 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  GripVertical,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  AlertTriangle,
  Palette,
  List,
  Star,
  CheckCircle,
  Clock,
  Circle,
  Copy,
  Move,
  FileText
} from 'lucide-react';

interface SectionModalProps {
  section?: InspectionSection;
  isOpen: boolean;
  onClose: () => void;
  onSave: (sectionData: Omit<InspectionSection, 'id' | 'createdAt' | 'updatedAt'>) => void;
  existingSections: InspectionSection[];
}

const SectionModal: React.FC<SectionModalProps> = ({ section, isOpen, onClose, onSave, existingSections }) => {
  const [formData, setFormData] = useState({
    key: '',
    label: '',
    description: '',
    icon: '🔧',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    isActive: true,
    isCustomerVisible: true,
    order: 1
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (section) {
      setFormData({
        key: section.key,
        label: section.label,
        description: section.description || '',
        icon: section.icon,
        color: section.color,
        isActive: section.isActive,
        isCustomerVisible: section.isCustomerVisible !== undefined ? section.isCustomerVisible : true,
        order: section.order
      });
    } else {
      const maxOrder = Math.max(...existingSections.map(s => s.order), 0);
      setFormData({
        key: '',
        label: '',
        description: '',
        icon: '🔧',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        isActive: true,
        isCustomerVisible: true,
        order: maxOrder + 1
      });
    }
    setErrors({});
  }, [section, isOpen, existingSections]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.label.trim()) newErrors.label = 'Section name is required';
    if (!formData.key.trim()) newErrors.key = 'Section key is required';
    
    // Check for duplicate keys (excluding current section)
    const duplicateKey = existingSections.find(s => 
      s.key === formData.key && s.id !== section?.id
    );
    if (duplicateKey) newErrors.key = 'Section key must be unique';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSave({
      key: formData.key.toLowerCase().replace(/\s+/g, '-'),
      label: formData.label.trim(),
      description: formData.description.trim() || undefined,
      icon: formData.icon,
      color: formData.color,
      isActive: formData.isActive,
      isCustomerVisible: formData.isCustomerVisible,
      order: formData.order,
      items: section?.items || []
    });
    onClose();
  };

  const colorOptions = [
    { label: 'Blue', value: 'bg-blue-100 text-blue-800 border-blue-200' },
    { label: 'Green', value: 'bg-green-100 text-green-800 border-green-200' },
    { label: 'Purple', value: 'bg-purple-100 text-purple-800 border-purple-200' },
    { label: 'Red', value: 'bg-red-100 text-red-800 border-red-200' },
    { label: 'Yellow', value: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { label: 'Indigo', value: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    { label: 'Pink', value: 'bg-pink-100 text-pink-800 border-pink-200' },
    { label: 'Cyan', value: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    { label: 'Orange', value: 'bg-orange-100 text-orange-800 border-orange-200' },
    { label: 'Gray', value: 'bg-gray-100 text-gray-800 border-gray-200' }
  ];

  const iconOptions = ['🔧', '🎨', '⚙️', '✨', '📸', '🚗', '🔍', '📋', '🛠️', '💎', '🌟', '⚡', '🎯', '🔥'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200/60 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {section ? 'Edit Section' : 'Add New Section'}
                </h2>
                <p className="text-sm text-gray-600">
                  Configure inspection section details
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Name *
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.label ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Mechanical Inspection"
              />
              {errors.label && <p className="text-red-600 text-sm mt-1">{errors.label}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Key *
              </label>
              <input
                type="text"
                value={formData.key}
                onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.key ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., mechanical"
              />
              {errors.key && <p className="text-red-600 text-sm mt-1">{errors.key}</p>}
              <p className="text-xs text-gray-500 mt-1">Unique identifier (lowercase, no spaces)</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this inspection section..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon
              </label>
              <div className="grid grid-cols-7 gap-2">
                {iconOptions.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon }))}
                    className={`p-2 text-xl rounded-lg border-2 transition-colors ${
                      formData.icon === icon
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    className={`p-2 text-sm rounded-lg border-2 transition-colors ${
                      formData.color === color.value
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${color.value}`}
                  >
                    {color.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-col justify-center space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Section is active</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isCustomerVisible}
                  onChange={(e) => setFormData(prev => ({ ...prev, isCustomerVisible: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Show in customer PDF</span>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${formData.color}`}>
              <span>{formData.icon}</span>
              <span>{formData.label || 'Section Name'}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200/60">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg"
            >
              {section ? 'Update Section' : 'Create Section'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ItemModalProps {
  item?: InspectionItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Omit<InspectionItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  existingItems: InspectionItem[];
}

const ItemModal: React.FC<ItemModalProps> = ({ item, isOpen, onClose, onSave, existingItems }) => {
  const [formData, setFormData] = useState({
    label: '',
    description: '',
    isRequired: true,
    isActive: true,
    order: 1
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setFormData({
        label: item.label,
        description: item.description || '',
        isRequired: item.isRequired,
        isActive: item.isActive,
        order: item.order
      });
    } else {
      const maxOrder = Math.max(...existingItems.map(i => i.order), 0);
      setFormData({
        label: '',
        description: '',
        isRequired: true,
        isActive: true,
        order: maxOrder + 1
      });
    }
    setErrors({});
  }, [item, isOpen, existingItems]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.label.trim()) newErrors.label = 'Item name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSave({
      label: formData.label.trim(),
      description: formData.description.trim() || undefined,
      isRequired: formData.isRequired,
      isActive: formData.isActive,
      order: formData.order
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-lg w-full border border-white/20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">
              {item ? 'Edit Inspection Item' : 'Add New Inspection Item'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name *
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.label ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Engine Operation"
              />
              {errors.label && <p className="text-red-600 text-sm mt-1">{errors.label}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of what to check..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isRequired}
                  onChange={(e) => setFormData(prev => ({ ...prev, isRequired: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Required item</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Item is active</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {item ? 'Update Item' : 'Add Item'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const InspectionSettings: React.FC = () => {
  const { dealership, user } = useAuth();
  const [settings, setSettings] = useState<InspectionSettingsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sections' | 'ratings' | 'global' | 'pdf'>('sections');
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingSection, setEditingSection] = useState<InspectionSection | null>(null);
  const [editingItem, setEditingItem] = useState<InspectionItem | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (dealership) {
      InspectionSettingsManager.initializeDefaultSettings(dealership.id);
      loadSettings();
    }
  }, [dealership]);

  const loadSettings = () => {
    if (!dealership) return;
    
    setIsLoading(true);
    const currentSettings = InspectionSettingsManager.getSettings(dealership.id);
    setSettings(currentSettings);
    setIsLoading(false);
  };

  const handleAddSection = (sectionData: Omit<InspectionSection, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!dealership) return;
    
    InspectionSettingsManager.addSection(dealership.id, sectionData);
    loadSettings();
    setShowSectionModal(false);
  };

  const handleEditSection = (sectionData: Omit<InspectionSection, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!dealership || !editingSection) return;
    
    InspectionSettingsManager.updateSection(dealership.id, editingSection.id, sectionData);
    loadSettings();
    setEditingSection(null);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!dealership) return;
    
    const section = settings?.sections.find(s => s.id === sectionId);
    if (!section) return;

    if (window.confirm(`Are you sure you want to delete the "${section.label}" section? This will also delete all items in this section.`)) {
      InspectionSettingsManager.deleteSection(dealership.id, sectionId);
      loadSettings();
    }
  };

  const handleToggleSectionActive = (sectionId: string) => {
    if (!dealership) return;
    
    const section = settings?.sections.find(s => s.id === sectionId);
    if (!section) return;

    InspectionSettingsManager.updateSection(dealership.id, sectionId, {
      isActive: !section.isActive
    });
    loadSettings();
  };

  const handleToggleSectionCustomerVisible = (sectionId: string) => {
    if (!dealership) return;
    
    const section = settings?.sections.find(s => s.id === sectionId);
    if (!section) return;

    InspectionSettingsManager.updateSection(dealership.id, sectionId, {
      isCustomerVisible: !section.isCustomerVisible
    });
    loadSettings();
  };

  const handleAddItem = (itemData: Omit<InspectionItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!dealership || !selectedSectionId) return;
    
    InspectionSettingsManager.addItem(dealership.id, selectedSectionId, itemData);
    loadSettings();
    setShowItemModal(false);
    setSelectedSectionId(null);
  };

  const handleEditItem = (itemData: Omit<InspectionItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!dealership || !selectedSectionId || !editingItem) return;
    
    InspectionSettingsManager.updateItem(dealership.id, selectedSectionId, editingItem.id, itemData);
    loadSettings();
    setEditingItem(null);
    setSelectedSectionId(null);
  };

  const handleDeleteItem = (sectionId: string, itemId: string) => {
    if (!dealership) return;
    
    const section = settings?.sections.find(s => s.id === sectionId);
    const item = section?.items.find(i => i.id === itemId);
    if (!item) return;

    if (window.confirm(`Are you sure you want to delete the "${item.label}" item?`)) {
      InspectionSettingsManager.deleteItem(dealership.id, sectionId, itemId);
      loadSettings();
    }
  };

  const handleToggleItemActive = (sectionId: string, itemId: string) => {
    if (!dealership) return;
    
    const section = settings?.sections.find(s => s.id === sectionId);
    const item = section?.items.find(i => i.id === itemId);
    if (!item) return;

    InspectionSettingsManager.updateItem(dealership.id, sectionId, itemId, {
      isActive: !item.isActive
    });
    loadSettings();
  };

  const handleUpdateRatingLabel = (labelKey: 'great' | 'fair' | 'needs-attention' | 'not-checked', updates: Partial<RatingLabel>) => {
    if (!dealership) return;
    
    InspectionSettingsManager.updateRatingLabel(dealership.id, labelKey, updates);
    loadSettings();
  };

  const handleUpdateCustomerPdfSettings = (updates: Partial<InspectionSettingsType['customerPdfSettings']>) => {
    if (!dealership) return;
    
    InspectionSettingsManager.updateCustomerPdfSettings(dealership.id, updates);
    loadSettings();
  };

  const handleResetToDefaults = () => {
    if (!dealership) return;
    
    if (window.confirm('Are you sure you want to reset all inspection settings to defaults? This will remove all custom sections and items.')) {
      InspectionSettingsManager.resetToDefaults(dealership.id);
      loadSettings();
    }
  };

  const handleExportSettings = () => {
    if (!dealership) return;
    
    const exportData = InspectionSettingsManager.exportSettings(dealership.id);
    if (!exportData) return;

    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inspection-settings-${dealership.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!dealership) return;
    
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (InspectionSettingsManager.importSettings(dealership.id, content)) {
        loadSettings();
        alert('Settings imported successfully!');
      } else {
        alert('Error importing settings. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  const toggleSectionExpanded = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-600">Only administrators can manage inspection settings.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 text-center">
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-blue-200 rounded-xl mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto"></div>
        </div>
        <p className="text-sm text-gray-600 mt-4">Loading inspection settings...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings Not Found</h3>
        <p className="text-gray-600 mb-4">Unable to load inspection settings.</p>
        <button
          onClick={loadSettings}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Inspection Settings</h2>
              <p className="text-gray-600">Customize inspection sections, items, and rating labels</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".json"
              onChange={handleImportSettings}
              className="hidden"
              id="import-settings"
            />
            <label
              htmlFor="import-settings"
              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Import
            </label>
            <button
              onClick={handleExportSettings}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleResetToDefaults}
              className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-1.5 shadow-lg border border-white/20">
        <div className="flex flex-wrap">
          <button
            onClick={() => setActiveTab('sections')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'sections'
                ? 'bg-white text-blue-600 shadow-md border border-blue-100'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <List className="w-5 h-5" />
            Sections & Items
          </button>
          <button
            onClick={() => setActiveTab('ratings')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'ratings'
                ? 'bg-white text-blue-600 shadow-md border border-blue-100'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <Star className="w-5 h-5" />
            Rating Labels
          </button>
          <button
            onClick={() => setActiveTab('global')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'global'
                ? 'bg-white text-blue-600 shadow-md border border-blue-100'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <Settings className="w-5 h-5" />
            Global Settings
          </button>
          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'pdf'
                ? 'bg-white text-blue-600 shadow-md border border-blue-100'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <FileText className="w-5 h-5" />
            PDF Settings
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'sections' && (
        <div className="space-y-6">
          {/* Add Section Button */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
            <button
              onClick={() => setShowSectionModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add New Section
            </button>
          </div>

          {/* Sections List */}
          <div className="space-y-4">
            {settings.sections
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <div key={section.id} className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                  {/* Section Header */}
                  <div className="p-4 border-b border-gray-200/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleSectionExpanded(section.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          {expandedSections.has(section.id) ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${section.color}`}>
                          <span>{section.icon}</span>
                          <span>{section.label}</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {section.items.filter(i => i.isActive).length} items
                        </span>
                        {!section.isActive && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            <EyeOff className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                        {!section.isCustomerVisible && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            <EyeOff className="w-3 h-3" />
                            Hidden from PDF
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleSectionActive(section.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            section.isActive
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-400 hover:bg-gray-50'
                          }`}
                          title={section.isActive ? 'Deactivate section' : 'Activate section'}
                        >
                          {section.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleToggleSectionCustomerVisible(section.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            section.isCustomerVisible
                              ? 'text-blue-600 hover:bg-blue-50'
                              : 'text-gray-400 hover:bg-gray-50'
                          }`}
                          title={section.isCustomerVisible ? 'Hide from customer PDF' : 'Show in customer PDF'}
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingSection(section)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit section"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSection(section.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete section"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {section.description && (
                      <p className="text-sm text-gray-600 mt-2 ml-8">{section.description}</p>
                    )}
                  </div>

                  {/* Section Items */}
                  {expandedSections.has(section.id) && (
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700">Inspection Items</h4>
                        <button
                          onClick={() => {
                            setSelectedSectionId(section.id);
                            setShowItemModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Plus className="w-3 h-3" />
                          Add Item
                        </button>
                      </div>

                      {section.items.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                          <List className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">No items in this section yet</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {section.items
                            .sort((a, b) => a.order - b.order)
                            .map((item) => (
                              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg border border-gray-200/60">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900">{item.label}</span>
                                    {item.isRequired && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                        Required
                                      </span>
                                    )}
                                    {!item.isActive && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                        <EyeOff className="w-3 h-3" />
                                        Inactive
                                      </span>
                                    )}
                                  </div>
                                  {item.description && (
                                    <span className="text-xs text-gray-500">- {item.description}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleToggleItemActive(section.id, item.id)}
                                    className={`p-1 rounded transition-colors ${
                                      item.isActive
                                        ? 'text-green-600 hover:bg-green-50'
                                        : 'text-gray-400 hover:bg-gray-50'
                                    }`}
                                    title={item.isActive ? 'Deactivate item' : 'Activate item'}
                                  >
                                    {item.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedSectionId(section.id);
                                      setEditingItem(item);
                                    }}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="Edit item"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(section.id, item.id)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Delete item"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {activeTab === 'ratings' && (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Rating Labels Configuration</h3>
          <p className="text-gray-600 mb-6">Customize the labels and descriptions for inspection ratings.</p>
          
          <div className="space-y-6">
            {settings.ratingLabels.map((label) => {
              const IconComponent = label.key === 'great' ? Star :
                                 label.key === 'fair' ? CheckCircle :
                                 label.key === 'needs-attention' ? AlertTriangle : Circle;
              
              return (
                <div key={label.key} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium ${label.color.replace('ring-2 ring-emerald-300', '').replace('ring-2 ring-yellow-300', '').replace('ring-2 ring-red-300', '')}`}>
                      <IconComponent className="w-4 h-4" />
                      <span>{label.label}</span>
                    </div>
                    <span className="text-sm text-gray-500 capitalize">({label.key.replace('-', ' ')})</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Label Text
                      </label>
                      <input
                        type="text"
                        value={label.label}
                        onChange={(e) => handleUpdateRatingLabel(label.key, { label: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={label.description || ''}
                        onChange={(e) => handleUpdateRatingLabel(label.key, { description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief description..."
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'global' && (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Global Inspection Settings</h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">User Requirements</h4>
                
                <label className="flex items-center justify-between p-4 bg-gray-50/80 rounded-lg border border-gray-200/60">
                  <div>
                    <span className="font-medium text-gray-900">Require User Initials</span>
                    <p className="text-sm text-gray-600">Users must enter initials when making changes</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.globalSettings.requireUserInitials}
                    onChange={(e) => {
                      if (dealership) {
                        InspectionSettingsManager.updateGlobalSettings(dealership.id, {
                          requireUserInitials: e.target.checked
                        });
                        loadSettings();
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50/80 rounded-lg border border-gray-200/60">
                  <div>
                    <span className="font-medium text-gray-900">Allow Skip Items</span>
                    <p className="text-sm text-gray-600">Users can skip non-required inspection items</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.globalSettings.allowSkipItems}
                    onChange={(e) => {
                      if (dealership) {
                        InspectionSettingsManager.updateGlobalSettings(dealership.id, {
                          allowSkipItems: e.target.checked
                        });
                        loadSettings();
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Interface Options</h4>
                
                <label className="flex items-center justify-between p-4 bg-gray-50/80 rounded-lg border border-gray-200/60">
                  <div>
                    <span className="font-medium text-gray-900">Auto-Save Progress</span>
                    <p className="text-sm text-gray-600">Automatically save inspection progress</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.globalSettings.autoSaveProgress}
                    onChange={(e) => {
                      if (dealership) {
                        InspectionSettingsManager.updateGlobalSettings(dealership.id, {
                          autoSaveProgress: e.target.checked
                        });
                        loadSettings();
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50/80 rounded-lg border border-gray-200/60">
                  <div>
                    <span className="font-medium text-gray-900">Show Progress Percentage</span>
                    <p className="text-sm text-gray-600">Display completion percentage in UI</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.globalSettings.showProgressPercentage}
                    onChange={(e) => {
                      if (dealership) {
                        InspectionSettingsManager.updateGlobalSettings(dealership.id, {
                          showProgressPercentage: e.target.checked
                        });
                        loadSettings();
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50/80 rounded-lg border border-gray-200/60">
                  <div>
                    <span className="font-medium text-gray-900">Enable Team Notes</span>
                    <p className="text-sm text-gray-600">Allow team members to add notes during inspection</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.globalSettings.enableTeamNotes}
                    onChange={(e) => {
                      if (dealership) {
                        InspectionSettingsManager.updateGlobalSettings(dealership.id, {
                          enableTeamNotes: e.target.checked
                        });
                        loadSettings();
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pdf' && (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Customer PDF Settings</h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Content Settings</h4>
                
                <label className="flex items-center justify-between p-4 bg-gray-50/80 rounded-lg border border-gray-200/60">
                  <div>
                    <span className="font-medium text-gray-900">Include Vehicle Photos</span>
                    <p className="text-sm text-gray-600">Add vehicle photos to the PDF report</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.customerPdfSettings?.includeVehiclePhotos}
                    onChange={(e) => {
                      handleUpdateCustomerPdfSettings({
                        includeVehiclePhotos: e.target.checked
                      });
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50/80 rounded-lg border border-gray-200/60">
                  <div>
                    <span className="font-medium text-gray-900">Include Customer Comments</span>
                    <p className="text-sm text-gray-600">Show customer comments in the PDF</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.customerPdfSettings?.includeCustomerComments}
                    onChange={(e) => {
                      handleUpdateCustomerPdfSettings({
                        includeCustomerComments: e.target.checked
                      });
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50/80 rounded-lg border border-gray-200/60">
                  <div>
                    <span className="font-medium text-gray-900">Show Detailed Ratings</span>
                    <p className="text-sm text-gray-600">Display detailed item ratings in the PDF</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.customerPdfSettings?.showDetailedRatings}
                    onChange={(e) => {
                      handleUpdateCustomerPdfSettings({
                        showDetailedRatings: e.target.checked
                      });
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">PDF Customization</h4>
                
                <div className="p-4 bg-gray-50/80 rounded-lg border border-gray-200/60">
                  <label className="block font-medium text-gray-900 mb-2">
                    Footer Text
                  </label>
                  <textarea
                    value={settings.customerPdfSettings?.footerText || ''}
                    onChange={(e) => {
                      handleUpdateCustomerPdfSettings({
                        footerText: e.target.value
                      });
                    }}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter footer text for PDF reports..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This text will appear at the bottom of all customer PDF reports
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Section Visibility</h4>
              <p className="text-sm text-gray-600 mb-4">
                Control which sections appear in the customer PDF report
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settings.sections.map((section) => (
                  <label key={section.id} className="flex items-center justify-between p-4 bg-gray-50/80 rounded-lg border border-gray-200/60">
                    <div className="flex items-center gap-3">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${section.color}`}>
                        <span>{section.icon}</span>
                        <span>{section.label}</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={section.isCustomerVisible}
                      onChange={() => handleToggleSectionCustomerVisible(section.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <SectionModal
        section={editingSection || undefined}
        isOpen={showSectionModal || !!editingSection}
        onClose={() => {
          setShowSectionModal(false);
          setEditingSection(null);
        }}
        onSave={editingSection ? handleEditSection : handleAddSection}
        existingSections={settings.sections}
      />

      <ItemModal
        item={editingItem || undefined}
        isOpen={showItemModal || !!editingItem}
        onClose={() => {
          setShowItemModal(false);
          setEditingItem(null);
          setSelectedSectionId(null);
        }}
        onSave={editingItem ? handleEditItem : handleAddItem}
        existingItems={selectedSectionId ? settings.sections.find(s => s.id === selectedSectionId)?.items || [] : []}
      />
    </div>
  );
};

export default InspectionSettings;