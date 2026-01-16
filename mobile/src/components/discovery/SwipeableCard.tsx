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
 */

import React, { memo, useMemo } from 'react';
import { View, ImageBackground, Pressable } from 'react-native';
import { PlaceCandidate } from '../../types/place.types';
import { DEFAULT_PLACE_IMAGE } from '../../constants/defaults';
import { useSwipeCard } from '../../hooks/useSwipeCard';
import { PhotoProgressBars } from './PhotoProgressBars';
import { MatchBadge } from './MatchBadge';
import { BottomInfoPanel } from './BottomInfoPanel';

interface SwipeableCardProps {
    candidate: PlaceCandidate;
    onDetailsPress?: () => void;
}

export const SwipeableCard = memo<SwipeableCardProps>(({ candidate, onDetailsPress }) => {
    const { photoIndex, photoUrls, handleNextPhoto, handlePrevPhoto } = useSwipeCard(candidate);

    const hasPhotos = photoUrls.length > 0;
    const hasMultiplePhotos = photoUrls.length > 1;
    const imageSource = hasPhotos ? { uri: photoUrls[photoIndex] } : { uri: DEFAULT_PLACE_IMAGE };

    const ratingDisplay = useMemo(() =>
        candidate.rating
            ? `⭐ ${candidate.rating}${candidate.userRatingCount ? ` (${formatCount(candidate.userRatingCount)})` : ''}`
            : null,
        [candidate.rating, candidate.userRatingCount]
    );

    return (
        <View className="flex-1 w-full h-full rounded-[36px] overflow-hidden bg-[#121212] border border-white/10 shadow-2xl shadow-black relative">
            <ImageBackground source={imageSource} className="flex-1 w-full h-full" resizeMode="cover">

                {/* Tap zones */}
                <View className="absolute inset-0 flex-row z-10">
                    <Pressable className="w-[30%] h-full" onPress={handlePrevPhoto} />
                    <Pressable className="flex-1 h-full" onPress={onDetailsPress} />
                    <Pressable className="w-[30%] h-full" onPress={handleNextPhoto} />
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
            </ImageBackground>
        </View>
    );
});

SwipeableCard.displayName = 'SwipeableCard';

// ============================================================================
// UTILITIES
// ============================================================================

function formatCount(count: number): string {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
}