import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../src/theme';

type ScreenHeaderProps = {
  onBack?: () => void;
  title?: string;
};

export function ScreenHeader({ onBack, title }: ScreenHeaderProps) {
  const { colors } = useTheme();
  const showTitle = typeof title === 'string' && title.length > 0;

  return (
    <View style={styles.container}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
            { backgroundColor: colors.cardSoft, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text>
        </Pressable>
      ) : (
        <View style={styles.spacer} />
      )}
      {showTitle ? <Text style={[styles.title, { color: colors.text }]}>{title}</Text> : <View style={styles.centerSpacer} />}
      <View style={styles.rightSlot}>
        <ThemeToggle />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  spacer: {
    width: 56,
  },
  centerSpacer: {
    flex: 1,
  },
  rightSlot: {
    width: 56,
    alignItems: 'flex-end',
  },
  backButton: {
    width: 56,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  backButtonText: {
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
});
