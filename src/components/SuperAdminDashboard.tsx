import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthManager } from '../utils/auth';
import { Dealership, User } from '../types/auth';
import { 
  Crown, 
  Building2, 
  Users, 
  BarChart3, 
  DollarSign,
  TrendingUp,
  Shield,
  Settings,
  LogOut,
  Eye,
  Pause,
  Play,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';

const SuperAdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedDealership, setSelectedDealership] = useState<Dealership | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'dealerships' | 'users' | 'analytics'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allDealerships = AuthManager.getAllDealershipsForSuperAdmin();
    const users = AuthManager.getAllUsersForSuperAdmin();
    setDealerships(allDealerships);
    setAllUsers(users);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
    }
  };

  const toggleDealershipStatus = (dealershipId: string) => {
    const dealership = dealerships.find(d => d.id === dealershipId);
    if (dealership) {
      const updatedDealership = { ...dealership, isActive: !dealership.isActive };
      AuthManager.updateDealership(updatedDealership);
      loadData();
    }
  };

  const getSubscriptionColor = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'premium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'basic':
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getTotalRevenue = () => {
    return dealerships.reduce((total, dealership) => {
      const monthlyRate = dealership.subscriptionPlan === 'enterprise' ? 999 :
                         dealership.subscriptionPlan === 'premium' ? 299 : 99;
      return total + (dealership.isActive ? monthlyRate : 0);
    }, 0);
  };

  const getActiveUsers = () => {
    return allUsers.filter(u => u.isActive).length;
  };

  const getActiveDealerships = () => {
    return dealerships.filter(d => d.isActive).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50/30 to-blue-50/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  ReconPro Platform
                  <Crown className="w-5 h-5 text-purple-600" />
                </h1>
                <p className="text-sm text-gray-600">Super Administrator Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-purple-600 font-semibold">Platform Administrator</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Navigation */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Platform Overview', icon: BarChart3 },
              { id: 'dealerships', label: 'Dealerships', icon: Building2, count: dealerships.length },
              { id: 'users', label: 'Users', icon: Users, count: allUsers.length },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                  activeView === item.id
                    ? 'bg-purple-100 text-purple-700 shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
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

        {/* Overview */}
        {activeView === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      ${getTotalRevenue().toLocaleString()}/mo
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Dealerships</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{getActiveDealerships()}</p>
                    <p className="text-sm text-gray-500">of {dealerships.length} total</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Users</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{getActiveUsers()}</p>
                    <p className="text-sm text-gray-500">across all dealerships</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Platform Health</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">Excellent</p>
                    <p className="text-sm text-gray-500">All systems operational</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Dealerships */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Dealerships</h3>
              <div className="space-y-4">
                {dealerships.slice(0, 5).map((dealership) => (
                  <div key={dealership.id} className="flex items-center justify-between p-4 bg-gray-50/80 rounded-lg border border-gray-200/60">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{dealership.name}</h4>
                        <p className="text-sm text-gray-600">{dealership.city}, {dealership.state}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getSubscriptionColor(dealership.subscriptionPlan)}`}>
                        {dealership.subscriptionPlan.charAt(0).toUpperCase() + dealership.subscriptionPlan.slice(1)}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        dealership.isActive 
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {dealership.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            Suspended
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dealerships */}
        {activeView === 'dealerships' && (
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              <div className="p-6 border-b border-gray-200/60">
                <h3 className="text-lg font-semibold text-gray-900">All Dealerships ({dealerships.length})</h3>
              </div>
              
              <div className="divide-y divide-gray-200/60">
                {dealerships.map((dealership) => {
                  const dealershipUsers = allUsers.filter(u => u.dealershipId === dealership.id);
                  
                  return (
                    <div key={dealership.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold text-gray-900 text-lg">{dealership.name}</h4>
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getSubscriptionColor(dealership.subscriptionPlan)}`}>
                                {dealership.subscriptionPlan.charAt(0).toUpperCase() + dealership.subscriptionPlan.slice(1)}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                dealership.isActive 
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : 'bg-red-100 text-red-800 border-red-200'
                              }`}>
                                {dealership.isActive ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <AlertTriangle className="w-3 h-3" />
                                    Suspended
                                  </>
                                )}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{dealership.city}, {dealership.state}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>{dealership.phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <span>{dealership.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>{dealershipUsers.length} users</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Joined {formatDate(dealership.createdAt)}</span>
                              </div>
                              {dealership.website && (
                                <div className="flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  <a href={dealership.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                                    Website
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedDealership(dealership)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleDealershipStatus(dealership.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              dealership.isActive
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={dealership.isActive ? 'Suspend' : 'Activate'}
                          >
                            {dealership.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {activeView === 'users' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-gray-200/60">
              <h3 className="text-lg font-semibold text-gray-900">All Users ({allUsers.length})</h3>
            </div>
            
            <div className="divide-y divide-gray-200/60">
              {allUsers.map((user) => {
                const userDealership = dealerships.find(d => d.id === user.dealershipId);
                
                return (
                  <div key={user.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">{user.initials}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{user.firstName} {user.lastName}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{user.email}</span>
                            <span>•</span>
                            <span className="capitalize">{user.role}</span>
                            {userDealership && (
                              <>
                                <span>•</span>
                                <span>{userDealership.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                        
                        <div className="text-right text-xs text-gray-500">
                          <div>Joined {formatDate(user.createdAt)}</div>
                          {user.lastLogin && (
                            <div>Last login: {formatDate(user.lastLogin)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Analytics */}
        {activeView === 'analytics' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Platform Analytics</h3>
            <p className="text-gray-600">Comprehensive platform analytics and reporting coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;