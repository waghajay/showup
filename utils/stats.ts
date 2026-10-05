export type IntensityLevel = 0 | 1 | 2 | 3 | 4;

export interface DailyStats {
  date: string; // YYYY-MM-DD
  completedCount: number;
  totalCount: number;
  percentage: number; // Integer 0-100
  isActive: boolean; // completedCount >= 1
  isMissed: boolean; // past date with 0 completed
  isStreakDay: boolean; // percentage >= 80
  intensity: IntensityLevel;
}

export interface ActivityLifeCycle {
  id: string;
  active_from: string; // YYYY-MM-DD
  active_until?: string | null; // YYYY-MM-DD
}

export interface CompletionRecord {
  activity_id: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface MonthlySummary {
  yearMonth: string; // YYYY-MM
  averageConsistency: number; // Integer percentage
  activeDays: number;
  bestDay: { date: string; percentage: number } | null;
  weakestDay: { date: string; percentage: number } | null;
  longestStreak: number;
}

export const INTENSITY_BOUNDARIES = {
  LEVEL_0: { min: 0, max: 0 },
  LEVEL_1: { min: 1, max: 24 },
  LEVEL_2: { min: 25, max: 49 },
  LEVEL_3: { min: 50, max: 79 },
  LEVEL_4: { min: 80, max: 100 },
} as const;

/**
 * Calculates integer percentage for daily consistency.
 * Formula: completedCount / totalCount * 100, rounded to nearest integer.
 * If totalCount === 0, returns 0.
 */
export function calculateDailyConsistency(completedCount: number, totalCount: number): number {
  if (totalCount <= 0 || completedCount <= 0) {
    return 0;
  }
  const ratio = completedCount / totalCount;
  return Math.min(100, Math.round(ratio * 100));
}

/**
 * Determines whether a day is considered active.
 * Rule: completedCount >= 1.
 */
export function isActiveDay(completedCount: number): boolean {
  return completedCount >= 1;
}

/**
 * Determines whether a calendar date is a missed day.
 * Rules:
 * - Future date (date > today) -> false (NOT missed)
 * - Today (date === today) -> false (NOT missed)
 * - Past date (date < today) with completedCount === 0 -> true (missed)
 * - Past date (date < today) with completedCount >= 1 -> false (NOT missed)
 */
export function isMissedDay(date: string, today: string, completedCount: number): boolean {
  if (date >= today) {
    return false;
  }
  return completedCount === 0;
}

/**
 * Determines whether a day qualifies as a streak day.
 * Rule: consistencyPercentage >= 80.
 */
export function isStreakDay(consistencyPercentage: number): boolean {
  return consistencyPercentage >= 80;
}

/**
 * Maps consistency percentage to calendar intensity level (0 to 4).
 * Boundaries:
 * 0: 0%
 * 1: 1 - 24%
 * 2: 25 - 49%
 * 3: 50 - 79%
 * 4: 80 - 100%
 */
export function getConsistencyIntensity(percentage: number): IntensityLevel {
  if (percentage <= 0) return 0;
  if (percentage <= 24) return 1;
  if (percentage <= 49) return 2;
  if (percentage <= 79) return 3;
  return 4;
}

/**
 * Calculates current streak count (consecutive qualifying days >= 80%).
 *
 * Edge Case Behavior:
 * 1. Future dates (date > today) are excluded.
 * 2. If today qualifies (>= 80%), streak count starts counting backward from today.
 * 3. If today is incomplete / does not qualify (< 80%), today is in-progress and NOT counted as a broken streak.
 *    The engine counts backward starting from yesterday (or the most recent qualifying past day).
 * 4. Any past date (< today) that does NOT qualify (or has no data) breaks the streak sequence.
 */
export function calculateCurrentStreak(dailyStats: DailyStats[], today: string): number {
  if (!dailyStats || dailyStats.length === 0) {
    return 0;
  }

  // Filter out future dates and create date map
  const validStats = dailyStats.filter((s) => s.date <= today);
  const statsMap = new Map<string, DailyStats>();
  validStats.forEach((s) => statsMap.set(s.date, s));

  // Determine starting date for backward check
  const todayStat = statsMap.get(today);
  let checkDate: Date;

  if (todayStat && todayStat.isStreakDay) {
    // Today qualifies! Start counting from today
    checkDate = parseDateString(today);
  } else {
    // Today is in-progress or missing. Start counting from yesterday
    const todayDate = parseDateString(today);
    todayDate.setDate(todayDate.getDate() - 1);
    checkDate = todayDate;
  }

  let streak = 0;

  while (true) {
    const dateStr = formatDateString(checkDate);
    const stat = statsMap.get(dateStr);

    if (stat && stat.isStreakDay) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Streak broken by past non-qualifying day or missing historical day
      break;
    }
  }

