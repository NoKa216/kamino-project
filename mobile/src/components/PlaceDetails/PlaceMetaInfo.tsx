/**
 * PlaceMetaInfo Sub-Component
 * 
 * Responsibilities:
 * - Display category, rating, name
 * - Show tags in horizontal scroll
 * - Display AI match reason
 */

import React, { memo, useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Star, Sparkles } from 'lucide-react-native';
import { PlaceCandidate } from '../../types/place.types';
import { getTagsForCategory } from '../../constants/defaults';

interface PlaceMetaInfoProps {
    place: PlaceCandidate;
    displayRating: number;
    displayCount: string;
}

export const PlaceMetaInfo = memo<PlaceMetaInfoProps>(({
    place,
    displayRating,
    displayCount,
}) => {
    const tags = useMemo(() => getTagsForCategory(place.suggestedCategory), [place.suggestedCategory]);

    return (
        <>
            {/* Header: Category + Rating */}
            <View className="flex-row items-center justify-between mb-2">
                <Text className="text-kamino-violet text-xs font-bold uppercase tracking-[2px]">
                    {place.suggestedCategory}
                </Text>
                <View className="flex-row items-center bg-white/10 px-2.5 py-1 rounded-full border border-white/5">
                    <Text className="text-white/60 text-[10px] font-bold mr-1.5">Google</Text>
                    <Star size={10} color="#FBBF24" fill="#FBBF24" />
                    <Text className="text-white text-xs font-bold ml-1">
                        {displayRating}
                        <Text className="text-white/50 font-medium text-[10px]"> ({displayCount})</Text>
                    </Text>
                </View>
            </View>

            {/* Place name */}
            <Text className="text-white text-4xl font-black mb-4 leading-tight">
                {place.name}
            </Text>

            {/* Tags */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-6 -mx-6 px-6"
            >
                {tags.map((tag: string, index: number) => (
                    <View
                        key={index}
                        className="bg-white/5 border border-white/10 px-4 py-2 rounded-full mr-2"
                    >
                        <Text className="text-white/80 text-xs font-medium">{tag}</Text>
                    </View>
                ))}
            </ScrollView>

            {/* AI Match Reason */}
            <View className="w-full bg-kamino-violet/10 border border-kamino-violet/30 rounded-2xl p-5 mb-8 flex-row items-start shadow-sm shadow-kamino-violet/10">
                <Sparkles size={20} color="#A78BFA" style={{ marginTop: 2 }} />
                <View className="ml-3 flex-1">
                    <Text className="text-kamino-violet font-bold text-sm mb-1.5 uppercase tracking-wide">
                        Why this fits you
                    </Text>
                    <Text className="text-white/90 text-base leading-6 font-medium">
                        {place.matchReason}
                    </Text>
                </View>
            </View>
        </>
    );
});

PlaceMetaInfo.displayName = 'PlaceMetaInfo';
