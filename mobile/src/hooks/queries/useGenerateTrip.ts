/**
 * useGenerateTrip Hook
 * 
 * React Query mutation for generating a new trip with AI.
 * Handles the async trip generation flow with loading states.
 * 
 * @module hooks/queries/useGenerateTrip
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TripsService, TripGenerationData, GeneratedTrip } from '../../services/trips';
import { TRIPS_QUERY_KEY } from './useMyTrips';

/**
 * Hook for generating a new trip with AI-powered recommendations.
 * 
 * Features:
 * - Mutation with loading/error states
 * - Automatic cache invalidation after success
 * - Returns generated candidates for swipe flow
 * 
 * @returns Mutation object with mutate function and states
 */
export function useGenerateTrip() {
    const queryClient = useQueryClient();

    return useMutation<GeneratedTrip, Error, TripGenerationData>({
        mutationFn: (data) => TripsService.generateTrip(data),
        onSuccess: () => {
            // Invalidate trips list to include the new trip
            queryClient.invalidateQueries({ queryKey: TRIPS_QUERY_KEY });
        },
    });
}
