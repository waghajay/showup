import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MonthData, DayLog } from '../../types/habit';
import { Fonts, Radii, Spacing } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface MonthHeatmapProps {
  monthData: MonthData;
  selectedDate: string;
  onSelectDate: (day: DayLog) => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MonthHeatmap: React.FC<MonthHeatmapProps> = ({
  monthData,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}) => {
  const { colors, isDark } = useTheme();

  // Dynamic intensity colors according to light / dark theme
  const INTENSITY_COLORS = {
    0: colors.surface2,
    1: isDark ? '#064E3B' : '#D1FAE5',
    2: isDark ? '#047857' : '#6EE7B7',
    3: isDark ? '#10B981' : '#34D399',
    4: colors.success,
  };

  // Pad blank spaces for month start alignment
  const blankCells = Array.from({ length: monthData.firstDayOfWeek }, (_, i) => i);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface1, borderColor: colors.border }]}>
      {/* Month & Year Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.monthTitle, { color: colors.textPrimary }]}>
          {monthData.monthName} {monthData.year}
        </Text>
        <View style={styles.navButtons}>
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: colors.surface2 }]}
            onPress={onPrevMonth}
          >
            <ChevronLeft size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: colors.surface2 }]}
            onPress={onNextMonth}
          >
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Weekday headers */}
      <View style={styles.gridRow}>
        {WEEKDAYS.map((day) => (
          <Text key={day} style={[styles.weekdayText, { color: colors.textSecondary }]}>
            {day}
          </Text>
        ))}
      </View>

      {/* Grid of days */}
      <View style={styles.gridContainer}>
        {blankCells.map((idx) => (
          <View key={`blank-${idx}`} style={styles.cellWrapper} />
        ))}
        {monthData.days.map((dayLog) => {
          const isSelected = dayLog.date === selectedDate;
          const bg = INTENSITY_COLORS[dayLog.intensity] || INTENSITY_COLORS[0];

          return (
            <TouchableOpacity
              key={dayLog.date}
              activeOpacity={0.7}
              onPress={() => onSelectDate(dayLog)}
              style={styles.cellWrapper}
            >
              <View
                style={[
                  styles.heatmapCell,
                  { backgroundColor: bg },
                  isSelected && [styles.selectedCell, { borderColor: colors.primary }],
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: colors.textPrimary },
                    dayLog.intensity >= 3 && !isDark && { color: '#064E3B' },
                    dayLog.intensity >= 3 && isDark && { color: '#FFFFFF' },
                  ]}
                >
                  {dayLog.dayNumber}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={[styles.legendRow, { borderTopColor: colors.border }]}>
        <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>Less</Text>
        {([0, 1, 2, 3, 4] as const).map((level) => (
          <View
            key={level}
            style={[styles.legendBox, { backgroundColor: INTENSITY_COLORS[level] }]}
          />
        ))}
        <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>More</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  monthTitle: {
    ...Fonts.typography.headlineMd,
  },
  navButtons: {
    flexDirection: 'row',
  },
  navBtn: {
    padding: 6,
    marginLeft: 4,
    borderRadius: Radii.md,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.sm,
  },
  weekdayText: {
    ...Fonts.typography.labelCodeSm,
    width: '14.28%',
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cellWrapper: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heatmapCell: {
    width: '100%',
    height: '100%',
    borderRadius: Radii.heatmapCell,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCell: {
    borderWidth: 2,
  },
  dayText: {
    ...Fonts.typography.labelCodeSm,
    fontWeight: '600',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  legendLabel: {
    ...Fonts.typography.bodySm,
    fontSize: 11,
    marginHorizontal: 4,
  },
  legendBox: {
    width: 14,
    height: 14,
    borderRadius: 3,
    marginHorizontal: 2,
  },
});
