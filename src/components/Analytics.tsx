import React, { useState, useEffect } from 'react';
import { AnalyticsManager } from '../utils/analytics';
import { DailyAnalytics, WeeklyAnalytics, MonthlyAnalytics, UserDailyAnalytics, UserWeeklyAnalytics, UserMonthlyAnalytics, UserYearlyAnalytics } from '../types/analytics';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Users, 
  Target, 
  Award,
  Activity,
  Clock,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Minus,
  Leaf,
  Palette,
  Wrench,
  Sparkles,
  Camera,
  PieChart,
  User,
  Eye,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';

const Analytics: React.FC = () => {
  const [activeView, setActiveView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [recentDays, setRecentDays] = useState<DailyAnalytics[]>([]);
  const [currentWeek, setCurrentWeek] = useState<WeeklyAnalytics | null>(null);
  const [currentMonth, setCurrentMonth] = useState<MonthlyAnalytics | null>(null);
  const [topPerformers, setTopPerformers] = useState<Array<{userInitials: string, completions: number}>>([]);
  
  // 🎯 NEW: User-specific analytics state
  const [allUsers, setAllUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showUserAnalytics, setShowUserAnalytics] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
    loadUserData();
  }, [activeView]);

  // 🎯 SIMPLIFIED: Listen for storage changes to refresh analytics in real-time
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'vehicleAnalytics') {
        console.log('📊 Analytics data changed, refreshing...');
        loadAnalyticsData();
        loadUserData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadAnalyticsData = () => {
    setRecentDays(AnalyticsManager.getRecentDailyAnalytics(7));
    setCurrentWeek(AnalyticsManager.getCurrentWeekAnalytics());
    setCurrentMonth(AnalyticsManager.getCurrentMonthAnalytics());
    setTopPerformers(AnalyticsManager.getTopPerformers(activeView === 'monthly' ? 'month' : 'week'));
  };

  const loadUserData = () => {
    const users = AnalyticsManager.getAllUsers();
    setAllUsers(users);
    console.log('📊 Available users for analytics:', users);
  };

  // 🎯 SIMPLIFIED: Manual refresh function
  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    loadAnalyticsData();
    loadUserData();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFullDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving':
        return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'declining':
        return <ArrowDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSectionConfig = (section: string) => {
    const configs = {
      emissions: {
        icon: Leaf,
        color: 'bg-green-500',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        label: 'Emissions'
      },
      cosmetic: {
        icon: Palette,
        color: 'bg-purple-500',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-200',
        label: 'Cosmetic'
      },
      mechanical: {
        icon: Wrench,
        color: 'bg-blue-500',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        label: 'Mechanical'
      },
      cleaned: {
        icon: Sparkles,
        color: 'bg-cyan-500',
        bgColor: 'bg-cyan-50',
        textColor: 'text-cyan-700',
        borderColor: 'border-cyan-200',
        label: 'Cleaning'
      },
      photos: {
        icon: Camera,
        color: 'bg-orange-500',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-200',
        label: 'Photos'
      }
    };
    return configs[section as keyof typeof configs] || configs.emissions;
  };

  const maxCompletions = Math.max(...recentDays.map(day => day.totalCompletions), 1);

  const CategoryBreakdownCard = ({ 
    title, 
    sectionBreakdown, 
    totalCompletions 
  }: { 
    title: string; 
    sectionBreakdown: any; 
    totalCompletions: number;
  }) => {
    const sections = Object.entries(sectionBreakdown);
    const maxSectionValue = Math.max(...sections.map(([, value]) => value as number), 1);

    return (
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-3 sm:p-6 transition-colors duration-300">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
          <div className="w-6 h-6 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
            <PieChart className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{totalCompletions} total completions</p>
          </div>
        </div>

        <div className="space-y-2 sm:space-y-4">
          {sections.map(([section, count]) => {
            const config = getSectionConfig(section);
            const Icon = config.icon;
            const percentage = totalCompletions > 0 ? ((count as number) / totalCompletions) * 100 : 0;
            const barWidth = maxSectionValue > 0 ? ((count as number) / maxSectionValue) * 100 : 0;

            return (
              <div key={section} className="space-y-1 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 sm:gap-3">
                    <div className={`w-4 h-4 sm:w-8 sm:h-8 ${config.color} rounded sm:rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-2 h-2 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <span className="text-xs sm:text-base font-medium text-gray-900 dark:text-white">{config.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs sm:text-base font-bold text-gray-900 dark:text-white">{count}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                  <div 
                    className={`${config.color} h-1.5 sm:h-2 rounded-full transition-all duration-500 shadow-sm`}
                    style={{ width: `${barWidth}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {totalCompletions === 0 && (
          <div className="text-center py-4 sm:py-6 text-gray-500 dark:text-gray-400">
            <PieChart className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
            <p className="text-xs sm:text-sm">No completions recorded yet</p>
          </div>
        )}
      </div>
    );
  };

  // 🎯 SIMPLIFIED: User Analytics Card Component with proper data loading
  const UserAnalyticsCard = ({ user }: { user: string }) => {
    // 🎯 Load user-specific data directly for this user
    const userDailyData = AnalyticsManager.getUserRecentDailyAnalytics(user, 7);
    const userWeeklyData = AnalyticsManager.getUserCurrentWeekAnalytics(user);
    const userMonthlyData = AnalyticsManager.getUserCurrentMonthAnalytics(user);
    
    // 🎯 Get today's date and find today's data
    const today = new Date().toISOString().split('T')[0];
    const todayData = userDailyData.find(d => d.date === today);
    
    // Calculate stats
    const todayCompletions = todayData?.totalCompletions || 0;
    const weekCompletions = userWeeklyData?.totalCompletions || 0;
    const monthCompletions = userMonthlyData?.totalCompletions || 0;
    
    console.log(`📊 User ${user} analytics:`, {
      today: todayCompletions,
      week: weekCompletions,
      month: monthCompletions,
      todayData,
      userDailyData
    });
    
    return (
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-4 sm:p-6 transition-colors duration-300">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{user}</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Individual Performance</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{todayCompletions}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Today</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">{weekCompletions}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">This Week</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{monthCompletions}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">This Month</div>
          </div>
        </div>

        {/* 7-Day Activity Chart */}
        <div className="mb-4 sm:mb-6">
          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Last 7 Days Activity</h4>
          <div className="space-y-1 sm:space-y-2">
            {userDailyData.map((day, index) => {
              const maxUserCompletions = Math.max(...userDailyData.map(d => d.totalCompletions), 1);
              const percentage = (day.totalCompletions / maxUserCompletions) * 100;
              
              return (
                <div key={day.date} className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 sm:w-12 text-xs font-medium text-gray-600 dark:text-gray-400">
                    {formatDate(day.date)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                      <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{day.totalCompletions}</span>
                      {day.vehiclesWorkedOn.length > 0 && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 sm:px-2 py-0.5 rounded-full font-medium">
                          {day.vehiclesWorkedOn.length} vehicles
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section Breakdown */}
        {userWeeklyData && userWeeklyData.totalCompletions > 0 && (
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">This Week by Section</h4>
            <div className="space-y-1 sm:space-y-2">
              {Object.entries(userWeeklyData.sectionBreakdown).map(([section, count]) => {
                const config = getSectionConfig(section);
                const Icon = config.icon;
                const percentage = userWeeklyData.totalCompletions > 0 ? ((count as number) / userWeeklyData.totalCompletions) * 100 : 0;
                
                return count > 0 && (
                  <div key={section} className="flex items-center justify-between">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className={`w-3 h-3 sm:w-4 sm:h-4 ${config.color} rounded flex items-center justify-center`}>
                        <Icon className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{config.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{count}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({percentage.toFixed(0)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Data State */}
        {todayCompletions === 0 && weekCompletions === 0 && monthCompletions === 0 && (
          <div className="text-center py-4 sm:py-6 text-gray-500 dark:text-gray-400">
            <Activity className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
            <p className="text-xs sm:text-sm">No activity recorded yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Complete inspection tasks to see analytics</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* MOBILE OPTIMIZED: Much smaller header */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-3 sm:p-6 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
              <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400 font-medium hidden sm:block">Track completion progress and individual performance</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 🎯 SIMPLIFIED: Manual Refresh Button */}
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-xs sm:text-sm"
              title="Refresh analytics data"
            >
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            
            {/* View Toggle */}
            <div className="flex bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-lg sm:rounded-xl p-1 sm:p-1.5 shadow-lg border border-white/20 dark:border-gray-600/20">
              <button
                onClick={() => setActiveView('daily')}
                className={`px-2 py-1 sm:px-4 sm:py-2 rounded text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  activeView === 'daily'
                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-md border border-indigo-100 dark:border-indigo-700'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-600/50'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setActiveView('weekly')}
                className={`px-2 py-1 sm:px-4 sm:py-2 rounded text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  activeView === 'weekly'
                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-md border border-indigo-100 dark:border-indigo-700'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-600/50'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setActiveView('monthly')}
                className={`px-2 py-1 sm:px-4 sm:py-2 rounded text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  activeView === 'monthly'
                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-md border border-indigo-100 dark:border-indigo-700'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-600/50'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 SIMPLIFIED: User Analytics Toggle */}
      {allUsers.length > 0 && (
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-3 sm:p-6 transition-colors duration-300">
          <button
            onClick={() => setShowUserAnalytics(!showUserAnalytics)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Individual User Analytics</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">View detailed performance for each team member ({allUsers.length} users)</p>
              </div>
            </div>
            {showUserAnalytics ? (
              <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
            )}
          </button>

          {showUserAnalytics && (
            <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
              {/* User Selection */}
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {allUsers.map((user) => (
                  <button
                    key={user}
                    onClick={() => setSelectedUser(selectedUser === user ? null : user)}
                    className={`px-2 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                      selectedUser === user
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {user}
                  </button>
                ))}
              </div>

              {/* Selected User Analytics */}
              {selectedUser && (
                <UserAnalyticsCard user={selectedUser} />
              )}

              {/* All Users Grid */}
              {!selectedUser && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {allUsers.map((user) => (
                    <div key={user} className="relative">
                      <UserAnalyticsCard user={user} />
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="absolute top-2 sm:top-4 right-2 sm:right-4 p-1.5 sm:p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                        title={`View detailed analytics for ${user}`}
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Daily View */}
      {activeView === 'daily' && (
        <div className="space-y-4 sm:space-y-8">
          {/* MOBILE OPTIMIZED: Compact Daily Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-3 sm:p-6 rounded-lg sm:rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 transition-colors duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Today's Completions</p>
                  <p className="text-lg sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {recentDays[recentDays.length - 1]?.totalCompletions || 0}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-3 sm:p-6 rounded-lg sm:rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 transition-colors duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">7-Day Average</p>
                  <p className="text-lg sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {Math.round(recentDays.reduce((sum, day) => sum + day.totalCompletions, 0) / 7)}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-3 sm:p-6 rounded-lg sm:rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 transition-colors duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Best Day</p>
                  <p className="text-lg sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {Math.max(...recentDays.map(day => day.totalCompletions))}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDate(recentDays.find(day => day.totalCompletions === Math.max(...recentDays.map(d => d.totalCompletions)))?.date || '')}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Award className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-3 sm:p-6 rounded-lg sm:rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 transition-colors duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Active Days</p>
                  <p className="text-lg sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {recentDays.filter(day => day.totalCompletions > 0).length}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">of 7 days</p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown for Daily */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            <CategoryBreakdownCard
              title="7-Day Category Breakdown"
              sectionBreakdown={recentDays.reduce((acc, day) => {
                Object.entries(day.completionsBySection).forEach(([section, count]) => {
                  acc[section] = (acc[section] || 0) + count;
                });
                return acc;
              }, {} as any)}
              totalCompletions={recentDays.reduce((sum, day) => sum + day.totalCompletions, 0)}
            />

            <CategoryBreakdownCard
              title="Today's Category Breakdown"
              sectionBreakdown={recentDays[recentDays.length - 1]?.completionsBySection || {}}
              totalCompletions={recentDays[recentDays.length - 1]?.totalCompletions || 0}
            />
          </div>

          {/* Daily Chart */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-3 sm:p-6 transition-colors duration-300">
            <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-6">Last 7 Days Activity</h3>
            <div className="space-y-2 sm:space-y-4">
              {recentDays.map((day, index) => (
                <div key={day.date} className="flex items-center gap-2 sm:gap-4">
                  <div className="w-12 sm:w-20 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                    {formatDate(day.date)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                      <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{day.totalCompletions} completions</span>
                      {day.vehiclesCompleted.length > 0 && (
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium">
                          {day.vehiclesCompleted.length} vehicles completed
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-3">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1.5 sm:h-3 rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${(day.totalCompletions / maxCompletions) * 100}%` }}
                      ></div>
                    </div>
                    {day.totalCompletions > 0 && (
                      <div className="flex gap-1 mt-1 sm:mt-2">
                        {Object.entries(day.completionsBySection).map(([section, count]) => {
                          const config = getSectionConfig(section);
                          return count > 0 && (
                            <div key={section} className="flex items-center gap-1">
                              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${config.color}`}></div>
                              <span className="text-xs text-gray-600 dark:text-gray-400">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-3 sm:p-6 transition-colors duration-300">
          <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-6 flex items-center gap-2">
            <Users className="w-4 h-4 sm:w-6 sm:h-6" />
            Top Performers ({activeView === 'monthly' ? 'This Month' : 'This Week'})
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {topPerformers.map((performer, index) => (
              <div key={performer.userInitials} className="flex items-center gap-2 sm:gap-4 p-2 sm:p-4 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-lg border border-gray-200/60 dark:border-gray-600/60">
                <div className={`w-6 h-6 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-white text-xs sm:text-base ${
                  index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                  index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                  index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                  'bg-gradient-to-br from-blue-500 to-blue-600'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white text-xs sm:text-base">{performer.userInitials}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{performer.completions} completions</p>
                </div>
                {index === 0 && (
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;