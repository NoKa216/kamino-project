/**
 * SwipeableCard - Atomic Component (2026 Standard)
 * 
 * Responsibilities:
 * - Layout orchestration ONLY
 * - Compose sub-components
 * - Delegate ALL logic to useSwipeCard hook
 * 
 * Sub-components:
 * - PhotoProgressBars
 * - MatchBadge
 * - BottomInfoPanel
 * 
 * Uses KaminoImage (expo-image) for optimized caching and transitions.
 */

import React, { memo, useMemo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { PlaceCandidate } from '../../types/place.types';
import { DEFAULT_PLACE_IMAGE } from '../../constants/defaults';
import { useSwipeCard } from '../../hooks/useSwipeCard';
import { PhotoProgressBars } from './PhotoProgressBars';
import { MatchBadge } from './MatchBadge';
import { BottomInfoPanel } from './BottomInfoPanel';
import { KaminoImage } from '../ui/KaminoImage';

interface SwipeableCardProps {
    candidate: PlaceCandidate;
    onDetailsPress?: () => void;
}

export const SwipeableCard = memo<SwipeableCardProps>(({ candidate, onDetailsPress }) => {
    const { photoIndex, photoUrls, handleNextPhoto, handlePrevPhoto } = useSwipeCard(candidate);

    const hasPhotos = photoUrls.length > 0;
    const currentPhotoUrl = hasPhotos ? photoUrls[photoIndex] : DEFAULT_PLACE_IMAGE;

    const ratingDisplay = useMemo(() =>
        candidate.rating
            ? `⭐ ${candidate.rating}${candidate.userRatingCount ? ` (${formatCount(candidate.userRatingCount)})` : ''}`
            : null,
        [candidate.rating, candidate.userRatingCount]
    );

    return (
        <View style={styles.container}>
            {/* Optimized image with caching - absolute fill with dark fallback */}
            <KaminoImage
                source={currentPhotoUrl}
                style={styles.backgroundImage}
                contentFit="cover"
                priority="high"
                alt={candidate.name}
            />

            {/* Tap zones */}
            <View style={styles.tapZones}>
                <Pressable style={styles.leftZone} onPress={handlePrevPhoto} />
                <Pressable style={styles.centerZone} onPress={onDetailsPress} />
                <Pressable style={styles.rightZone} onPress={handleNextPhoto} />
            </View>

            <PhotoProgressBars totalPhotos={photoUrls.length} currentIndex={photoIndex} />
            <MatchBadge text={candidate.matchTag || `Perfect for ${candidate.suggestedCategory}`} />

            <BottomInfoPanel
                category={candidate.suggestedCategory}
                name={candidate.name}
                location={candidate.location}
                ratingDisplay={ratingDisplay}
                description={candidate.description}
                onPress={onDetailsPress}
            />
        </View>
    );
});

SwipeableCard.displayName = 'SwipeableCard';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        borderRadius: 36,
        overflow: 'hidden',
        backgroundColor: '#121212', // Prevent white flash
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    // Absolute positioning to fill entire card with dark background fallback
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#121212', // Match container to prevent white flash
    },
    tapZones: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        zIndex: 10,
    },
    leftZone: {
        width: '30%',
        height: '100%',
    },
    centerZone: {
        flex: 1,
        height: '100%',
    },
    rightZone: {
        width: '30%',
        height: '100%',
    },
});

// ============================================================================
// UTILITIES
// ============================================================================

function formatCount(count: number): string {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
}