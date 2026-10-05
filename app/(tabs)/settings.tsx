import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { ManageActivities } from '../../components/settings/ManageActivities';
import { NotificationSettingsModal } from '../../components/settings/NotificationSettingsModal';
import { AppearanceSettingsModal } from '../../components/settings/AppearanceSettingsModal';
import { getUserActiveActivities, getTodayLocalDateString } from '../../services/activities';
import {
  getUserSettings,
  checkNotificationPermissions,
  format12HourTime,
} from '../../services/notifications';
import { exportUserData } from '../../services/export';
import { resetUserData } from '../../services/reset';
import { Fonts, Radii, Spacing } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  ListChecks,
  Bell,
  Palette,
  Download,
  Trash2,
  Info,
  ChevronRight,
  LogOut,
} from 'lucide-react-native';

const ICON_MAP: Record<string, React.ElementType> = {
  ListChecks,
  Bell,
  Palette,
  Download,
  Trash2,
  Info,
};

interface SettingItem {
  id: string;
  label: string;
  icon: string;
  subtext?: string;
  destructive?: boolean;
  loading?: boolean;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export default function SettingsScreen() {
  const { signOut, user } = useAuth();
  const { colors, themePreference, setTheme } = useTheme();

  const [currentView, setCurrentView] = useState<'main' | 'manage_activities'>('main');
  const [activeCount, setActiveCount] = useState<number>(11);
  const [notifSubtext, setNotifSubtext] = useState<string>('Disabled');
  const [notifModalVisible, setNotifModalVisible] = useState<boolean>(false);
  const [appearanceModalVisible, setAppearanceModalVisible] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const loadActiveCount = useCallback(async () => {
    if (!user) return;
    try {
      const activeActs = await getUserActiveActivities(user.id, getTodayLocalDateString());
      setActiveCount(activeActs.length);
    } catch (e) {
      console.error('[SettingsScreen] Failed to load active count:', e);
    }
  }, [user]);

  const loadNotifState = useCallback(async () => {
    if (!user) return;
    try {
      const settings = await getUserSettings(user.id);
      const hasPermission = await checkNotificationPermissions();
      if (settings.notifications_enabled && hasPermission) {
        setNotifSubtext(`Daily reminders at ${format12HourTime(settings.reminder_time || '21:00')}`);
      } else {
        setNotifSubtext('Disabled');
      }
    } catch (e) {
      console.error('[SettingsScreen] Failed to load notification settings:', e);
    }
  }, [user]);

  useEffect(() => {
    loadActiveCount();
    loadNotifState();
  }, [loadActiveCount, loadNotifState]);

  const appearanceSubtext =
    themePreference === 'system'
      ? 'System Default'
      : themePreference === 'light'
      ? 'Light Mode'
      : 'Dark Mode';

  const settingsSections: SettingSection[] = [
    {
      title: 'Habits & Configuration',
      items: [
        {
          id: 'manage_activities',
          label: 'Manage Activities',
          icon: 'ListChecks',
          subtext: `${activeCount} Active routines`,
        },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: 'Bell',
          subtext: notifSubtext,
        },
      ],
    },
    {
      title: 'Preferences & Theme',
      items: [
        { id: 'appearance', label: 'Appearance', icon: 'Palette', subtext: appearanceSubtext },
      ],
    },
    {
      title: 'Data & Privacy',
      items: [
        {
          id: 'export_data',
          label: 'Export Data',
          icon: 'Download',
          subtext: isExporting ? 'Preparing export JSON...' : 'JSON format',
          loading: isExporting,
        },
        { id: 'reset_data', label: 'Reset Data', icon: 'Trash2', subtext: 'Clear local logs', destructive: true },
      ],
    },
    {
      title: 'App Info',
      items: [
        { id: 'about', label: 'About ShowUp', icon: 'Info', subtext: 'v1.0.0 • Consistency > Intensity' },
      ],
    },
  ];

