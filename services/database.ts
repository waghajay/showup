import * as SQLite from 'expo-sqlite';
import { Activity, DailyCompletion, UserSettings, ActivityCategory } from '../types/db';

const DB_NAME = 'showup.db';
let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
    // Enable PRAGMA foreign keys
    await dbInstance.execAsync('PRAGMA foreign_keys = ON;');
  }
  return dbInstance;
}

/**
 * Initializes the SQLite database, creates required tables, and seeds initial data idempotently.
 */
export async function initializeDatabase(): Promise<void> {
  const db = await getDatabase();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      active_from TEXT NOT NULL,
      active_until TEXT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS daily_completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activity_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(activity_id) REFERENCES activities(id) ON DELETE CASCADE,
      UNIQUE(activity_id, date)
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      theme TEXT NOT NULL DEFAULT 'system',
      notifications_enabled INTEGER NOT NULL DEFAULT 0,
      reminder_time TEXT NOT NULL DEFAULT '21:00',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  await migrateDatabase(db);
  await seedDefaultActivities(db);
  await seedUserSettings(db);

  // Diagnostic logging for SQLite persistence verification
  const completionsCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM daily_completions;'
  );
  console.log(`[SQLite Diagnostic] Database showup.db initialized. Total daily_completions stored: ${completionsCount?.count || 0}`);
}

/**
 * Version migration handler
 */
export async function migrateDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.runAsync(
    `INSERT OR IGNORE INTO app_meta (key, value) VALUES ('database_version', '1');`
  );
}

/**
 * Seed default 11 activities idempotently if table is empty.
 */
export async function seedDefaultActivities(db: SQLite.SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM activities;'
  );

  if (result && result.count > 0) {
    // Already seeded
    return;
  }

  const nowISO = new Date().toISOString();
  const setupDate = '2026-10-05'; // Standard initial setup date YYYY-MM-DD

  const DEFAULT_ACTIVITIES: { name: string; category: ActivityCategory; sort_order: number }[] = [
    // PLACEMENT
    { name: 'DSA', category: 'PLACEMENT', sort_order: 1 },
    { name: 'Aptitude', category: 'PLACEMENT', sort_order: 2 },
    { name: 'Development / Project', category: 'PLACEMENT', sort_order: 3 },
    { name: 'Job / Internship Applications', category: 'PLACEMENT', sort_order: 4 },

    // COLLEGE
    { name: 'College Study', category: 'COLLEGE', sort_order: 5 },
    { name: 'Assignments / Viva / Exam', category: 'COLLEGE', sort_order: 6 },
    { name: 'Revision / Notes', category: 'COLLEGE', sort_order: 7 },

    // HEALTH
    { name: 'Exercise / Walk', category: 'HEALTH', sort_order: 8 },
    { name: 'Sleep 7+ Hours', category: 'HEALTH', sort_order: 9 },
    { name: 'Reading / Personal Growth', category: 'HEALTH', sort_order: 10 },

    // LIFESTYLE
    { name: 'Limit Social Media', category: 'LIFESTYLE', sort_order: 11 },
  ];

  for (const act of DEFAULT_ACTIVITIES) {
    await db.runAsync(
      `INSERT INTO activities (name, category, active_from, active_until, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, NULL, ?, ?, ?);`,
      [act.name, act.category, setupDate, act.sort_order, nowISO, nowISO]
    );
  }
}

/**
 * Seed default user settings idempotently.
 */
export async function seedUserSettings(db: SQLite.SQLiteDatabase): Promise<void> {
  const nowISO = new Date().toISOString();
  await db.runAsync(
    `INSERT OR IGNORE INTO user_settings (id, theme, notifications_enabled, reminder_time, created_at, updated_at)
     VALUES (1, 'system', 0, '21:00', ?, ?);`,
    [nowISO, nowISO]
  );
}

/**
 * Fetch all activities ordered by sort_order
 */
export async function getActivities(): Promise<Activity[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Activity>(
    'SELECT * FROM activities ORDER BY sort_order ASC;'
  );
}

/**
 * Fetch active activities for a specific date (YYYY-MM-DD)
 */
export async function getActiveActivitiesForDate(date: string): Promise<Activity[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Activity>(
    `SELECT * FROM activities
     WHERE active_from <= ? AND (active_until IS NULL OR active_until >= ?)
     ORDER BY sort_order ASC;`,
    [date, date]
  );
}

/**
 * Get completion state for a single activity on a specific date
 */
export async function getCompletion(
  activityId: number,
  date: string
): Promise<DailyCompletion | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<DailyCompletion>(
    'SELECT * FROM daily_completions WHERE activity_id = ? AND date = ?;',
    [activityId, date]
  );
}

/**
 * Upsert completion state (1 for done, 0 for undone). Only creates record on interaction.
 */
export async function upsertCompletion(
  activityId: number,
  date: string,
  completed: boolean
): Promise<void> {
  const db = await getDatabase();
  const nowISO = new Date().toISOString();
  const completedVal = completed ? 1 : 0;

  await db.runAsync(
    `INSERT INTO daily_completions (activity_id, date, completed, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(activity_id, date) DO UPDATE SET
       completed = excluded.completed,
       updated_at = excluded.updated_at;`,
    [activityId, date, completedVal, nowISO]
  );
}

/**
 * Get all completions recorded for a specific date
 */
export async function getCompletionsForDate(date: string): Promise<DailyCompletion[]> {
  const db = await getDatabase();
  return await db.getAllAsync<DailyCompletion>(
    'SELECT * FROM daily_completions WHERE date = ?;',
    [date]
  );
}

/**
 * Fetch user settings
 */
export async function getSettings(): Promise<UserSettings | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<UserSettings>(
    'SELECT * FROM user_settings WHERE id = 1;'
  );
}

/**
 * Update user settings
 */
export async function updateSettings(
  partialSettings: Partial<Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>>
): Promise<void> {
  const db = await getDatabase();
  const current = await getSettings();
  if (!current) return;

  const theme = partialSettings.theme ?? current.theme;
  const notifications_enabled =
    partialSettings.notifications_enabled ?? current.notifications_enabled;
  const reminder_time = partialSettings.reminder_time ?? current.reminder_time;
  const nowISO = new Date().toISOString();

  await db.runAsync(
    `UPDATE user_settings
     SET theme = ?, notifications_enabled = ?, reminder_time = ?, updated_at = ?
     WHERE id = 1;`,
    [theme, notifications_enabled, reminder_time, nowISO]
  );
}
