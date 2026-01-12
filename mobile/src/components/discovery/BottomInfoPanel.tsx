/**
 * BottomInfoPanel Sub-Component
 * 
 * Responsibilities:
 * - Display card content (category, name, location, description)
 * - Show rating information
 * - Provide "Read More" indicator
 * - Handle tap interaction
 */

import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPin, ChevronUp } from 'lucide-react-native';

interface BottomInfoPanelProps {
    category: string;
    name: string;
    location?: string;
    ratingDisplay: string | null;
    description: string;
    onPress?: () => void;
}

export const BottomInfoPanel = memo<BottomInfoPanelProps>(({
    category,
    name,
    location,
    ratingDisplay,
    description,
    onPress,
}) => (
    <View className="absolute bottom-0 w-full z-20 overflow-hidden rounded-t-[32px] border-t border-white/10">
        <View className="w-full bg-black/80 backdrop-blur-xl">
            <TouchableOpacity activeOpacity={0.9} onPress={onPress} className="px-6 pt-6 pb-8">
                <Text className="text-kamino-violet text-[10px] font-bold uppercase tracking-[2px] mb-2">
                    {category}
                </Text>

                <Text className="text-white text-3xl font-black mb-1 leading-tight" numberOfLines={2}>
                    {name}
                </Text>

                <View className="flex-row items-center mb-3 opacity-80">
                    <MapPin size={14} color="rgba(255,255,255,0.8)" />
                    <Text className="text-white/80 text-sm ml-1 font-medium flex-1" numberOfLines={1}>
                        {location || 'Explore this destination'}
                        {ratingDisplay && ` • ${ratingDisplay}`}
                    </Text>
                </View>

                <Text className="text-white/70 text-base font-normal leading-6 mb-4" numberOfLines={2}>
                    {description}
                </Text>

                <View className="w-full flex-row items-center justify-center opacity-40 mt-1">
                    <Text className="text-white text-[10px] font-bold uppercase tracking-widest mr-1">
                        Read More
                    </Text>
                    <ChevronUp size={12} color="white" />
                </View>
            </TouchableOpacity>
        </View>
    </View>
));

BottomInfoPanel.displayName = 'BottomInfoPanel';
