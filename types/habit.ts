export type CategoryType = 'PLACEMENT' | 'COLLEGE' | 'HEALTH' | 'LIFESTYLE';

export interface CategoryInfo {
  key: CategoryType;
  title: string;
  badgeBg: string;
  badgeText: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  category: CategoryType;
  completed: boolean;
  subtitle?: string;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  intensity: 0 | 1 | 2 | 3 | 4;
  completedCount: number;
  totalCount: number;
  activitiesCompleted: string[];
  activitiesMissed: string[];
}

export interface MonthData {
  monthName: string;
  year: number;
  daysInMonth: number;
  firstDayOfWeek: number; // 0 = Sun, 1 = Mon ...
  days: DayLog[];
}

export interface ReportMetrics {
  overallConsistency: number; // e.g. 88
  currentStreak: number; // e.g. 14
  longestStreak: number; // e.g. 28
  activeDays: number; // e.g. 45
  totalDaysLogged: number; // e.g. 52
}

export interface TrendPoint {
  label: string;
  value: number; // 0-100 percentage
}

export interface CategoryCompletionStat {
  category: CategoryType;
  title: string;
  percentage: number;
  completedCount: number;
  totalCount: number;
  color: string;
}
