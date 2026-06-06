import { router } from 'expo-router';
import { useMemo } from 'react';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../components/EmptyState';
import { LoadingState } from '../components/LoadingState';
import { QuickActionModal } from '../components/QuickActionModal';
import { ScreenHeader } from '../components/ScreenHeader';
import { UpdateCard } from '../components/UpdateCard';
import { addTripUpdate, fetchDiscussionSession } from '../src/mockBackend';
import type { DiscussionSession, UpdateTemplate } from '../src/types';
import { useTheme } from '../src/theme';

const EMPTY_DISCUSSION_HINT =
  'No updates here, please create an update with one of the quick actions below.';

type DiscussionScreenProps = {
  tripId: string;
};

export function DiscussionScreen({ tripId }: DiscussionScreenProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [discussion, setDiscussion] = useState<DiscussionSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDiscussion() {
      setLoading(true);
      setError(null);
      const response = await fetchDiscussionSession(tripId);

      if (!cancelled) {
        if (response) {
          setDiscussion(response);
          setSubmissionError(null);
        } else {
          setError('We could not load this trip discussion.');
          setDiscussion(null);
        }
        setLoading(false);
      }
    }

    loadDiscussion();

    return () => {
      cancelled = true;
    };
  }, [tripId]);

  useEffect(() => {
    let cancelled = false;
    const pollingInterval = 1 * 60 * 1000;

    const intervalId = setInterval(() => {
      void (async () => {
        setPolling(true);
        const response = await fetchDiscussionSession(tripId);

        if (!cancelled) {
          if (response) {
            setDiscussion(response);
            setSubmissionError(null);
          } else {
            setError('We could not refresh this trip discussion.');
          }
          setPolling(false);
        }
      })();
    }, pollingInterval);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [tripId]);

  async function refreshDiscussion() {
    setRefreshing(true);
    setError(null);
    const response = await fetchDiscussionSession(tripId);

    if (response) {
      setDiscussion(response);
      setSubmissionError(null);
    } else {
      setError('We could not refresh this trip discussion.');
    }
    setRefreshing(false);
  }

  function goBack() {
    setComposeOpen(false);

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/trips');
  }

  async function handleCreate(template: UpdateTemplate, detail: string) {
    if (!discussion) {
      return;
    }

    const createdUpdate = await addTripUpdate(discussion.trip.id, template, detail);

    if (createdUpdate) {
      setDiscussion((current) =>
        current
          ? {
              ...current,
              updates: [createdUpdate, ...current.updates],
            }
          : current
      );
      setComposeOpen(false);
      setSubmissionError(null);
    } else {
      setSubmissionError('We could not add this update.');
    }
  }

  const hasUpdates = (discussion?.updates.length ?? 0) > 0;
  const canCreateUpdates = Boolean(discussion && !discussion.isArchived);

  return (
    <View style={styles.screen}>
      <ScreenHeader onBack={goBack} title="Discussion" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <LoadingState label="Fetching trip discussion..." />
        ) : error ? (
          <EmptyState title="Discussion unavailable" message={error} />
        ) : discussion ? (
          <>
            <View style={styles.summaryCard}>
              <View style={styles.summaryTopRow}>
                <View style={styles.summaryTextBlock}>
                  <Text style={styles.summaryTitle}>{discussion.trip.serviceNumber}</Text>
                  <Text style={styles.summaryBusName}>{discussion.trip.busName ?? 'Bus name not shared'}</Text>
                </View>
                <Pressable
                  disabled={refreshing || polling}
                  onPress={() => void refreshDiscussion()}
                  style={({ pressed }) => [
                    styles.refreshButton,
                    (refreshing || polling) && styles.refreshButtonDisabled,
                    pressed && !refreshing && !polling && styles.pressed,
                  ]}
                >
                  <Text style={styles.refreshButtonText}>
                    {refreshing ? 'Refreshing...' : polling ? 'Polling...' : 'Refresh'}
                  </Text>
                </Pressable>
              </View>
              <View style={styles.badgeRow}>
                <MetaBadge label={`Date ${discussion.trip.date}`} />
                <MetaBadge label={discussion.passengerName} />
                {discussion.isArchived ? <MetaBadge label="Archived" /> : null}
              </View>
            </View>

            {submissionError ? (
              <View style={styles.readOnlyBanner}>
                <Text style={styles.readOnlyText}>{submissionError}</Text>
              </View>
            ) : null}

            {hasUpdates ? (
              <View style={styles.updateList}>
                {discussion.updates.map((update) => (
                  <UpdateCard key={update.id} update={update} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyDiscussion}>
                <Text style={styles.emptyTitle}>{discussion.isArchived ? 'This trip is archived' : 'No updates here'}</Text>
                <Text style={styles.emptyText}>
                  {discussion.isArchived
                    ? 'This discussion is read-only now. You can still view existing updates.'
                    : EMPTY_DISCUSSION_HINT}
                </Text>
                {canCreateUpdates ? (
                  <Pressable onPress={() => setComposeOpen(true)} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
                    <Text style={styles.primaryButtonText}>Create update</Text>
                  </Pressable>
                ) : null}
              </View>
            )}
          </>
        ) : null}
      </ScrollView>

      {canCreateUpdates && hasUpdates ? (
        <Pressable onPress={() => setComposeOpen(true)} style={({ pressed }) => [styles.fab, pressed && styles.pressed]}>
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      ) : null}

      {canCreateUpdates ? (
        <QuickActionModal
          defaultPassengerName={discussion?.passengerName ?? ''}
          visible={composeOpen}
          onClose={() => {
            setComposeOpen(false);
          }}
          onCreate={handleCreate}
        />
      ) : null}
    </View>
  );
}

function MetaBadge({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.cardSoft,
        borderColor: colors.border,
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 7,
      }}
    >
      <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
    gap: 16,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 10,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryTextBlock: {
    flex: 1,
    gap: 10,
  },
  summaryTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  summaryBusName: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: colors.cardSoft,
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonDisabled: {
    opacity: 0.65,
  },
  refreshButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaBadge: {
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  metaBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  updateList: {
    gap: 12,
  },
  emptyDiscussion: {
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  readOnlyBanner: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  readOnlyText: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  primaryButtonText: {
    color: '#08131f',
    fontSize: 16,
    fontWeight: '800',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  fabText: {
    color: '#09131f',
    fontSize: 32,
    fontWeight: '700',
    marginTop: -2,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  });
}
