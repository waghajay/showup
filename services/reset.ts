import { supabase } from '../lib/supabase';
import { getTodayLocalDateString } from './activities';
import { cancelDailyReminder } from './notifications';

export const DEFAULT_ACTIVITIES_SPEC = [
  // PLACEMENT
  { name: 'DSA', category: 'PLACEMENT' as const, sort_order: 1 },
  { name: 'Aptitude', category: 'PLACEMENT' as const, sort_order: 2 },
  { name: 'Development / Project', category: 'PLACEMENT' as const, sort_order: 3 },
  { name: 'Job / Internship Applications', category: 'PLACEMENT' as const, sort_order: 4 },

  // COLLEGE
  { name: 'College Study', category: 'COLLEGE' as const, sort_order: 5 },
  { name: 'Assignments / Viva / Exam', category: 'COLLEGE' as const, sort_order: 6 },
  { name: 'Revision / Notes', category: 'COLLEGE' as const, sort_order: 7 },

  // HEALTH
  { name: 'Exercise / Walk', category: 'HEALTH' as const, sort_order: 8 },
  { name: 'Sleep 7+ Hours', category: 'HEALTH' as const, sort_order: 9 },
  { name: 'Reading / Personal Growth', category: 'HEALTH' as const, sort_order: 10 },

  // LIFESTYLE
  { name: 'Limit Social Media', category: 'LIFESTYLE' as const, sort_order: 11 },
];

/**
 * Resets user's ShowUp application data while keeping their Supabase auth account intact.
 *
 * Operations:
 * 1. Delete all daily_completions for user_id
 * 2. Delete all activities (custom + previous defaults) for user_id
 * 3. Re-provision default 11 activities with active_from = resetDate, active_until = null
 * 4. Reset user_settings to theme='system', notifications_enabled=false, reminder_time='21:00'
 * 5. Cancel any active local scheduled notifications
 */
export async function resetUserData(
  userId: string,
  resetDate: string = getTodayLocalDateString()
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required for resetting data.');
  }

  // 1. Delete all daily_completions for user
  const { error: compError } = await supabase
    .from('daily_completions')
    .delete()
    .eq('user_id', userId);

  if (compError) {
    console.error('[Reset Service] Error deleting daily completions:', compError.message);
    throw new Error(`Failed to delete completion history: ${compError.message}`);
  }

  // 2. Delete all activities for user
  const { error: actError } = await supabase
    .from('activities')
    .delete()
    .eq('user_id', userId);

  if (actError) {
    console.error('[Reset Service] Error deleting activities:', actError.message);
    throw new Error(`Failed to delete activities: ${actError.message}`);
  }

  // 3. Restore default 11 activities starting on resetDate
  const defaultRows = DEFAULT_ACTIVITIES_SPEC.map((act) => ({
    user_id: userId,
    name: act.name,
    category: act.category,
    active_from: resetDate,
    active_until: null,
    sort_order: act.sort_order,
  }));

  const { error: insertError } = await supabase
    .from('activities')
    .insert(defaultRows);

  if (insertError) {
    console.error('[Reset Service] Error restoring default activities:', insertError.message);
    throw new Error(`Failed to restore default activities: ${insertError.message}`);
  }

  // 4. Reset user_settings
  const resetSettings = {
    user_id: userId,
    theme: 'system' as const,
    notifications_enabled: false,
    reminder_time: '21:00',
    updated_at: new Date().toISOString(),
  };

  const { error: settingsError } = await supabase
    .from('user_settings')
    .upsert(resetSettings, { onConflict: 'user_id' });

  if (settingsError) {
    console.error('[Reset Service] Error resetting user settings:', settingsError.message);
    throw new Error(`Failed to reset user settings: ${settingsError.message}`);
  }

  // 5. Cancel local scheduled notification
  try {
    await cancelDailyReminder();
  } catch (e) {
    console.warn('[Reset Service] Failed to cancel local reminder:', e);
  }
}
