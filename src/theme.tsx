import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark';

export type ThemeColors = {
  accent: string;
  accentSoft: string;
  accentStrong: string;
  background: string;
  backgroundTwo: string;
  border: string;
  card: string;
  cardSoft: string;
  danger: string;
  muted: string;
  text: string;
};

export const SPACING = {
  page: 20,
} as const;

const DARK_COLORS: ThemeColors = {
  background: '#07111f',
  backgroundTwo: '#0f1f36',
  border: 'rgba(255,255,255,0.08)',
  card: 'rgba(8, 18, 35, 0.92)',
  cardSoft: 'rgba(255,255,255,0.04)',
  accent: '#66e0c4',
  accentSoft: 'rgba(102,224,196,0.14)',
  accentStrong: '#8df1d9',
  danger: '#ff8c7a',
  text: '#f5f7fb',
  muted: '#98a8c2',
};

const LIGHT_COLORS: ThemeColors = {
  background: '#f3f7fd',
  backgroundTwo: '#dce9f8',
  border: 'rgba(8,19,31,0.12)',
  card: '#ffffff',
  cardSoft: 'rgba(8,19,31,0.04)',
  accent: '#0e7c66',
  accentSoft: 'rgba(14,124,102,0.12)',
  accentStrong: '#0e7c66',
  danger: '#c94f43',
  text: '#0b1622',
  muted: '#5c6b80',
};

const THEME_MAP: Record<ThemeMode, ThemeColors> = {
  dark: DARK_COLORS,
  light: LIGHT_COLORS,
};

export const COLORS = DARK_COLORS;

type ThemeContextValue = {
  colors: ThemeColors;
  mode: ThemeMode;
  ready: boolean;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggleMode: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const ready = true;

  async function setMode(modeValue: ThemeMode) {
    setModeState(modeValue);
  }

  async function toggleMode() {
    const nextMode = mode === 'dark' ? 'light' : 'dark';
    await setMode(nextMode);
  }

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: THEME_MAP[mode],
      mode,
      ready,
      setMode,
      toggleMode,
    }),
    [mode, ready]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
