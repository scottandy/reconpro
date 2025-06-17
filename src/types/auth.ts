export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  initials: string;
  role: 'admin' | 'manager' | 'technician' | 'sales' | 'super-admin'; // Added super-admin role
  dealershipId: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Dealership {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  isActive: boolean;
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  createdAt: string;
  settings: DealershipSettings;
  // New fields for super admin management
  lastActivity?: string;
  totalUsers?: number;
  totalVehicles?: number;
  monthlyRevenue?: number;
  status: 'active' | 'suspended' | 'trial' | 'expired';
}

export interface DealershipSettings {
  allowUserRegistration: boolean;
  requireApproval: boolean;
  maxUsers: number;
  features: {
    analytics: boolean;
    multiLocation: boolean;
    customReports: boolean;
    apiAccess: boolean;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  dealership: Dealership | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterDealershipData {
  // Dealership info
  dealershipName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  dealershipEmail: string;
  website?: string;
  
  // Admin user info
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'manager' | 'technician' | 'sales';
}

// New interface for platform analytics
export interface PlatformAnalytics {
  totalDealerships: number;
  activeDealerships: number;
  totalUsers: number;
  totalVehicles: number;
  monthlyRevenue: number;
  growthRate: number;
  topDealerships: Array<{
    id: string;
    name: string;
    users: number;
    vehicles: number;
    revenue: number;
  }>;
  subscriptionBreakdown: {
    basic: number;
    premium: number;
    enterprise: number;
  };
}</parameter>
</invoke>
<invoke name="file">
<parameter name="filePath">src/utils/auth.ts</parameter>
<parameter name="fileContent">import { User, Dealership, AuthState, LoginCredentials, RegisterDealershipData, RegisterUserData, PlatformAnalytics } from '../types/auth';

export class AuthManager {
  private static readonly STORAGE_KEYS = {
    DEALERSHIPS: 'dealerships',
    USERS: 'users',
    CURRENT_SESSION: 'currentSession',
    VEHICLE_DATA_PREFIX: 'dealership_vehicles_',
    PLATFORM_ADMIN: 'platform_admin'
  };

  // Initialize with demo data including super admin
  static initializeDemoData(): void {
    const existingDealerships = localStorage.getItem(this.STORAGE_KEYS.DEALERSHIPS);
    if (!existingDealerships) {
      const demoDealerships: Dealership[] = [
        {
          id: 'demo-dealership-1',
          name: 'Premier Auto Group',
          address: '123 Main Street',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
          phone: '(555) 123-4567',
          email: 'info@premierauto.com',
          website: 'https://premierauto.com',
          isActive: true,
          subscriptionPlan: 'premium',
          createdAt: new Date().toISOString(),
          status: 'active',
          lastActivity: new Date().toISOString(),
          totalUsers: 3,
          totalVehicles: 15,
          monthlyRevenue: 2500,
          settings: {
            allowUserRegistration: true,
            requireApproval: false,
            maxUsers: 50,
            features: {
              analytics: true,
              multiLocation: true,
              customReports: true,
              apiAccess: false
            }
          }
        },
        {
          id: 'demo-dealership-2',
          name: 'City Motors',
          address: '456 Oak Avenue',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          phone: '(555) 987-6543',
          email: 'contact@citymotors.com',
          isActive: true,
          subscriptionPlan: 'basic',
          createdAt: new Date().toISOString(),
          status: 'active',
          lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          totalUsers: 2,
          totalVehicles: 8,
          monthlyRevenue: 500,
          settings: {
            allowUserRegistration: false,
            requireApproval: true,
            maxUsers: 10,
            features: {
              analytics: false,
              multiLocation: false,
              customReports: false,
              apiAccess: false
            }
          }
        },
        {
          id: 'demo-dealership-3',
          name: 'Elite Motors',
          address: '789 Business Blvd',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          phone: '(555) 456-7890',
          email: 'admin@elitemotors.com',
          isActive: true,
          subscriptionPlan: 'enterprise',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          status: 'trial',
          lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          totalUsers: 8,
          totalVehicles: 45,
          monthlyRevenue: 5000,
          settings: {
            allowUserRegistration: true,
            requireApproval: false,
            maxUsers: 100,
            features: {
              analytics: true,
              multiLocation: true,
              customReports: true,
              apiAccess: true
            }
          }
        }
      ];

      const demoUsers: User[] = [
        // Super Admin
        {
          id: 'super-admin-1',
          email: 'admin@reconpro.com',
          firstName: 'Platform',
          lastName: 'Administrator',
          initials: 'PA',
          role: 'super-admin',
          dealershipId: 'platform', // Special dealership ID for super admin
          isActive: true,
          createdAt: new Date().toISOString()
        },
        // Premier Auto Group users
        {
          id: 'user-1',
          email: 'admin@premierauto.com',
          firstName: 'John',
          lastName: 'Smith',
          initials: 'JS',
          role: 'admin',
          dealershipId: 'demo-dealership-1',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'user-2',
          email: 'manager@premierauto.com',
          firstName: 'Sarah',
          lastName: 'Johnson',
          initials: 'SJ',
          role: 'manager',
          dealershipId: 'demo-dealership-1',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'user-3',
          email: 'tech@premierauto.com',
          firstName: 'Mike',
          lastName: 'Wilson',
          initials: 'MW',
          role: 'technician',
          dealershipId: 'demo-dealership-1',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        // City Motors users
        {
          id: 'user-4',
          email: 'admin@citymotors.com',
          firstName: 'Lisa',
          lastName: 'Davis',
          initials: 'LD',
          role: 'admin',
          dealershipId: 'demo-dealership-2',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'user-5',
          email: 'sales@citymotors.com',
          firstName: 'Tom',
          lastName: 'Brown',
          initials: 'TB',
          role: 'sales',
          dealershipId: 'demo-dealership-2',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        // Elite Motors users
        {
          id: 'user-6',
          email: 'admin@elitemotors.com',
          firstName: 'Jennifer',
          lastName: 'Martinez',
          initials: 'JM',
          role: 'admin',
          dealershipId: 'demo-dealership-3',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];

      localStorage.setItem(this.STORAGE_KEYS.DEALERSHIPS, JSON.stringify(demoDealerships));
      localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(demoUsers));
    }
  }

  static async login(credentials: LoginCredentials): Promise<{ user: User; dealership: Dealership }> {
    const users = this.getUsers();
    const dealerships = this.getDealerships();

    // Find user by email
    const user = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase() && u.isActive);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Handle super admin login
    if (user.role === 'super-admin') {
      // Create a virtual dealership for super admin
      const platformDealership: Dealership = {
        id: 'platform',
        name: 'ReconPro Platform',
        address: 'Platform Administration',
        city: 'Virtual',
        state: 'N/A',
        zipCode: '00000',
        phone: '(555) 000-0000',
        email: 'admin@reconpro.com',
        isActive: true,
        subscriptionPlan: 'enterprise',
        createdAt: new Date().toISOString(),
        status: 'active',
        settings: {
          allowUserRegistration: true,
          requireApproval: false,
          maxUsers: 999999,
          features: {
            analytics: true,
            multiLocation: true,
            customReports: true,
            apiAccess: true
          }
        }
      };

      // Update last login
      user.lastLogin = new Date().toISOString();
      this.updateUser(user);

      // Store session
      const session = { userId: user.id, dealershipId: 'platform' };
      localStorage.setItem(this.STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));

      return { user, dealership: platformDealership };
    }

    // Regular dealership user login
    const dealership = dealerships.find(d => d.id === user.dealershipId && d.isActive);
    if (!dealership) {
      throw new Error('Dealership not found or inactive');
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    this.updateUser(user);

    // Update dealership last activity
    dealership.lastActivity = new Date().toISOString();
    this.updateDealership(dealership);

    // Store session
    const session = { userId: user.id, dealershipId: dealership.id };
    localStorage.setItem(this.STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));

    return { user, dealership };
  }

  static logout(): void {
    localStorage.removeItem(this.STORAGE_KEYS.CURRENT_SESSION);
  }

  static getCurrentSession(): { user: User; dealership: Dealership } | null {
    const sessionData = localStorage.getItem(this.STORAGE_KEYS.CURRENT_SESSION);
    if (!sessionData) return null;

    try {
      const session = JSON.parse(sessionData);
      const users = this.getUsers();
      const dealerships = this.getDealerships();

      const user = users.find(u => u.id === session.userId && u.isActive);
      
      if (user?.role === 'super-admin') {
        // Return virtual platform dealership for super admin
        const platformDealership: Dealership = {
          id: 'platform',
          name: 'ReconPro Platform',
          address: 'Platform Administration',
          city: 'Virtual',
          state: 'N/A',
          zipCode: '00000',
          phone: '(555) 000-0000',
          email: 'admin@reconpro.com',
          isActive: true,
          subscriptionPlan: 'enterprise',
          createdAt: new Date().toISOString(),
          status: 'active',
          settings: {
            allowUserRegistration: true,
            requireApproval: false,
            maxUsers: 999999,
            features: {
              analytics: true,
              multiLocation: true,
              customReports: true,
              apiAccess: true
            }
          }
        };
        return { user, dealership: platformDealership };
      }

      const dealership = dealerships.find(d => d.id === session.dealershipId && d.isActive);

      if (user && dealership) {
        return { user, dealership };
      }
    } catch (error) {
      console.error('Error parsing session:', error);
    }

    return null;
  }

  static async registerDealership(data: RegisterDealershipData): Promise<{ user: User; dealership: Dealership }> {
    const dealerships = this.getDealerships();
    const users = this.getUsers();

    // Check if dealership email already exists
    if (dealerships.some(d => d.email.toLowerCase() === data.dealershipEmail.toLowerCase())) {
      throw new Error('A dealership with this email already exists');
    }

    // Check if user email already exists
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('A user with this email already exists');
    }

    // Validate passwords match
    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Create dealership
    const dealership: Dealership = {
      id: `dealership-${Date.now()}`,
      name: data.dealershipName,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      phone: data.phone,
      email: data.dealershipEmail,
      website: data.website,
      isActive: true,
      subscriptionPlan: 'basic',
      createdAt: new Date().toISOString(),
      status: 'trial',
      lastActivity: new Date().toISOString(),
      totalUsers: 1,
      totalVehicles: 0,
      monthlyRevenue: 0,
      settings: {
        allowUserRegistration: true,
        requireApproval: false,
        maxUsers: 10,
        features: {
          analytics: false,
          multiLocation: false,
          customReports: false,
          apiAccess: false
        }
      }
    };

    // Create admin user
    const user: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      initials: `${data.firstName.charAt(0)}${data.lastName.charAt(0)}`.toUpperCase(),
      role: 'admin',
      dealershipId: dealership.id,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    // Save to storage
    dealerships.push(dealership);
    users.push(user);
    localStorage.setItem(this.STORAGE_KEYS.DEALERSHIPS, JSON.stringify(dealerships));
    localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));

