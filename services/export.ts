import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { supabase } from '../lib/supabase';
import { getTodayLocalDateString } from './activities';

export interface ExportedActivity {
  id: string;
  name: string;
  category: string;
  active_from: string;
  active_until: string | null;
  sort_order: number;
}

export interface ExportedCompletion {
  id: string;
  activity_id: string;
  date: string;
  completed: boolean;
}

export interface ExportedSettings {
  theme: string;
  notifications_enabled: boolean;
  reminder_time: string;
}

export interface ExportPayload {
  app: string;
  version: number;
  exportedAt: string;
  activities: ExportedActivity[];
  dailyCompletions: ExportedCompletion[];
  settings: ExportedSettings;
}

/**
  Generates the standard export filename format: showup-export-YYYY-MM-DD.json
 */
export function getExportFileName(dateStr: string = getTodayLocalDateString()): string {
  return `showup-export-${dateStr}.json`;
}

/**
  Queries Supabase for the authenticated user's data and constructs a clean ExportPayload object.
  Ensures RLS compliance (eq('user_id', userId)) and excludes sensitive credentials.
 */
export async function fetchExportPayload(userId: string): Promise<ExportPayload> {
  if (!userId) {
    throw new Error('User ID is required to fetch export data.');
  }

  // 1. Fetch User Activities
  const { data: activitiesData, error: actError } = await supabase
    .from('activities')
    .select('id, name, category, active_from, active_until, sort_order')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (actError) {
    console.error('[Export Service] Error fetching activities:', actError.message);
    throw new Error('Failed to fetch user activities for export.');
  }

  // 2. Fetch User Daily Completions
  const { data: completionsData, error: compError } = await supabase
    .from('daily_completions')
    .select('id, activity_id, date, completed')
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (compError) {
    console.error('[Export Service] Error fetching daily completions:', compError.message);
    throw new Error('Failed to fetch user completion records for export.');
  }

  // 3. Fetch User Settings
  const { data: settingsData, error: setErrors } = await supabase
    .from('user_settings')
    .select('theme, notifications_enabled, reminder_time')
    .eq('user_id', userId)
    .maybeSingle();

  if (setErrors) {
    console.error('[Export Service] Error fetching settings:', setErrors.message);
    throw new Error('Failed to fetch user settings for export.');
  }

  const defaultSettings: ExportedSettings = {
    theme: 'system',
    notifications_enabled: false,
    reminder_time: '21:00',
  };

  const cleanSettings: ExportedSettings = settingsData
    ? {
        theme: settingsData.theme || 'system',
        notifications_enabled: settingsData.notifications_enabled ?? false,
        reminder_time: settingsData.reminder_time || '21:00',
      }
    : defaultSettings;

  const payload: ExportPayload = {
    app: 'ShowUp',
    version: 1,
    exportedAt: new Date().toISOString(),
    activities: (activitiesData || []).map((a) => ({
      id: a.id,
      name: a.name,
      category: a.category,
      active_from: a.active_from,
      active_until: a.active_until,
      sort_order: a.sort_order,
    })),
    dailyCompletions: (completionsData || []).map((c) => ({
      id: c.id,
      activity_id: c.activity_id,
      date: c.date,
      completed: Boolean(c.completed),
    })),
    settings: cleanSettings,
  };

  return payload;
}

/**
  Full export pipeline:
  1. Fetches payload
  2. Writes payload JSON string to local file using Expo File API
  3. Triggers native sharing sheet (expo-sharing)
 */
export async function exportUserData(userId: string): Promise<string> {
  const payload = await fetchExportPayload(userId);
  const jsonContent = JSON.stringify(payload, null, 2);

  const fileName = getExportFileName();
  const file = new File(Paths.cache, fileName);

  try {
    file.write(jsonContent);
  } catch (e: any) {
    console.error('[Export Service] Failed to write export file to disk:', e);
    throw new Error('Failed to save export file to local storage.');
  }

  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Native file sharing is not supported on this device.');
  }

  try {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      dialogTitle: 'Export ShowUp Data',
      UTI: 'public.json',
    });
  } catch (e: any) {
    console.error('[Export Service] Native sharing cancelled or failed:', e);
    throw new Error('Sharing failed or was cancelled.');
  }

  return file.uri;
}
