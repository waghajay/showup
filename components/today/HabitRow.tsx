import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ActivityItem, CategoryInfo } from '../../types/habit';
import { CATEGORIES } from '../../mock/mockData';
import { Checkbox } from '../common/Checkbox';
import { Badge } from '../common/Badge';
import { Fonts, Radii, Spacing } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface HabitRowProps {
  item: ActivityItem;
  onToggle: (id: string) => void;
}

export const HabitRow: React.FC<HabitRowProps> = ({ item, onToggle }) => {
  const { colors } = useTheme();
  const categoryInfo: CategoryInfo = CATEGORIES[item.category] || CATEGORIES.PLACEMENT;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onToggle(item.id)}
      style={[
        styles.row,
        {
          backgroundColor: item.completed ? colors.surface2 : colors.surface1,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.leftSection}>
        <View style={styles.badgeContainer}>
          <Badge
            text={categoryInfo.title}
            bgColor={categoryInfo.badgeBg}
            textColor={categoryInfo.badgeText}
          />
        </View>
        <Text
          style={[
            styles.title,
            { color: colors.textPrimary },
            item.completed && { textDecorationLine: 'line-through', color: colors.textMuted },
          ]}
        >
          {item.title}
        </Text>
      </View>
      <Checkbox checked={item.completed} onPress={() => onToggle(item.id)} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  leftSection: {
    flex: 1,
    marginRight: Spacing.md,
  },
  badgeContainer: {
    marginBottom: 4,
  },
  title: {
    ...Fonts.typography.headlineSm,
    fontSize: 15,
  },
});
