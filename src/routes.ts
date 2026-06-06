export type DiscussionRouteParams = {
  tripId: string;
};

export function discussionRoute(tripId: string) {
  return {
    pathname: '/discussion/[tripId]' as const,
    params: { tripId },
  };
}
