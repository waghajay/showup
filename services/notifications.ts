import Constants, { ExecutionEnvironment } from 'expo-constants';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

export type UserSettings = Database['public']['Tables']['user_settings']['Row'];

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Safely lazy-load expo-notifications to prevent Expo Go top-level evaluation crashes
function getNotificationsModule() {
  if (isExpoGo) return null;
  try {
    return require('expo-notifications');
  } catch (e) {
    return null;
  }
}

// Configure global notification handler safely if not in Expo Go
try {
  const Notifications = getNotificationsModule();
  if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  }
} catch (e) {
  console.warn('[Notifications Service] Safe warning: Notifications handler disabled in this environment.');
}

/**
 * Parses HH:MM string into hour and minute numbers.
 */
export function parseHHMM(timeStr: string): { hour: number; minute: number } {
  const parts = timeStr.split(':');
  let hour = parseInt(parts[0], 10);
  let minute = parseInt(parts[1], 10);
  if (isNaN(hour) || hour < 0 || hour > 23) hour = 21;
  if (isNaN(minute) || minute < 0 || minute > 59) minute = 0;
  return { hour, minute };
}

/**
 * Formats HH:MM string into human-readable 12-hour local time format (e.g., "9:00 PM").
 */
export function format12HourTime(timeStr: string): string {
  const { hour, minute } = parseHHMM(timeStr);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const displayMinute = String(minute).padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}

/**
 * Requests OS notification permissions safely.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    console.warn('[Notifications Service] Local notifications require a development build.');
    return false;
  }
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (error) {
    console.error('[Notifications Service] Error requesting permission:', error);
    return false;
  }
}

/**
 * Checks existing OS notification permission without prompting.
 */
export async function checkNotificationPermissions(): Promise<boolean> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return false;
  }
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('[Notifications Service] Error checking permission:', error);
    return false;
  }
}

/**
 * Cancels all scheduled local ShowUp notifications to prevent duplicates.
 */
export async function cancelDailyReminder(): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return;
  }
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('[Notifications Service] Error canceling notifications:', error);
  }
}

/**
 * Schedules a single local daily notification at the given HH:MM time.
 */
export async function scheduleDailyReminder(reminderTime: string): Promise<boolean> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    console.warn('[Notifications Service] Scheduling local notifications requires a development build.');
    return false;
  }
  try {
    const { hour, minute } = parseHHMM(reminderTime);
    await cancelDailyReminder(); // Always cancel existing first to avoid duplicates

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'ShowUp',
        body: "Keep your streak alive. Check today's activities.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
    return true;
  } catch (error) {
    console.error('[Notifications Service] Error scheduling notification:', error);
    return false;
  }
}

/**
 * Fetches or initializes user settings from Supabase.
 */
export async function getUserSettings(userId: string): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') {
    // No row found, insert default settings
    const defaultSettings = {
      user_id: userId,
      theme: 'system' as const,
      notifications_enabled: false,
      reminder_time: '21:00',
    };
    const { data: inserted, error: insertError } = await supabase
      .from('user_settings')
      .insert([defaultSettings])
      .select()
      .single();

    if (insertError) {
      console.error('[Notifications Service] Error creating default user settings:', insertError.message);
      throw insertError;
    }
    return inserted;
  }

  if (error) {
    console.error('[Notifications Service] Error fetching user settings:', error.message);
    throw error;
  }

  return data;
}

/**
 * Updates notification preferences in Supabase user_settings table.
 */
export async function updateUserSettings(
  userId: string,
  updates: Partial<UserSettings>
): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('[Notifications Service] Error updating user settings:', error.message);
    throw error;
  }

  return data;
}
