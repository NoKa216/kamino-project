/**
 * UpcomingTripCard - Premium Hero Card for Active/Upcoming Trips
 * 
 * Visual Hierarchy (matches InspirationCard style):
 * - Top: Country/Region (Small, Uppercase)
 * - Middle: City Name (Large, Hero)
 * - Bottom: Date Range
 * - Footer: Glassmorphic Button
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { ArrowRight, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { GeneratedTrip } from '../../services/trips';
import { getPhotoUrl } from '../../utils/imageUtils';

interface UpcomingTripCardProps {
    trip: GeneratedTrip;
}

// Default fallback image
const DEFAULT_TRIP_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200';

export function UpcomingTripCard({ trip }: UpcomingTripCardProps) {
    const router = useRouter();

    // Calculate days left until trip
    const daysLeft = useMemo(() => {
        if (!trip.startDate) return null;
        const start = new Date(trip.startDate);
        const now = new Date();
        const diffTime = start.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }, [trip.startDate]);

    // Format date range (e.g., "Jan 15-20")
    const dateRange = useMemo(() => {
        if (!trip.startDate || !trip.endDate) return '';
        const start = new Date(trip.startDate);
        const end = new Date(trip.endDate);
        const monthName = start.toLocaleDateString('en-US', { month: 'short' });
        return `${monthName} ${start.getDate()}-${end.getDate()}`;
    }, [trip.startDate, trip.endDate]);

    // Get trip image from first candidate's first photo, or fallback
    const tripImage = useMemo(() => {
        const photoRef = trip.candidates?.[0]?.photoRefs?.[0];
        if (photoRef) {
            return getPhotoUrl(photoRef, 1200);
        }
        // Fallback to legacy photos array
        const legacyPhoto = trip.candidates?.[0]?.photos?.[0];
        return legacyPhoto || DEFAULT_TRIP_IMAGE;
    }, [trip.candidates]);

    // Extract city name (first part before comma) and country/region (second part)
    const cityName = trip.destination?.split(',')[0]?.trim() || 'Trip';
    const countryName = trip.destination?.split(',')[1]?.trim() || '';

    // Navigate to swipe screen for planning trips, or trip details for others
    const handlePress = () => {
        const tripId = trip.id || trip.tripId;
        if (trip.status === 'planning' && tripId) {
            router.push({
                pathname: '/(app)/trip/[id]/swipe',
                params: {
                    id: tripId,
                    candidates: JSON.stringify(trip.candidates || []),
                    swipedIds: JSON.stringify([
                        ...(trip.swipedLikeIds || []),
                        ...(trip.swipedDislikeIds || [])
                    ])
                }
            });
        } else {
            router.push('/(app)/trips');
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={0.95}
            className="mx-6 h-[450px] rounded-[32px] overflow-hidden relative border border-white/10 bg-white/5"
            onPress={handlePress}
        >
            <ImageBackground
                source={{ uri: tripImage }}
                className="w-full h-full justify-end"
                resizeMode="cover"
            >
                {/* Gradient Overlay - Bottom 60% for text readability */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)', '#000000']}
                    locations={[0, 0.3, 0.6, 1]}
                    style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '100%' }}
                />

                {/* Days Left Badge - Top Right (Dark Glass Pill) */}
                {daysLeft !== null && (
                    <View className="absolute top-4 right-4 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-md">
                        <Text className="text-white text-xs font-bold uppercase tracking-wider">
                            {daysLeft === 0 ? '🔥 Today!' : `${daysLeft} days left`}
                        </Text>
                    </View>
                )}

                {/* Content Container - Matches InspirationCard Hierarchy */}
                <View className="p-6 pb-8">

                    {/* COUNTRY/REGION - Top (Small, Uppercase) */}
                    {countryName && (
                        <Text className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">
                            {countryName}
                        </Text>
                    )}

                    {/* CITY NAME - Middle (Large, Hero) */}
                    <Text className="text-white text-5xl font-bold tracking-tight mb-2">
                        {cityName}
                    </Text>

                    {/* DATE RANGE - Below Title with Icon */}
                    {dateRange && (
                        <View className="flex-row items-center mb-6">
                            <Calendar color="rgba(255,255,255,0.7)" size={14} />
                            <Text className="text-white/90 text-base font-medium ml-1.5">
                                {dateRange}
                            </Text>
                        </View>
                    )}

                    {/* Action Button - Glassmorphic Style */}
                    <TouchableOpacity
                        onPress={handlePress}
                        activeOpacity={0.8}
                        className="w-full h-12 bg-white/15 border border-white/30 rounded-2xl flex-row items-center justify-center backdrop-blur-md"
                    >
                        <Text className="text-white font-bold text-sm mr-2 uppercase tracking-wide">
                            {trip.status === 'planning' ? 'Continue Planning' : 'View Itinerary'}
                        </Text>
                        <ArrowRight color="white" size={16} strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );
}