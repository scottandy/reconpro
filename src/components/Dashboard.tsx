import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { mockVehicles } from '../data/mockVehicles';
import { Vehicle, TeamNote } from '../types/vehicle';
import VehicleCard from './VehicleCard';
import AddVehicleModal from './AddVehicleModal';
import Analytics from './Analytics';
import UserManagement from './UserManagement';
import LocationManagement from './LocationManagement';
import LocationSettings from './LocationSettings';
import ThemeSettings from './ThemeSettings';
import ContactManagement from './ContactManagement';
import TodoCalendar from './TodoCalendar';
import InspectionSettings from './InspectionSettings';
import { ProgressCalculator } from '../utils/progressCalculator';
import { 
  Car, 
  Plus, 
  Search, 
  Filter, 
  BarChart3, 
  Users, 
  Settings,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Archive,
  RotateCcw,
  TrendingUp,
  Target,
  Activity,
  MapPin,
  Phone,
  Calendar,
  ChevronDown,
  ChevronUp,
  ClipboardList
} from 'lucide-react';

type DashboardView = 'inventory' | 'analytics' | 'users' | 'locations' | 'contacts' | 'todos' | 'settings' | 'inspection-settings';
type VehicleFilter = 'all' | 'active' | 'completed' | 'pending' | 'needs-attention' | 'sold' | 'vehicle-pending';
type LocationFilter = 'all' | 'on-site' | 'off-site' | 'in-transit';

