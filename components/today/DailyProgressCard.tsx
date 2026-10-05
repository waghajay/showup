import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { Fonts, Radii, Spacing } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { Flame } from 'lucide-react-native';

interface DailyProgressCardProps {
  percentage: number;
  completedCount: number;
  totalCount: number;
  streakDays: number;
}

export const DailyProgressCard: React.FC<DailyProgressCardProps> = ({
  percentage,
  completedCount,
  totalCount,
  streakDays,
}) => {
  const { colors } = useTheme();

  return (
    <Card style={[styles.card, { backgroundColor: colors.surface1 }]}>
      <View style={styles.topRow}>
        <View style={[styles.streakBadge, { backgroundColor: colors.warningContainer }]}>
          <Flame size={16} color={colors.warning} />
          <Text style={[styles.streakText, { color: colors.warning }]}>{streakDays} Days Streak</Text>
        </View>
        <Text style={[styles.countText, { color: colors.textSecondary }]}>
          {completedCount} / {totalCount} Done
        </Text>
      </View>

      <View style={styles.percentageRow}>
        <Text style={[styles.percentageNumber, { color: colors.textPrimary }]}>{percentage}%</Text>
        <Text style={[styles.percentageLabel, { color: colors.textSecondary }]}>Daily Consistency</Text>
      </View>

      {/* Progress Bar Track */}
      <View style={[styles.track, { backgroundColor: colors.surface2 }]}>
        <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: colors.primary }]} />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  streakText: {
    ...Fonts.typography.labelCodeSm,
    marginLeft: 4,
    fontWeight: '600',
  },
  countText: {
    ...Fonts.typography.labelCodeMd,
  },
  percentageRow: {
    marginVertical: Spacing.xs,
  },
  percentageNumber: {
    ...Fonts.typography.headlineXl,
    fontFamily: Fonts.family.mono,
    fontSize: 42,
    lineHeight: 48,
  },
  percentageLabel: {
    ...Fonts.typography.bodySm,
    marginTop: 2,
  },
  track: {
    height: 8,
    borderRadius: Radii.full,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radii.full,
  },
});
