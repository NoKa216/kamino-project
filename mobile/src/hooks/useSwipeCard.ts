/**
 * Custom Hook: useSwipeCard
 * 
 * Encapsulates all business logic for SwipeableCard
 * - Photo navigation state
 * - Auto-reset on candidate change
 * - Photo navigation handlers with haptic feedback
 */

import { useState, useEffect, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { PlaceCandidate } from '../types/place.types';

export function useSwipeCard(candidate: PlaceCandidate) {
    const [photoIndex, setPhotoIndex] = useState(0);

    // Reset photo index when card changes
    useEffect(() => {
        setPhotoIndex(0);
    }, [candidate.id]);

    const handleNextPhoto = useCallback(() => {
        if (!candidate.photos || candidate.photos.length <= 1) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setPhotoIndex(prev => Math.min(candidate.photos!.length - 1, prev + 1));
    }, [candidate.photos]);

    const handlePrevPhoto = useCallback(() => {
        if (!candidate.photos || candidate.photos.length <= 1) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setPhotoIndex(prev => Math.max(0, prev - 1));
    }, [candidate.photos]);

    return {
        photoIndex,
        handleNextPhoto,
        handlePrevPhoto,
    };
}
