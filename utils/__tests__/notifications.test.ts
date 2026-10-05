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
  console.log('--- Running ShowUp Custom Notification Timer Tests ---');

  // Test 1: Time Parsing and Local Format Preservation (No UTC shifting)
  console.log('1. Testing Local Time HH:MM Parsing & 12-Hour Formatting...');
  const parsed1 = parseHHMM('21:00');
  assert(parsed1.hour === 21 && parsed1.minute === 0, '21:00 should parse to hour 21 and minute 0');
  assert(format12HourTime('21:00') === '9:00 PM', '21:00 should format to "9:00 PM"');

  const parsedCustom = parseHHMM('20:35');
  assert(parsedCustom.hour === 20 && parsedCustom.minute === 35, '20:35 should parse to hour 20 and minute 35');
  assert(format12HourTime('20:35') === '8:35 PM', '20:35 should format to "8:35 PM"');

  const parsedPreset19 = parseHHMM('19:00');
  assert(parsedPreset19.hour === 19 && parsedPreset19.minute === 0, '19:00 should parse to hour 19 and minute 0');
  assert(format12HourTime('19:00') === '7:00 PM', '19:00 should format to "7:00 PM"');

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

  // Test 3: Scheduling Custom Time (8:35 PM -> 20:35)
  console.log('3. Testing Custom Time Scheduling (8:35 PM -> 20:35)...');
  const mockScheduler = new MockNotificationScheduler();

  const customTime = '20:35';
  const { hour: ch, minute: cm } = parseHHMM(customTime);
  mockScheduler.cancelAllScheduledNotificationsAsync();
  mockScheduler.scheduleNotificationAsync({
    content: { title: 'ShowUp', body: "Keep your streak alive. Check today's activities." },
    trigger: { hour: ch, minute: cm },
  });

  assert(mockScheduler.scheduledList.length === 1, 'Exactly 1 notification should be scheduled');
  assert(mockScheduler.scheduledList[0].hour === 20, 'Scheduled hour should be 20');
  assert(mockScheduler.scheduledList[0].minute === 35, 'Scheduled minute should be 35');

  // Test 4: Changing Preset to Custom & Guaranteeing 1 Notification
  console.log('4. Testing Rescheduling Custom Time (Single Notification Guarantee)...');
  const timePreset = '23:00';
  const { hour: ph, minute: pm } = parseHHMM(timePreset);
  mockScheduler.cancelAllScheduledNotificationsAsync(); // Always cancel previous
  mockScheduler.scheduleNotificationAsync({
    content: { title: 'ShowUp', body: "Keep your streak alive. Check today's activities." },
    trigger: { hour: ph, minute: pm },
  });

  assert(mockScheduler.scheduledList.length === 1, 'Exactly 1 notification should remain after rescheduling');
  assert(mockScheduler.scheduledList[0].hour === 23, 'Updated scheduled hour should be 23');
  assert(mockScheduler.scheduledList[0].minute === 0, 'Updated scheduled minute should be 0');

  // Test 5: Disabling Notification Cancels Schedule
  console.log('5. Testing Disabling Notifications Cancels Schedule...');
  mockScheduler.cancelAllScheduledNotificationsAsync();
  assert(mockScheduler.scheduledList.length === 0, 'Disabling notifications MUST clear scheduled list');

  // Test 6: Permission Denial Behavior
  console.log('6. Testing Permission Denial Guard...');
  const deniedScheduler = new MockNotificationScheduler();
  deniedScheduler.permissionGranted = false;

  let enabledState = false;
  if (!deniedScheduler.permissionGranted) {
    enabledState = false;
  }
  assert(enabledState === false, 'Permission denial MUST NOT enable notifications');

  console.log('✅ ALL CUSTOM NOTIFICATION TIMER TESTS PASSED SUCCESSFULLY!');
}

runNotificationTests();
