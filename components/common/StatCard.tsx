import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts, Radii, Spacing } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  highlightColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, unit, highlightColor }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface1, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: colors.textPrimary }, highlightColor ? { color: highlightColor } : null]}>
          {value}
        </Text>
        {unit && <Text style={[styles.unit, { color: colors.textSecondary }]}>{unit}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.sm + 4,
    marginHorizontal: 4,
  },
  label: {
    ...Fonts.typography.bodySm,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    ...Fonts.typography.labelCodeMd,
    fontSize: 20,
  },
  unit: {
    ...Fonts.typography.bodySm,
    marginLeft: 2,
  },
});
