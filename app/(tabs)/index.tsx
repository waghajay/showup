import React from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { DailyProgressCard } from '../../components/today/DailyProgressCard';
import { HabitRow } from '../../components/today/HabitRow';
import { CATEGORY_ORDER } from '../../mock/mockData';
import { CategoryType } from '../../types';
import { Fonts, Spacing } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useApp } from '../../context/AppContext';

export default function TodayScreen() {
  const { colors } = useTheme();
  const { routines, toggleRoutineCompletion } = useApp();

  const totalCount = routines.length;
  const completedCount = routines.filter((r) => r.completed).length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  // Calculate average streak or max streak for header display
  const activeStreaks = routines.map((r) => r.streak);
  const currentStreak = activeStreaks.length > 0 ? Math.max(...activeStreaks) : 0;

  const getFormattedDateText = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    };
    return today.toLocaleDateString('en-US', options);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header
          subtitle="ShowUp — Consistency > Intensity"
          title="Today's Checklist"
          dateText={getFormattedDateText()}
        />

        <DailyProgressCard
          percentage={percentage}
          completedCount={completedCount}
          totalCount={totalCount}
          streakDays={currentStreak}
        />

        {/* Grouped Checklists */}
        <View style={styles.sectionsContainer}>
          {CATEGORY_ORDER.map((catKey: CategoryType) => {
            const catRoutines = routines.filter((r) => r.category === catKey);
            if (catRoutines.length === 0) return null;

            const catCompleted = catRoutines.filter((r) => r.completed).length;

            return (
              <View key={catKey} style={styles.categorySection}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.categoryTitle, { color: colors.textSecondary }]}>
                    {catKey}
                  </Text>
                  <Text style={[styles.categoryCount, { color: colors.textMuted }]}>
                    {catCompleted} / {catRoutines.length}
                  </Text>
                </View>

                {catRoutines.map((item) => (
                  <HabitRow
                    key={item.id}
                    item={item}
                    onToggle={toggleRoutineCompletion}
                  />
                ))}
              </View>
            );
          })}
        </View>
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
});
