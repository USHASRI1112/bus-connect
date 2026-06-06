import { useMemo, useState } from 'react';

import type { Trip } from '../src/types';

export type TripFilters = {
  date: string;
  serviceNumber: string;
  busName: string;
};

const EMPTY_FILTERS: TripFilters = {
  date: '',
  serviceNumber: '',
  busName: '',
};

export function useTripFilters(trips: Trip[]) {
  const [filters, setFilters] = useState<TripFilters>(EMPTY_FILTERS);

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const dateMatches = filters.date.trim() ? trip.date === filters.date.trim() : true;
      const serviceMatches = filters.serviceNumber.trim()
        ? trip.serviceNumber.toLowerCase().includes(filters.serviceNumber.trim().toLowerCase())
        : true;
      const busMatches = filters.busName.trim()
        ? trip.busName?.toLowerCase().includes(filters.busName.trim().toLowerCase()) ?? false
        : true;

      return dateMatches && serviceMatches && busMatches;
    });
  }, [filters, trips]);

  function updateFilter<K extends keyof TripFilters>(key: K, value: TripFilters[K]) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
  }

  return {
    clearFilters,
    filteredTrips,
    filters,
    hasTrips: trips.length > 0,
    updateFilter,
  };
}
