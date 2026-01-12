/**
 * FullScreenPhotoViewer Sub-Component
 * 
 * Responsibilities:
 * - Display photo in fullscreen mode
 * - Show progress indicators
 * - Handle tap zones for navigation
 * - Provide close button
 */

import React, { memo } from 'react';
import { View, Pressable, TouchableOpacity, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import { X } from 'lucide-react-native';

interface FullScreenPhotoViewerProps {
    visible: boolean;
    currentPhoto: string | undefined;
    photos: string[];
    photoIndex: number;
    onClose: () => void;
    onPrevPhoto: () => void;
    onNextPhoto: () => void;
}

export const FullScreenPhotoViewer = memo<FullScreenPhotoViewerProps>(({
    visible,
    currentPhoto,
    photos,
    photoIndex,
    onClose,
    onPrevPhoto,
    onNextPhoto,
}) => {
    if (!visible) return null;

    return (
        <View className="absolute inset-0 bg-black z-50 justify-center items-center">
            <StatusBar hidden={true} />

            <Image
                source={{ uri: currentPhoto }}
                style={{ width: '100%', height: '100%' }}
                contentFit="contain"
            />

            <TouchableOpacity
                onPress={onClose}
                className="absolute top-12 right-6 z-50 bg-black/40 p-2 rounded-full"
            >
                <X color="white" size={28} />
            </TouchableOpacity>

            {photos.length > 1 && (
                <View className="absolute top-14 left-6 right-20 flex-row gap-1.5 z-40">
                    {photos.map((_: string, idx: number) => (
                        <View
                            key={idx}
                            className={`h-1 flex-1 rounded-full ${idx === photoIndex ? 'bg-white' : 'bg-white/30'}`}
                        />
                    ))}
                </View>
            )}

            <View className="absolute inset-0 flex-row z-10">
                <Pressable className="w-[30%] h-full" onPress={onPrevPhoto} />
                <Pressable className="flex-1 h-full" onPress={onClose} />
                <Pressable className="w-[30%] h-full" onPress={onNextPhoto} />
            </View>
        </View>
    );
});

FullScreenPhotoViewer.displayName = 'FullScreenPhotoViewer';
