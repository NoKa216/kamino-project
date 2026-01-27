/**
 * useSwipeAction Hook
 * 
 * React Query mutation for recording swipe actions with optimistic updates.
 * Immediately updates UI while syncing to server in background.
 * 
 * @module hooks/queries/useSwipeAction
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TripsService, GeneratedTrip } from '../../services/trips';
import { tripDetailsQueryKey } from './useTripDetails';
import { PlaceCandidate } from '../../types/place.types';

interface SwipeActionInput {
    tripId: string;
    place: PlaceCandidate;
    direction: 'like' | 'dislike';
}

interface SwipeActionContext {
    previousTrip: GeneratedTrip | undefined;
}

interface SwipeActionCallbacks {
    onSwipeComplete?: (direction: 'like' | 'dislike', place: PlaceCandidate) => void;
}

/**
 * Hook for recording swipe actions with optimistic UI updates.
 * 
 * Features:
 * - Immediate UI response (optimistic update)
 * - Background sync to server
 * - Automatic cache invalidation
 * - Rollback on error
 * 
 * @param callbacks - Optional callbacks for swipe completion
 * @returns Mutation object with swipe function
 */
export function useSwipeAction(callbacks?: SwipeActionCallbacks) {
    const queryClient = useQueryClient();

    return useMutation<{ tripId: string; place: PlaceCandidate; direction: 'like' | 'dislike' }, Error, SwipeActionInput, SwipeActionContext>({
        mutationFn: async ({ tripId, place, direction }) => {
            await TripsService.recordSwipe(tripId, {
                id: place.id,
                name: place.name,
                suggestedCategory: place.suggestedCategory
            }, direction);
            return { tripId, place, direction };
        },

        onMutate: async ({ tripId, place, direction }) => {
            // Cancel any outgoing refetches to prevent overwriting optimistic update
            await queryClient.cancelQueries({ queryKey: tripDetailsQueryKey(tripId) });

            // Snapshot the previous value for potential rollback
            const previousTrip = queryClient.getQueryData<GeneratedTrip>(tripDetailsQueryKey(tripId));

            // Optimistically update the cache
            queryClient.setQueryData<GeneratedTrip>(tripDetailsQueryKey(tripId), (old) => {
                if (!old) return old;

                const fieldName = direction === 'like' ? 'swipedLikeIds' : 'swipedDislikeIds';
                return {
                    ...old,
                    [fieldName]: [...(old[fieldName] || []), place.id]
                };
            });

            // Call the completion callback
            callbacks?.onSwipeComplete?.(direction, place);

            // Return context for rollback
            return { previousTrip };
        },

        onError: (_err, { tripId }, context) => {
            // Rollback to the previous value on error
            if (context?.previousTrip) {
                queryClient.setQueryData(tripDetailsQueryKey(tripId), context.previousTrip);
            }
            console.error('[useSwipeAction] Error recording swipe:', _err);
        },

        onSettled: (_data, _error, variables) => {
            // Always refetch after error or success to ensure cache is in sync
            if (variables?.tripId) {
                queryClient.invalidateQueries({ queryKey: tripDetailsQueryKey(variables.tripId) });
            }
        },
    });
}

/**
 * Simple swipe hook that just performs the mutation without optimistic updates.
 * Use this for fire-and-forget swipe recording.
 */
export function useSimpleSwipe() {
    return useMutation({
        mutationFn: async ({ tripId, place, direction }: SwipeActionInput) => {
            await TripsService.recordSwipe(tripId, {
                id: place.id,
                name: place.name,
                suggestedCategory: place.suggestedCategory
            }, direction);
        },
    });
}
