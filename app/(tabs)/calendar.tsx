import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { StatCard } from '../../components/common/StatCard';
import { MonthHeatmap } from '../../components/calendar/MonthHeatmap';
import { SelectedDayDetails } from '../../components/calendar/SelectedDayDetails';
import { getCalendarMonthData, getTodayLocalDateString } from '../../services/calendar';
import { MonthData, DayLog } from '../../types/habit';
import { MonthlySummary } from '../../utils/stats';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Fonts, Radii, Spacing } from '../../constants/theme';
import { RefreshCw, AlertCircle } from 'lucide-react-native';

export default function CalendarScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const todayStr = getTodayLocalDateString();

  const [currentYear, setCurrentYear] = useState<number>(() => {
    const [y] = todayStr.split('-').map(Number);
    return y;
  });

  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    const [, m] = todayStr.split('-').map(Number);
    return m;
  });

  const [monthData, setMonthData] = useState<MonthData | null>(null);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [selectedDayLog, setSelectedDayLog] = useState<DayLog | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(
    async (year: number, month: number) => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const result = await getCalendarMonthData(user.id, year, month, todayStr);
        setMonthData(result.monthData);
        setSummary(result.summary);
        setCurrentStreak(result.currentStreak);

        // Preserve selected day if present in month, else default to today (if in month) or 1st of month
        const todayDay = result.monthData.days.find((d) => d.date === todayStr);
        const firstDay = result.monthData.days[0] || null;

        setSelectedDayLog((prev) => {
          if (prev) {
            const existing = result.monthData.days.find((d) => d.date === prev.date);
            if (existing) return existing;
          }
          return todayDay || firstDay;
        });
      } catch (e: any) {
        console.error('[CalendarScreen] Failed to load calendar data:', e);
        setError('Failed to load consistency calendar. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [user, todayStr]
  );

  useEffect(() => {
    loadData(currentYear, currentMonth);
  }, [loadData, currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleSelectDate = (day: DayLog) => {
    setSelectedDayLog(day);
  };

  if (loading && !monthData) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title="Consistency Calendar" subtitle="Daily execution & revision logs" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading calendar data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !monthData) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title="Consistency Calendar" subtitle="Daily execution & revision logs" />
        <View style={styles.centerContainer}>
          <AlertCircle size={36} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
            onPress={() => loadData(currentYear, currentMonth)}
          >
            <RefreshCw size={16} color="#FFFFFF" />
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header title="Consistency Calendar" subtitle="Daily execution & revision logs" />

        {/* Summary Stat Cards */}
        <View style={styles.statsRow}>
          <StatCard
            label="Avg Consistency"
            value={summary ? `${summary.averageConsistency}` : '0'}
            unit="%"
            highlightColor={colors.primary}
          />
          <StatCard
            label="Active Days"
            value={summary && monthData ? `${summary.activeDays}/${monthData.daysInMonth}` : '0/30'}
            highlightColor={colors.success}
          />
          <StatCard
            label="Current Streak"
            value={`${currentStreak}`}
            unit="d"
            highlightColor={colors.warning}
          />
        </View>

        {/* Monthly Heatmap Component */}
        {monthData && (
          <View style={styles.heatmapContainer}>
            <MonthHeatmap
              monthData={monthData}
              selectedDate={selectedDayLog?.date || todayStr}
              onSelectDate={handleSelectDate}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
            />
          </View>
        )}

        {/* Selected Day Details Panel */}
        <View style={styles.detailsContainer}>
          <SelectedDayDetails dayLog={selectedDayLog} today={todayStr} />
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    ...Fonts.typography.bodyMd,
    marginTop: Spacing.md,
  },
  errorText: {
    ...Fonts.typography.bodyMd,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
  },
  retryBtnText: {
    ...Fonts.typography.headlineSm,
    color: '#FFFFFF',
    marginLeft: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.gutter - 4,
    marginBottom: Spacing.md,
  },
  heatmapContainer: {
    paddingHorizontal: Spacing.gutter,
  },
  detailsContainer: {
    paddingHorizontal: Spacing.gutter,
  },
});
