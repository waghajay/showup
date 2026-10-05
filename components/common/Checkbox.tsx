import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { Radii } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onPress }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.box,
        checked
          ? { backgroundColor: colors.success, borderWidth: 0 }
          : { borderWidth: 1.5, borderColor: colors.border, backgroundColor: 'transparent' },
      ]}
    >
      {checked && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  box: {
    width: 24,
    height: 24,
    borderRadius: Radii.checkbox,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
