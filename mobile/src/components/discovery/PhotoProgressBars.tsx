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
    photos: string[];
    photoIndex: number;
    visible: boolean;
}

export const PhotoProgressBars = memo<PhotoProgressBarsProps>(({ photos, photoIndex, visible }) => {
    if (!visible) return null;

    return (
        <View className="absolute top-4 left-5 right-5 flex-row gap-1.5 z-20">
            {photos.map((_: string, idx: number) => (
                <View
                    key={idx}
                    className={`h-1 flex-1 rounded-full ${idx === photoIndex ? 'bg-white' : 'bg-white/30'}`}
                />
            ))}
        </View>
    );
});

PhotoProgressBars.displayName = 'PhotoProgressBars';
