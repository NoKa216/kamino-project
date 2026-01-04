import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { UpcomingTripCard } from './UpcomingTripCard';
import { InspirationCard } from './InspirationCard';

interface HeroTripCardProps {
    trip?: any;
}

export function HeroTripCard({ trip }: HeroTripCardProps) {
    const router = useRouter();

    return (
        <View className="mb-10">
            {/* Header Title Section */}
            <View className="flex-row justify-between items-end px-6 mb-5">
                <Text className="text-white text-2xl font-medium tracking-tight">
                    {trip ? 'Upcoming Trip' : 'Start Your Journey'}
                </Text>
                {trip && (
                    <TouchableOpacity onPress={() => router.push('/(app)/trips')}>
                        <Text className="text-white/50 text-sm font-medium">View all</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Conditional Rendering */}
            {trip ? <UpcomingTripCard trip={trip} /> : <InspirationCard />}
        </View>
    );
}