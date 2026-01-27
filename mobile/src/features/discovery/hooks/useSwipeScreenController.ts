/**
 * useSwipeScreenController - MVVM Controller Hook
 * 
 * Extracts all business logic from the Swipe Screen.
 * The screen component only renders UI based on this hook's output.
 * 
 * Responsibilities:
 * - Parse route params (tripId, candidates, swipedIds)
 * - Fetch trip data via React Query
 * - Compute unswiped candidates
 * - Handle swipe actions (fire-and-forget to backend)
 * - Handle itinerary building
 * - Navigation callbacks
 * 
 * @module features/discovery/hooks/useSwipeScreenController
 */

import { useState, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTripDetails, useSimpleSwipe } from '../../../hooks/queries';
import { TripsService } from '../../../services/trips';
import { PlaceCandidate } from '../../../types/place.types';

/** Controller state for View consumption */
export interface SwipeScreenState {
    /** Candidates that haven't been swiped yet */
    unswipedCandidates: PlaceCandidate[];
    /** Number of liked places in current session */
    likedCount: number;
    /** Whether data is loading */
    isLoading: boolean;
    /** Whether swipe stack is complete */
    isComplete: boolean;
    /** Whether itinerary is being built */
    isBuilding: boolean;
    /** Currently selected place for details modal */
    selectedPlace: PlaceCandidate | null;
}

/** Controller actions for View consumption */
export interface SwipeScreenActions {
    /** Handle swipe action */
    handleSwipe: (direction: 'like' | 'dislike', place: PlaceCandidate) => void;
    /** Open place details modal */
    handleDetailsPress: (place: PlaceCandidate) => void;
    /** Close place details modal */
    handleCloseDetails: () => void;
    /** Mark stack as complete */
    handleComplete: () => void;
    /** Build itinerary from liked places */
    handleBuildItinerary: () => Promise<void>;
    /** Navigate back */
    goBack: () => void;
}

export interface SwipeScreenController extends SwipeScreenState, SwipeScreenActions { }

/**
 * Controller hook for the Swipe Screen.
 * Encapsulates all business logic, leaving the UI as pure rendering.
 */
export function useSwipeScreenController(): SwipeScreenController {
    const router = useRouter();
    const { id: tripId, candidates: candidatesParam, swipedIds: swipedIdsParam } = useLocalSearchParams();

    // Local state
    const [selectedPlace, setSelectedPlace] = useState<PlaceCandidate | null>(null);
    const [likedCount, setLikedCount] = useState(0);
    const [isBuilding, setIsBuilding] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    // React Query hooks
    const { data: trip, isLoading } = useTripDetails(tripId as string);
    const swipeMutation = useSimpleSwipe();

    // Compute unswiped candidates
    const unswipedCandidates = useMemo(() => {
        let allCandidates: PlaceCandidate[] = [];
        let swipedIds: string[] = [];

        if (trip?.candidates) {
            allCandidates = trip.candidates;
            swipedIds = [...(trip.swipedLikeIds || []), ...(trip.swipedDislikeIds || [])];
        } else if (candidatesParam) {
            try {
                allCandidates = JSON.parse(candidatesParam as string);
                if (swipedIdsParam) {
                    swipedIds = JSON.parse(swipedIdsParam as string);
                }
            } catch (e) {
                console.error('[SwipeController] Failed to parse route params:', e);
                return [];
            }
        }

        const unswiped = allCandidates.filter(c => !swipedIds.includes(c.id));
        console.log(`[SwipeController] Total: ${allCandidates.length}, Swiped: ${swipedIds.length}, Remaining: ${unswiped.length}`);

        return unswiped;
    }, [trip, candidatesParam, swipedIdsParam]);

    // Actions
    const handleSwipe = useCallback((direction: 'like' | 'dislike', place: PlaceCandidate) => {
        if (direction === 'like') {
            setLikedCount(prev => prev + 1);
        }

        if (tripId) {
            swipeMutation.mutate({
                tripId: tripId as string,
                place,
                direction
            });
        }
    }, [tripId, swipeMutation]);

    const handleDetailsPress = useCallback((place: PlaceCandidate) => {
        setSelectedPlace(place);
    }, []);

    const handleCloseDetails = useCallback(() => {
        setSelectedPlace(null);
    }, []);

    const handleComplete = useCallback(() => {
        setIsComplete(true);
    }, []);

    const handleBuildItinerary = useCallback(async () => {
        if (!tripId) return;

        setIsBuilding(true);
        console.log('[SwipeController] Building itinerary with', likedCount, 'liked places');

        try {
            const result = await TripsService.buildItinerary(tripId as string);
            console.log('[SwipeController] Itinerary created:', result);

            Alert.alert(
                '🎉 Itinerary Built!',
                `Your ${result.likedPlacesCount}-stop adventure is ready!`,
                [
                    { text: 'View Trips', onPress: () => router.replace('/(app)/trips') }
                ]
            );
        } catch (error) {
            console.error('[SwipeController] Build itinerary error:', error);
            Alert.alert('Error', 'Failed to build itinerary. Please try again.');
        } finally {
            setIsBuilding(false);
        }
    }, [tripId, likedCount, router]);

    const goBack = useCallback(() => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(app)/trips');
        }
    }, [router]);

    return {
        // State
        unswipedCandidates,
        likedCount,
        isLoading: isLoading && !candidatesParam,
        isComplete: isComplete || unswipedCandidates.length === 0,
        isBuilding,
        selectedPlace,
        // Actions
        handleSwipe,
        handleDetailsPress,
        handleCloseDetails,
        handleComplete,
        handleBuildItinerary,
        goBack,
    };
}
