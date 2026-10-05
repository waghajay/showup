import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { ConsistencyLineChart } from '../../components/reports/ConsistencyLineChart';
import { ActivityBarChart } from '../../components/reports/ActivityBarChart';
import { getReportsData, ReportsDataResult } from '../../services/reports';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Fonts, Radii, Spacing } from '../../constants/theme';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react-native';

export default function ReportsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [reportsData, setReportsData] = useState<ReportsDataResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const result = await getReportsData(user.id);
      setReportsData(result);
    } catch (e: any) {
      console.error('[ReportsScreen] Failed to load reports data:', e);
      setError('Failed to load consistency reports. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading && !reportsData) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title="Consistency Reports" subtitle="Consistency > Intensity • Performance & Trends" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading consistency reports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !reportsData) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title="Consistency Reports" subtitle="Consistency > Intensity • Performance & Trends" />
        <View style={styles.centerContainer}>
          <AlertCircle size={36} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={loadData}>
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
        <Header
          title="Consistency Reports"
          subtitle="Consistency > Intensity • Performance & Trends"
        />

        {/* 4 Overview Metric Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              label="Overall Rate"
              value={reportsData?.overallConsistency ?? 0}
              unit="%"
              highlightColor={colors.primary}
            />
            <StatCard
              label="Current Streak"
              value={reportsData?.currentStreak ?? 0}
              unit="d"
              highlightColor={colors.warning}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              label="Longest Streak"
              value={reportsData?.longestStreak ?? 0}
              unit="d"
              highlightColor={colors.purple}
            />
            <StatCard
              label="Active Days"
              value={reportsData?.activeDays ?? 0}
              unit={`/${reportsData?.totalDaysLogged ?? 0}`}
              highlightColor={colors.success}
            />
          </View>
        </View>

        {/* Approved Stitch V1 Single Consistency Line Chart */}
        <View style={styles.chartContainer}>
          <ConsistencyLineChart data={reportsData?.trendPoints || []} />
        </View>

        {/* Activity Completion Rate Horizontal Bar Chart */}
        <View style={styles.chartContainer}>
          <ActivityBarChart stats={reportsData?.categoryStats || []} />
        </View>

        {/* Monthly Performance Summary */}
        <View style={styles.chartContainer}>
          <Card style={[styles.summaryCard, { backgroundColor: colors.primaryContainer }]}>
            <View style={styles.summaryTitleRow}>
              <Sparkles size={18} color={colors.primary} />
              <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>Monthly Performance Note</Text>
            </View>
            <Text style={[styles.summaryBody, { color: colors.textSecondary }]}>
              {reportsData?.performanceNote ||
                'Keep showing up daily—small steps compound into major breakthroughs.'}
            </Text>
          </Card>
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
  statsGrid: {
    paddingHorizontal: Spacing.gutter - 4,
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  chartContainer: {
    paddingHorizontal: Spacing.gutter,
  },
  summaryCard: {
    borderColor: 'transparent',
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryTitle: {
    ...Fonts.typography.headlineSm,
    marginLeft: 6,
  },
  summaryBody: {
    ...Fonts.typography.bodyMd,
    lineHeight: 20,
  },
});