  const handleExportData = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User session not found.');
      return;
    }
    if (isExporting) return;

    try {
      setIsExporting(true);
      await exportUserData(user.id);
    } catch (err: any) {
      console.error('[SettingsScreen] Export failed:', err);
      Alert.alert(
        'Export Failed',
        err.message || 'An error occurred while preparing your data export.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleItemPress = (id: string, label: string) => {
    if (id === 'manage_activities') {
      setCurrentView('manage_activities');
    } else if (id === 'notifications') {
      setNotifModalVisible(true);
    } else if (id === 'appearance') {
      setAppearanceModalVisible(true);
    } else if (id === 'export_data') {
      handleExportData();
    } else if (id === 'reset_data') {
      Alert.alert(
        'Reset All Data?',
        'This will permanently delete your completion history and custom activities. Your account will not be deleted.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset Data',
            style: 'destructive',
            onPress: async () => {
              if (!user?.id) return;
              try {
                await resetUserData(user.id);
                await setTheme('system');
                await loadActiveCount();
                await loadNotifState();
                Alert.alert(
                  'Data Reset Complete',
                  'Your activity history, custom routines, and settings have been reset to default state.'
                );
              } catch (err: any) {
                console.error('[SettingsScreen] Reset failed:', err);
                Alert.alert('Reset Failed', err.message || 'An error occurred while resetting data.');
              }
            },
          },
        ]
      );
    } else {
      Alert.alert(label, `${label} option tapped.`);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header title="Settings" subtitle="Preferences & Configuration" />

        {currentView === 'manage_activities' ? (
          <View style={styles.subViewContainer}>
            <ManageActivities
              onBack={() => setCurrentView('main')}
              onActivitiesChanged={loadActiveCount}
            />
          </View>
        ) : (
          <View style={styles.sectionsContainer}>
            {settingsSections.map((section, idx) => (
              <View key={idx} style={styles.sectionGroup}>
                <Text style={[styles.sectionHeaderTitle, { color: colors.textSecondary }]}>
                  {section.title}
                </Text>
                <Card style={[styles.cardGroup, { backgroundColor: colors.surface1, borderColor: colors.border }]}>
                  {section.items.map((item, itemIdx) => {
                    const IconComp = ICON_MAP[item.icon] || Info;
                    const isLast = itemIdx === section.items.length - 1;

                    return (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.7}
                        disabled={item.loading}
                        onPress={() => handleItemPress(item.id, item.label)}
                        style={[styles.itemRow, !isLast && [styles.itemBorder, { borderBottomColor: colors.border }]]}
                      >
                        <View style={styles.leftContent}>
                          <View
                            style={[
                              styles.iconBox,
                              { backgroundColor: colors.surface2 },
                              item.destructive && { backgroundColor: colors.errorContainer },
                            ]}
                          >
                            <IconComp
                              size={18}
                              color={item.destructive ? colors.error : colors.primary}
                            />
                          </View>
                          <View style={styles.textColumn}>
                            <Text
                              style={[
                                styles.itemLabel,
                                { color: colors.textPrimary },
                                item.destructive && { color: colors.error },
                              ]}
                            >
                              {item.label}
                            </Text>
                            {item.subtext && (
                              <Text style={[styles.itemSubtext, { color: colors.textSecondary }]}>
                                {item.subtext}
                              </Text>
                            )}
                          </View>
                        </View>
                        {item.loading ? (
                          <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                          <ChevronRight size={18} color={colors.textMuted} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </Card>
              </View>
            ))}

            {/* Account Section */}
            <View style={styles.sectionGroup}>
              <Text style={[styles.sectionHeaderTitle, { color: colors.textSecondary }]}>ACCOUNT</Text>
              <Card style={[styles.cardGroup, { backgroundColor: colors.surface1, borderColor: colors.border }]}>
                {user && (
                  <View style={[styles.itemRow, styles.itemBorder, { borderBottomColor: colors.border }]}>
                    <View style={styles.leftContent}>
                      <View style={[styles.iconBox, { backgroundColor: colors.surface2 }]}>
                        <Info size={18} color={colors.primary} />
                      </View>
                      <View style={styles.textColumn}>
                        <Text style={[styles.itemLabel, { color: colors.textPrimary }]}>Signed in as</Text>
                        <Text style={[styles.itemSubtext, { color: colors.textSecondary }]}>{user.email}</Text>
                      </View>
                    </View>
                  </View>
                )}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleLogout}
                  style={styles.itemRow}
                >
                  <View style={styles.leftContent}>
                    <View style={[styles.iconBox, { backgroundColor: colors.errorContainer }]}>
                      <LogOut size={18} color={colors.error} />
                    </View>
                    <View style={styles.textColumn}>
                      <Text style={[styles.itemLabel, { color: colors.error }]}>
                        Sign Out
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </Card>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Notifications Modal */}
      <NotificationSettingsModal
        visible={notifModalVisible}
        onClose={() => setNotifModalVisible(false)}
        onSettingsChanged={loadNotifState}
      />

      {/* Appearance Modal */}
      <AppearanceSettingsModal
        visible={appearanceModalVisible}
        onClose={() => setAppearanceModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl * 2,
  },
  sectionsContainer: {
    paddingHorizontal: Spacing.gutter,
  },
  subViewContainer: {
    paddingHorizontal: Spacing.gutter,
  },
  sectionGroup: {
    marginBottom: Spacing.md,
  },
  sectionHeaderTitle: {
    ...Fonts.typography.labelCodeSm,
    marginBottom: Spacing.xs,
    paddingLeft: 4,
  },
  cardGroup: {
    padding: 0,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
  },
  itemBorder: {
    borderBottomWidth: 1,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm + 4,
  },
  textColumn: {
    flex: 1,
  },
  itemLabel: {
    ...Fonts.typography.headlineSm,
    fontSize: 15,
  },
  itemSubtext: {
    ...Fonts.typography.bodySm,
    marginTop: 2,
  },
});
