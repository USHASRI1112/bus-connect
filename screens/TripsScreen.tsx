import { router } from 'expo-router';
import { useMemo } from 'react';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../components/EmptyState';
import { DatePickerField } from '../components/DatePickerField';
import { CreateTripModal } from '../components/CreateTripModal';
import { InputField } from '../components/InputField';
import { LoadingState } from '../components/LoadingState';
import { ScreenHeader } from '../components/ScreenHeader';
import { TripCard } from '../components/TripCard';
import { useTripFilters } from '../hooks/useTripFilters';
import { createTrip, fetchTrips } from '../src/mockBackend';
import { discussionRoute } from '../src/routes';
import type { CreateTripInput, Trip } from '../src/types';
import { useTheme } from '../src/theme';
import { endOfLocalDay, startOfLocalDay, shiftLocalDate } from '../src/utils';

export function TripsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createTripOpen, setCreateTripOpen] = useState(false);
  const { clearFilters, filteredTrips, filters, hasTrips, updateFilter } = useTripFilters(trips);

  useEffect(() => {
    let cancelled = false;

    async function loadTrips() {
      setLoading(true);
      setError(null);
      const response = await fetchTrips();

      if (!cancelled) {
        if (response) {
          setTrips(response);
        } else {
          setError('We could not load trips right now.');
        }
        setLoading(false);
      }
    }

    loadTrips();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const pollingInterval = 2 * 60 * 60 * 1000;

    const intervalId = setInterval(() => {
      void (async () => {
        setRefreshing(true);
        const response = await fetchTrips();

        if (!cancelled) {
          if (response) {
            setTrips(response);
          } else {
            setError('We could not refresh trips right now.');
          }
          setRefreshing(false);
        }
      })();
    }, pollingInterval);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  }

  function openTrip(tripId: string) {
    router.push(discussionRoute(tripId));
  }

  async function handleCreateTrip(input: CreateTripInput): Promise<Trip | null> {
    const createdTrip = await createTrip(input);
    if (!createdTrip) {
      setError('We could not create this trip right now.');
      return null;
    }

    setTrips((current) => {
      const withoutDuplicate = current.filter((trip) => trip.id !== createdTrip.id);
      return [...withoutDuplicate, createdTrip].sort((left, right) => {
        if (left.date === right.date) {
          return left.serviceNumber.localeCompare(right.serviceNumber);
        }

        return left.date.localeCompare(right.date);
      });
    });

    router.push(discussionRoute(createdTrip.id));
    return createdTrip;
  }

  async function refreshTrips() {
    setRefreshing(true);
    setError(null);
    const response = await fetchTrips();

    if (response) {
      setTrips(response);
    } else {
      setError('We could not refresh trips right now.');
    }
    setRefreshing(false);
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader onBack={goBack} title="Trips" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.filterCard}>
          <Text style={styles.sectionTitle}>Search trips</Text>

          <DatePickerField
            label="Date"
            value={filters.date}
            onChange={(value) => updateFilter('date', value)}
            onClear={() => updateFilter('date', '')}
            placeholder="Any date"
            helperText="Yesterday and today only"
            minimumDate={startOfLocalDay(shiftLocalDate(new Date(), -1))}
            maximumDate={endOfLocalDay(new Date())}
          />
          <InputField
            label="Service number"
            value={filters.serviceNumber}
            onChangeText={(value) => updateFilter('serviceNumber', value)}
            placeholder="Search by service number"
          />
          <InputField
            label="Bus name"
            value={filters.busName}
            onChangeText={(value) => updateFilter('busName', value)}
            placeholder="Optional bus name"
          />

          <View style={styles.filterActions}>
            <Pressable onPress={clearFilters} style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}>
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
            <Pressable
              disabled={refreshing || loading}
              onPress={() => refreshTrips()}
              style={({ pressed }) => [
                styles.refreshButton,
                (refreshing || loading) && styles.refreshButtonDisabled,
                pressed && !refreshing && !loading && styles.pressed,
              ]}
            >
              <Text style={styles.refreshText}>{refreshing ? 'Refreshing...' : 'Refresh'}</Text>
            </Pressable>
            <Text style={styles.resultsText}>{filteredTrips.length} trips found</Text>
          </View>
        </View>

        {loading ? (
          <LoadingState label="Loading trips..." />
        ) : error ? (
          <EmptyState title="Trips unavailable" message={error} />
          ) : filteredTrips.length === 0 ? (
          <EmptyState
            title={hasTrips ? 'No trips match your search' : 'Create your trip please'}
            message={
              hasTrips
                ? 'Try clearing the filters or searching with a different service number.'
                : 'We do not have any trips in the backend yet.'
            }
            actionLabel={hasTrips ? 'Reset filters' : 'Create trip'}
            onAction={hasTrips ? clearFilters : () => setCreateTripOpen(true)}
          />
        ) : (
          <View style={styles.tripList}>
            {filteredTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onPress={() => openTrip(trip.id)} />
            ))}
          </View>
        )}
      </ScrollView>

      {!loading && !error && hasTrips ? (
        <Pressable onPress={() => setCreateTripOpen(true)} style={({ pressed }) => [styles.fab, pressed && styles.pressed]}>
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      ) : null}

      <CreateTripModal
        visible={createTripOpen}
        onClose={() => {
          setCreateTripOpen(false);
        }}
        onSubmit={handleCreateTrip}
      />
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
    gap: 16,
  },
  filterCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  filterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 4,
  },
  clearButton: {
    backgroundColor: colors.cardSoft,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  refreshButton: {
    backgroundColor: colors.cardSoft,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  refreshButtonDisabled: {
    opacity: 0.65,
  },
  refreshText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  resultsText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  tripList: {
    gap: 12,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 5,
  },
  fabText: {
    color: '#08131f',
    fontSize: 30,
    lineHeight: 30,
    fontWeight: '900',
    marginTop: -2,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  });
}
