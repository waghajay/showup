import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { CategoryType } from '../types/habit';

export type DbActivity = Database['public']['Tables']['activities']['Row'];

export function getTodayLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Fetches all currently active activities for the user on a specific date (defaults to today).
 */
export async function getUserActiveActivities(
  userId: string,
  today: string = getTodayLocalDateString()
): Promise<DbActivity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .lte('active_from', today)
    .or(`active_until.is.null,active_until.gte.${today}`)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[Activities Service] Failed to fetch active activities:', error.message);
    throw error;
  }

  return data || [];
}

/**
 * Fetches all activities (active + archived) for the user.
 */
export async function getAllUserActivities(userId: string): Promise<DbActivity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[Activities Service] Failed to fetch all activities:', error.message);
    throw error;
  }

  return data || [];
}

/**
 * Creates a new custom activity starting on the current local date (active_from = today).
 */
export async function addUserActivity(
  userId: string,
  name: string,
  category: CategoryType,
  today: string = getTodayLocalDateString()
): Promise<DbActivity> {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error('Activity name cannot be empty.');
  }

  // Determine next sort_order
  const existing = await getAllUserActivities(userId);
  const maxSortOrder = existing.reduce((max, a) => Math.max(max, a.sort_order || 0), 0);

  const newActivity = {
    user_id: userId,
    name: trimmedName,
    category,
    active_from: today,
    active_until: null,
    sort_order: maxSortOrder + 10,
  };

  const { data, error } = await supabase
    .from('activities')
    .insert([newActivity])
    .select()
    .single();

  if (error) {
    console.error('[Activities Service] Failed to add activity:', error.message);
    throw error;
  }

  return data;
}

/**
 * Archives an existing activity by setting active_until to today.
 * Respects same-day archive rule (remains historically active for today, excluded starting tomorrow).
 */
export async function archiveUserActivity(
  userId: string,
  activityId: string,
  today: string = getTodayLocalDateString()
): Promise<DbActivity> {
  const { data, error } = await supabase
    .from('activities')
    .update({
      active_until: today,
      updated_at: new Date().toISOString(),
    })
    .eq('id', activityId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('[Activities Service] Failed to archive activity:', error.message);
    throw error;
  }

  return data;
}
