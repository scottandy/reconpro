import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ContactManager } from '../utils/contactManager';
import { Contact, ContactCategory, CONTACT_CATEGORY_CONFIGS } from '../types/contact';
import { 
  Phone, 
  Plus, 
  Search, 
  Filter, 
  Star, 
  Mail, 
  MapPin, 
  Building2, 
  User, 
  Edit3, 
  Trash2, 
  Heart, 
  PhoneCall,
  Clock,
  X,
  Eye,
  EyeOff,
  Save,
  Users,
  BarChart3,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ContactModalProps {
  contact?: Contact;
  isOpen: boolean;
  onClose: () => void;
  onSave: (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ contact, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    title: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    category: 'other' as ContactCategory,
    specialties: [] as string[],
    notes: '',
    isFavorite: false,
    isActive: true
  });
  const [newSpecialty, setNewSpecialty] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        company: contact.company || '',
        title: contact.title || '',
        phone: contact.phone,
        email: contact.email || '',
        address: contact.address || '',
        city: contact.city || '',
        state: contact.state || '',
        zipCode: contact.zipCode || '',
        category: contact.category,
        specialties: contact.specialties || [],
        notes: contact.notes || '',
        isFavorite: contact.isFavorite || false,
        isActive: contact.isActive
      });
    } else {
      setFormData({
        name: '',
        company: '',
        title: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        category: 'other',
        specialties: [],
        notes: '',
        isFavorite: false,
        isActive: true
      });
    }
    setErrors({});
  }, [contact, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    
    // Basic phone validation
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) newErrors.phone = 'Phone number must be 10 digits';

    // Email validation if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onSave(formData);
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-gray-700/20">
        <div className="sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {contact ? 'Edit Contact' : 'Add New Contact'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {contact ? 'Update contact information' : 'Add a new contact for reconditioning services'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="John Smith"
                />
                {errors.name && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.phone ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="(555) 123-4567"
                />
                {errors.phone && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="ABC Auto Services"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Manager"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="john@company.com"
                />
                {errors.email && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value as ContactCategory)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {Object.entries(CONTACT_CATEGORY_CONFIGS).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Springfield"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select state</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="62701"
                />
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Specialties & Services
            </h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="Add a specialty (e.g., Paint Work, Engine Repair)"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                />
                <button
                  type="button"
                  onClick={addSpecialty}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              
              {formData.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm border border-blue-200 dark:border-blue-700"
                    >
                      {specialty}
                      <button
                        type="button"
                        onClick={() => removeSpecialty(specialty)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about this contact..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Settings */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isFavorite}
                onChange={(e) => handleInputChange('isFavorite', e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mark as favorite</span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200/60 dark:border-gray-700/60">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg"
            >
              {contact ? 'Update Contact' : 'Add Contact'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ContactManagement: React.FC = () => {
  const { dealership } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ContactCategory | 'all' | 'favorites'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (dealership) {
      ContactManager.initializeDefaultContacts(dealership.id);
      loadContacts();
    }
  }, [dealership]);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchTerm, categoryFilter, showInactive]);

  const loadContacts = () => {
    if (dealership) {
      const allContacts = ContactManager.getContacts(dealership.id);
      setContacts(allContacts);
    }
  };

  const filterContacts = () => {
    let filtered = contacts;

    // Filter by active/inactive
    if (!showInactive) {
      filtered = filtered.filter(contact => contact.isActive);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = ContactManager.searchContacts(dealership?.id || '', searchTerm);
      if (!showInactive) {
        filtered = filtered.filter(contact => contact.isActive);
      }
    }

    // Filter by category
    if (categoryFilter === 'favorites') {
      filtered = filtered.filter(contact => contact.isFavorite);
    } else if (categoryFilter !== 'all') {
      filtered = filtered.filter(contact => contact.category === categoryFilter);
    }

    // Sort: favorites first, then by name
    filtered.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return a.name.localeCompare(b.name);
    });

    setFilteredContacts(filtered);
  };

  const handleAddContact = (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (dealership) {
      ContactManager.addContact(dealership.id, contactData);
      loadContacts();
      setShowAddModal(false);
    }
  };

  const handleEditContact = (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (dealership && editingContact) {
      ContactManager.updateContact(dealership.id, editingContact.id, contactData);
      loadContacts();
      setEditingContact(null);
    }
  };

  const handleDeleteContact = (contact: Contact) => {
    if (dealership && window.confirm(`Are you sure you want to delete "${contact.name}"?`)) {
      ContactManager.deleteContact(dealership.id, contact.id);
      loadContacts();
    }
  };

  const handleToggleFavorite = (contact: Contact) => {
    if (dealership) {
      ContactManager.toggleFavorite(dealership.id, contact.id);
      loadContacts();
    }
  };

  const handleCall = (contact: Contact) => {
    if (dealership) {
      ContactManager.logCall(dealership.id, contact.id);
      ContactManager.makePhoneCall(contact.phone);
      loadContacts(); // Refresh to update last contacted
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getContactStats = () => {
    if (!dealership) return { total: 0, active: 0, favorites: 0, byCategory: {} };
    return ContactManager.getContactStats(dealership.id);
  };

  const stats = getContactStats();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* MOBILE OPTIMIZED: Much smaller header */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-3 sm:p-6 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Contact Management</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">Manage your reconditioning service contacts</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Add Contact</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* MOBILE OPTIMIZED: Compact stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-2 sm:p-4 rounded-lg sm:rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-2 sm:p-4 rounded-lg sm:rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Active</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
            </div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-2 sm:p-4 rounded-lg sm:rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Favorites</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.favorites}</p>
            </div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-2 sm:p-4 rounded-lg sm:rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Categories</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                {Object.values(stats.byCategory).filter(count => count > 0).length}
              </p>
            </div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE OPTIMIZED: Compact search and filters */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-3 sm:p-4 transition-colors duration-300">
        {/* Search and Filter Toggle Row */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-1 ${
              showFilters 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-3 border-t border-gray-200/60 dark:border-gray-700/60">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as ContactCategory | 'all' | 'favorites')}
              className="px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="favorites">⭐ Favorites</option>
              {Object.entries(CONTACT_CATEGORY_CONFIGS).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.icon} {config.label}
                </option>
              ))}
            </select>
            
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Show inactive</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredContacts.map((contact) => {
          const categoryConfig = CONTACT_CATEGORY_CONFIGS[contact.category];
          
          return (
            <div 
              key={contact.id}
              className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${
                !contact.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-lg">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">{contact.name}</h3>
                      {contact.company && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{contact.company}</p>
                      )}
                      {contact.title && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{contact.title}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleFavorite(contact)}
                      className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                        contact.isFavorite
                          ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                          : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Star className={`w-3 h-3 sm:w-4 sm:h-4 ${contact.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="mb-3 sm:mb-4">
                  <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${categoryConfig.color}`}>
                    <span>{categoryConfig.icon}</span>
                    <span className="hidden sm:inline">{categoryConfig.label}</span>
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-mono">
                      {ContactManager.formatPhoneNumber(contact.phone)}
                    </span>
                  </div>
                  
                  {contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate">{contact.email}</span>
                    </div>
                  )}
                  
                  {(contact.city || contact.state) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate">
                        {[contact.city, contact.state].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Specialties */}
                {contact.specialties && contact.specialties.length > 0 && (
                  <div className="mb-3 sm:mb-4">
                    <div className="flex flex-wrap gap-1">
                      {contact.specialties.slice(0, 2).map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                        >
                          {specialty}
                        </span>
                      ))}
                      {contact.specialties.length > 2 && (
                        <span className="inline-block px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs">
                          +{contact.specialties.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Last Contacted */}
                {contact.lastContacted && (
                  <div className="mb-3 sm:mb-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>Last contacted: {formatDate(contact.lastContacted)}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCall(contact)}
                    className="flex-1 inline-flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-xs sm:text-sm"
                  >
                    <PhoneCall className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Call</span>
                  </button>
                  <button
                    onClick={() => setEditingContact(contact)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteContact(contact)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add New Contact Card */}
        <div 
          onClick={() => setShowAddModal(true)}
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
        >
          <div className="p-4 sm:p-6 flex flex-col items-center justify-center h-full min-h-[200px] sm:min-h-[280px]">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Add New Contact</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">Add a new contact for reconditioning services</p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredContacts.length === 0 && (
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-8 sm:p-12 text-center transition-colors duration-300">
          <Phone className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">No Contacts Found</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || categoryFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Add your first contact to get started managing your reconditioning service providers.'
            }
          </p>
          {!searchTerm && categoryFilter === 'all' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Add Your First Contact
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Contact Modal */}
      <ContactModal
        contact={editingContact || undefined}
        isOpen={showAddModal || !!editingContact}
        onClose={() => {
          setShowAddModal(false);
          setEditingContact(null);
        }}
        onSave={editingContact ? handleEditContact : handleAddContact}
      />
    </div>
  );
};

export default ContactManagement;