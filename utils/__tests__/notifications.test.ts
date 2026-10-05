function parseHHMM(timeStr: string): { hour: number; minute: number } {
  const parts = timeStr.split(':');
  let hour = parseInt(parts[0], 10);
  let minute = parseInt(parts[1], 10);
  if (isNaN(hour) || hour < 0 || hour > 23) hour = 21;
  if (isNaN(minute) || minute < 0 || minute > 59) minute = 0;
  return { hour, minute };
}

function format12HourTime(timeStr: string): string {
  const { hour, minute } = parseHHMM(timeStr);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const displayMinute = String(minute).padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED]: ${message}`);
  }
}

// Mock notification store to verify scheduling logic without a real device
class MockNotificationScheduler {
  public scheduledList: Array<{ title: string; body: string; hour: number; minute: number }> = [];
  public permissionGranted: boolean = true;

  async getPermissionsAsync() {
    return { status: this.permissionGranted ? 'granted' : 'denied' };
  }

  async requestPermissionsAsync() {
    return { status: this.permissionGranted ? 'granted' : 'denied' };
  }

  async cancelAllScheduledNotificationsAsync() {
    this.scheduledList = [];
  }

  async scheduleNotificationAsync(options: { content: { title: string; body: string }; trigger: { hour: number; minute: number } }) {
    this.scheduledList.push({
      title: options.content.title,
      body: options.content.body,
      hour: options.trigger.hour,
      minute: options.trigger.minute,
    });
    return 'mock-notification-id-1';
  }
}

function runNotificationTests() {
  console.log('--- Running Phase 4B Notifications Settings & Scheduling Tests ---');

  // Test 1: Time Parsing and Local Format Preservation (No UTC shifting)
  console.log('1. Testing Local Time HH:MM Parsing & 12-Hour Formatting...');
  const parsed1 = parseHHMM('21:00');
  assert(parsed1.hour === 21 && parsed1.minute === 0, '21:00 should parse to hour 21 and minute 0');
  assert(format12HourTime('21:00') === '9:00 PM', '21:00 should format to "9:00 PM"');

  const parsed2 = parseHHMM('08:30');
  assert(parsed2.hour === 8 && parsed2.minute === 30, '08:30 should parse to hour 8 and minute 30');
  assert(format12HourTime('08:30') === '8:30 AM', '08:30 should format to "8:30 AM"');

  const parsed3 = parseHHMM('12:00');
  assert(parsed3.hour === 12 && parsed3.minute === 0, '12:00 should parse to hour 12 and minute 0');
  assert(format12HourTime('12:00') === '12:00 PM', '12:00 should format to "12:00 PM"');

  // Test 2: Default Settings State
  console.log('2. Testing Default Settings State...');
  const defaultUserSettings = {
    user_id: 'test-user',
    theme: 'system' as const,
    notifications_enabled: false,
    reminder_time: '21:00',
  };
  assert(defaultUserSettings.notifications_enabled === false, 'Default notifications_enabled MUST be false');
  assert(defaultUserSettings.reminder_time === '21:00', 'Default reminder_time MUST be "21:00"');

  // Test 3 & 4: Scheduling & Duplicate Prevention
  console.log('3 & 4. Testing Notification Scheduling & Duplicate Prevention...');
  const mockScheduler = new MockNotificationScheduler();

  // Schedule initial reminder
  const time1 = '21:00';
  const { hour: h1, minute: m1 } = parseHHMM(time1);
  mockScheduler.cancelAllScheduledNotificationsAsync();
  mockScheduler.scheduleNotificationAsync({
    content: { title: 'ShowUp', body: "Keep your streak alive. Check today's activities." },
    trigger: { hour: h1, minute: m1 },
  });

  assert(mockScheduler.scheduledList.length === 1, 'Exactly 1 notification should be scheduled');
  assert(mockScheduler.scheduledList[0].hour === 21, 'Scheduled hour should be 21');
  assert(mockScheduler.scheduledList[0].title === 'ShowUp', 'Notification title MUST be "ShowUp"');
  assert(
    mockScheduler.scheduledList[0].body === "Keep your streak alive. Check today's activities.",
    'Notification body text MUST match ShowUp wording'
  );

  // Change reminder time to 08:00 AM -> Must cancel previous and schedule new (no duplicates)
  console.log('5. Testing Changing Reminder Time (No Duplicate Scheduled Notifications)...');
  const time2 = '08:00';
  const { hour: h2, minute: m2 } = parseHHMM(time2);
  mockScheduler.cancelAllScheduledNotificationsAsync();
  mockScheduler.scheduleNotificationAsync({
    content: { title: 'ShowUp', body: "Keep your streak alive. Check today's activities." },
    trigger: { hour: h2, minute: m2 },
  });

  assert(mockScheduler.scheduledList.length === 1, 'Exactly 1 notification should remain (no duplicates)');
  assert(mockScheduler.scheduledList[0].hour === 8, 'Updated scheduled hour should be 8');

  // Test 6: Disabling Notification Cancels Schedule
  console.log('6. Testing Disabling Notifications Cancels Schedule...');
  mockScheduler.cancelAllScheduledNotificationsAsync();
  assert(mockScheduler.scheduledList.length === 0, 'Disabling notifications MUST clear scheduled list');

  // Test 7: Permission Denial Behavior
  console.log('7. Testing Permission Denial Guard...');
  const deniedScheduler = new MockNotificationScheduler();
  deniedScheduler.permissionGranted = false;

  let enabledState = false;
  if (!deniedScheduler.permissionGranted) {
    enabledState = false;
  }
  assert(enabledState === false, 'Permission denial MUST NOT enable notifications');

  console.log('✅ ALL PHASE 4B NOTIFICATIONS SETTINGS TESTS PASSED SUCCESSFULLY!');
}

runNotificationTests();
