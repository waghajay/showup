import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts, Radii } from '../../constants/theme';

interface BadgeProps {
  text: string;
  bgColor: string;
  textColor: string;
}

export const Badge: React.FC<BadgeProps> = ({ text, bgColor, textColor }) => {
  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
    alignSelf: 'flex-start',
  },
  text: {
    ...Fonts.typography.labelCodeSm,
    textTransform: 'uppercase',
  },
});
