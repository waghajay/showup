import { CategoryInfo, ActivityItem, MonthData, ReportMetrics, TrendPoint, CategoryCompletionStat, CategoryType, RoutineItem } from '../types';

export const CATEGORY_ORDER: CategoryType[] = ['PLACEMENT', 'COLLEGE', 'HEALTH', 'LIFESTYLE'];

export const CATEGORIES: Record<string, CategoryInfo> = {
  PLACEMENT: {
    key: 'PLACEMENT',
    title: 'PLACEMENT',
    badgeBg: 'rgba(139, 92, 246, 0.1)',
    badgeText: '#7C3AED',
  },
  COLLEGE: {
    key: 'COLLEGE',
    title: 'COLLEGE',
    badgeBg: 'rgba(37, 99, 235, 0.1)',
    badgeText: '#2563EB',
  },
  HEALTH: {
    key: 'HEALTH',
    title: 'HEALTH',
    badgeBg: 'rgba(16, 185, 129, 0.1)',
    badgeText: '#059669',
  },
  LIFESTYLE: {
    key: 'LIFESTYLE',
    title: 'LIFESTYLE',
    badgeBg: 'rgba(245, 158, 11, 0.1)',
    badgeText: '#D97706',
  },
};

export const INITIAL_TODAY_ACTIVITIES: ActivityItem[] = [
  // PLACEMENT
  { id: '1', title: 'DSA', category: 'PLACEMENT', completed: true },
  { id: '2', title: 'Aptitude', category: 'PLACEMENT', completed: true },
  { id: '3', title: 'Development / Project', category: 'PLACEMENT', completed: true },
  { id: '4', title: 'Job / Internship Applications', category: 'PLACEMENT', completed: false },

  // COLLEGE
  { id: '5', title: 'College Study', category: 'COLLEGE', completed: true },
  { id: '6', title: 'Assignments / Viva / Exam', category: 'COLLEGE', completed: true },
  { id: '7', title: 'Revision / Notes', category: 'COLLEGE', completed: true },

  // HEALTH
  { id: '8', title: 'Exercise / Walk', category: 'HEALTH', completed: true },
  { id: '9', title: 'Sleep 7+ Hours', category: 'HEALTH', completed: true },
  { id: '10', title: 'Reading / Personal Growth', category: 'HEALTH', completed: false },

  // LIFESTYLE
  { id: '11', title: 'Limit Social Media', category: 'LIFESTYLE', completed: false },
];

export const DEFAULT_ROUTINES: RoutineItem[] = INITIAL_TODAY_ACTIVITIES.map((act) => ({
  id: act.id,
  title: act.title,
  category: act.category,
  completed: act.completed,
  streak: act.completed ? 3 : 0,
}));

export const generateMockHeatmap = () => {
  return [
    { date: '2026-10-01', intensity: 3, completedCount: 9, totalCount: 11, activitiesCompleted: ['DSA', 'Study', 'Exercise', 'Sleep'], activitiesMissed: ['Reading', 'Social Media'] },
    { date: '2026-10-02', intensity: 4, completedCount: 11, totalCount: 11, activitiesCompleted: ['All 11 completed'], activitiesMissed: [] },
    { date: '2026-10-03', intensity: 2, completedCount: 6, totalCount: 11, activitiesCompleted: ['DSA', 'Exercise', 'Sleep'], activitiesMissed: ['Aptitude', 'Applications'] },
    { date: '2026-10-04', intensity: 4, completedCount: 10, totalCount: 11, activitiesCompleted: ['10 completed'], activitiesMissed: ['Social Media'] },
    { date: '2026-10-05', intensity: 3, completedCount: 8, totalCount: 11, activitiesCompleted: ['DSA', 'Aptitude', 'Dev', 'College Study', 'DBMS', 'Revision', 'Exercise', 'Sleep'], activitiesMissed: ['Job Applications', 'Reading', 'Limit Social Media'] },
    { date: '2026-10-06', intensity: 4, completedCount: 11, totalCount: 11, activitiesCompleted: ['All completed'], activitiesMissed: [] },
  ];
};

