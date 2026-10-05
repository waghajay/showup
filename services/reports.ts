import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { TrendPoint, CategoryCompletionStat, CategoryType } from '../types/habit';
import {
  calculateDailyStatsForDate,
  calculateMonthlySummary,
  calculateCurrentStreak,
  calculateLongestStreak,
  DailyStats,
  ActivityLifeCycle,
  CompletionRecord,
  MonthlySummary,
} from '../utils/stats';
import { Colors } from '../constants/theme';

export type DbActivity = Database['public']['Tables']['activities']['Row'];
export type DbCompletion = Database['public']['Tables']['daily_completions']['Row'];

export interface ReportsDataResult {
  overallConsistency: number;
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
  totalDaysLogged: number;
  trendPoints: TrendPoint[];
  categoryStats: CategoryCompletionStat[];
  monthlySummary: MonthlySummary;
  performanceNote: string;
}

const CATEGORY_COLORS: Record<CategoryType, string> = {
  PLACEMENT: Colors.light.primary,
  COLLEGE: Colors.light.purple,
  HEALTH: Colors.light.warning,
  LIFESTYLE: Colors.light.success,
};

/**
 * Returns local date in YYYY-MM-DD.
 */
export function getTodayLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Fetches all user activity history and generates report metrics.
 */
export async function getReportsData(
  userId: string,
  today: string = getTodayLocalDateString()
): Promise<ReportsDataResult> {
  // 1. Fetch user activities
  const { data: activitiesData, error: actError } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .lte('active_from', today)
    .order('sort_order', { ascending: true });

  if (actError) {
    console.error('[Reports Service] Failed to fetch activities:', actError.message);
    throw actError;
  }

  const activities: DbActivity[] = activitiesData || [];

  if (activities.length === 0) {
    // Return empty state result
    const currentYearMonth = today.substring(0, 7);
    return {
      overallConsistency: 0,
      currentStreak: 0,
      longestStreak: 0,
      activeDays: 0,
      totalDaysLogged: 0,
      trendPoints: [],
      categoryStats: [],
      monthlySummary: {
        yearMonth: currentYearMonth,
        averageConsistency: 0,
        activeDays: 0,
        bestDay: null,
        weakestDay: null,
        longestStreak: 0,
      },
      performanceNote: 'No activities configured yet. Add your daily habits on Today screen to start tracking consistency.',
    };
  }

  // 2. Find earliest active_from date among activities to determine start date
  let earliestDate = today;
  activities.forEach((a) => {
    if (a.active_from && a.active_from < earliestDate) {
      earliestDate = a.active_from;
    }
  });

  // Default to at least 14 days back if user started recently
  const minStartDateObj = parseDateString(today);
  minStartDateObj.setDate(minStartDateObj.getDate() - 13);
  const minStartDateStr = formatDateObject(minStartDateObj);

  const startDateStr = earliestDate < minStartDateStr ? earliestDate : minStartDateStr;

  // 3. Query all completion records from startDateStr to today
  const { data: completionsData, error: compError } = await supabase
    .from('daily_completions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDateStr)
    .lte('date', today);

  if (compError) {
    console.error('[Reports Service] Failed to fetch completions:', compError.message);
    throw compError;
  }

  const completions: DbCompletion[] = completionsData || [];

  // Convert to pure calculation engine formats
  const lifecycles: ActivityLifeCycle[] = activities.map((a) => ({
    id: a.id,
    active_from: a.active_from,
    active_until: a.active_until,
  }));

  const completionRecords: CompletionRecord[] = completions.map((c) => ({
    activity_id: c.activity_id,
    date: c.date,
    completed: c.completed,
  }));

  // 4. Generate daily stats for every calendar day from startDateStr to today
  const dailyStats: DailyStats[] = [];
  const curr = parseDateString(startDateStr);

  while (formatDateObject(curr) <= today) {
    const dStr = formatDateObject(curr);
    const stat = calculateDailyStatsForDate(dStr, today, lifecycles, completionRecords);
    dailyStats.push(stat);
    curr.setDate(curr.getDate() + 1);
  }

  // 5. Overall Consistency & Metrics
  const totalDaysLogged = dailyStats.length;
  const sumPercentage = dailyStats.reduce((acc, s) => acc + s.percentage, 0);
  const overallConsistency =
    totalDaysLogged > 0 ? Math.round(sumPercentage / totalDaysLogged) : 0;

  const currentStreak = calculateCurrentStreak(dailyStats, today);
  const longestStreak = calculateLongestStreak(dailyStats);
  const activeDays = dailyStats.filter((s) => s.isActive).length;

  // 6. Trend Points for Line Chart (Sample up to 7 evenly spaced points across history)
  const trendPoints: TrendPoint[] = [];
  if (dailyStats.length > 0) {
    const numPoints = Math.min(7, dailyStats.length);
    const step = (dailyStats.length - 1) / (numPoints - 1 || 1);

    for (let i = 0; i < numPoints; i++) {
      const index = Math.round(i * step);
      const stat = dailyStats[index];
      const [, m, d] = stat.date.split('-');
      trendPoints.push({
        label: `${m}/${d}`,
        value: stat.percentage,
      });
    }
  }

  // 7. Activity Completion Horizontal Bar Chart (per activity performance respecting lifecycle)
  const categoryStats: CategoryCompletionStat[] = activities.map((act) => {
    // Find eligible active dates for this activity
    const eligibleDates = dailyStats.filter(
      (s) => s.date >= act.active_from && (!act.active_until || s.date <= act.active_until)
    );

    const eligibleSet = new Set(eligibleDates.map((s) => s.date));
    const completedCount = completions.filter(
      (c) => c.activity_id === act.id && c.completed && eligibleSet.has(c.date)
    ).length;

    const totalCount = eligibleDates.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const catType = (act.category || 'PLACEMENT') as CategoryType;

    return {
      category: catType,
      title: act.name,
      percentage,
      completedCount,
      totalCount,
      color: CATEGORY_COLORS[catType] || Colors.light.primary,
    };
  });

  // Sort by percentage DESC
  categoryStats.sort((a, b) => b.percentage - a.percentage);

  // 8. Monthly Performance Summary Note
  const currentYearMonth = today.substring(0, 7);
  const monthlySummary = calculateMonthlySummary(dailyStats, currentYearMonth, today);

  let performanceNote = 'Showing up daily builds consistency over time. Keep going!';
  if (categoryStats.length > 0) {
    const top = categoryStats[0];
    if (top.percentage > 0) {
      performanceNote = `Highest momentum achieved in ${top.title} (${top.percentage}%). Keep showing up daily—small steps compound into major breakthroughs.`;
    }
  }

  return {
    overallConsistency,
    currentStreak,
    longestStreak,
    activeDays,
    totalDaysLogged,
    trendPoints,
    categoryStats,
    monthlySummary,
    performanceNote,
  };
}

// Helpers
function parseDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDateObject(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
