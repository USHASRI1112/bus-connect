import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BusIllustration } from '../components/BusIllustration';
import { ScreenHeader } from '../components/ScreenHeader';
import { useTheme } from '../src/theme';

function InfoPill({
  label,
  styles,
  value,
}: {
  label: string;
  styles: ReturnType<typeof createStyles>;
  value: string;
}) {
  return (
    <View style={styles.infoPill}>
      <Text style={styles.infoPillValue}>{value}</Text>
      <Text style={styles.infoPillLabel}>{label}</Text>
    </View>
  );
}

export function WelcomeScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.screen}>
      <ScreenHeader />
      <View style={styles.page}>
        <View style={styles.topArt}>
          <BusIllustration />
        </View>

        <View style={styles.middleContent}>
          <View style={styles.card}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>BusConnect</Text>
            </View>
            <Text style={styles.title}>Ride Together, Talk Together.</Text>
            <Text style={styles.subtitle}>
              An instant community for your bus trip, active for the journey and gone after.
            </Text>

            {/* <View style={styles.statsRow}>
              <InfoPill label="App name" styles={styles} value="BusConnect" />
              <InfoPill label="Trip chats" styles={styles} value="Live" />
              <InfoPill label="Lifetime" styles={styles} value="Journey only" />
            </View> */}
          </View>
        </View>

        <View style={styles.bottomCtaWrap}>
          <Pressable
            onPress={() => router.push('/trips')}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text style={styles.buttonText}>Find My Trip</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    content: {
      flexGrow: 1,
      padding: 20,
      backgroundColor: colors.background,
    },
    screen: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 50,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      // alignContent: 'center',

    },
    page: {
      flex: 1,
      paddingHorizontal: 20,
      paddingBottom: 20,
      justifyContent: 'flex-start',
      gap: 12,
    },
    topArt: {
      height: 160,
      overflow: 'hidden',
      borderRadius: 24,
    },
    middleContent: {
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 24,
      gap: 18,
    },
    badge: {
      alignSelf: 'flex-start',
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: colors.accentSoft,
    },
    badgeText: {
      color: colors.accentStrong,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    title: {
      color: colors.text,
      fontSize: 33,
      lineHeight: 40,
      fontWeight: '800',
      letterSpacing: -0.7,
    },
    subtitle: {
      color: colors.muted,
      fontSize: 15,
      lineHeight: 22,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 10,
      flexWrap: 'wrap',
    },
    infoPill: {
      minWidth: 92,
      flexGrow: 1,
      backgroundColor: colors.cardSoft,
      borderRadius: 18,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoPillValue: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '800',
    },
    infoPillLabel: {
      color: colors.muted,
      fontSize: 12,
      marginTop: 2,
    },
    button: {
      backgroundColor: colors.accent,
      borderRadius: 18,
      paddingVertical: 16,
      alignItems: 'center',
      width: '100%',
    },
    buttonText: {
      color: '#08131f',
      fontSize: 16,
      fontWeight: '800',
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.99 }],
    },
    bottomCtaWrap: {
      paddingTop: 8,
    },
  });
