export interface CompletionEvent {
  id: string;
  vehicleId: string;
  vehicleName: string; // e.g., "2023 Honda Accord"
  section: 'emissions' | 'cosmetic' | 'mechanical' | 'cleaned' | 'photos';
  sectionName: string;
  completedBy: string;
  completedDate: string;
  timestamp: string;
  itemName?: string; // NEW: Specific item that was updated
  oldRating?: string; // NEW: Previous rating
  newRating?: string; // NEW: New rating
}

export interface DailyAnalytics {
  date: string; // YYYY-MM-DD format
  totalCompletions: number;
  completionsBySection: {
    emissions: number;
    cosmetic: number;
    mechanical: number;
    cleaned: number;
    photos: number;
  };
  completionsByUser: Record<string, number>;
  vehiclesCompleted: string[]; // Vehicle IDs that were fully completed this day
  events: CompletionEvent[];
}

export interface WeeklyAnalytics {
  weekStart: string; // YYYY-MM-DD format (Monday)
  weekEnd: string;
  totalCompletions: number;
  averageCompletionsPerDay: number;
  mostProductiveDay: {
    date: string;
    completions: number;
  };
  topPerformer: {
    userInitials: string;
    completions: number;
  };
  sectionBreakdown: {
    emissions: number;
    cosmetic: number;
    mechanical: number;
    cleaned: number;
    photos: number;
  };
  vehiclesFullyCompleted: number;
  dailyData: DailyAnalytics[];
}

export interface MonthlyAnalytics {
  month: string; // YYYY-MM format
  monthName: string; // e.g., "January 2024"
  totalCompletions: number;
  averageCompletionsPerDay: number;
  totalWorkingDays: number;
  bestWeek: {
    weekStart: string;
    completions: number;
  };
  topPerformer: {
    userInitials: string;
    completions: number;
  };
  sectionBreakdown: {
    emissions: number;
    cosmetic: number;
    mechanical: number;
    cleaned: number;
    photos: number;
  };
  vehiclesFullyCompleted: number;
  weeklyData: WeeklyAnalytics[];
  trends: {
    completionsGrowth: number; // Percentage change from previous month
    efficiencyTrend: 'improving' | 'declining' | 'stable';
  };
}

// NEW: User-specific analytics interfaces
export interface UserDailyAnalytics {
  date: string;
  userInitials: string;
  totalCompletions: number;
  completionsBySection: {
    emissions: number;
    cosmetic: number;
    mechanical: number;
    cleaned: number;
    photos: number;
  };
  vehiclesWorkedOn: string[];
  events: CompletionEvent[];
  hoursWorked?: number; // Optional for future enhancement
}

export interface UserWeeklyAnalytics {
  weekStart: string;
  weekEnd: string;
  userInitials: string;
  totalCompletions: number;
  averageCompletionsPerDay: number;
  mostProductiveDay: {
    date: string;
    completions: number;
  };
  sectionBreakdown: {
    emissions: number;
    cosmetic: number;
    mechanical: number;
    cleaned: number;
    photos: number;
  };
  vehiclesWorkedOn: string[];
  dailyData: UserDailyAnalytics[];
}

export interface UserMonthlyAnalytics {
  month: string;
  monthName: string;
  userInitials: string;
  totalCompletions: number;
  averageCompletionsPerDay: number;
  totalWorkingDays: number;
  bestWeek: {
    weekStart: string;
    completions: number;
  };
  sectionBreakdown: {
    emissions: number;
    cosmetic: number;
    mechanical: number;
    cleaned: number;
    photos: number;
  };
  vehiclesWorkedOn: string[];
  weeklyData: UserWeeklyAnalytics[];
  trends: {
    completionsGrowth: number;
    efficiencyTrend: 'improving' | 'declining' | 'stable';
  };
}

export interface UserYearlyAnalytics {
  year: string;
  userInitials: string;
  totalCompletions: number;
  averageCompletionsPerMonth: number;
  totalWorkingDays: number;
  bestMonth: {
    month: string;
    completions: number;
  };
  sectionBreakdown: {
    emissions: number;
    cosmetic: number;
    mechanical: number;
    cleaned: number;
    photos: number;
  };
  vehiclesWorkedOn: string[];
  monthlyData: UserMonthlyAnalytics[];
  trends: {
    completionsGrowth: number;
    efficiencyTrend: 'improving' | 'declining' | 'stable';
  };
}

export interface AnalyticsData {
  dailyAnalytics: Record<string, DailyAnalytics>;
  weeklyAnalytics: Record<string, WeeklyAnalytics>;
  monthlyAnalytics: Record<string, MonthlyAnalytics>;
  // NEW: User-specific analytics
  userDailyAnalytics: Record<string, Record<string, UserDailyAnalytics>>; // [userInitials][date]
  userWeeklyAnalytics: Record<string, Record<string, UserWeeklyAnalytics>>; // [userInitials][weekStart]
  userMonthlyAnalytics: Record<string, Record<string, UserMonthlyAnalytics>>; // [userInitials][month]
  userYearlyAnalytics: Record<string, Record<string, UserYearlyAnalytics>>; // [userInitials][year]
  lastUpdated: string;
}