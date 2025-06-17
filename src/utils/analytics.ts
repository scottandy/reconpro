import { CompletionEvent, DailyAnalytics, WeeklyAnalytics, MonthlyAnalytics, AnalyticsData, UserDailyAnalytics, UserWeeklyAnalytics, UserMonthlyAnalytics, UserYearlyAnalytics } from '../types/analytics';

export class AnalyticsManager {
  private static readonly STORAGE_KEY = 'vehicleAnalytics';

  // 🎯 SIMPLIFIED: Record any inspection task update
  static recordTaskUpdate(
    vehicleId: string,
    vehicleName: string,
    section: CompletionEvent['section'],
    userInitials: string,
    itemName?: string,
    oldRating?: string,
    newRating?: string
  ): void {
    const now = new Date();
    const event: CompletionEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      vehicleId,
      vehicleName,
      section,
      sectionName: this.getSectionDisplayName(section),
      completedBy: userInitials,
      completedDate: now.toISOString().split('T')[0],
      timestamp: now.toISOString(),
      itemName,
      oldRating,
      newRating
    };

    console.log(`📊 Recording task update:`, event);
    this.addTaskEvent(event);
  }

  // 🎯 LEGACY: Keep for backward compatibility
  static recordCompletion(
    vehicleId: string,
    vehicleName: string,
    section: CompletionEvent['section'],
    userInitials: string,
    itemName?: string,
    oldRating?: string,
    newRating?: string
  ): void {
    this.recordTaskUpdate(vehicleId, vehicleName, section, userInitials, itemName, oldRating, newRating);
  }

  private static getSectionDisplayName(section: CompletionEvent['section']): string {
    const names = {
      emissions: 'Emissions',
      cosmetic: 'Cosmetic',
      mechanical: 'Mechanical',
      cleaned: 'Cleaning',
      photos: 'Photography'
    };
    return names[section];
  }

  // 🎯 SIMPLIFIED: Add task event and update all analytics
  private static addTaskEvent(event: CompletionEvent): void {
    const analytics = this.getAnalyticsData();
    const dateKey = event.completedDate;
    const userInitials = event.completedBy;

    // 1. Update overall daily analytics
    this.updateOverallDailyAnalytics(analytics, event, dateKey);

    // 2. Update user-specific daily analytics
    this.updateUserDailyAnalytics(analytics, event, dateKey, userInitials);

    // 3. Save and trigger updates
    analytics.lastUpdated = new Date().toISOString();
    this.saveAnalyticsData(analytics);

    console.log(`✅ Analytics updated for ${userInitials} on ${dateKey}`);
  }

  // 🎯 SIMPLIFIED: Update overall daily analytics
  private static updateOverallDailyAnalytics(analytics: AnalyticsData, event: CompletionEvent, dateKey: string): void {
    if (!analytics.dailyAnalytics[dateKey]) {
      analytics.dailyAnalytics[dateKey] = {
        date: dateKey,
        totalCompletions: 0,
        completionsBySection: {
          emissions: 0,
          cosmetic: 0,
          mechanical: 0,
          cleaned: 0,
          photos: 0
        },
        completionsByUser: {},
        vehiclesCompleted: [],
        events: []
      };
    }

    const dailyData = analytics.dailyAnalytics[dateKey];
    dailyData.totalCompletions++;
    dailyData.completionsBySection[event.section]++;
    dailyData.completionsByUser[event.completedBy] = (dailyData.completionsByUser[event.completedBy] || 0) + 1;
    dailyData.events.push(event);
  }

  // 🎯 SIMPLIFIED: Update user-specific daily analytics
  private static updateUserDailyAnalytics(analytics: AnalyticsData, event: CompletionEvent, dateKey: string, userInitials: string): void {
    // Initialize user analytics if needed
    if (!analytics.userDailyAnalytics[userInitials]) {
      analytics.userDailyAnalytics[userInitials] = {};
    }

    if (!analytics.userDailyAnalytics[userInitials][dateKey]) {
      analytics.userDailyAnalytics[userInitials][dateKey] = {
        date: dateKey,
        userInitials,
        totalCompletions: 0,
        completionsBySection: {
          emissions: 0,
          cosmetic: 0,
          mechanical: 0,
          cleaned: 0,
          photos: 0
        },
        vehiclesWorkedOn: [],
        events: []
      };
    }

    const userDailyData = analytics.userDailyAnalytics[userInitials][dateKey];
    userDailyData.totalCompletions++;
    userDailyData.completionsBySection[event.section]++;
    userDailyData.events.push(event);
    
    if (!userDailyData.vehiclesWorkedOn.includes(event.vehicleId)) {
      userDailyData.vehiclesWorkedOn.push(event.vehicleId);
    }

    console.log(`📊 User ${userInitials} daily data updated:`, userDailyData);
  }

  // 🎯 SIMPLIFIED: Get analytics data with proper initialization
  static getAnalyticsData(): AnalyticsData {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Ensure all required structures exist
        if (!data.userDailyAnalytics) data.userDailyAnalytics = {};
        if (!data.userWeeklyAnalytics) data.userWeeklyAnalytics = {};
        if (!data.userMonthlyAnalytics) data.userMonthlyAnalytics = {};
        if (!data.userYearlyAnalytics) data.userYearlyAnalytics = {};
        return data;
      } catch (error) {
        console.error('Error parsing analytics data:', error);
      }
    }

    return {
      dailyAnalytics: {},
      weeklyAnalytics: {},
      monthlyAnalytics: {},
      userDailyAnalytics: {},
      userWeeklyAnalytics: {},
      userMonthlyAnalytics: {},
      userYearlyAnalytics: {},
      lastUpdated: new Date().toISOString()
    };
  }

  private static saveAnalyticsData(data: AnalyticsData): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    
    // Trigger storage event for real-time updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: this.STORAGE_KEY,
      newValue: JSON.stringify(data)
    }));
  }

  // 🎯 SIMPLIFIED: Get all users who have recorded tasks
  static getAllUsers(): string[] {
    const analytics = this.getAnalyticsData();
    const users = new Set<string>();
    
    // Get users from daily analytics
    Object.values(analytics.dailyAnalytics).forEach(day => {
      Object.keys(day.completionsByUser).forEach(user => users.add(user));
    });

    // Get users from user-specific analytics
    Object.keys(analytics.userDailyAnalytics).forEach(user => users.add(user));

    const result = Array.from(users).sort();
    console.log('📊 All users found:', result);
    return result;
  }

  // 🎯 SIMPLIFIED: Get user's recent daily analytics
  static getUserRecentDailyAnalytics(userInitials: string, days: number = 7): UserDailyAnalytics[] {
    const analytics = this.getAnalyticsData();
    const result: UserDailyAnalytics[] = [];
    const today = new Date();

    console.log(`📊 Getting ${days} days of data for user: ${userInitials}`);

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      const dayData = analytics.userDailyAnalytics[userInitials]?.[dateKey];
      if (dayData) {
        result.push(dayData);
        console.log(`📊 Found data for ${dateKey}:`, dayData);
      } else {
        // Create empty day data for consistency
        const emptyDay: UserDailyAnalytics = {
          date: dateKey,
          userInitials,
          totalCompletions: 0,
          completionsBySection: {
            emissions: 0,
            cosmetic: 0,
            mechanical: 0,
            cleaned: 0,
            photos: 0
          },
          vehiclesWorkedOn: [],
          events: []
        };
        result.push(emptyDay);
        console.log(`📊 Created empty data for ${dateKey}`);
      }
    }

    console.log(`📊 Final result for ${userInitials}:`, result);
    return result;
  }

  // 🎯 SIMPLIFIED: Get user's current week analytics
  static getUserCurrentWeekAnalytics(userInitials: string): UserWeeklyAnalytics | null {
    const analytics = this.getAnalyticsData();
    const today = new Date();
    const weekStart = this.getWeekStart(new Date(today));
    
    // Calculate week analytics on the fly
    const weekData = this.calculateUserWeeklyAnalytics(userInitials, weekStart);
    return weekData.totalCompletions > 0 ? weekData : null;
  }

  // 🎯 SIMPLIFIED: Get user's current month analytics
  static getUserCurrentMonthAnalytics(userInitials: string): UserMonthlyAnalytics | null {
    const analytics = this.getAnalyticsData();
    const today = new Date();
    const monthKey = today.toISOString().substring(0, 7);
    
    // Calculate month analytics on the fly
    const monthData = this.calculateUserMonthlyAnalytics(userInitials, monthKey);
    return monthData.totalCompletions > 0 ? monthData : null;
  }

  private static getWeekStart(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  private static calculateUserWeeklyAnalytics(userInitials: string, weekStart: Date): UserWeeklyAnalytics {
    const analytics = this.getAnalyticsData();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekKey = weekStart.toISOString().split('T')[0];

    const dailyData: UserDailyAnalytics[] = [];
    let totalCompletions = 0;
    let mostProductiveDay = { date: '', completions: 0 };
    const sectionBreakdown = {
      emissions: 0,
      cosmetic: 0,
      mechanical: 0,
      cleaned: 0,
      photos: 0
    };
    const vehiclesWorkedOn: string[] = [];

    // Collect data for each day of the week
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(currentDate.getDate() + i);
      const dateKey = currentDate.toISOString().split('T')[0];
      
      const dayData = analytics.userDailyAnalytics[userInitials]?.[dateKey];
      if (dayData) {
        dailyData.push(dayData);
        totalCompletions += dayData.totalCompletions;

        // Update section breakdown
        Object.keys(sectionBreakdown).forEach(section => {
          sectionBreakdown[section as keyof typeof sectionBreakdown] += 
            dayData.completionsBySection[section as keyof typeof dayData.completionsBySection];
        });

        // Track vehicles worked on
        dayData.vehiclesWorkedOn.forEach(vehicleId => {
          if (!vehiclesWorkedOn.includes(vehicleId)) {
            vehiclesWorkedOn.push(vehicleId);
          }
        });

        // Check for most productive day
        if (dayData.totalCompletions > mostProductiveDay.completions) {
          mostProductiveDay = {
            date: dateKey,
            completions: dayData.totalCompletions
          };
        }
      }
    }

    return {
      weekStart: weekKey,
      weekEnd: weekEnd.toISOString().split('T')[0],
      userInitials,
      totalCompletions,
      averageCompletionsPerDay: totalCompletions / 7,
      mostProductiveDay,
      sectionBreakdown,
      vehiclesWorkedOn,
      dailyData
    };
  }

  private static calculateUserMonthlyAnalytics(userInitials: string, monthKey: string): UserMonthlyAnalytics {
    const analytics = this.getAnalyticsData();
    const [year, month] = monthKey.split('-').map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);
    const monthName = monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    let totalCompletions = 0;
    let workingDays = 0;
    const sectionBreakdown = {
      emissions: 0,
      cosmetic: 0,
      mechanical: 0,
      cleaned: 0,
      photos: 0
    };
    const vehiclesWorkedOn: string[] = [];

    // Count working days and collect data
    const userDailyData = analytics.userDailyAnalytics[userInitials] || {};
    for (let day = 1; day <= monthEnd.getDate(); day++) {
      const dateKey = `${monthKey}-${day.toString().padStart(2, '0')}`;
      const dayData = userDailyData[dateKey];
      if (dayData && dayData.totalCompletions > 0) {
        workingDays++;
        totalCompletions += dayData.totalCompletions;

        // Update section breakdown
        Object.keys(sectionBreakdown).forEach(section => {
          sectionBreakdown[section as keyof typeof sectionBreakdown] += 
            dayData.completionsBySection[section as keyof typeof dayData.completionsBySection];
        });

        // Track vehicles worked on
        dayData.vehiclesWorkedOn.forEach(vehicleId => {
          if (!vehiclesWorkedOn.includes(vehicleId)) {
            vehiclesWorkedOn.push(vehicleId);
          }
        });
      }
    }

    return {
      month: monthKey,
      monthName,
      userInitials,
      totalCompletions,
      averageCompletionsPerDay: workingDays > 0 ? totalCompletions / workingDays : 0,
      totalWorkingDays: workingDays,
      bestWeek: { weekStart: '', completions: 0 }, // Simplified
      sectionBreakdown,
      vehiclesWorkedOn,
      weeklyData: [], // Simplified
      trends: {
        completionsGrowth: 0,
        efficiencyTrend: 'stable'
      }
    };
  }

  // 🎯 LEGACY METHODS - Keep for backward compatibility
  static getRecentDailyAnalytics(days: number = 7): DailyAnalytics[] {
    const analytics = this.getAnalyticsData();
    const result: DailyAnalytics[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      const dayData = analytics.dailyAnalytics[dateKey];
      if (dayData) {
        result.push(dayData);
      } else {
        result.push({
          date: dateKey,
          totalCompletions: 0,
          completionsBySection: {
            emissions: 0,
            cosmetic: 0,
            mechanical: 0,
            cleaned: 0,
            photos: 0
          },
          completionsByUser: {},
          vehiclesCompleted: [],
          events: []
        });
      }
    }

    return result;
  }

  static getCurrentWeekAnalytics(): WeeklyAnalytics | null {
    // Simplified implementation
    return null;
  }

  static getCurrentMonthAnalytics(): MonthlyAnalytics | null {
    // Simplified implementation
    return null;
  }

  static getTopPerformers(period: 'week' | 'month' = 'week', limit: number = 5): Array<{userInitials: string, completions: number}> {
    const analytics = this.getAnalyticsData();
    const userTotals: Record<string, number> = {};

    // Get recent data based on period
    const days = period === 'week' ? 7 : 30;
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      const dayData = analytics.dailyAnalytics[dateKey];
      if (dayData) {
        Object.entries(dayData.completionsByUser).forEach(([user, count]) => {
          userTotals[user] = (userTotals[user] || 0) + count;
        });
      }
    }

    return Object.entries(userTotals)
      .map(([userInitials, completions]) => ({ userInitials, completions }))
      .sort((a, b) => b.completions - a.completions)
      .slice(0, limit);
  }
}