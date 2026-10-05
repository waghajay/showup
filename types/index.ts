export * from './habit';

export interface RoutineItem {
  id: string;
  title: string;
  category: import('./habit').CategoryType;
  completed: boolean;
  streak: number;
}

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  percentage: number;
  intensity: 0 | 1 | 2 | 3 | 4;
}

export interface ActivityStat {
  id: string;
  title: string;
  category: import('./habit').CategoryType;
  completionRate: number; // 0-100
  completedDays: number;
  totalDays: number;
}

export interface ReportStats {
  overallConsistency: number;
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
  totalDays: number;
  trendData: { label: string; percentage: number }[];
  activityStats: ActivityStat[];
  monthlySummary: {
    month: string;
    consistency: number;
    completedTasks: number;
    totalTasks: number;
  }[];
}

export interface UserSettingsState {
  themePreference: 'system' | 'light' | 'dark';
  notificationsEnabled: boolean;
  reminderTime: string; // HH:MM 24h format
}
