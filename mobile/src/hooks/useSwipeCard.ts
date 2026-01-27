/**
 * Custom Hook: useSwipeCard
 * 
 * Encapsulates all business logic for SwipeableCard
 * - Photo navigation state
 * - Auto-reset on candidate change
 * - Photo navigation handlers with haptic feedback
 * - Secure URL construction from photoRefs
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { PlaceCandidate } from '../types/place.types';
import { getPhotoUrls, getStaticMapUrl } from '../utils/imageUtils';

export function useSwipeCard(candidate: PlaceCandidate) {
    const [photoIndex, setPhotoIndex] = useState(0);

    // Construct photo URLs from references (secure method)
    const photoUrls = useMemo(() => {
        // Prefer photoRefs (new secure method), fallback to photos (legacy)
        if (candidate.photoRefs && candidate.photoRefs.length > 0) {
            // Use 600px width for optimal mobile card performance
            return getPhotoUrls(candidate.photoRefs, 600);
        }
        return candidate.photos || [];
    }, [candidate.photoRefs, candidate.photos]);

    // Generate static map URL from coordinates (secure - no DB storage of API key)
    const staticMapUrl = useMemo(() => {
        // Prefer coordinates (new method), fallback to legacy staticMapUrl
        if (candidate.coordinates) {
            return getStaticMapUrl(candidate.coordinates.lat, candidate.coordinates.lng);
        }
        return candidate.staticMapUrl || '';
    }, [candidate.coordinates, candidate.staticMapUrl]);

    // Reset photo index when card changes
    useEffect(() => {
        setPhotoIndex(0);
    }, [candidate.id]);

    const handleNextPhoto = useCallback(() => {
        if (photoUrls.length <= 1) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setPhotoIndex(prev => Math.min(photoUrls.length - 1, prev + 1));
    }, [photoUrls.length]);

    const handlePrevPhoto = useCallback(() => {
        if (photoUrls.length <= 1) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setPhotoIndex(prev => Math.max(0, prev - 1));
    }, [photoUrls.length]);

    return {
        photoIndex,
        photoUrls,
        staticMapUrl,
        handleNextPhoto,
        handlePrevPhoto,
    };
}
