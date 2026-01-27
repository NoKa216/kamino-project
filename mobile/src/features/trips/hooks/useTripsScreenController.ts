/**
 * useTripsScreenController - MVVM Controller Hook
 * 
 * Extracts all business logic from the Trips Screen.
 * The screen component only renders UI based on this hook's output.
 * 
 * Responsibilities:
 * - Fetch user's trips via React Query
 * - Handle trip press navigation (resume vs view)
 * - Handle pull-to-refresh
 * - Provide loading/error states
 * 
 * @module features/trips/hooks/useTripsScreenController
 */

import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useMyTrips } from '../../../hooks/queries';
import { GeneratedTrip } from '../../../services/trips';

/** Controller state for View consumption */
export interface TripsScreenState {
    /** Array of user's trips */
    trips: GeneratedTrip[];
    /** Whether data is loading initially */
    isLoading: boolean;
    /** Whether there was an error loading trips */
    isError: boolean;
    /** Whether refresh is in progress */
    isRefreshing: boolean;
}

/** Controller actions for View consumption */
export interface TripsScreenActions {
    /** Handle trip card press - navigates to swipe or details */
    handleTripPress: (trip: GeneratedTrip) => void;
    /** Handle pull-to-refresh */
    handleRefresh: () => void;
    /** Navigate to create new trip */
    handleCreateTrip: () => void;
}

export interface TripsScreenController extends TripsScreenState, TripsScreenActions { }

/**
 * Extract already-swiped IDs from a trip (handles both old and new schema)
 */
function extractSwipedIds(trip: GeneratedTrip): string[] {
    let likeIds: string[] = [];
    let dislikeIds: string[] = [];

    // Try new lean schema first
    if (trip.swipedLikeIds) {
        likeIds = trip.swipedLikeIds;
    } else if (trip.swipedLikes) {
        likeIds = trip.swipedLikes.map((place: { id: string }) => place.id);
    }

    if (trip.swipedDislikeIds) {
        dislikeIds = trip.swipedDislikeIds;
    } else if (trip.swipedDislikes) {
        dislikeIds = trip.swipedDislikes.map((place: { id: string }) => place.id);
    }

    return [...likeIds, ...dislikeIds];
}

/**
 * Controller hook for the Trips Screen.
 * Encapsulates all business logic, leaving the UI as pure rendering.
 */
export function useTripsScreenController(): TripsScreenController {
    const router = useRouter();

    // React Query hook
    const {
        data: trips = [],
        isLoading,
        isError,
        refetch,
        isRefetching
    } = useMyTrips();

    // Handle trip card press
    const handleTripPress = useCallback((trip: GeneratedTrip) => {
        if (trip.status === 'planning') {
            const alreadySwipedIds = extractSwipedIds(trip);

            // Resume swipe flow with progress filtering
            router.push({
                pathname: '/(app)/trip/[id]/swipe',
                params: {
                    id: trip.id || trip.tripId || '',
                    candidates: JSON.stringify(trip.candidates || []),
                    swipedIds: JSON.stringify(alreadySwipedIds)
                }
            });
        } else {
            // Navigate to finalized trip details (TODO: implement details screen)
            console.log('[TripsController] Navigate to trip details:', trip.id || trip.tripId);
        }
    }, [router]);

    // Handle pull-to-refresh
    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    // Navigate to create trip
    const handleCreateTrip = useCallback(() => {
        router.push('/create');
    }, [router]);

    return {
        // State
        trips,
        isLoading,
        isError,
        isRefreshing: isRefetching,
        // Actions
        handleTripPress,
        handleRefresh,
        handleCreateTrip,
    };
}
