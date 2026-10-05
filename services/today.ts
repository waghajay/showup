import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import {
  calculateCurrentStreak,
  calculateDailyStatsForDate,
  ActivityLifeCycle,
  DailyStats,
} from '../utils/stats';

export type DbActivity = Database['public']['Tables']['activities']['Row'];
export type DbCompletion = Database['public']['Tables']['daily_completions']['Row'];

/**
 * Returns device's local calendar date in YYYY-MM-DD format.
 */
export function getTodayLocalDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a Date object into human readable date text for header (e.g., "Monday, October 5, 2026")
 */
export function getFormattedDateText(): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Date().toLocaleDateString('en-US', options);
}

/**
 * Fetches active activities for the authenticated user for today.
 * Filters by: active_from <= today AND (active_until IS NULL OR active_until >= today)
 * Sorted by: sort_order ASC
 */
export async function getTodayActivities(userId: string): Promise<DbActivity[]> {
  const today = getTodayLocalDate();

  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .lte('active_from', today)
    .or(`active_until.is.null,active_until.gte.${today}`)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[Today Service] Failed to fetch activities:', error.message);
    throw error;
  }

  return data || [];
}

/**
 * Fetches today's completions for the authenticated user.
 */
export async function getTodayCompletions(userId: string): Promise<DbCompletion[]> {
  const today = getTodayLocalDate();

  const { data, error } = await supabase
    .from('daily_completions')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today);

  if (error) {
    console.error('[Today Service] Failed to fetch today completions:', error.message);
    throw error;
  }

  return data || [];
}

/**
 * Sets activity completion state for today.
 * If completed is true: UPSERTS a record into daily_completions (completed: true).
 * If completed is false: DELETES the record from daily_completions.
 */
export async function setActivityCompletion(
  userId: string,
  activityId: string,
  completed: boolean
): Promise<void> {
  const today = getTodayLocalDate();

  if (completed) {
    const { error } = await supabase
      .from('daily_completions')
      .upsert(
        {
          user_id: userId,
          activity_id: activityId,
          date: today,
          completed: true,
        },
        { onConflict: 'user_id,activity_id,date' }
      );

    if (error) {
      console.error('[Today Service] Failed to upsert completion:', error.message);
      throw error;
    }
  } else {
    const { error } = await supabase
      .from('daily_completions')
      .delete()
      .eq('user_id', userId)
      .eq('activity_id', activityId)
      .eq('date', today);

    if (error) {
      console.error('[Today Service] Failed to delete completion:', error.message);
      throw error;
    }
  }
}

/**
 * Fetches recent daily completions (past 60 days) from Supabase and computes live current streak.
 */
export async function getUserStreak(userId: string): Promise<number> {
  const today = getTodayLocalDate();

  // 1. Fetch user activities
  const activities = await getTodayActivities(userId);
  if (!activities || activities.length === 0) {
    return 0;
  }

  // 2. Determine date range for recent history (60 days back)
  const todayDate = new Date();
  const startDateObj = new Date(todayDate);
  startDateObj.setDate(startDateObj.getDate() - 60);

  const startDateStr = formatDateStr(startDateObj);

  // 3. Query daily_completions from Supabase for past 60 days
  const { data: completionsData, error } = await supabase
    .from('daily_completions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDateStr)
    .lte('date', today);

  if (error) {
    console.error('[Today Service] Failed to fetch completions for streak:', error.message);
    return 0;
  }

  const completions = completionsData || [];

  // 4. Map activities to ActivityLifeCycle format
  const activityLifecycles: ActivityLifeCycle[] = activities.map((a) => ({
    id: a.id,
    active_from: a.active_from,
    active_until: a.active_until,
  }));

  // 5. Generate daily stats for every calendar day from startDateStr to today
  const dailyStats: DailyStats[] = [];
  const curr = new Date(startDateObj);

  while (formatDateStr(curr) <= today) {
    const dStr = formatDateStr(curr);
    const stat = calculateDailyStatsForDate(dStr, today, activityLifecycles, completions);
    dailyStats.push(stat);
    curr.setDate(curr.getDate() + 1);
  }

  // 6. Calculate current streak using pure calculation engine
  return calculateCurrentStreak(dailyStats, today);
}

function formatDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
