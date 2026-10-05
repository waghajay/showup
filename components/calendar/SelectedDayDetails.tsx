import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DayLog } from '../../types/habit';
import { Card } from '../common/Card';
import { Fonts, Spacing } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { CheckCircle2, XCircle } from 'lucide-react-native';

interface SelectedDayDetailsProps {
  dayLog: DayLog | null;
  today?: string;
}

export const SelectedDayDetails: React.FC<SelectedDayDetailsProps> = ({ dayLog, today }) => {
  const { colors } = useTheme();

  if (!dayLog) return null;

  const isFuture = today ? dayLog.date > today : false;
  const percentage =
    dayLog.totalCount > 0 ? Math.round((dayLog.completedCount / dayLog.totalCount) * 100) : 0;

  return (
    <Card style={[styles.card, { backgroundColor: colors.surface1, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.dateTitle, { color: colors.textPrimary }]}>{dayLog.date}</Text>
        <Text style={[styles.percentageText, { color: colors.primary }]}>
          {isFuture ? 'Future' : `${percentage}% Completed`}
        </Text>
      </View>

      <Text style={[styles.subtext, { color: colors.textSecondary }]}>
        {isFuture
          ? 'Activity logging will open on this date'
          : `${dayLog.completedCount} of ${dayLog.totalCount} activities done`}
      </Text>

      {/* Completed Section */}
      {dayLog.activitiesCompleted.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Completed</Text>
          {dayLog.activitiesCompleted.map((act, i) => (
            <View key={i} style={styles.itemRow}>
              <CheckCircle2 size={16} color={colors.success} />
              <Text style={[styles.itemText, { color: colors.textPrimary }]}>{act}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Missed Section */}
      {dayLog.activitiesMissed.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Missed</Text>
          {dayLog.activitiesMissed.map((act, i) => (
            <View key={i} style={styles.itemRow}>
              <XCircle size={16} color={colors.textMuted} />
              <Text style={[styles.itemText, { color: colors.textMuted, textDecorationLine: 'line-through' }]}>
                {act}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTitle: {
    ...Fonts.typography.headlineSm,
  },
  percentageText: {
    ...Fonts.typography.labelCodeMd,
  },
  subtext: {
    ...Fonts.typography.bodySm,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  section: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Fonts.typography.labelCodeSm,
    marginBottom: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemText: {
    ...Fonts.typography.bodyMd,
    marginLeft: 8,
  },
});
