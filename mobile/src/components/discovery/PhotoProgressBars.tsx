/**
 * PhotoProgressBars Sub-Component
 * 
 * Responsibilities:
 * - Display progress indicators for photo carousel
 * - Instagram-style progress bars
 */

import React, { memo } from 'react';
import { View } from 'react-native';

interface PhotoProgressBarsProps {
    totalPhotos: number;
    currentIndex: number;
}

export const PhotoProgressBars = memo<PhotoProgressBarsProps>(({ totalPhotos, currentIndex }) => {
    if (totalPhotos <= 1) return null;

    return (
        <View className="absolute top-4 left-5 right-5 flex-row gap-1.5 z-20">
            {Array.from({ length: totalPhotos }).map((_, idx: number) => (
                <View
                    key={idx}
                    className={`h-1 flex-1 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white/30'}`}
                />
            ))}
        </View>
    );
});

PhotoProgressBars.displayName = 'PhotoProgressBars';
