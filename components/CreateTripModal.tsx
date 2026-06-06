import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { DatePickerField } from './DatePickerField';
import type { CreateTripInput, Trip } from '../src/types';
import { useTheme } from '../src/theme';
import { endOfLocalDay, formatLocalDate, startOfLocalDay, shiftLocalDate } from '../src/utils';

type CreateTripModalProps = {
  onClose: () => void;
  onSubmit: (input: CreateTripInput) => Promise<Trip | null>;
  visible: boolean;
};

function createEmptyForm(): CreateTripInput {
  return {
    busName: '',
    serviceNumber: '',
    tripDate: formatLocalDate(new Date()),
  };
}

export function CreateTripModal({ onClose, onSubmit, visible }: CreateTripModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [form, setForm] = useState<CreateTripInput>(createEmptyForm);
  const [helpOpen, setHelpOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) {
      setForm(createEmptyForm());
      setHelpOpen(false);
      setError(null);
      setSubmitting(false);
    }
  }, [visible]);

  const canSubmit = form.serviceNumber.trim().length > 0 && form.tripDate.trim().length > 0;

  function updateField<K extends keyof CreateTripInput>(key: K, value: CreateTripInput[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function closeModal() {
    setForm(createEmptyForm());
    setHelpOpen(false);
    setError(null);
    setSubmitting(false);
    onClose();
  }

  async function submit() {
    if (!canSubmit || submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);
    const createdTrip = await onSubmit({
      busName: form.busName.trim(),
      serviceNumber: form.serviceNumber.trim(),
      tripDate: form.tripDate.trim(),
    });

    if (createdTrip) {
      closeModal();
    } else {
      setError('We could not create this trip.');
    }

    setSubmitting(false);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={closeModal}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardShell}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Create trip</Text>
            <Text style={styles.subtitle}>
              Add the trip details below. If the service number already exists, we will open that trip instead.
            </Text>

            <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Bus name</Text>
                <TextInput
                  value={form.busName}
                  onChangeText={(value) => updateField('busName', value)}
                  placeholder="Optional bus name"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="words"
                  autoCorrect={false}
                  style={styles.input}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Service no *</Text>
                <TextInput
                  value={form.serviceNumber}
                  onChangeText={(value) => updateField('serviceNumber', value)}
                  placeholder="Enter service number"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  style={styles.input}
                />
                <Pressable
                  onPress={() => setHelpOpen((current) => !current)}
                  style={({ pressed }) => [styles.helpToggle, pressed && styles.pressed]}
                >
                  <Text style={styles.helpToggleText}>How to find service number</Text>
                </Pressable>
                {helpOpen ? (
                  <Text style={styles.helpText}>
                    Look for the number printed on the bus schedule, ticket, or route board. Use the exact
                    service number shown there.
                  </Text>
                ) : null}
              </View>

              <View style={styles.fieldGroup}>
                <DatePickerField
                  label="Date *"
                  value={form.tripDate}
                  onChange={(value) => updateField('tripDate', value)}
                  placeholder="Select date"
                  helperText="Today or tomorrow only"
                  minimumDate={startOfLocalDay(new Date())}
                  maximumDate={endOfLocalDay(shiftLocalDate(new Date(), 1))}
                />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {!canSubmit ? <Text style={styles.requiredText}>Service number and date are required.</Text> : null}

              <View style={styles.actions}>
                <Pressable
                  onPress={closeModal}
                  style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                >
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  disabled={!canSubmit || submitting}
                  onPress={() => void submit()}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    (!canSubmit || submitting) && styles.primaryButtonDisabled,
                    pressed && canSubmit && !submitting && styles.pressed,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>{submitting ? 'Saving...' : 'Create trip'}</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 14, 0.72)',
    justifyContent: 'center',
    padding: 20,
  },
  keyboardShell: {
    width: '100%',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 14,
    maxHeight: '90%',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  form: {
    gap: 14,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardSoft,
    color: colors.text,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  helpToggle: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  helpToggleText: {
    color: colors.accentStrong,
    fontSize: 13,
    fontWeight: '700',
  },
  helpText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  requiredText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 4,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.cardSoft,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 14,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
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
}
