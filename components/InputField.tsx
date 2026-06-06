import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '../src/theme';

type InputFieldProps = {
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

export function InputField({ label, onChangeText, placeholder, value }: InputFieldProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        autoCorrect={false}
        style={[
          styles.input,
          { borderColor: colors.border, backgroundColor: colors.cardSoft, color: colors.text },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
});
