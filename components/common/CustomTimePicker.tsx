import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Clock, Check } from 'lucide-react-native';
import { Fonts, Radii, Spacing } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { format12HourTime, parseHHMM } from '../../services/notifications';

export interface CustomTimePickerProps {
  value?: string; // HH:mm 24-hour format (e.g. "20:35")
  selectedTime?: string; // Alias for value
  onChange?: (time: string) => void;
  onSelectTime?: (time: string) => void; // Alias for onChange
  disabled?: boolean;
}

export const PRESET_TIMES = [
  { label: '7:00 PM', value: '19:00' },
  { label: '9:00 PM', value: '21:00' },
  { label: '11:00 PM', value: '23:00' },
];

export const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  value,
  selectedTime,
  onChange,
  onSelectTime,
  disabled = false,
}) => {
  const { colors } = useTheme();

  const currentTime = value || selectedTime || '21:00';
  const handleTimeChange = onChange || onSelectTime || (() => {});

  const isPreset = PRESET_TIMES.some((p) => p.value === currentTime);
  const [isCustomSelected, setIsCustomSelected] = useState<boolean>(!isPreset);

  // Sync internal state when external time changes
  useEffect(() => {
    setIsCustomSelected(!PRESET_TIMES.some((p) => p.value === currentTime));
  }, [currentTime]);

  const parsed = parseHHMM(currentTime);
  const displayHour12 = parsed.hour % 12 === 0 ? 12 : parsed.hour % 12;
  const [inputHour, setInputHour] = useState<string>(String(displayHour12));
  const [inputMinute, setInputMinute] = useState<string>(String(parsed.minute).padStart(2, '0'));
  const [period, setPeriod] = useState<'AM' | 'PM'>(parsed.hour >= 12 ? 'PM' : 'AM');

  useEffect(() => {
    const p = parseHHMM(currentTime);
    const h12 = p.hour % 12 === 0 ? 12 : p.hour % 12;
    setInputHour(String(h12));
    setInputMinute(String(p.minute).padStart(2, '0'));
    setPeriod(p.hour >= 12 ? 'PM' : 'AM');
  }, [currentTime]);

  const updateCustomHHMM = (hStr: string, mStr: string, pStr: 'AM' | 'PM') => {
    let h = parseInt(hStr, 10);
    let m = parseInt(mStr, 10);

    if (isNaN(h) || h < 1) h = 12;
    if (h > 12) h = 12;
    if (isNaN(m) || m < 0) m = 0;
    if (m > 59) m = 59;

    let h24 = h;
    if (pStr === 'PM' && h < 12) h24 = h + 12;
    if (pStr === 'AM' && h === 12) h24 = 0;

    const formatted = `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    handleTimeChange(formatted);
  };

  const handleHourText = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 2);
    setInputHour(cleaned);
    if (cleaned.length > 0) {
      updateCustomHHMM(cleaned, inputMinute, period);
    }
  };

  const handleMinuteText = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 2);
    setInputMinute(cleaned);
    if (cleaned.length > 0) {
      updateCustomHHMM(inputHour, cleaned, period);
    }
  };

  const handlePeriodToggle = (newPeriod: 'AM' | 'PM') => {
    setPeriod(newPeriod);
    updateCustomHHMM(inputHour, inputMinute, newPeriod);
  };

  const formattedCustomText = isCustomSelected ? format12HourTime(currentTime) : '';

  return (
    <View style={styles.container}>
      {/* Preset List: 7:00 PM, 9:00 PM, 11:00 PM */}
      {PRESET_TIMES.map((item) => {
        const isSelected = !isCustomSelected && currentTime === item.value;

        return (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.optionRow,
              { borderBottomColor: colors.border },
            ]}
            onPress={() => {
              setIsCustomSelected(false);
              handleTimeChange(item.value);
            }}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <View style={styles.radioLabelRow}>
              <View
                style={[
                  styles.radioOuter,
                  { borderColor: isSelected ? colors.primary : colors.border },
                ]}
              >
                {isSelected && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
              </View>

              <Text
                style={[
                  styles.optionText,
                  { color: colors.textPrimary },
                  disabled && { color: colors.textMuted },
                  isSelected && styles.selectedOptionText,
                ]}
              >
                {item.label}
              </Text>
            </View>
            {isSelected && !disabled && <Check size={18} color={colors.primary} />}
          </TouchableOpacity>
        );
      })}

      {/* Custom Time Option */}
      <TouchableOpacity
        style={[styles.optionRow, { borderBottomColor: colors.border }]}
        onPress={() => {
          setIsCustomSelected(true);
          updateCustomHHMM(inputHour, inputMinute, period);
        }}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={styles.radioLabelRow}>
          <View
            style={[
              styles.radioOuter,
              { borderColor: isCustomSelected ? colors.primary : colors.border },
            ]}
          >
            {isCustomSelected && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
          </View>

          <View style={styles.customLabelCol}>
            <Text
              style={[
                styles.optionText,
                { color: colors.textPrimary },
                disabled && { color: colors.textMuted },
                isCustomSelected && styles.selectedOptionText,
              ]}
            >
              Custom time
            </Text>
            {isCustomSelected && (
              <Text style={[styles.customSubtitle, { color: colors.primary }]}>
                Custom · {formattedCustomText}
              </Text>
            )}
          </View>
        </View>

        {isCustomSelected && !disabled && <Check size={18} color={colors.primary} />}
      </TouchableOpacity>

      {/* Custom Time Picker Box when Custom time is active */}
      {isCustomSelected && (
        <View style={[styles.customBox, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
          <Text style={[styles.customHeaderLabel, { color: colors.textSecondary }]}>
            SET REMINDER TIME
          </Text>
          <View style={styles.pickerControls}>
            {/* Hour */}
            <View style={styles.inputCol}>
              <TextInput
                style={[
                  styles.timeInput,
                  {
                    backgroundColor: colors.surface1,
                    color: colors.textPrimary,
                    borderColor: colors.border,
                  },
                ]}
                value={inputHour}
                onChangeText={handleHourText}
                keyboardType="number-pad"
                maxLength={2}
                editable={!disabled}
                placeholder="08"
                placeholderTextColor={colors.textMuted}
              />
              <Text style={[styles.subLabel, { color: colors.textMuted }]}>Hour</Text>
            </View>

            <Text style={[styles.colonText, { color: colors.textPrimary }]}>:</Text>

            {/* Minute */}
            <View style={styles.inputCol}>
              <TextInput
                style={[
                  styles.timeInput,
                  {
                    backgroundColor: colors.surface1,
                    color: colors.textPrimary,
                    borderColor: colors.border,
                  },
                ]}
                value={inputMinute}
                onChangeText={handleMinuteText}
                keyboardType="number-pad"
                maxLength={2}
                editable={!disabled}
                placeholder="35"
                placeholderTextColor={colors.textMuted}
              />
              <Text style={[styles.subLabel, { color: colors.textMuted }]}>Minute</Text>
            </View>

            {/* AM / PM Toggle */}
            <View style={styles.periodGroup}>
              <TouchableOpacity
                style={[
                  styles.periodChip,
                  period === 'AM' && { backgroundColor: colors.primary },
                  period !== 'AM' && { backgroundColor: colors.surface1, borderColor: colors.border, borderWidth: 1 },
                ]}
                onPress={() => handlePeriodToggle('AM')}
                disabled={disabled}
              >
                <Text
                  style={[
                    styles.periodText,
                    period === 'AM' ? { color: '#FFFFFF' } : { color: colors.textPrimary },
                  ]}
                >
                  AM
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.periodChip,
                  period === 'PM' && { backgroundColor: colors.primary },
                  period !== 'PM' && { backgroundColor: colors.surface1, borderColor: colors.border, borderWidth: 1 },
                ]}
                onPress={() => handlePeriodToggle('PM')}
                disabled={disabled}
              >
                <Text
                  style={[
                    styles.periodText,
                    period === 'PM' ? { color: '#FFFFFF' } : { color: colors.textPrimary },
                  ]}
                >
                  PM
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
  },
  radioLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    flex: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  customLabelCol: {
    justifyContent: 'center',
  },
  optionText: {
    ...Fonts.typography.bodyMd,
    fontSize: 15,
  },
  selectedOptionText: {
    fontFamily: Fonts.family.sansMedium,
    fontWeight: '600',
  },
  customSubtitle: {
    ...Fonts.typography.labelCodeSm,
    fontSize: 12,
    marginTop: 2,
  },
  customBox: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  customHeaderLabel: {
    ...Fonts.typography.labelCodeSm,
    marginBottom: Spacing.xs + 2,
  },
  pickerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs + 2,
  },
  inputCol: {
    alignItems: 'center',
  },
  timeInput: {
    ...Fonts.typography.labelCodeMd,
    fontSize: 18,
    width: 56,
    height: 44,
    borderRadius: Radii.sm + 2,
    borderWidth: 1,
    textAlign: 'center',
  },
  subLabel: {
    ...Fonts.typography.labelCodeSm,
    fontSize: 10,
    marginTop: 3,
  },
  colonText: {
    ...Fonts.typography.headlineLg,
    fontSize: 22,
    marginTop: -14,
  },
  periodGroup: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: Spacing.xs,
  },
  periodChip: {
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'center',
    borderRadius: Radii.sm + 2,
  },
  periodText: {
    ...Fonts.typography.labelCodeSm,
    fontSize: 13,
  },
});
