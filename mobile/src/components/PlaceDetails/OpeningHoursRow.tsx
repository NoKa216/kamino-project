/**
 * OpeningHoursRow Sub-Component
 * 
 * Responsibilities:
 * - Display opening hours for today
 * - Show open/closed status indicator
 */

import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { Clock } from 'lucide-react-native';

interface OpeningHoursRowProps {
    openNow: boolean;
    todayHours: string;
}

export const OpeningHoursRow = memo<OpeningHoursRowProps>(({
    openNow,
    todayHours,
}) => (
    <View className="flex-row items-start">
        <View className="w-8 items-center pt-1">
            <Clock size={18} color="#A3A3A3" />
        </View>
        <View className="flex-1">
            <Text className="text-white/50 text-[10px] font-bold uppercase mb-0.5 tracking-wider">
                Opening Hours
            </Text>
            <Text className="text-white text-base font-medium mb-1">
                {todayHours}
            </Text>
            <View className="flex-row items-center">
                <View className={`w-2 h-2 rounded-full mr-2 ${openNow ? 'bg-green-500' : 'bg-red-500'}`} />
                <Text className={`text-xs font-bold ${openNow ? 'text-green-400' : 'text-red-400'}`}>
                    {openNow ? 'Open Now' : 'Closed'}
                </Text>
            </View>
        </View>
    </View>
));

OpeningHoursRow.displayName = 'OpeningHoursRow';
