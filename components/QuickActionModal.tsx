import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { UpdateTemplate } from '../src/types';
import { buildUpdateContent } from '../src/utils';
import { COLORS } from '../src/theme';

type HelperConfig = {
  description: string;
  fieldLabel: string;
  fieldPlaceholder: string;
  title: string;
  helperLabel: string;
  template: UpdateTemplate;
};

const HELPERS: HelperConfig[] = [
  {
    template: 'waiting',
    helperLabel: 'Waiting',
    title: 'Waiting at bus stop',
    description: 'Create a waiting update for a specific stop.',
    fieldLabel: 'Bus stop',
    fieldPlaceholder: 'Enter bus stop name',
  },
  {
    template: 'driver',
    helperLabel: 'Driver missing',
    title: 'Driver not arrived',
    description: 'Tell passengers the driver has not reached the stop yet.',
    fieldLabel: 'Bus stop',
    fieldPlaceholder: 'Enter bus stop name',
  },
  {
    template: 'delay',
    helperLabel: 'Delay',
    title: 'Bus delay',
    description: 'Share a delay duration in minutes.',
    fieldLabel: 'Delay minutes',
    fieldPlaceholder: 'Enter minutes, e.g. 15',
  },
  {
    template: 'arrived',
    helperLabel: 'Arrived',
    title: 'Bus arrived',
    description: 'Let passengers know the bus has reached the stop.',
    fieldLabel: 'Bus stop',
    fieldPlaceholder: 'Enter bus stop name',
  },
  {
    template: 'general',
    helperLabel: 'General',
    title: 'General update',
    description: 'Write any other trip update.',
    fieldLabel: 'Update text',
    fieldPlaceholder: 'Write your update',
  },
];

type QuickActionModalProps = {
  defaultPassengerName: string;
  onClose: () => void;
  onCreate: (template: UpdateTemplate, detail: string) => Promise<void> | void;
  visible: boolean;
};

type SelectedHelperState = HelperConfig | null;

export function QuickActionModal({
  defaultPassengerName,
  onClose,
  onCreate,
  visible,
}: QuickActionModalProps) {
  const [selectedHelper, setSelectedHelper] = useState<SelectedHelperState>(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!visible) {
      setSelectedHelper(null);
      setValue('');
    }
  }, [visible]);

  const canSubmit = value.trim().length > 0 && selectedHelper !== null;

  const previewText = useMemo(() => {
    if (!selectedHelper) {
      return '';
    }

    return value.trim().length > 0
      ? buildUpdateContent(selectedHelper.template, value.trim())
      : '';
  }, [selectedHelper, value]);

  function closeModal() {
    setSelectedHelper(null);
    setValue('');
    onClose();
  }

  function backToHelpers() {
    setSelectedHelper(null);
    setValue('');
  }

  async function submit() {
    if (!selectedHelper || !canSubmit) {
      return;
    }

    await onCreate(selectedHelper.template, value.trim());
    setSelectedHelper(null);
    setValue('');
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={closeModal}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardShell}
        >
          <View style={styles.card}>
            {!selectedHelper ? (
              <>
                <Text style={styles.title}>Choose a helper</Text>
                <Text style={styles.subtitle}>
                  Pick one of the 5 helpers, then fill the matching form and submit it.
                </Text>
                <View style={styles.helperGrid}>
                  {HELPERS.map((helper) => (
                    <Pressable
                      key={helper.template}
                      onPress={() => setSelectedHelper(helper)}
                      style={({ pressed }) => [styles.helperCard, pressed && styles.pressed]}
                    >
                      <Text style={styles.helperLabel}>{helper.helperLabel}</Text>
                      <Text style={styles.helperTitle}>{helper.title}</Text>
                      <Text style={styles.helperDescription}>{helper.description}</Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable onPress={closeModal} style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.formHeader}>
                  <Pressable onPress={backToHelpers} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
                    <Text style={styles.backButtonText}>Back</Text>
                  </Pressable>
                  <View style={styles.formHeaderText}>
                    <Text style={styles.title}>{selectedHelper.title}</Text>
                    <Text style={styles.subtitle}>{selectedHelper.description}</Text>
                  </View>
                </View>

                <Text style={styles.passengerText}>Posting as {defaultPassengerName}</Text>

                <Text style={styles.fieldLabel}>{selectedHelper.fieldLabel}</Text>
                <TextInput
                  value={value}
                  onChangeText={setValue}
                  placeholder={selectedHelper.fieldPlaceholder}
                  placeholderTextColor={COLORS.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType={selectedHelper.template === 'delay' ? 'number-pad' : 'default'}
                  style={styles.input}
                />

                {previewText ? <Text style={styles.previewText}>{previewText}</Text> : null}

                {!canSubmit ? <Text style={styles.helperText}>This field is required before you can submit.</Text> : null}

                <Pressable
                  disabled={!canSubmit}
                  onPress={() => void submit()}
                  style={({ pressed }) => [
                    styles.submitButton,
                    !canSubmit && styles.submitButtonDisabled,
                    pressed && canSubmit && styles.pressed,
                  ]}
                >
                  <Text style={styles.submitText}>Submit update</Text>
                </Pressable>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: COLORS.card,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    gap: 14,
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  helperGrid: {
    gap: 10,
  },
  helperCard: {
    backgroundColor: COLORS.cardSoft,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 4,
  },
  helperLabel: {
    color: COLORS.accentStrong,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  helperTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
  helperDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  formHeaderText: {
    flex: 1,
    gap: 4,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.cardSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardSoft,
    color: COLORS.text,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  fieldLabel: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  passengerText: {
    color: COLORS.accentStrong,
    fontSize: 13,
    fontWeight: '700',
  },
  previewText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardSoft,
  },
  helperText: {
    color: COLORS.danger,
    fontSize: 13,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.45,
  },
  submitText: {
    color: '#08131f',
    fontSize: 16,
    fontWeight: '800',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
});
