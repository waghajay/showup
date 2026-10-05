import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CategoryCompletionStat } from '../../types/habit';
import { Fonts, Radii, Spacing } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface ActivityBarChartProps {
  stats: CategoryCompletionStat[];
}

export const ActivityBarChart: React.FC<ActivityBarChartProps> = ({ stats }) => {
  const { colors } = useTheme();

  if (!stats || stats.length === 0) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface1, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Activity Completion Rate</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Completion breakdown by activity</Text>
        <Text style={[styles.countText, { color: colors.textSecondary }]}>No activities configured yet.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface1, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Activity Completion Rate</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Completion breakdown by activity</Text>

      <View style={styles.list}>
        {stats.map((item, idx) => (
          <View key={`${item.category}-${item.title}-${idx}`} style={styles.item}>
            <View style={styles.labelRow}>
              <Text style={[styles.categoryTitle, { color: colors.textPrimary }]}>{item.title}</Text>
              <Text style={[styles.percentageText, { color: colors.textPrimary }]}>{item.percentage}%</Text>
            </View>

            {/* Track */}
            <View style={[styles.track, { backgroundColor: colors.surface2 }]}>
              <View
                style={[
                  styles.fill,
                  { width: `${item.percentage}%`, backgroundColor: item.color },
                ]}
              />
            </View>
            <Text style={[styles.countText, { color: colors.textSecondary }]}>
              {item.completedCount} of {item.totalCount} routines done
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    ...Fonts.typography.headlineSm,
  },
  subtitle: {
    ...Fonts.typography.bodySm,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  list: {
    gap: Spacing.sm + 4,
  },
  item: {
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryTitle: {
    ...Fonts.typography.bodyMd,
    fontWeight: '600',
  },
  percentageText: {
    ...Fonts.typography.labelCodeMd,
  },
  track: {
    height: 8,
    borderRadius: Radii.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radii.full,
  },
  countText: {
    ...Fonts.typography.bodySm,
    fontSize: 11,
    marginTop: 2,
  },
});
