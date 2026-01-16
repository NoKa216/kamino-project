/**
 * AccommodationSection - Hotel booking UI for LogisticsStep
 * 
 * Handles:
 * - Booked accommodation toggle
 * - Hotel autocomplete input
 */

import React from 'react';
import { View, Text, Switch, Platform } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { BedDouble } from 'lucide-react-native';
import { HotelAutocomplete } from '../HotelAutocomplete';

interface AccommodationDetails {
    hotelName?: string;
    location?: string;
}

interface AccommodationSectionProps {
    hasBookedAccommodation: boolean;
    accommodationDetails?: AccommodationDetails;
    onToggleAccommodation: (value: boolean) => void;
    onUpdateAccommodationDetails: (updates: Partial<AccommodationDetails>) => void;
}

export function AccommodationSection({
    hasBookedAccommodation,
    accommodationDetails,
    onToggleAccommodation,
    onUpdateAccommodationDetails
}: AccommodationSectionProps) {
    return (
        <View className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-10 z-50 overflow-visible">
            {/* Header with Toggle */}
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                    <View className="bg-kamino-violet/20 p-2 rounded-full mr-3">
                        <BedDouble color="#8B5CF6" size={20} />
                    </View>
                    <Text className="text-white text-lg font-semibold">Booked Hotel?</Text>
                </View>
                <Switch
                    trackColor={{ false: '#3f3f46', true: '#8B5CF6' }}
                    thumbColor="#FFFFFF"
                    onValueChange={onToggleAccommodation}
                    value={hasBookedAccommodation}
                />
            </View>

            {hasBookedAccommodation ? (
                <Animated.View layout={LinearTransition.springify()} style={{ zIndex: 100 }}>
                    <Text className="text-white/60 text-xs uppercase font-bold mb-2 ml-1">Hotel Name / Address</Text>
                    <HotelAutocomplete
                        value={accommodationDetails?.hotelName}
                        onSelect={(name) => onUpdateAccommodationDetails({ hotelName: name })}
                        placeholder="Where are you staying?"
                    />
                </Animated.View>
            ) : (
                <Animated.View layout={LinearTransition.springify()}>
                    <View className="self-start bg-kamino-violet/10 px-3 py-1.5 rounded-lg border border-kamino-violet/20 ml-11">
                        <Text className="text-kamino-violet text-xs font-bold">We'll recommend top-rated hotels</Text>
                    </View>
                </Animated.View>
            )}
        </View>
    );
}
