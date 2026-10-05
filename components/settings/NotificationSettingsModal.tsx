import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Card } from '../common/Card';
import {
  getUserSettings,
  updateUserSettings,
  requestNotificationPermissions,
  checkNotificationPermissions,
  scheduleDailyReminder,
  cancelDailyReminder,
  format12HourTime,
} from '../../services/notifications';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Fonts, Radii, Spacing } from '../../constants/theme';
import { Bell, Clock, X, Check } from 'lucide-react-native';

interface NotificationSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSettingsChanged?: () => void;
}

const PRESET_TIMES = [
  { label: '7:00 PM', value: '19:00' },
  { label: '8:00 PM', value: '20:00' },
  { label: '9:00 PM', value: '21:00' },
  { label: '10:00 PM', value: '22:00' },
  { label: '11:00 PM', value: '23:00' },
];

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  visible,
  onClose,
  onSettingsChanged,
}) => {
  const { user } = useAuth();
  const { colors } = useTheme();

  const [loading, setLoading] = useState<boolean>(true);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [reminderTime, setReminderTime] = useState<string>('21:00');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadSettings = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const settings = await getUserSettings(user.id);
      const hasPermission = await checkNotificationPermissions();

      const isEnabled = settings.notifications_enabled && hasPermission;
      setEnabled(isEnabled);
      setReminderTime(settings.reminder_time || '21:00');

      // If database says enabled but OS permission is revoked, sync DB safely without auto-prompting
      if (settings.notifications_enabled && !hasPermission) {
        await updateUserSettings(user.id, { notifications_enabled: false });
        await cancelDailyReminder();
      }
    } catch (e) {
      console.error('[NotificationSettingsModal] Failed to load settings:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (visible) {
      loadSettings();
    }
  }, [visible, loadSettings]);

  const handleToggleSwitch = async (value: boolean) => {
    if (!user) return;

    if (value) {
      // User is turning notifications ON -> request permission
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Notification permission was not granted. Please allow notifications in your device settings to receive daily reminders.'
        );
        setEnabled(false);
        return;
      }

      try {
        setSubmitting(true);
        await scheduleDailyReminder(reminderTime);
        await updateUserSettings(user.id, { notifications_enabled: true });
        setEnabled(true);
        if (onSettingsChanged) onSettingsChanged();
      } catch (e: any) {
        console.error('[NotificationSettingsModal] Failed to enable notifications:', e);
        Alert.alert('Error', 'Failed to schedule daily reminder.');
        setEnabled(false);
      } finally {
        setSubmitting(false);
      }
    } else {
      // User is turning notifications OFF -> cancel reminder & update DB
      try {
        setSubmitting(true);
        await cancelDailyReminder();
        await updateUserSettings(user.id, { notifications_enabled: false });
        setEnabled(false);
        if (onSettingsChanged) onSettingsChanged();
      } catch (e: any) {
        console.error('[NotificationSettingsModal] Failed to disable notifications:', e);
        Alert.alert('Error', 'Failed to update notification settings.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleSelectTime = async (newTime: string) => {
    if (!user || newTime === reminderTime) return;

    try {
      setSubmitting(true);
      setReminderTime(newTime);
      await updateUserSettings(user.id, { reminder_time: newTime });

      if (enabled) {
        await scheduleDailyReminder(newTime);
      }
      if (onSettingsChanged) onSettingsChanged();
    } catch (e: any) {
      console.error('[NotificationSettingsModal] Failed to update time:', e);
      Alert.alert('Error', 'Failed to save reminder time.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleRow}>
              <Bell size={20} color={colors.primary} />
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Daily Reminder</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading settings...</Text>
            </View>
          ) : (
            <View style={styles.body}>
              {/* Toggle Row */}
              <Card style={[styles.settingCard, { backgroundColor: colors.surface1, borderColor: colors.border }]}>
                <View style={styles.row}>
                  <View style={styles.labelCol}>
                    <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>Daily Reminder</Text>
                    <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
                      {enabled ? `Active at ${format12HourTime(reminderTime)}` : 'Disabled'}
                    </Text>
                  </View>
                  {submitting ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Switch
                      value={enabled}
                      onValueChange={handleToggleSwitch}
                      trackColor={{ false: colors.surface2, true: colors.primary }}
                      thumbColor="#FFFFFF"
                    />
                  )}
                </View>
              </Card>

              {/* Reminder Time Options */}
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>REMINDER TIME</Text>
                <Card
                  style={[
                    styles.settingCard,
                    { backgroundColor: colors.surface1, borderColor: colors.border },
                    !enabled ? styles.disabledCard : null,
                  ]}
                >
                  {PRESET_TIMES.map((item, idx) => {
                    const isSelected = reminderTime === item.value;
                    const isLast = idx === PRESET_TIMES.length - 1;

                    return (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.timeRow,
                          !isLast && [styles.timeBorder, { borderBottomColor: colors.border }],
                        ]}
                        onPress={() => handleSelectTime(item.value)}
                        disabled={!enabled || submitting}
                        activeOpacity={0.7}
                      >
                        <View style={styles.timeInfo}>
                          <Clock
                            size={16}
                            color={
                              !enabled
                                ? colors.textMuted
                                : isSelected
                                ? colors.primary
                                : colors.textSecondary
                            }
                          />
                          <Text
                            style={[
                              styles.timeText,
                              { color: colors.textPrimary },
                              !enabled && { color: colors.textMuted },
                              isSelected && [styles.selectedTimeText, { color: colors.primary }],
                            ]}
                          >
                            {item.label}
                          </Text>
                        </View>
                        {isSelected && enabled && (
                          <Check size={18} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </Card>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    padding: Spacing.gutter,
    paddingBottom: Spacing.xl * 2,
    maxHeight: '80%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  modalTitle: {
    ...Fonts.typography.headlineMd,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    ...Fonts.typography.bodySm,
    marginTop: Spacing.xs,
  },
  body: {
    gap: Spacing.md,
  },
  settingCard: {
    padding: Spacing.md,
  },
  disabledCard: {
    opacity: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelCol: {
    flex: 1,
  },
  itemTitle: {
    ...Fonts.typography.headlineSm,
    fontSize: 15,
  },
  itemSubtitle: {
    ...Fonts.typography.bodySm,
    marginTop: 2,
  },
  section: {
    marginTop: Spacing.xs,
  },
  sectionLabel: {
    ...Fonts.typography.labelCodeSm,
    marginBottom: Spacing.xs,
    paddingLeft: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 2,
  },
  timeBorder: {
    borderBottomWidth: 1,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  timeText: {
    ...Fonts.typography.bodyMd,
  },
  selectedTimeText: {
    ...Fonts.typography.headlineSm,
    fontSize: 14,
  },
});