    return { user, dealership };
  }

  static async registerUser(data: RegisterUserData, dealershipId: string): Promise<User> {
    const users = this.getUsers();
    const dealerships = this.getDealerships();

    const dealership = dealerships.find(d => d.id === dealershipId && d.isActive);
    if (!dealership) {
      throw new Error('Dealership not found');
    }

    // Check user limits
    const dealershipUsers = users.filter(u => u.dealershipId === dealershipId && u.isActive);
    if (dealershipUsers.length >= dealership.settings.maxUsers) {
      throw new Error('Maximum number of users reached for this dealership');
    }

    // Check if user email already exists
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('A user with this email already exists');
    }

    // Validate passwords match
    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Create user
    const user: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      initials: `${data.firstName.charAt(0)}${data.lastName.charAt(0)}`.toUpperCase(),
      role: data.role,
      dealershipId: dealershipId,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    users.push(user);
    localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));

    // Update dealership user count
    dealership.totalUsers = (dealership.totalUsers || 0) + 1;
    this.updateDealership(dealership);

    return user;
  }

  static getDealerships(): Dealership[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.DEALERSHIPS);
    return data ? JSON.parse(data) : [];
  }

  static getUsers(): User[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  }

  static getDealershipUsers(dealershipId: string): User[] {
    return this.getUsers().filter(u => u.dealershipId === dealershipId && u.isActive);
  }

  static updateUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  }

  static updateDealership(dealership: Dealership): void {
    const dealerships = this.getDealerships();
    const index = dealerships.findIndex(d => d.id === dealership.id);
    if (index !== -1) {
      dealerships[index] = dealership;
      localStorage.setItem(this.STORAGE_KEYS.DEALERSHIPS, JSON.stringify(dealerships));
    }
  }

  static deactivateUser(userId: string): void {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.isActive = false;
      this.updateUser(user);
    }
  }

  static suspendDealership(dealershipId: string): void {
    const dealerships = this.getDealerships();
    const dealership = dealerships.find(d => d.id === dealershipId);
    if (dealership) {
      dealership.status = 'suspended';
      dealership.isActive = false;
      this.updateDealership(dealership);
    }
  }

  static reactivateDealership(dealershipId: string): void {
    const dealerships = this.getDealerships();
    const dealership = dealerships.find(d => d.id === dealershipId);
    if (dealership) {
      dealership.status = 'active';
      dealership.isActive = true;
      dealership.lastActivity = new Date().toISOString();
      this.updateDealership(dealership);
    }
  }

  static getPlatformAnalytics(): PlatformAnalytics {
    const dealerships = this.getDealerships();
    const users = this.getUsers();

    const activeDealerships = dealerships.filter(d => d.isActive);
    const totalUsers = users.filter(u => u.isActive && u.role !== 'super-admin').length;
    
    // Calculate totals
    const totalVehicles = dealerships.reduce((sum, d) => sum + (d.totalVehicles || 0), 0);
    const monthlyRevenue = dealerships.reduce((sum, d) => sum + (d.monthlyRevenue || 0), 0);

    // Top dealerships
    const topDealerships = dealerships
      .filter(d => d.isActive)
      .map(d => ({
        id: d.id,
        name: d.name,
        users: users.filter(u => u.dealershipId === d.id && u.isActive).length,
        vehicles: d.totalVehicles || 0,
        revenue: d.monthlyRevenue || 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Subscription breakdown
    const subscriptionBreakdown = {
      basic: dealerships.filter(d => d.subscriptionPlan === 'basic').length,
      premium: dealerships.filter(d => d.subscriptionPlan === 'premium').length,
      enterprise: dealerships.filter(d => d.subscriptionPlan === 'enterprise').length
    };

    return {
      totalDealerships: dealerships.length,
      activeDealerships: activeDealerships.length,
      totalUsers,
      totalVehicles,
      monthlyRevenue,
      growthRate: 15.2, // Mock growth rate
      topDealerships,
      subscriptionBreakdown
    };
  }

  // Vehicle data isolation per dealership
  static getDealershipVehicleStorageKey(dealershipId: string): string {
    return `${this.STORAGE_KEYS.VEHICLE_DATA_PREFIX}${dealershipId}`;
  }
}</parameter>
</invoke>
<invoke name="file">
<parameter name="filePath">src/components/SuperAdminDashboard.tsx</parameter>
<parameter name="fileContent">import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthManager } from '../utils/auth';
import { Dealership, User, PlatformAnalytics } from '../types/auth';
import { 
  Building2, 
  Users, 
  Car, 
  DollarSign, 
  TrendingUp, 
  Search, 
  Filter,
  MoreVertical,
  Eye,
  Ban,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Crown,
  Shield,
  Activity,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';

const SuperAdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<'overview' | 'dealerships' | 'analytics' | 'settings'>('overview');
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trial' | 'suspended' | 'expired'>('all');
  const [selectedDealership, setSelectedDealership] = useState<Dealership | null>(null);
  const [showDealershipModal, setShowDealershipModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allDealerships = AuthManager.getDealerships();
    const allUsers = AuthManager.getUsers();
    const platformAnalytics = AuthManager.getPlatformAnalytics();

    setDealerships(allDealerships);
    setUsers(allUsers);
    setAnalytics(platformAnalytics);
  };

  const getFilteredDealerships = () => {
    let filtered = dealerships;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(search) ||
        d.email.toLowerCase().includes(search) ||
        d.city.toLowerCase().includes(search) ||
        d.state.toLowerCase().includes(search)
      );
    }

    return filtered;
  };

  const handleSuspendDealership = (dealershipId: string) => {
    if (window.confirm('Are you sure you want to suspend this dealership? This will disable their access.')) {
      AuthManager.suspendDealership(dealershipId);
      loadData();
    }
  };

  const handleReactivateDealership = (dealershipId: string) => {
    if (window.confirm('Are you sure you want to reactivate this dealership?')) {
      AuthManager.reactivateDealership(dealershipId);
      loadData();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'trial':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'premium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredDealerships = getFilteredDealerships();

  const sidebarItems = [
    { id: 'overview', label: 'Platform Overview', icon: BarChart3 },
    { id: 'dealerships', label: 'Dealerships', icon: Building2, count: dealerships.length },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Platform Settings', icon: Settings }
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
    }
  };

  if (!user || user.role !== 'super-admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center p-4">
        <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Super admin access required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ReconPro Platform Admin</h1>
                <p className="text-sm text-gray-600">Super Administrator Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-purple-600 font-semibold flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Super Admin
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{user.initials}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <nav className="space-y-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id as any)}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 text-left ${
                      activeView === item.id
                        ? 'bg-purple-100 text-purple-700 shadow-md'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {'count' in item && item.count !== undefined && (
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        activeView === item.id
                          ? 'bg-purple-200 text-purple-800'
                          : 'bg-gray-200 text-gray-600'
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
            {activeView === 'overview' && analytics && (
              <div className="space-y-8">
                {/* Platform Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Dealerships</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.totalDealerships}</p>
                        <p className="text-sm text-green-600 font-medium">{analytics.activeDealerships} active</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Users</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.totalUsers}</p>
                        <p className="text-sm text-blue-600 font-medium">Across all dealerships</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Vehicles</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.totalVehicles}</p>
                        <p className="text-sm text-purple-600 font-medium">In reconditioning</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Car className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Monthly Revenue</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(analytics.monthlyRevenue)}</p>
                        <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          +{analytics.growthRate}%
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscription Breakdown */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Subscription Plans</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gray-50/80 rounded-xl border border-gray-200/60">
                      <h4 className="font-bold text-gray-900 mb-2">Basic</h4>
                      <p className="text-3xl font-bold text-gray-700">{analytics.subscriptionBreakdown.basic}</p>
                      <p className="text-sm text-gray-600">dealerships</p>
                    </div>
                    <div className="text-center p-6 bg-blue-50/80 rounded-xl border border-blue-200/60">
                      <h4 className="font-bold text-blue-900 mb-2">Premium</h4>
                      <p className="text-3xl font-bold text-blue-700">{analytics.subscriptionBreakdown.premium}</p>
                      <p className="text-sm text-blue-600">dealerships</p>
                    </div>
                    <div className="text-center p-6 bg-purple-50/80 rounded-xl border border-purple-200/60">
                      <h4 className="font-bold text-purple-900 mb-2">Enterprise</h4>
                      <p className="text-3xl font-bold text-purple-700">{analytics.subscriptionBreakdown.enterprise}</p>
                      <p className="text-sm text-purple-600">dealerships</p>
                    </div>
                  </div>
                </div>

                {/* Top Dealerships */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Top Performing Dealerships</h3>
                  <div className="space-y-4">
                    {analytics.topDealerships.map((dealership, index) => (
                      <div key={dealership.id} className="flex items-center justify-between p-4 bg-gray-50/80 rounded-lg border border-gray-200/60">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                            index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                            index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                            'bg-gradient-to-br from-blue-500 to-blue-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{dealership.name}</p>
                            <p className="text-sm text-gray-600">{dealership.users} users • {dealership.vehicles} vehicles</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{formatCurrency(dealership.revenue)}</p>
                          <p className="text-sm text-gray-600">monthly</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeView === 'dealerships' && (
              <div className="space-y-6">
                {/* Dealerships Header */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Dealership Management</h2>
                      <p className="text-gray-600">Monitor and manage all registered dealerships</p>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search dealerships..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="w-64">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="trial">Trial</option>
                        <option value="suspended">Suspended</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Dealerships List */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                  <div className="divide-y divide-gray-200/60">
                    {filteredDealerships.map((dealership) => (
                      <div key={dealership.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg">{dealership.name}</h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{dealership.city}, {dealership.state}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  <span>{dealership.email}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>Since {formatDate(dealership.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(dealership.status)}`}>
                                  {dealership.status === 'active' && <CheckCircle className="w-3 h-3" />}
                                  {dealership.status === 'suspended' && <Ban className="w-3 h-3" />}
                                  {dealership.status === 'trial' && <Activity className="w-3 h-3" />}
                                  {dealership.status.charAt(0).toUpperCase() + dealership.status.slice(1)}
                                </span>
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getPlanColor(dealership.subscriptionPlan)}`}>
                                  {dealership.subscriptionPlan.charAt(0).toUpperCase() + dealership.subscriptionPlan.slice(1)}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                {dealership.totalUsers || 0} users • {dealership.totalVehicles || 0} vehicles
                              </div>
                              <div className="text-sm font-semibold text-gray-900">
                                {formatCurrency(dealership.monthlyRevenue || 0)}/month
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedDealership(dealership);
                                  setShowDealershipModal(true);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              {dealership.status === 'active' ? (
                                <button
                                  onClick={() => handleSuspendDealership(dealership.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Suspend Dealership"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleReactivateDealership(dealership.id)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Reactivate Dealership"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {filteredDealerships.length === 0 && (
                    <div className="p-12 text-center">
                      <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Dealerships Found</h3>
                      <p className="text-gray-600">No dealerships match your current filters.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeView === 'analytics' && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
                <p className="text-gray-600">Detailed platform analytics and reporting coming soon.</p>
              </div>
            )}

            {activeView === 'settings' && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 text-center">
                <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Platform Settings</h3>
                <p className="text-gray-600">Platform configuration and settings coming soon.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dealership Detail Modal */}
      {showDealershipModal && selectedDealership && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-2xl w-full border border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Dealership Details</h3>
                <button
                  onClick={() => setShowDealershipModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <p className="text-gray-900 font-semibold">{selectedDealership.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedDealership.status)}`}>
                      {selectedDealership.status.charAt(0).toUpperCase() + selectedDealership.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{selectedDealership.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-gray-900">{selectedDealership.phone}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <p className="text-gray-900">
                    {selectedDealership.address}<br />
                    {selectedDealership.city}, {selectedDealership.state} {selectedDealership.zipCode}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Users</label>
                    <p className="text-2xl font-bold text-gray-900">{selectedDealership.totalUsers || 0}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicles</label>
                    <p className="text-2xl font-bold text-gray-900">{selectedDealership.totalVehicles || 0}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Revenue</label>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedDealership.monthlyRevenue || 0)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                    <p className="text-gray-900">{formatDate(selectedDealership.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Activity</label>
                    <p className="text-gray-900">
                      {selectedDealership.lastActivity ? formatDate(selectedDealership.lastActivity) : 'Never'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Plan</label>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getPlanColor(selectedDealership.subscriptionPlan)}`}>
                    {selectedDealership.subscriptionPlan.charAt(0).toUpperCase() + selectedDealership.subscriptionPlan.slice(1)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                {selectedDealership.status === 'active' ? (
                  <button
                    onClick={() => {
                      handleSuspendDealership(selectedDealership.id);
                      setShowDealershipModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Suspend Dealership
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleReactivateDealership(selectedDealership.id);
                      setShowDealershipModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Reactivate Dealership
                  </button>
                )}
                <button
                  onClick={() => setShowDealershipModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;</parameter>
</invoke>
<invoke name="file">
<parameter name="filePath">src/App.tsx</parameter>
<parameter name="fileContent">import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import VehicleDetail from './components/VehicleDetail';

type AppView = 'landing' | 'login' | 'register';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('landing');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white rounded-lg"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Check if user is super admin
    if (user?.role === 'super-admin') {
      return <SuperAdminDashboard />;
    }

    // Regular dealership user
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vehicle/:id" element={<VehicleDetail />} />
          <Route path="*" element={<Navigate to="/\" replace />} />
        </Routes>
      </Router>
    );
  }

  switch (currentView) {
    case 'login':
      return (
        <LoginForm
          onBack={() => setCurrentView('landing')}
          onShowRegister={() => setCurrentView('register')}
        />
      );
    case 'register':
      return (
        <RegisterForm
          onBack={() => setCurrentView('landing')}
          onShowLogin={() => setCurrentView('login')}
        />
      );
    default:
      return (
        <LandingPage
          onShowLogin={() => setCurrentView('login')}
          onShowRegister={() => setCurrentView('register')}
        />
      );
  }
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;</parameter>
</invoke>
<invoke name="file">
<parameter name="filePath">src/components/LoginForm.tsx</parameter>
<parameter name="fileContent">import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Car, Eye, EyeOff, ArrowLeft, Building2, Users, Mail, Lock, Crown } from 'lucide-react';

interface LoginFormProps {
  onBack: () => void;
  onShowRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onBack, onShowRegister }) => {
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login(formData);
  };

  const handleDemoLogin = async (email: string) => {
    clearError();
    await login({ email, password: 'demo' });
  };

  const demoAccounts = [
    {
      type: 'Super Admin',
      icon: Crown,
      color: 'from-purple-500 to-indigo-600',
      accounts: [
        { email: 'admin@reconpro.com', role: 'Platform Admin', name: 'Platform Administrator' }
      ]
    },
    {
      type: 'Premier Auto Group',
      icon: Building2,
      color: 'from-blue-500 to-indigo-600',
      accounts: [
        { email: 'admin@premierauto.com', role: 'Admin', name: 'John Smith' },
        { email: 'manager@premierauto.com', role: 'Manager', name: 'Sarah Johnson' },
        { email: 'tech@premierauto.com', role: 'Technician', name: 'Mike Wilson' }
      ]
    },
    {
      type: 'City Motors',
      icon: Building2,
      color: 'from-emerald-500 to-green-600',
      accounts: [
        { email: 'admin@citymotors.com', role: 'Admin', name: 'Lisa Davis' },
        { email: 'sales@citymotors.com', role: 'Sales', name: 'Tom Brown' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 w-full max-w-md">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <button
              onClick={onBack}
              className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Car className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Demo Accounts */}
          <div className="mb-6">
            <button
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="w-full p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm border border-blue-200"
            >
              {showDemoAccounts ? 'Hide' : 'Show'} Demo Accounts
            </button>
            
            {showDemoAccounts && (
              <div className="mt-4 space-y-4">
                {demoAccounts.map((group, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-6 h-6 bg-gradient-to-br ${group.color} rounded-lg flex items-center justify-center`}>
                        <group.icon className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm">{group.type}</h4>
                      {group.type === 'Super Admin' && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                          Platform Access
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {group.accounts.map((account, accountIndex) => (
                        <button
                          key={accountIndex}
                          onClick={() => handleDemoLogin(account.email)}
                          disabled={isLoading}
                          className="w-full text-left p-2 bg-white rounded border hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{account.name}</p>
                              <p className="text-xs text-gray-600">{account.email}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              account.role === 'Platform Admin' 
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {account.role}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <button
                onClick={onShowRegister}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Register your dealership
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;</parameter>
</invoke>