import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../src/theme';

type LoadingStateProps = {
  label: string;
};

export function LoadingState({ label }: LoadingStateProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.loadingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ActivityIndicator color={colors.accent} />
      <Text style={[styles.loadingText, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingCard: {
    minHeight: 180,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
