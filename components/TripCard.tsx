import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Trip } from '../src/types';
import { useTheme } from '../src/theme';

type TripCardProps = {
  onPress: () => void;
  trip: Trip;
};

export function TripCard({ onPress, trip }: TripCardProps) {
  const { colors } = useTheme();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.header}>
        <Text style={[styles.serviceNumber, { color: colors.text }]}>{trip.serviceNumber}</Text>
        <View style={styles.metaRow}>
          {trip.isArchived ? (
            <View style={[styles.archivedBadge, { backgroundColor: colors.accentSoft }]}>
              <Text style={[styles.archivedText, { color: colors.accentStrong }]}>Archived</Text>
            </View>
          ) : null}
          <Text style={[styles.date, { color: colors.accentStrong }]}>{trip.date}</Text>
        </View>
      </View>
      <Text style={[styles.busName, { color: colors.text }]}>{trip.busName ?? 'Bus name not shared'}</Text>
      <Text style={[styles.hint, { color: colors.muted }]}>{trip.isArchived ? 'Read-only discussion' : 'Tap to open discussion'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  archivedBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  archivedText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  serviceNumber: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
  },
  date: {
    fontSize: 13,
    fontWeight: '700',
  },
  busName: {
    fontSize: 15,
    fontWeight: '600',
  },
  hint: {
    fontSize: 13,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
});
