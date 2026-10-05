import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Fonts, Radii, Spacing } from '../../constants/theme';
import { useTheme, ThemePreference } from '../../contexts/ThemeContext';
import { Card } from '../common/Card';
import { Cpu, Sun, Moon, Palette, X, CheckCircle2 } from 'lucide-react-native';

interface AppearanceSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const THEME_OPTIONS: Array<{
  value: ThemePreference;
  label: string;
  subtext: string;
  IconComponent: React.ComponentType<{ size: number; color: string }>;
}> = [
  {
    value: 'system',
    label: 'System',
    subtext: 'Use your device settings',
    IconComponent: Cpu,
  },
  {
    value: 'light',
    label: 'Light',
    subtext: 'Always use light mode',
    IconComponent: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    subtext: 'Always use dark mode',
    IconComponent: Moon,
  },
];

export const AppearanceSettingsModal: React.FC<AppearanceSettingsModalProps> = ({
  visible,
  onClose,
}) => {
  const { themePreference, setTheme, colors } = useTheme();

  const handleSelect = async (option: ThemePreference) => {
    await setTheme(option);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.modalContainer, { backgroundColor: colors.surface1, borderColor: colors.border }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Palette size={22} color={colors.primary} />
              <Text style={[styles.title, { color: colors.textPrimary }]}>Appearance</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Subtitle */}
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Choose how ShowUp looks to you.
          </Text>

          {/* Theme Option Cards */}
          <Card style={[styles.optionsCard, { backgroundColor: colors.surface1, borderColor: colors.border }]}>
            {THEME_OPTIONS.map((item, idx) => {
              const isSelected = themePreference === item.value;
              const isLast = idx === THEME_OPTIONS.length - 1;
              const IconComp = item.IconComponent;

              return (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.optionRow,
                    !isLast && [styles.borderBottom, { borderBottomColor: colors.border }],
                    isSelected && { backgroundColor: colors.primaryContainer },
                  ]}
                  onPress={() => handleSelect(item.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionLeft}>
                    <View
                      style={[
                        styles.iconBadge,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surface2,
                        },
                      ]}
                    >
                      <IconComp
                        size={18}
                        color={isSelected ? '#FFFFFF' : colors.textSecondary}
                      />
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text
                        style={[
                          styles.optionLabel,
                          { color: colors.textPrimary },
                          isSelected && { fontFamily: Fonts.family.sansBold, color: colors.primary },
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Text style={[styles.optionSubtext, { color: colors.textSecondary }]}>
                        {item.subtext}
                      </Text>
                    </View>
                  </View>

                  {isSelected && (
                    <CheckCircle2 size={22} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </Card>

          {/* Done Button */}
          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: colors.primary }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.gutter,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    borderRadius: Radii.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    ...Fonts.typography.headlineMd,
  },
  subtitle: {
    ...Fonts.typography.bodyMd,
    marginBottom: Spacing.lg,
  },
  optionsCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  borderBottom: {
    borderBottomWidth: 1,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    ...Fonts.typography.headlineSm,
    fontSize: 15,
    marginBottom: 2,
  },
  optionSubtext: {
    ...Fonts.typography.bodySm,
  },
  doneButton: {
    borderRadius: Radii.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    ...Fonts.typography.headlineSm,
    color: '#FFFFFF',
  },
});
