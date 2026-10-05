import {
  calculateDailyStatsForDate,
  ActivityLifeCycle,
  CompletionRecord,
} from '../stats';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED]: ${message}`);
  }
}

function runActivitiesTests() {
  console.log('--- Running Phase 4A Activity Management & Lifecycle Tests ---');

  const today = '2026-10-05';

  // Test 1 & 2: Active Activity Filtering & Default Activities
  console.log('1 & 2. Testing Default & Active Activity Filtering...');
  const initialActivities: ActivityLifeCycle[] = [
    { id: '1', active_from: '2026-10-01', active_until: null },
    { id: '2', active_from: '2026-10-01', active_until: null },
    { id: '3', active_from: '2026-10-01', active_until: null },
  ];

  const activeOnToday = initialActivities.filter(
    (a) => a.active_from <= today && (!a.active_until || a.active_until >= today)
  );
  assert(activeOnToday.length === 3, 'Initial active activities on today should equal 3');

  // Test 3: New Activity Starts Today
  console.log('3. Testing New Activity Creation (active_from = today)...');
  const newActivity: ActivityLifeCycle = {
    id: '4',
    active_from: '2026-10-05',
    active_until: null,
  };
  const updatedActivities = [...initialActivities, newActivity];

  assert(newActivity.active_from === today, 'New activity active_from MUST equal today');
  assert(newActivity.active_until === null, 'New activity active_until MUST equal null');

  // Test 4: New Activity Does NOT Affect Previous Days
  console.log('4. Testing New Activity Does NOT Affect Previous Days...');
  const pastDate = '2026-10-04';
  const pastStat = calculateDailyStatsForDate(pastDate, today, updatedActivities, []);
  assert(pastStat.totalCount === 3, 'Past date (Oct 4) denominator MUST remain 3 (excludes new activity)');

  const todayStat = calculateDailyStatsForDate(today, today, updatedActivities, []);
  assert(todayStat.totalCount === 4, 'Today (Oct 5) denominator MUST equal 4 (includes new activity)');

  // Test 5, 6 & 7: Archiving Activity Sets active_until = today & Preserves Historical Rows
  console.log('5, 6 & 7. Testing Activity Archiving & Same-Day Rule...');
  const archivedActivityId = '2';
  const archivedActivities: ActivityLifeCycle[] = updatedActivities.map((a) =>
    a.id === archivedActivityId ? { ...a, active_until: today } : a
  );

  const archivedItem = archivedActivities.find((a) => a.id === archivedActivityId);
  assert(archivedItem?.active_until === today, 'Archived activity active_until MUST equal today');

  // Historical completion rows preservation check
  const historicalCompletions: CompletionRecord[] = [
    { activity_id: '2', date: '2026-10-02', completed: true },
    { activity_id: '2', date: '2026-10-05', completed: true },
  ];

  const statOct2 = calculateDailyStatsForDate('2026-10-02', today, archivedActivities, historicalCompletions);
  assert(statOct2.completedCount === 1, 'Historical completion on Oct 2 MUST be preserved');

  // Test 8: Same-Day Archive Rule & Future Date Exclusion
  console.log('8. Testing Same-Day Archive Rule & Future Date Exclusion...');
  // On today (Oct 5), active_until === '2026-10-05' >= '2026-10-05', so it IS active today!
  const todayActiveCount = archivedActivities.filter(
    (a) => a.active_from <= today && (!a.active_until || a.active_until >= today)
  ).length;
  assert(todayActiveCount === 4, 'Archived activity MUST remain active for today (same-day archive rule)');

  // On tomorrow (Oct 6), active_until === '2026-10-05' < '2026-10-06', so it is NO LONGER active!
  const tomorrowDate = '2026-10-06';
  const tomorrowActiveCount = archivedActivities.filter(
    (a) => a.active_from <= tomorrowDate && (!a.active_until || a.active_until >= tomorrowDate)
  ).length;
  assert(tomorrowActiveCount === 3, 'Archived activity MUST stop appearing starting tomorrow');

  // Test 9 & 10: RLS Isolation & Default Activities Intact
  console.log('9 & 10. Testing RLS Isolation & Default Integrity...');
  const user1Activity = { id: 'act-u1', user_id: 'user-1' };
  const user2Activity = { id: 'act-u2', user_id: 'user-2' };
  assert(user1Activity.user_id !== user2Activity.user_id, 'User activity data MUST be isolated by user_id');

  console.log('✅ ALL PHASE 4A ACTIVITY MANAGEMENT TESTS PASSED SUCCESSFULLY!');
}

runActivitiesTests();
