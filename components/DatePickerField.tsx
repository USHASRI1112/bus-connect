import { useEffect, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import { useTheme } from '../src/theme';
import { formatDisplayDate, formatLocalDate, parseLocalDate } from '../src/utils';

type DatePickerFieldProps = {
  helperText?: string;
  label: string;
  maximumDate?: Date;
  minimumDate?: Date;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder: string;
  value: string;
};

export function DatePickerField({
  helperText,
  label,
  maximumDate,
  minimumDate,
  onChange,
  onClear,
  placeholder,
  value,
}: DatePickerFieldProps) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [draftDate, setDraftDate] = useState<Date>(() => parseLocalDate(value) ?? new Date());

  useEffect(() => {
    if (visible) {
      setDraftDate(parseLocalDate(value) ?? new Date());
    }
  }, [value, visible]);

  const displayValue = useMemo(() => {
    if (!value.trim()) {
      return placeholder;
    }

    return formatDisplayDate(value);
  }, [placeholder, value]);

  function openPicker() {
    const currentDate = parseLocalDate(value) ?? new Date();
    setDraftDate(currentDate);

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: currentDate,
        mode: 'date',
        minimumDate,
        maximumDate,
        onChange: (_event, selectedDate) => {
          if (selectedDate) {
            onChange(formatLocalDate(selectedDate));
          }
        },
      });
      return;
    }

    setVisible(true);
  }

  function closePicker() {
    setVisible(false);
  }

  function handleChange(_event: DateTimePickerEvent, selectedDate?: Date) {
    if (selectedDate) {
      setDraftDate(selectedDate);
    }
  }

  function applyDate() {
    onChange(formatLocalDate(draftDate));
    setVisible(false);
  }

  return (
    <View style={styles.group}>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <Pressable
        onPress={openPicker}
        style={({ pressed }) => [
          styles.field,
          pressed && styles.pressed,
          { borderColor: colors.border, backgroundColor: colors.cardSoft },
        ]}
      >
        <Text
          style={[styles.fieldText, !value.trim() && styles.placeholderText, { color: value.trim() ? colors.text : colors.muted }]}
          numberOfLines={1}
        >
          {displayValue}
        </Text>
      </Pressable>
      <View style={styles.footerRow}>
        {helperText ? <Text style={[styles.helperText, { color: colors.muted }]}>{helperText}</Text> : <View />}
        {value.trim().length > 0 && onClear ? (
          <Pressable onPress={onClear} style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}>
            <Text style={[styles.clearText, { color: colors.accentStrong }]}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      {Platform.OS === 'ios' ? (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={closePicker}>
          <View style={styles.backdrop}>
            <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.modalHeader}>
                <Pressable
                  onPress={closePicker}
                  style={({ pressed }) => [
                    styles.backButton,
                    pressed && styles.pressed,
                    { backgroundColor: colors.cardSoft, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text>
                </Pressable>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{label}</Text>
                <View style={styles.headerSpacer} />
              </View>
              <Text style={[styles.modalSubtitle, { color: colors.muted }]}>
                Pick a date from the calendar. Use the exact day the trip should be shown on.
              </Text>

              <DateTimePicker
                value={draftDate}
                mode="date"
                display="inline"
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                onChange={handleChange}
              />

              <View style={styles.modalActions}>
                <Pressable
                  onPress={closePicker}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.pressed,
                    { backgroundColor: colors.cardSoft, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={applyDate}
                  style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                >
                  <Text style={styles.primaryButtonText}>Apply</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  field: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    minHeight: 48,
    justifyContent: 'center',
  },
  fieldText: {
    fontSize: 15,
  },
  placeholderText: {
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  helperText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  clearButton: {
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '700',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 14, 0.72)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerSpacer: {
    width: 56,
  },
  backButton: {
    minWidth: 56,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 14,
    lineHeight: 21,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 4,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#66e0c4',
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#08131f',
    fontSize: 15,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
});
