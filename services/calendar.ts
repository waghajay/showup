import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { MonthData, DayLog } from '../types/habit';
import {
  calculateDailyStatsForDate,
  calculateMonthlySummary,
  calculateCurrentStreak,
  DailyStats,
  ActivityLifeCycle,
  CompletionRecord,
  MonthlySummary,
} from '../utils/stats';

export type DbActivity = Database['public']['Tables']['activities']['Row'];
export type DbCompletion = Database['public']['Tables']['daily_completions']['Row'];

export interface CalendarMonthResult {
  monthData: MonthData;
  summary: MonthlySummary;
  currentStreak: number;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Returns device's local date as YYYY-MM-DD.
 */
export function getTodayLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats year, month (1-indexed), day into YYYY-MM-DD string.
 */
export function formatLocalDateString(year: number, month: number, day: number): string {
  const y = String(year);
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Fetches calendar data for a specific year and month for the authenticated user.
 */
export async function getCalendarMonthData(
  userId: string,
  year: number,
  month: number, // 1-indexed (1 = Jan, 10 = Oct)
  today: string = getTodayLocalDateString()
): Promise<CalendarMonthResult> {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0 = Sun, 1 = Mon...

  const startDateStr = formatLocalDateString(year, month, 1);
  const endDateStr = formatLocalDateString(year, month, daysInMonth);
  const yearMonthStr = `${year}-${String(month).padStart(2, '0')}`;

  // Calculate streak start date (at least 60 days prior to today to ensure streak across month boundaries)
  const todayDateObj = parseDateString(today);
  const streakStartObj = new Date(todayDateObj);
  streakStartObj.setDate(streakStartObj.getDate() - 60);
  const streakStartStr = formatDateObject(streakStartObj);

  const queryStartStr = streakStartStr < startDateStr ? streakStartStr : startDateStr;
  const queryEndStr = endDateStr > today ? endDateStr : today;

  // 1. Fetch user activities active during query range
  const { data: activitiesData, error: actError } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .lte('active_from', queryEndStr)
    .or(`active_until.is.null,active_until.gte.${queryStartStr}`)
    .order('sort_order', { ascending: true });

  if (actError) {
    console.error('[Calendar Service] Failed to fetch activities:', actError.message);
    throw actError;
  }

  const activities: DbActivity[] = activitiesData || [];

  // 2. Fetch completions for query range
  const { data: completionsData, error: compError } = await supabase
    .from('daily_completions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', queryStartStr)
    .lte('date', queryEndStr);

  if (compError) {
    console.error('[Calendar Service] Failed to fetch completions:', compError.message);
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

  // Build daily stats for all days in month
  const monthDailyStats: DailyStats[] = [];
  const days: DayLog[] = [];

  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const dateStr = formatLocalDateString(year, month, dayNum);
    const stat = calculateDailyStatsForDate(dateStr, today, lifecycles, completionRecords);
    monthDailyStats.push(stat);

    // Active activities on date
    const activeActivities = activities.filter(
      (a) => a.active_from <= dateStr && (!a.active_until || a.active_until >= dateStr)
    );

    const activeIds = new Set(activeActivities.map((a) => a.id));

    // Completed completions on date
    const completedSet = new Set(
      completions
        .filter((c) => c.date === dateStr && c.completed && activeIds.has(c.activity_id))
        .map((c) => c.activity_id)
    );

    const activitiesCompleted: string[] = [];
    const activitiesMissed: string[] = [];

    activeActivities.forEach((act) => {
      if (completedSet.has(act.id)) {
        activitiesCompleted.push(act.name);
      } else {
        // Future dates do NOT list activities as missed
        if (dateStr <= today) {
          activitiesMissed.push(act.name);
        }
      }
    });

    days.push({
      date: dateStr,
      dayNumber: dayNum,
      intensity: stat.intensity,
      completedCount: stat.completedCount,
      totalCount: stat.totalCount,
      activitiesCompleted,
      activitiesMissed,
    });
  }

  // Calculate Monthly Summary using Phase 3E engine
  const summary = calculateMonthlySummary(monthDailyStats, yearMonthStr, today);

  // Calculate current streak across historical date range up to today
  const streakDailyStats: DailyStats[] = [];
  const streakCurr = new Date(streakStartObj);
  while (formatDateObject(streakCurr) <= today) {
    const dStr = formatDateObject(streakCurr);
    const stat = calculateDailyStatsForDate(dStr, today, lifecycles, completionRecords);
    streakDailyStats.push(stat);
    streakCurr.setDate(streakCurr.getDate() + 1);
  }

  const currentStreak = calculateCurrentStreak(streakDailyStats, today);

  const monthData: MonthData = {
    monthName: MONTH_NAMES[month - 1],
    year,
    daysInMonth,
    firstDayOfWeek,
    days,
  };

  return {
    monthData,
    summary,
    currentStreak,
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
