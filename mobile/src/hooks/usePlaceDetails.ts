/**
 * Custom Hook: usePlaceDetails
 * 
 * Encapsulates all business logic for PlaceDetailsModal
 * - Photo navigation state and handlers
 * - Fullscreen toggle
 * - Data formatting (ratings, review counts)
 * - Opening hours calculation
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { PlaceCandidate } from '../types/place.types';
import { DEFAULT_RATING, DEFAULT_REVIEW_COUNT } from '../constants/defaults';
import { getPhotoUrls } from '../utils/imageUtils';

export function usePlaceDetails(place: PlaceCandidate | null, isVisible: boolean) {
    const [photoIndex, setPhotoIndex] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Reset state when modal opens/closes or place changes
    useEffect(() => {
        if (isVisible) {
            setPhotoIndex(0);
            setIsFullScreen(false);
        }
    }, [isVisible, place?.id]);

    // Photo navigation
    const handleNextPhoto = useCallback(() => {
        const photoCount = getPhotoCount();
        if (photoCount <= 1) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setPhotoIndex(prev => Math.min(photoCount - 1, prev + 1));
    }, [place?.photos, place?.photoRefs]);

    const handlePrevPhoto = useCallback(() => {
        const photoCount = getPhotoCount();
        if (photoCount <= 1) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setPhotoIndex(prev => Math.max(0, prev - 1));
    }, [place?.photos, place?.photoRefs]);

    const handleToggleFullScreen = useCallback(() => {
        setIsFullScreen(prev => !prev);
    }, []);

    // Helper to get photo count
    function getPhotoCount(): number {
        if (place?.photoRefs && place.photoRefs.length > 0) return place.photoRefs.length;
        if (place?.photos && place.photos.length > 0) return place.photos.length;
        return 0;
    }

    // Computed values - FIXED: Handle both photoRefs (new) and photos (legacy)
    const photos = useMemo(() => {
        // Priority 1: Use photoRefs (new secure method) - convert to URLs
        if (place?.photoRefs && place.photoRefs.length > 0) {
            return getPhotoUrls(place.photoRefs, 1200);
        }
        // Priority 2: Use photos (legacy direct URLs)
        if (place?.photos && place.photos.length > 0) {
            return place.photos;
        }
        return [];
    }, [place?.photoRefs, place?.photos]);

    const currentPhoto = useMemo(() => photos[photoIndex], [photos, photoIndex]);

    const displayRating = useMemo(() =>
        place?.rating || DEFAULT_RATING,
        [place?.rating]
    );

    const displayCount = useMemo(() =>
        place?.userRatingCount ? formatReviewCount(place.userRatingCount) : DEFAULT_REVIEW_COUNT,
        [place?.userRatingCount]
    );

    // Opening hours calculation
    const todayHours = useMemo(() => {
        if (!place?.openingHours?.weekdayText) return null;

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = days[new Date().getDay()];
        const todayString = place.openingHours.weekdayText.find(
            (dayString: string) => dayString.includes(todayName)
        ) || 'Check website';

        // Remove day name prefix
        return todayString.split(': ').slice(1).join(': ') || todayString;
    }, [place?.openingHours?.weekdayText]);

    return {
        photoIndex,
        isFullScreen,
        photos,
        currentPhoto,
        displayRating,
        displayCount,
        todayHours,
        handleNextPhoto,
        handlePrevPhoto,
        handleToggleFullScreen,
    };
}

function formatReviewCount(count: number): string {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
}
