import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { DailyProgressCard } from '../../components/today/DailyProgressCard';
import { HabitRow } from '../../components/today/HabitRow';
import { CATEGORIES } from '../../mock/mockData';
import { CategoryType, ActivityItem } from '../../types/habit';
import { Fonts, Radii, Spacing } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  getTodayActivities,
  getTodayCompletions,
  setActivityCompletion,
  getFormattedDateText,
  getUserStreak,
  DbActivity,
} from '../../services/today';
import { RefreshCw } from 'lucide-react-native';

export default function TodayScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [streakDays, setStreakDays] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const [dbActivities, dbCompletions, currentStreak] = await Promise.all([
        getTodayActivities(user.id),
        getTodayCompletions(user.id),
        getUserStreak(user.id),
      ]);

      const completionSet = new Set(
        dbCompletions.filter((c) => c.completed).map((c) => c.activity_id)
      );

      const items: ActivityItem[] = dbActivities.map((act: DbActivity) => ({
        id: act.id,
        title: act.name,
        category: act.category as CategoryType,
        completed: completionSet.has(act.id),
      }));

      setActivities(items);
      setStreakDays(currentStreak);
    } catch (e: any) {
      console.error('[TodayScreen] Load error:', e);
      setError('Failed to load today\'s activities. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Dynamic calculation from real data
  const totalCount = activities.length;
  const completedCount = activities.filter((a) => a.completed).length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Optimistic UI toggle with rollback on failure
  const handleToggle = async (id: string) => {
    if (!user) return;

    const target = activities.find((a) => a.id === id);
    if (!target) return;

    const previousCompleted = target.completed;
    const newCompleted = !previousCompleted;

    // 1. Optimistic update
    setActivities((prev) =>
      prev.map((act) => (act.id === id ? { ...act, completed: newCompleted } : act))
    );

    // 2. Database persistence
    try {
      await setActivityCompletion(user.id, id, newCompleted);
      // Refresh live streak calculation after updating completion
      const updatedStreak = await getUserStreak(user.id);
      setStreakDays(updatedStreak);
    } catch (e: any) {
      console.error('[TodayScreen] Toggle persistence error:', e);

      // 3. Rollback on failure
      setActivities((prev) =>
        prev.map((act) => (act.id === id ? { ...act, completed: previousCompleted } : act))
      );

      Alert.alert(
        'Update Failed',
        'Could not update activity status. Please check your internet connection and try again.'
      );
    }
  };

  const categoryKeys: CategoryType[] = ['PLACEMENT', 'COLLEGE', 'HEALTH', 'LIFESTYLE'];

  const userDisplayName = user?.email
    ? user.email.split('@')[0]
    : 'User';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header
          subtitle={`Good evening, ${userDisplayName} 👋`}
          title="Today's Consistency"
          dateText={getFormattedDateText()}
        />

        <DailyProgressCard
          percentage={percentage}
          completedCount={completedCount}
          totalCount={totalCount}
          streakDays={streakDays}
        />

        {/* Loading State */}
        {loading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading activities...</Text>
          </View>
        )}

        {/* Error State */}
        {!loading && error && (
          <View style={[styles.errorCard, { backgroundColor: colors.errorContainer }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={loadData}>
              <RefreshCw size={16} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {!loading && !error && activities.length === 0 && (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface1, borderColor: colors.border }]}>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Active Activities</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              You don't have any active activities for today.
            </Text>
          </View>
        )}

        {/* Grouped Checklists */}
        {!loading && !error && activities.length > 0 && (
          <View style={styles.sectionsContainer}>
            {categoryKeys.map((catKey) => {
              const catInfo = CATEGORIES[catKey];
              const catActivities = activities.filter((a) => a.category === catKey);

              if (catActivities.length === 0) return null;

              return (
                <View key={catKey} style={styles.categorySection}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.categoryTitle, { color: catInfo.badgeText }]}>
                      {catInfo.title}
                    </Text>
                    <Text style={[styles.categoryCount, { color: colors.textSecondary }]}>
                      {catActivities.filter((a) => a.completed).length}/{catActivities.length}
                    </Text>
                  </View>

                  {catActivities.map((item) => (
                    <HabitRow key={item.id} item={item} onToggle={handleToggle} />
                  ))}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
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
    marginTop: Spacing.sm,
  },
  categorySection: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs + 2,
    paddingHorizontal: 2,
  },
  categoryTitle: {
    ...Fonts.typography.labelCodeSm,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  categoryCount: {
    ...Fonts.typography.labelCodeSm,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  loadingText: {
    ...Fonts.typography.bodyMd,
    marginTop: Spacing.sm,
  },
  errorCard: {
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.gutter,
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  errorText: {
    ...Fonts.typography.bodyMd,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    gap: Spacing.xs,
  },
  retryButtonText: {
    ...Fonts.typography.headlineSm,
    fontSize: 14,
    color: '#FFFFFF',
  },
  emptyCard: {
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    marginHorizontal: Spacing.gutter,
    marginTop: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyTitle: {
    ...Fonts.typography.headlineMd,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    ...Fonts.typography.bodyMd,
    textAlign: 'center',
  },
});
