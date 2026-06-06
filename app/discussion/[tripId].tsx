import { Redirect, useLocalSearchParams } from 'expo-router';

import { DiscussionScreen } from '../../screens/DiscussionScreen';
import type { DiscussionRouteParams } from '../../src/routes';

export default function DiscussionRoute() {
  const params = useLocalSearchParams<Partial<DiscussionRouteParams>>();
  const tripId = Array.isArray(params.tripId) ? params.tripId[0] : params.tripId;

  if (!tripId) {
    return <Redirect href="/trips" />;
  }

  return <DiscussionScreen tripId={tripId} />;
}
