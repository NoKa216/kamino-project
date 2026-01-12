/**
 * PlaceImageGallery Sub-Component
 * 
 * Responsibilities:
 * - Display current photo with fullscreen support
 * - Show progress bars for multiple photos
 * - Handle tap zones for navigation
 */

import React, { memo } from 'react';
import { View, Pressable, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { X, Maximize2 } from 'lucide-react-native';
import { DEFAULT_PLACE_IMAGE } from '../../constants/defaults';

interface PlaceImageGalleryProps {
    currentPhoto: string | undefined;
    photos: string[];
    photoIndex: number;
    onPrevPhoto: () => void;
    onNextPhoto: () => void;
    onToggleFullScreen: () => void;
    onClose: () => void;
}

export const PlaceImageGallery = memo<PlaceImageGalleryProps>(({
    currentPhoto,
    photos,
    photoIndex,
    onPrevPhoto,
    onNextPhoto,
    onToggleFullScreen,
    onClose,
}) => {
    const imageUri = currentPhoto || DEFAULT_PLACE_IMAGE;
    const hasMultiplePhotos = photos.length > 1;

    return (
        <View className="w-full h-80 relative bg-neutral-900">
            <Image
                source={{ uri: imageUri }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={200}
            />
            <View className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#121212] to-transparent" />

            {/* Tap zones */}
            <View className="absolute inset-0 flex-row z-10">
                <Pressable className="w-[30%] h-full" onPress={onPrevPhoto} />
                <Pressable
                    className="flex-1 h-full items-center justify-center"
                    onPress={onToggleFullScreen}
                >
                    <View className="bg-black/30 p-2 rounded-full opacity-0 active:opacity-100">
                        <Maximize2 color="white" size={24} />
                    </View>
                </Pressable>
                <Pressable className="w-[30%] h-full" onPress={onNextPhoto} />
            </View>

            {/* Progress bars */}
            {hasMultiplePhotos && (
                <View className="absolute top-4 left-4 right-16 flex-row gap-1.5 z-20">
                    {photos.map((_: string, idx: number) => (
                        <View
                            key={idx}
                            className={`h-1 flex-1 rounded-full shadow-sm ${idx === photoIndex ? 'bg-white' : 'bg-white/30'
                                }`}
                        />
                    ))}
                </View>
            )}

            {/* Close button */}
            <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.8}
                className="absolute top-4 right-4 m-2 w-10 h-10 bg-black/60 rounded-full items-center justify-center border border-white/10 backdrop-blur-md z-50 shadow-lg"
            >
                <X color="white" size={20} />
            </TouchableOpacity>
        </View>
    );
});

PlaceImageGallery.displayName = 'PlaceImageGallery';
