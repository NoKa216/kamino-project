/**
 * useTripDetails Hook
 * 
 * React Query wrapper for fetching a single trip by ID.
 * Used for resume functionality and swipe screen.
 * 
 * @module hooks/queries/useTripDetails
 */

import { useQuery } from '@tanstack/react-query';
import { TripsService, GeneratedTrip } from '../../services/trips';

/**
 * Query key factory for trip details
 */
export const tripDetailsQueryKey = (tripId: string) => ['trip', tripId] as const;

/**
 * Hook to fetch a single trip by ID.
 * 
 * Features:
 * - Automatic caching per trip ID
 * - Only fetches when tripId is provided
 * - Full trip data including candidates and swipe state
 * 
 * @param tripId - Firestore document ID of the trip
 * @returns Query result with trip data, loading, and error states
 */
export function useTripDetails(tripId: string | undefined) {
    return useQuery<GeneratedTrip | null, Error>({
        queryKey: tripDetailsQueryKey(tripId || ''),
        queryFn: () => tripId ? TripsService.getTripById(tripId) : null,
        enabled: !!tripId, // Only fetch when tripId is available
        staleTime: 1000 * 60 * 2, // 2 minutes for detail views
    });
}
