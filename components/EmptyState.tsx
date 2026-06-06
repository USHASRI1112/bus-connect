import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../src/theme';

type EmptyStateProps = {
  actionLabel?: string;
  message: string;
  onAction?: () => void;
  title: string;
};

export function EmptyState({ actionLabel, message, onAction, title }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.pressed,
            { backgroundColor: colors.cardSoft, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.actionText, { color: colors.text }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    minHeight: 220,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  actionButton: {
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
});
