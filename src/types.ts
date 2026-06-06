export type Trip = {
  id: string;
  serviceNumber: string;
  busName?: string;
  date: string;
  isArchived: boolean;
};

export type TripUpdate = {
  id: string;
  passengerName: string;
  content: string;
  time: string;
  tripId: string;
};

export type DiscussionSession = {
  passengerName: string;
  trip: Trip;
  isArchived: boolean;
  updates: TripUpdate[];
};

export type UpdateTemplate = 'waiting' | 'driver' | 'delay' | 'arrived' | 'general';

export type CreateTripInput = {
  busName: string;
  serviceNumber: string;
  tripDate: string;
};