const Dashboard: React.FC = () => {
  const { user, dealership, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [activeView, setActiveView] = useState<DashboardView>('inventory');
  const [vehicleFilter, setVehicleFilter] = useState<VehicleFilter>('active');
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Vehicle state management
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [soldVehicles, setSoldVehicles] = useState<Vehicle[]>([]);
  const [pendingVehicles, setPendingVehicles] = useState<Vehicle[]>([]);

  // Load all vehicles on component mount
  useEffect(() => {
    loadAllVehicles();
  }, []);

  // Listen for storage changes to update vehicle data in real-time
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'vehicleUpdates' || e.key === 'addedVehicles' || e.key === 'soldVehicles' || e.key === 'pendingVehicles') {
        loadAllVehicles();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadAllVehicles = () => {
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

    // Separate active, sold, and pending vehicles
    const activeVehicles = allVehicles.filter(v => !v.isSold && !v.isPending);
    const soldVehiclesList = allVehicles.filter(v => v.isSold);
    const pendingVehiclesList = allVehicles.filter(v => v.isPending);

    // Also load sold vehicles from separate storage
    const savedSoldVehicles = localStorage.getItem('soldVehicles');
    if (savedSoldVehicles) {
      try {
        const soldFromStorage = JSON.parse(savedSoldVehicles);
        soldVehiclesList.push(...soldFromStorage.filter((sv: Vehicle) => 
          !soldVehiclesList.some(existing => existing.id === sv.id)
        ));
      } catch (error) {
        console.error('Error loading sold vehicles:', error);
      }
    }

    // Also load pending vehicles from separate storage
    const savedPendingVehicles = localStorage.getItem('pendingVehicles');
    if (savedPendingVehicles) {
      try {
        const pendingFromStorage = JSON.parse(savedPendingVehicles);
        pendingVehiclesList.push(...pendingFromStorage.filter((pv: Vehicle) => 
          !pendingVehiclesList.some(existing => existing.id === pv.id)
        ));
      } catch (error) {
        console.error('Error loading pending vehicles:', error);
      }
    }

    setVehicles(activeVehicles);
    setSoldVehicles(soldVehiclesList);
    setPendingVehicles(pendingVehiclesList);
  };

  const handleAddVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: Date.now().toString()
    };

    // Save to localStorage for persistence
    const savedAddedVehicles = localStorage.getItem('addedVehicles');
    const addedVehicles = savedAddedVehicles ? JSON.parse(savedAddedVehicles) : [];
    addedVehicles.unshift(newVehicle);
    localStorage.setItem('addedVehicles', JSON.stringify(addedVehicles));

    // Update local state
    setVehicles(prev => [newVehicle, ...prev]);
    setShowAddVehicle(false);

    // Trigger storage event for other components to listen to
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'addedVehicles',
      newValue: JSON.stringify(addedVehicles)
    }));
  };

  const handleReactivateVehicle = (vehicleId: string, fromType: 'sold' | 'pending') => {
    const userInitials = prompt('Enter your initials to reactivate this vehicle:');
    if (!userInitials?.trim()) return;

    let vehicleToReactivate: Vehicle | undefined;
    
    if (fromType === 'sold') {
      vehicleToReactivate = soldVehicles.find(v => v.id === vehicleId);
    } else {
      vehicleToReactivate = pendingVehicles.find(v => v.id === vehicleId);
    }

    if (!vehicleToReactivate) return;

    // Create reactivated vehicle
    const reactivatedVehicle: Vehicle = {
      ...vehicleToReactivate,
      isSold: false,
      isPending: false,
      reactivatedBy: userInitials.trim().toUpperCase(),
      reactivatedDate: new Date().toISOString(),
      reactivatedFrom: fromType,
      teamNotes: [
        ...(vehicleToReactivate.teamNotes || []),
        {
          id: (Date.now() + Math.random()).toString(),
          text: `Vehicle reactivated from ${fromType} status and returned to active inventory.`,
          userInitials: userInitials.trim().toUpperCase(),
          timestamp: new Date().toISOString(),
          category: 'general'
        }
      ]
    };

    // Remove from sold/pending and add to active
    if (fromType === 'sold') {
      const updatedSoldVehicles = soldVehicles.filter(v => v.id !== vehicleId);
      setSoldVehicles(updatedSoldVehicles);
      localStorage.setItem('soldVehicles', JSON.stringify(updatedSoldVehicles));
    } else {
      const updatedPendingVehicles = pendingVehicles.filter(v => v.id !== vehicleId);
      setPendingVehicles(updatedPendingVehicles);
      localStorage.setItem('pendingVehicles', JSON.stringify(updatedPendingVehicles));
    }

    // Add to active vehicles
    setVehicles(prev => [reactivatedVehicle, ...prev]);

    // Update vehicle updates storage
    const savedUpdates = localStorage.getItem('vehicleUpdates');
    const updates = savedUpdates ? JSON.parse(savedUpdates) : {};
    updates[vehicleId] = reactivatedVehicle;
    localStorage.setItem('vehicleUpdates', JSON.stringify(updates));

    // Trigger storage events
    window.dispatchEvent(new StorageEvent('storage', {
      key: fromType === 'sold' ? 'soldVehicles' : 'pendingVehicles',
      newValue: JSON.stringify(fromType === 'sold' ? updatedSoldVehicles : updatedPendingVehicles)
    }));

    alert(`Vehicle successfully reactivated from ${fromType} status!`);
  };

  // NEW: Location type detection function
  const getVehicleLocationType = (location: string): LocationFilter => {
    const locationLower = location.toLowerCase();
    
    // Check for In-Transit indicators
    if (locationLower.includes('transit') || locationLower.includes('transport')) {
      return 'in-transit';
    }
    
    // Check for Off-Site indicators
    if (locationLower.includes('off-site') || 
        locationLower.includes('storage') || 
        locationLower.includes('external')) {
      return 'off-site';
    }
    
    // Default to On-Site for most locations
    return 'on-site';
  };

  const getFilteredVehicles = () => {
    let vehiclesToFilter: Vehicle[] = [];
    
    switch (vehicleFilter) {
      case 'sold':
        vehiclesToFilter = soldVehicles;
        break;
      case 'vehicle-pending':
        vehiclesToFilter = pendingVehicles;
        break;
      default:
        vehiclesToFilter = vehicles;
        break;
    }

    // Apply status filter for active vehicles
    if (vehicleFilter !== 'sold' && vehicleFilter !== 'vehicle-pending') {
      switch (vehicleFilter) {
        case 'completed':
          vehiclesToFilter = vehiclesToFilter.filter(vehicle => 
            Object.values(vehicle.status).every(status => status === 'completed')
          );
          break;
        case 'pending':
          vehiclesToFilter = vehiclesToFilter.filter(vehicle => 
            Object.values(vehicle.status).some(status => status === 'pending')
          );
          break;
        case 'needs-attention':
          vehiclesToFilter = vehiclesToFilter.filter(vehicle => 
            Object.values(vehicle.status).some(status => status === 'needs-attention')
          );
          break;
        case 'active':
          vehiclesToFilter = vehiclesToFilter.filter(vehicle => 
            !Object.values(vehicle.status).every(status => status === 'completed')
          );
          break;
        case 'all':
        default:
          // Show all active vehicles
          break;
      }
    }

    // NEW: Apply location filter
    if (locationFilter !== 'all') {
      vehiclesToFilter = vehiclesToFilter.filter(vehicle => {
        const vehicleLocationType = getVehicleLocationType(vehicle.location);
        return vehicleLocationType === locationFilter;
      });
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      vehiclesToFilter = vehiclesToFilter.filter(vehicle =>
        vehicle.make.toLowerCase().includes(search) ||
        vehicle.model.toLowerCase().includes(search) ||
        vehicle.year.toString().includes(search) ||
        vehicle.vin.toLowerCase().includes(search) ||
        vehicle.color.toLowerCase().includes(search) ||
        vehicle.location.toLowerCase().includes(search)
      );
    }

    return vehiclesToFilter;
  };

  const getFilterCounts = () => {
    return {
      all: vehicles.length,
      active: vehicles.filter(v => !Object.values(v.status).every(status => status === 'completed')).length,
      completed: vehicles.filter(v => Object.values(v.status).every(status => status === 'completed')).length,
      pending: vehicles.filter(v => Object.values(v.status).some(status => status === 'pending')).length,
      'needs-attention': vehicles.filter(v => Object.values(v.status).some(status => status === 'needs-attention')).length,
      sold: soldVehicles.length,
      'vehicle-pending': pendingVehicles.length
    };
  };

  // NEW: Get location filter counts
  const getLocationFilterCounts = () => {
    const allActiveVehicles = vehicles;
    return {
      all: allActiveVehicles.length,
      'on-site': allActiveVehicles.filter(v => getVehicleLocationType(v.location) === 'on-site').length,
      'off-site': allActiveVehicles.filter(v => getVehicleLocationType(v.location) === 'off-site').length,
      'in-transit': allActiveVehicles.filter(v => getVehicleLocationType(v.location) === 'in-transit').length
    };
  };

  const getInventorySummary = () => {
    const totalInventory = vehicles.length;
    const completed = vehicles.filter(v => Object.values(v.status).every(status => status === 'completed')).length;
    const inProgress = vehicles.filter(v => 
      Object.values(v.status).some(status => status === 'pending') && 
      !Object.values(v.status).every(status => status === 'completed')
    ).length;
    const needsAttention = vehicles.filter(v => Object.values(v.status).some(status => status === 'needs-attention')).length;
    
    return { totalInventory, completed, inProgress, needsAttention };
  };

  // NEW: Handle clicking on inventory summary cards
  const handleInventoryCardClick = (filterType: VehicleFilter) => {
    setVehicleFilter(filterType);
    // Scroll to vehicle grid
    setTimeout(() => {
      const vehicleGrid = document.getElementById('vehicle-grid');
      if (vehicleGrid) {
        vehicleGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const filteredVehicles = getFilteredVehicles();
  const filterCounts = getFilterCounts();
  const locationFilterCounts = getLocationFilterCounts();
  const inventorySummary = getInventorySummary();

  const sidebarItems = [
    { id: 'inventory', label: 'Inventory', icon: Car, count: vehicles.length },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'todos', label: 'Todo & Calendar', icon: Calendar },
    { id: 'contacts', label: 'Contacts', icon: Phone },
    { id: 'locations', label: 'Locations', icon: MapPin },
    ...(user?.role === 'admin' ? [
      { id: 'users', label: 'Users', icon: Users },
      { id: 'inspection-settings', label: 'Inspection Settings', icon: ClipboardList }
    ] : []),
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const filterOptions = [
    { id: 'all', label: 'All Vehicles', icon: Car, count: filterCounts.all },
    { id: 'active', label: 'In Progress', icon: Clock, count: filterCounts.active },
    { id: 'completed', label: 'Ready for Sale', icon: CheckCircle2, count: filterCounts.completed },
    { id: 'pending', label: 'Needs Attention', icon: AlertTriangle, count: filterCounts.pending + filterCounts['needs-attention'] },
    { id: 'sold', label: 'Sold Vehicles', icon: Archive, count: filterCounts.sold },
    { id: 'vehicle-pending', label: 'Pending Vehicles', icon: Clock, count: filterCounts['vehicle-pending'] }
  ];

  // NEW: Location filter options
  const locationFilterOptions = [
    { id: 'all', label: 'All Locations', icon: MapPin, count: locationFilterCounts.all },
    { id: 'on-site', label: 'On-Site', icon: MapPin, count: locationFilterCounts['on-site'], color: 'text-green-600' },
    { id: 'off-site', label: 'Off-Site', icon: MapPin, count: locationFilterCounts['off-site'], color: 'text-yellow-600' },
    { id: 'in-transit', label: 'In-Transit', icon: MapPin, count: locationFilterCounts['in-transit'], color: 'text-red-600' }
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900/20 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-b border-white/20 dark:border-gray-700/20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Car className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{dealership?.name}</h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">Reconditioning Management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{user?.role}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{user?.initials}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className={`lg:w-64 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-4 sm:p-6 transition-colors duration-300">
              <nav className="space-y-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id as DashboardView);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 sm:py-3 rounded-lg transition-all duration-200 text-left ${
                      activeView === item.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-medium text-sm sm:text-base">{item.label}</span>
                    </div>
                    {'count' in item && item.count !== undefined && (
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        activeView === item.id
                          ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeView === 'inventory' && (
              <div className="space-y-6">
                {/* Inventory Summary Dashboard - ENHANCED MOBILE STYLING */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-3 sm:p-6 transition-colors duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div>
                      <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">Inventory Overview</h2>
                      <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400">Real-time summary - click any metric to filter</p>
                    </div>
                    <button
                      onClick={() => setShowAddVehicle(true)}
                      className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Add Vehicle</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>

                  {/* Enhanced Mobile Key Indicators */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6">
                    <button
                      onClick={() => handleInventoryCardClick('all')}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 sm:p-6 rounded-xl border border-blue-200/60 dark:border-blue-700/60 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] text-left group"
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-4">
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">Total</p>
                          <p className="text-xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100 group-hover:text-blue-700 dark:group-hover:text-blue-200 transition-colors">{inventorySummary.totalInventory}</p>
                        </div>
                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-blue-700 transition-colors flex-shrink-0">
                          <Car className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                        </div>
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                        Click to view all vehicles →
                      </div>
                    </button>

                    <button
                      onClick={() => handleInventoryCardClick('completed')}
                      className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-3 sm:p-6 rounded-xl border border-emerald-200/60 dark:border-emerald-700/60 hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-900/30 dark:hover:to-green-900/30 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] text-left group"
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-4">
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1">Ready</p>
                          <p className="text-xl sm:text-3xl font-bold text-emerald-900 dark:text-emerald-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-200 transition-colors">{inventorySummary.completed}</p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 hidden sm:block">
                            {inventorySummary.totalInventory > 0 ? Math.round((inventorySummary.completed / inventorySummary.totalInventory) * 100) : 0}% of total
                          </p>
                        </div>
                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-emerald-700 transition-colors flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                        </div>
                      </div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                        Click to view completed vehicles →
                      </div>
                    </button>

                    <button
                      onClick={() => handleInventoryCardClick('active')}
                      className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-3 sm:p-6 rounded-xl border border-amber-200/60 dark:border-amber-700/60 hover:from-amber-100 hover:to-yellow-100 dark:hover:from-amber-900/30 dark:hover:to-yellow-900/30 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] text-left group"
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-4">
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1">Working</p>
                          <p className="text-xl sm:text-3xl font-bold text-amber-900 dark:text-amber-100 group-hover:text-amber-700 dark:group-hover:text-amber-200 transition-colors">{inventorySummary.inProgress}</p>
                          <p className="text-xs text-amber-600 dark:text-amber-400 hidden sm:block">
                
                            {inventorySummary.totalInventory > 0 ? Math.round((inventorySummary.inProgress / inventorySummary.totalInventory) * 100) : 0}% of total
                          </p>
                        </div>
                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-amber-600 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-amber-700 transition-colors flex-shrink-0">
                          <Activity className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                        </div>
                      </div>
                      <div className="text-xs text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                        Click to view in-progress vehicles →
                      </div>
                    </button>

                    <button
                      onClick={() => handleInventoryCardClick('needs-attention')}
                      className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 p-3 sm:p-6 rounded-xl border border-red-200/60 dark:border-red-700/60 hover:from-red-100 hover:to-rose-100 dark:hover:from-red-900/30 dark:hover:to-rose-900/30 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] text-left group"
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-4">
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-1">Issues</p>
                          <p className="text-xl sm:text-3xl font-bold text-red-900 dark:text-red-100 group-hover:text-red-700 dark:group-hover:text-red-200 transition-colors">{inventorySummary.needsAttention}</p>
                          <p className="text-xs text-red-600 dark:text-red-400 hidden sm:block">
                            {inventorySummary.totalInventory > 0 ? Math.round((inventorySummary.needsAttention / inventorySummary.totalInventory) * 100) : 0}% of total
                          </p>
                        </div>
                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-red-600 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-red-700 transition-colors flex-shrink-0">
                          <AlertTriangle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                        </div>
                      </div>
                      <div className="text-xs text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                        Click to view vehicles needing attention →
                      </div>
                    </button>
                  </div>

                  {/* Progress Overview - COMPACT ON MOBILE */}
                  {inventorySummary.totalInventory > 0 && (
                    <div className="mt-3 sm:mt-6 p-3 sm:p-4 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl border border-gray-200/60 dark:border-gray-700/60">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Overall Completion Rate</h3>
                        <span className="text-sm sm:text-sm font-bold text-gray-900 dark:text-white">
                          {Math.round((inventorySummary.completed / inventorySummary.totalInventory) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 sm:h-3 rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${(inventorySummary.completed / inventorySummary.totalInventory) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                        <span>{inventorySummary.completed} completed</span>
                        <span>{inventorySummary.totalInventory - inventorySummary.completed} remaining</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* MOBILE OPTIMIZED: Compact search and filters - SAME AS TODO/CALENDAR */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-3 sm:p-4 transition-colors duration-300">
                  {/* Search and Filter Toggle Row */}
                  <div className="flex gap-2 mb-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search vehicles..."
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
                      {/* Status Filter */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                        <select
                          value={vehicleFilter}
                          onChange={(e) => setVehicleFilter(e.target.value as VehicleFilter)}
                          className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          {filterOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label} ({option.count})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Location Filter */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                        <select
                          value={locationFilter}
                          onChange={(e) => setLocationFilter(e.target.value as LocationFilter)}
                          className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          {locationFilterOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label} ({option.count})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Active Filter Indicators */}
                  {(vehicleFilter !== 'all' || locationFilter !== 'all') && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Active filters:</span>
                      {vehicleFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                          {filterOptions.find(opt => opt.id === vehicleFilter)?.label}
                          <button
                            onClick={() => setVehicleFilter('all')}
                            className="ml-1 p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {locationFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
                          {locationFilterOptions.find(opt => opt.id === locationFilter)?.label}
                          <button
                            onClick={() => setLocationFilter('all')}
                            className="ml-1 p-0.5 hover:bg-green-200 dark:hover:bg-green-800 rounded-full transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {(vehicleFilter !== 'all' || locationFilter !== 'all') && (
                        <button
                          onClick={() => {
                            setVehicleFilter('all');
                            setLocationFilter('all');
                          }}
                          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Vehicle Grid */}
                <div id="vehicle-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {filteredVehicles.length > 0 ? (
                    filteredVehicles.map((vehicle) => (
                      <div key={vehicle.id} className="relative">
                        <VehicleCard vehicle={vehicle} />
                        {(vehicleFilter === 'sold' || vehicleFilter === 'vehicle-pending') && (
                          <div className="absolute top-2 right-2">
                            <button
                              onClick={() => handleReactivateVehicle(vehicle.id, vehicleFilter === 'sold' ? 'sold' : 'pending')}
                              className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shadow-lg"
                              title={`Reactivate from ${vehicleFilter === 'sold' ? 'sold' : 'pending'} status`}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full">
                      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-8 sm:p-12 text-center transition-colors duration-300">
                        <Car className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {searchTerm || vehicleFilter !== 'all' || locationFilter !== 'all' ? 'No vehicles found' : 'No vehicles in this category'}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                          {searchTerm || vehicleFilter !== 'all' || locationFilter !== 'all'
                            ? 'Try adjusting your search terms or filters.'
                            : vehicleFilter === 'sold' 
                              ? 'No vehicles have been sold yet.'
                              : vehicleFilter === 'vehicle-pending'
                                ? 'No vehicles are currently pending.'
                                : vehicleFilter === 'needs-attention'
                                  ? 'Great! No vehicles currently need attention.'
                                  : vehicleFilter === 'completed'
                                    ? 'No vehicles are ready for sale yet.'
                                    : 'Add your first vehicle to get started.'
                          }
                        </p>
                        {!searchTerm && vehicleFilter === 'all' && locationFilter === 'all' && (
                          <button
                            onClick={() => setShowAddVehicle(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold"
                          >
                            <Plus className="w-4 h-4" />
                            Add Vehicle
                          </button>
                        )}
                        {(vehicleFilter !== 'all' || locationFilter !== 'all') && (
                          <button
                            onClick={() => {
                              setVehicleFilter('all');
                              setLocationFilter('all');
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-semibold"
                          >
                            <Car className="w-4 h-4" />
                            View All Vehicles
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeView === 'analytics' && <Analytics />}
            {activeView === 'todos' && <TodoCalendar />}
            {activeView === 'contacts' && <ContactManagement />}
            {activeView === 'locations' && <LocationManagement />}
            {activeView === 'users' && <UserManagement />}
            {activeView === 'inspection-settings' && <InspectionSettings />}
            {activeView === 'settings' && (
              <div className="space-y-6">
                <ThemeSettings />
                <LocationSettings />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={showAddVehicle}
        onClose={() => setShowAddVehicle(false)}
        onAddVehicle={handleAddVehicle}
      />
    </div>
  );
};

export default Dashboard;