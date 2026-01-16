import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { UpcomingTripCard } from './UpcomingTripCard';
import { InspirationCard } from './InspirationCard';

interface HeroTripCardProps {
    trip?: any;
    isLoading?: boolean;
}

/**
 * Skeleton Card - Shown while loading to prevent UI flash
 */
function SkeletonCard() {
    return (
        <View className="mx-6 h-[450px] rounded-[32px] bg-neutral-900 border border-white/10 items-center justify-center">
            <ActivityIndicator size="large" color="#A78BFA" />
            <Text className="text-white/30 text-sm mt-4">Loading trip...</Text>
        </View>
    );
}

export function HeroTripCard({ trip, isLoading }: HeroTripCardProps) {
    const router = useRouter();

    // Show skeleton while loading
    if (isLoading) {
        return (
            <View className="mb-10">
                <View className="flex-row justify-between items-end px-6 mb-5">
                    <View className="bg-white/5 rounded-lg h-7 w-40" />
                </View>
                <SkeletonCard />
            </View>
        );
    }

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