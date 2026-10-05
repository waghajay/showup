import {
  calculateDailyConsistency,
  isActiveDay,
  isMissedDay,
  isStreakDay,
  getConsistencyIntensity,
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateDailyStatsForDate,
  calculateMonthlySummary,
  DailyStats,
  ActivityLifeCycle,
  CompletionRecord,
} from '../stats';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED]: ${message}`);
  }
}

function runTests() {
  console.log('--- Running Phase 3E Streak Bug Fix Audit Tests ---');

  const today = '2026-10-05';

  const makeStat = (date: string, percentage: number): DailyStats => ({
    date,
    completedCount: Math.round((percentage / 100) * 10),
    totalCount: 10,
    percentage,
    isActive: percentage > 0,
    isMissed: date < today && percentage === 0,
    isStreakDay: percentage >= 80,
    intensity: getConsistencyIntensity(percentage),
  });

  // 1. Core Formulas
  console.log('1. Testing Core Formulas...');
  assert(calculateDailyConsistency(8, 11) === 73, '8/11 should equal 73%');
  assert(calculateDailyConsistency(9, 11) === 82, '9/11 should equal 82%');
  assert(calculateDailyConsistency(11, 11) === 100, '11/11 should equal 100%');
  assert(calculateDailyConsistency(0, 11) === 0, '0/11 should equal 0%');

  assert(isActiveDay(0) === false, '0 completions -> active false');
  assert(isActiveDay(1) === true, '1 completion -> active true');

  assert(isMissedDay('2026-10-06', today, 0) === false, 'Future date not missed');
  assert(isMissedDay('2026-10-05', today, 0) === false, 'Today not missed');
  assert(isMissedDay('2026-10-04', today, 0) === true, 'Past date 0 completions is missed');

  assert(isStreakDay(80) === true, '80% is streak day');
  assert(isStreakDay(79) === false, '79% is NOT streak day');

  // 2. Exact Bug Test: 14 generated dates with NO completion data
  console.log('2. Testing Exact Bug Case: 14 generated dates with NO completion data...');
  const fourteenEmptyDates: DailyStats[] = [];
  for (let i = 14; i >= 1; i--) {
    const d = new Date(2026, 9, 5 - i + 1); // 2026-09-22 to 2026-10-05
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    fourteenEmptyDates.push(makeStat(dateStr, 0));
  }
  assert(calculateCurrentStreak(fourteenEmptyDates, today) === 0, '14 empty dates MUST yield currentStreak === 0');
  assert(calculateLongestStreak(fourteenEmptyDates) === 0, '14 empty dates MUST yield longestStreak === 0');

  // 3. CASE 1 — No data
  console.log('3. Testing CASE 1 (No data)...');
  const case1 = [
    makeStat('2026-10-01', 0),
    makeStat('2026-10-02', 0),
    makeStat('2026-10-03', 0),
    makeStat('2026-10-04', 0),
    makeStat('2026-10-05', 0),
  ];
  assert(calculateCurrentStreak(case1, today) === 0, 'CASE 1 current streak must be 0');
  assert(calculateLongestStreak(case1) === 0, 'CASE 1 longest streak must be 0');

  // 4. CASE 2 — One qualifying day
  console.log('4. Testing CASE 2 (One qualifying day)...');
  const case2 = [makeStat('2026-10-05', 90)];
  assert(calculateCurrentStreak(case2, today) === 1, 'CASE 2 current streak must be 1');
  assert(calculateLongestStreak(case2) === 1, 'CASE 2 longest streak must be 1');

  // 5. CASE 3 — Three consecutive qualifying days
  console.log('5. Testing CASE 3 (Three consecutive qualifying days)...');
  const case3 = [
    makeStat('2026-10-03', 100),
    makeStat('2026-10-04', 90),
    makeStat('2026-10-05', 82),
  ];
  assert(calculateCurrentStreak(case3, today) === 3, 'CASE 3 current streak must be 3');
  assert(calculateLongestStreak(case3) === 3, 'CASE 3 longest streak must be 3');

  // 6. CASE 4 — Broken streak
  console.log('6. Testing CASE 4 (Broken streak)...');
  const case4 = [
    makeStat('2026-10-01', 100),
    makeStat('2026-10-02', 90),
    makeStat('2026-10-03', 70), // Oct 3 failure (70%) breaks Oct 1-2 streak
    makeStat('2026-10-04', 90), // Oct 4 = 90% creates new streak
    makeStat('2026-10-05', 50), // Oct 5 = 50% (today incomplete)
  ];
  assert(calculateCurrentStreak(case4, today) === 1, 'CASE 4 current streak must be 1 (from Oct 4)');
  assert(calculateLongestStreak(case4) === 2, 'CASE 4 longest streak must be 2 (from Oct 1-2)');

  // 7. CASE 5 — Today incomplete after yesterday's streak broken earlier
  console.log('7. Testing CASE 5 (Today incomplete after yesterday failed)...');
  const case5 = [
    makeStat('2026-10-01', 100),
    makeStat('2026-10-02', 90),
    makeStat('2026-10-03', 82),
    makeStat('2026-10-04', 50), // yesterday failed (< 80%)
    makeStat('2026-10-05', 0),  // today incomplete
  ];
  assert(calculateCurrentStreak(case5, today) === 0, 'CASE 5 current streak must be 0 because Oct 4 broke historical streak');
  assert(calculateLongestStreak(case5) === 3, 'CASE 5 longest streak remains 3 (Oct 1-3)');

  // 8. CASE 6 — Today incomplete but yesterday qualifies
  console.log('8. Testing CASE 6 (Today incomplete but yesterday qualifies)...');
  const case6 = [
    makeStat('2026-10-03', 70),
    makeStat('2026-10-04', 90),
    makeStat('2026-10-05', 50), // today incomplete
  ];
  assert(calculateCurrentStreak(case6, today) === 1, 'CASE 6 current streak must be 1 (Oct 4)');

  // 9. CASE 7 — Today incomplete with older qualifying streak separated by a gap
  console.log('9. Testing CASE 7 (Today incomplete with gap before yesterday)...');
  const case7 = [
    makeStat('2026-10-01', 100),
    makeStat('2026-10-02', 90),
    makeStat('2026-10-03', 50), // GAP!
    makeStat('2026-10-04', 100),
    makeStat('2026-10-05', 50), // today incomplete
  ];
  assert(calculateCurrentStreak(case7, today) === 1, 'CASE 7 current streak MUST be 1 (NOT 2 or 3)');
  assert(calculateLongestStreak(case7) === 2, 'CASE 7 longest streak must be 2 (Oct 1-2)');

  // 10. Future dates
  console.log('10. Testing Future Dates...');
  const futureTest = [
    makeStat('2026-10-05', 90),
    makeStat('2026-10-06', 100), // future date
    makeStat('2026-10-07', 100), // future date
  ];
  assert(calculateCurrentStreak(futureTest, today) === 1, 'Future dates MUST NOT contribute to current streak');

  console.log('✅ ALL STREAK AUDIT & BUG FIX TESTS PASSED SUCCESSFULLY!');
}

runTests();