export const MOCK_OCTOBER_2026: MonthData = {
  monthName: 'October',
  year: 2026,
  daysInMonth: 31,
  firstDayOfWeek: 4, // Thursday (1st Oct 2026)
  days: [
    { date: '2026-10-01', dayNumber: 1, intensity: 3, completedCount: 9, totalCount: 11, activitiesCompleted: ['DSA', 'Study', 'Exercise', 'Sleep'], activitiesMissed: ['Reading', 'Social Media'] },
    { date: '2026-10-02', dayNumber: 2, intensity: 4, completedCount: 11, totalCount: 11, activitiesCompleted: ['All 11 completed'], activitiesMissed: [] },
    { date: '2026-10-03', dayNumber: 3, intensity: 2, completedCount: 6, totalCount: 11, activitiesCompleted: ['DSA', 'Exercise', 'Sleep'], activitiesMissed: ['Aptitude', 'Applications'] },
    { date: '2026-10-04', dayNumber: 4, intensity: 4, completedCount: 10, totalCount: 11, activitiesCompleted: ['10 completed'], activitiesMissed: ['Social Media'] },
    { date: '2026-10-05', dayNumber: 5, intensity: 3, completedCount: 8, totalCount: 11, activitiesCompleted: ['DSA', 'Aptitude', 'Dev', 'College Study', 'DBMS', 'Revision', 'Exercise', 'Sleep'], activitiesMissed: ['Job Applications', 'Reading', 'Limit Social Media'] },
    { date: '2026-10-06', dayNumber: 6, intensity: 4, completedCount: 11, totalCount: 11, activitiesCompleted: ['All completed'], activitiesMissed: [] },
  ],
};

export const MOCK_REPORT_METRICS: ReportMetrics = {
  overallConsistency: 88,
  currentStreak: 14,
  longestStreak: 28,
  activeDays: 45,
  totalDaysLogged: 52,
};

export const MOCK_TREND_POINTS: TrendPoint[] = [
  { label: 'W1', value: 65 },
  { label: 'W2', value: 72 },
  { label: 'W3', value: 80 },
  { label: 'W4', value: 76 },
  { label: 'W5', value: 88 },
  { label: 'W6', value: 84 },
  { label: 'W7', value: 92 },
  { label: 'W8', value: 88 },
];

export const MOCK_CATEGORY_STATS: CategoryCompletionStat[] = [
  { category: 'PLACEMENT', title: 'Placement Prep', percentage: 85, completedCount: 34, totalCount: 40, color: '#8B5CF6' },
  { category: 'COLLEGE', title: 'College Studies', percentage: 92, completedCount: 23, totalCount: 25, color: '#2563EB' },
  { category: 'HEALTH', title: 'Health & Fitness', percentage: 76, completedCount: 19, totalCount: 25, color: '#10B981' },
  { category: 'LIFESTYLE', title: 'Lifestyle Discipline', percentage: 68, completedCount: 17, totalCount: 25, color: '#F59E0B' },
];

export const MOCK_REPORTS = {
  overallConsistency: 88,
  currentStreak: 14,
  longestStreak: 28,
  activeDays: 45,
  totalDaysLogged: 52,
  trendData: MOCK_TREND_POINTS.map((t) => ({ label: t.label, percentage: t.value })),
  activityStats: MOCK_CATEGORY_STATS.map((c) => ({
    title: c.title,
    category: c.category,
    completionRate: c.percentage,
    completedDays: c.completedCount,
    totalDays: c.totalCount,
  })),
};

export const MOCK_SETTINGS_SECTIONS = [
  {
    title: 'Habits & Configuration',
    items: [
      { id: 'manage_activities', label: 'Manage Activities', icon: 'ListChecks', subtext: '11 Active routines' },
      { id: 'notifications', label: 'Notifications', icon: 'Bell', subtext: 'Daily reminders at 9:00 PM' },
    ],
  },
  {
    title: 'Preferences & Theme',
    items: [
      { id: 'appearance', label: 'Appearance', icon: 'Palette', subtext: 'System Default' },
    ],
  },
  {
    title: 'Data & Privacy',
    items: [
      { id: 'export_data', label: 'Export Data', icon: 'Download', subtext: 'JSON / CSV format' },
      { id: 'reset_data', label: 'Reset Data', icon: 'Trash2', subtext: 'Clear local logs', destructive: true },
    ],
  },
  {
    title: 'App Info',
    items: [
      { id: 'about', label: 'About ShowUp', icon: 'Info', subtext: 'v1.0.0 • Consistency > Intensity' },
    ],
  },
];