  return streak;
}

/**
 * Calculates the longest streak (maximum consecutive qualifying days >= 80%) in chronological history.
 */
export function calculateLongestStreak(dailyStats: DailyStats[]): number {
  if (!dailyStats || dailyStats.length === 0) {
    return 0;
  }

  // Sort chronologically ascending
  const sorted = [...dailyStats].sort((a, b) => a.date.localeCompare(b.date));

  let maxStreak = 0;
  let currentStreak = 0;

  for (const stat of sorted) {
    if (stat.isStreakDay) {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else {
      currentStreak = 0;
    }
  }

  return maxStreak;
}

/**
 * Computes DailyStats for a specific date given active activity lifecycles and completions.
 * Calculates dynamic denominator based on active activities on that date:
 * (active_from <= date AND (active_until IS NULL OR active_until >= date))
 */
export function calculateDailyStatsForDate(
  date: string,
  today: string,
  activities: ActivityLifeCycle[],
  completions: CompletionRecord[]
): DailyStats {
  // Find active activities on this date
  const activeActivities = activities.filter(
    (a) => a.active_from <= date && (!a.active_until || a.active_until >= date)
  );

  const activeIds = new Set(activeActivities.map((a) => a.id));

  // Count completions on this date for active activities
  const dateCompletions = completions.filter(
    (c) => c.date === date && c.completed && activeIds.has(c.activity_id)
  );

  const totalCount = activeActivities.length;
  const completedCount = dateCompletions.length;
  const percentage = calculateDailyConsistency(completedCount, totalCount);
  const active = isActiveDay(completedCount);
  const missed = isMissedDay(date, today, completedCount);
  const streakDay = isStreakDay(percentage);
  const intensity = getConsistencyIntensity(percentage);

  return {
    date,
    completedCount,
    totalCount,
    percentage,
    isActive: active,
    isMissed: missed,
    isStreakDay: streakDay,
    intensity,
  };
}

/**
 * Computes a monthly summary for a given yearMonth (YYYY-MM).
 * Operates on daily statistics filtered for that month up to today.
 */
export function calculateMonthlySummary(
  dailyStats: DailyStats[],
  yearMonth: string,
  today: string
): MonthlySummary {
  // Filter for month and date <= today
  const monthStats = dailyStats.filter(
    (s) => s.date.startsWith(yearMonth) && s.date <= today
  );

  if (monthStats.length === 0) {
    return {
      yearMonth,
      averageConsistency: 0,
      activeDays: 0,
      bestDay: null,
      weakestDay: null,
      longestStreak: 0,
    };
  }

  const sumConsistency = monthStats.reduce((acc, s) => acc + s.percentage, 0);
  const averageConsistency = Math.round(sumConsistency / monthStats.length);

  const activeDays = monthStats.filter((s) => s.isActive).length;

  // Best day: highest percentage
  let best = monthStats[0];
  let weakest = monthStats[0];

  for (const s of monthStats) {
    if (s.percentage > best.percentage) {
      best = s;
    }
    if (s.percentage < weakest.percentage) {
      weakest = s;
    }
  }

  const longestStreak = calculateLongestStreak(monthStats);

  return {
    yearMonth,
    averageConsistency,
    activeDays,
    bestDay: { date: best.date, percentage: best.percentage },
    weakestDay: { date: weakest.date, percentage: weakest.percentage },
    longestStreak,
  };
}

// Helpers
function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
