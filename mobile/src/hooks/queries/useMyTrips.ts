/**
 * useMyTrips Hook
 * 
 * React Query wrapper for fetching user's trips.
 * Provides automatic caching, background refetching, and loading/error states.
 * 
 * @module hooks/queries/useMyTrips
 */

import { useQuery } from '@tanstack/react-query';
import { TripsService, GeneratedTrip } from '../../services/trips';

/**
 * Query key for trips list - used for cache invalidation
 */
export const TRIPS_QUERY_KEY = ['trips'] as const;

/**
 * Hook to fetch all trips for the current user.
 * 
 * Features:
 * - Automatic caching (5 min stale time)
 * - Background refetching on mount
 * - Loading and error states
 * 
 * @returns Query result with trips data, loading, and error states
 */
export function useMyTrips() {
    return useQuery<GeneratedTrip[], Error>({
        queryKey: TRIPS_QUERY_KEY,
        queryFn: () => TripsService.getUserTrips(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
