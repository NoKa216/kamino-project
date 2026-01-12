/**
 * MatchBadge Sub-Component
 * 
 * Responsibilities:
 * - Display AI match tag with emoji
 * - Glassmorphism styling
 */

import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { Sparkles } from 'lucide-react-native';

interface MatchBadgeProps {
    text: string;
}

export const MatchBadge = memo<MatchBadgeProps>(({ text }) => (
    <View className="absolute top-10 left-5 flex-row items-center bg-black/60 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-sm shadow-black/40 z-20">
        <Sparkles size={12} color="#A78BFA" fill="#A78BFA" />
        <Text className="text-white font-bold text-xs ml-1.5 tracking-wide shadow-black" numberOfLines={1}>
            {text}
        </Text>
    </View>
));

MatchBadge.displayName = 'MatchBadge';
