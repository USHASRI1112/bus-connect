import type { CreateTripInput, DiscussionSession, Trip, TripUpdate, UpdateTemplate } from './types';
import { getApiBaseUrl } from './apiConfig';
import { getClientSessionId } from './clientSession';

async function requestJson<T>(path: string, init?: RequestInit): Promise<T | null> {
  const clientSessionId = await getClientSessionId();
  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-client-session-id': clientSessionId,
        ...(init?.headers ?? {}),
      },
      ...init,
    });

    if (!response.ok) {
      const message = await parseErrorMessage(response);
      console.error(`Request to ${path} failed: ${message}`);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`Network error while requesting ${path}:`, error);
    return null;
  }
}

async function parseErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { message?: string };
    return payload.message ?? `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

export async function fetchTrips(): Promise<Trip[] | null> {
  return requestJson<Trip[]>('/trips');
}

export async function createTrip(input: CreateTripInput): Promise<Trip | null> {
  return requestJson<Trip>('/trips', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function fetchDiscussionSession(tripId: string): Promise<DiscussionSession | null> {
  return requestJson<DiscussionSession>(`/trips/${tripId}/discussion`);
}

export async function addTripUpdate(
  tripId: string,
  template: UpdateTemplate,
  detail: string
): Promise<TripUpdate | null> {
  return requestJson<TripUpdate>(`/trips/${tripId}/updates`, {
    method: 'POST',
    body: JSON.stringify({ template, detail }),
  });
}
