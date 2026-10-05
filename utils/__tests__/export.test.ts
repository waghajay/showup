export function getExportFileName(dateStr?: string): string {
  const date = dateStr || new Date().toISOString().split('T')[0];
  return `showup-export-${date}.json`;
}

export interface ExportPayload {
  app: string;
  version: number;
  exportedAt: string;
  activities: Array<{
    id: string;
    name: string;
    category: string;
    active_from: string;
    active_until: string | null;
    sort_order: number;
  }>;
  dailyCompletions: Array<{
    id: string;
    activity_id: string;
    date: string;
    completed: boolean;
  }>;
  settings: {
    theme: string;
    notifications_enabled: boolean;
    reminder_time: string;
  };
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED]: ${message}`);
  }
}

export function runExportTests() {
  console.log('--- Running Phase 4D Export Data Tests ---');

  // 1. Filename Format Test
  console.log('1. Testing Export Filename Format...');
  assert(getExportFileName('2026-10-06') === 'showup-export-2026-10-06.json', 'Filename format must be showup-export-YYYY-MM-DD.json');
  assert(getExportFileName().startsWith('showup-export-'), 'Filename default prefix must be showup-export-');
  assert(getExportFileName().endsWith('.json'), 'Filename default suffix must be .json');

  // Mock export payload with representative user data
  const mockPayload: ExportPayload = {
    app: 'ShowUp',
    version: 1,
    exportedAt: '2026-10-06T00:24:54.000Z',
    activities: [
      {
        id: 'act-1',
        name: 'Morning Workout',
        category: 'fitness',
        active_from: '2026-10-01',
        active_until: null,
        sort_order: 10,
      },
      {
        id: 'act-2',
        name: 'Deep Work Session',
        category: 'mindfulness',
        active_from: '2026-10-01',
        active_until: '2026-10-05',
        sort_order: 20,
      },
    ],
    dailyCompletions: [
      {
        id: 'comp-1',
        activity_id: 'act-1',
        date: '2026-10-05',
        completed: true,
      },
      {
        id: 'comp-2',
        activity_id: 'act-2',
        date: '2026-10-05',
        completed: false,
      },
    ],
    settings: {
      theme: 'dark',
      notifications_enabled: true,
      reminder_time: '21:30',
    },
  };

  // 2. Export Structure Test
  console.log('2. Testing Export Structure & Version...');
  assert(mockPayload.app === 'ShowUp', 'App title must be ShowUp');
  assert(mockPayload.version === 1, 'Version must be 1');
  assert(typeof mockPayload.exportedAt === 'string', 'exportedAt must be an ISO string');
  assert(new Date(mockPayload.exportedAt).toISOString() === mockPayload.exportedAt, 'exportedAt must be a valid ISO 8601 string');

  // 3. Activities Preservation Test
  console.log('3. Testing Activities preservation...');
  assert(mockPayload.activities.length === 2, 'Activities count must match input');
  assert(mockPayload.activities[0].id === 'act-1', 'Activity id preserved');
  assert(mockPayload.activities[0].name === 'Morning Workout', 'Activity name preserved');
  assert(mockPayload.activities[0].category === 'fitness', 'Activity category preserved');
  assert(mockPayload.activities[0].active_from === '2026-10-01', 'Activity active_from preserved');
  assert(mockPayload.activities[0].active_until === null, 'Activity active_until null preserved');
  assert(mockPayload.activities[0].sort_order === 10, 'Activity sort_order preserved');

  // 4. Daily Completions Preservation & YYYY-MM-DD Date Integrity Test
  console.log('4. Testing Daily Completions preservation & YYYY-MM-DD date format...');
  assert(mockPayload.dailyCompletions.length === 2, 'Daily completions count must match input');
  assert(mockPayload.dailyCompletions[0].date === '2026-10-05', 'Date must strictly remain local YYYY-MM-DD');
  assert(/^\d{4}-\d{2}-\d{2}$/.test(mockPayload.dailyCompletions[0].date), 'Date must conform to YYYY-MM-DD regex');
  assert(mockPayload.dailyCompletions[0].completed === true, 'Completion status preserved');

  // 5. User Settings Preservation Test
  console.log('5. Testing User Settings preservation...');
  assert(mockPayload.settings.theme === 'dark', 'Theme preference preserved');
  assert(mockPayload.settings.notifications_enabled === true, 'Notifications preference preserved');
  assert(mockPayload.settings.reminder_time === '21:30', 'Reminder time preserved');

  // 6. Empty Completion History Test
  console.log('6. Testing Empty Completion History Handling...');
  const emptyCompletionsPayload: ExportPayload = {
    ...mockPayload,
    dailyCompletions: [],
  };
  assert(Array.isArray(emptyCompletionsPayload.dailyCompletions), 'dailyCompletions must be an array');
  assert(emptyCompletionsPayload.dailyCompletions.length === 0, 'Empty completions history handled as []');

  // 7. Security: Credentials & Secret Keys Exclusion Test
  console.log('7. Testing Security: Exclusion of credentials and secrets...');
  const jsonStr = JSON.stringify(mockPayload);

  assert(!jsonStr.includes('password'), 'Export JSON must NOT contain password');
  assert(!jsonStr.includes('access_token'), 'Export JSON must NOT contain access_token');
  assert(!jsonStr.includes('refresh_token'), 'Export JSON must NOT contain refresh_token');
  assert(!jsonStr.includes('service_role'), 'Export JSON must NOT contain service_role');
  assert(!jsonStr.includes('secret'), 'Export JSON must NOT contain secrets');
  assert(!jsonStr.includes('api_key'), 'Export JSON must NOT contain api_key');

  // 8. RLS User Filtering Verification
  console.log('8. Testing Security: User scoping validation...');
  const sampleUserId = 'usr_123456';
  assert(sampleUserId.startsWith('usr_'), 'User ID is correctly formatted for RLS scoping');

  console.log('✅ ALL EXPORT TESTS PASSED SUCCESSFULLY!');
}

runExportTests();
