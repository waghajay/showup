import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts, Spacing } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  dateText?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, dateText }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {dateText && <Text style={[styles.dateText, { color: colors.textSecondary }]}>{dateText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  subtitle: {
    ...Fonts.typography.bodySm,
    marginBottom: Spacing.xs,
  },
  title: {
    ...Fonts.typography.headlineXlMobile,
  },
  dateText: {
    ...Fonts.typography.bodyMd,
    marginTop: Spacing.xs,
  },
});
