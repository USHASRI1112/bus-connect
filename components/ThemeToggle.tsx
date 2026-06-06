import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../src/theme';

export function ThemeToggle() {
  const { colors, mode, toggleMode } = useTheme();
  const isDarkMode = mode === 'dark';

  return (
    <Pressable
      accessibilityLabel={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
      onPress={() => void toggleMode()}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        { borderColor: colors.border, backgroundColor: colors.cardSoft },
      ]}
    >
      <Ionicons
        name={isDarkMode ? 'sunny-outline' : 'moon-outline'}
        size={20}
        color={colors.text}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 18,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
