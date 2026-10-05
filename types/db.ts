export type ActivityCategory = 'PLACEMENT' | 'COLLEGE' | 'HEALTH' | 'LIFESTYLE';

export interface Activity {
  id: number;
  name: string;
  category: ActivityCategory;
  active_from: string; // YYYY-MM-DD
  active_until: string | null; // YYYY-MM-DD or null
  sort_order: number;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

export interface DailyCompletion {
  id: number;
  activity_id: number;
  date: string; // YYYY-MM-DD
  completed: number; // 0 or 1
  updated_at: string; // ISO 8601
}

export interface UserSettings {
  id: number; // 1
  theme: string; // 'system' | 'light' | 'dark'
  notifications_enabled: number; // 0 or 1
  reminder_time: string; // HH:mm format, e.g. '21:00'
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

export interface AppMeta {
  key: string;
  value: string;
}
