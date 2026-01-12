/**
 * LocationMapPreview Sub-Component
 * 
 * Responsibilities:
 * - Display static map preview
 * - Show "Open in Google Maps" button
 */

import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Navigation } from 'lucide-react-native';
import { DEFAULT_MAP_IMAGE } from '../../constants/defaults';

interface LocationMapPreviewProps {
    mapUrl: string | undefined;
}

export const LocationMapPreview = memo<LocationMapPreviewProps>(({ mapUrl }) => (
    <>
        <Text className="text-white font-bold text-xl mb-4">Location</Text>
        <View className="w-full h-48 rounded-3xl overflow-hidden border border-white/10 relative mb-8 bg-[#242f3e]">
            <Image
                source={{ uri: mapUrl || DEFAULT_MAP_IMAGE }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
            />
            <View className="absolute inset-0 bg-black/10" />
            <View className="absolute bottom-3 right-3">
                <TouchableOpacity className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex-row items-center">
                    <Text className="text-white text-xs font-bold mr-1">Google Maps</Text>
                    <Navigation size={10} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    </>
));

LocationMapPreview.displayName = 'LocationMapPreview';
