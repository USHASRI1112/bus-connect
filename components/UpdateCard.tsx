import { StyleSheet, Text, View } from 'react-native';

import type { TripUpdate } from '../src/types';
import { useTheme } from '../src/theme';
import { formatTime } from '../src/utils';

type UpdateCardProps = {
  update: TripUpdate;
};

export function UpdateCard({ update }: UpdateCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.passenger, { color: colors.accentStrong }]}>{update.passengerName}</Text>
        <Text style={[styles.time, { color: colors.muted }]}>{formatTime(update.time)}</Text>
      </View>
      <Text style={[styles.content, { color: colors.text }]}>{update.content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  passenger: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  time: {
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
  },
});
