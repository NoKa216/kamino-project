import React, { useState, useCallback } from 'react';
import { View, StatusBar, ScrollView, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { TripsService, GeneratedTrip } from '../../services/trips';

// Import UI Components
import { ExploreHeader } from '../../components/explore/ExploreHeader';
import { SearchBar } from '../../components/explore/SearchBar';
import { HeroTripCard } from '../../components/explore/HeroTripCard';
import { CategorySection } from '../../components/explore/CategorySection';

// Import Data Constants
import {
    ROMANTIC_DESTINATIONS,
    AFFORDABLE_LUXURY_DESTINATIONS,
    RELAXATION_DESTINATIONS
} from '../../constants/destinations';

// Brand Color Constant
const BRAND_COLOR = '#8B5CF6';

export default function ExploreScreen() {
    const { user } = useAuth();
    const insets = useSafeAreaInsets();

    // 1. Initialize State
    const cachedTrip = TripsService.getCachedUpcomingTrip();
    const [upcomingTrip, setUpcomingTrip] = useState<GeneratedTrip | null>(cachedTrip);

    // 2. Loading / Refreshing states
    const [isLoading, setIsLoading] = useState(!cachedTrip);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async (forceRefresh = false) => {
        try {
            if (!TripsService.hasCachedData() && !forceRefresh) {
                setIsLoading(true);
            }

            await TripsService.getUserTrips(forceRefresh);
            const bestTrip = TripsService.getCachedUpcomingTrip();
            setUpcomingTrip(bestTrip);

        } catch (error) {
            console.error('[Explore] Failed to load data:', error);
        } finally {
            setIsLoading(false);
            if (!refreshing) setIsLoading(false);
        }
    }, [refreshing]);

    useFocusEffect(
        useCallback(() => {
            loadData(false);
        }, [loadData])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        // UX Delay to ensure spinner is visible
        await Promise.all([
            loadData(true),
            new Promise(resolve => setTimeout(resolve, 1500))
        ]);
        setRefreshing(false);
    }, [loadData]);

    return (
        <View className="flex-1 bg-[#050505]">
            <StatusBar barStyle="light-content" />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}

                // --- The Magic Fix for iOS Notch & Spinner ---
                // מגדיר ל-iOS שהתוכן מתחיל מתחת ל-Notch, אבל הגלילה היא על כל המסך
                contentInset={{ top: insets.top }}
                contentOffset={{ x: 0, y: -insets.top }} // מציב את הגלילה ההתחלתית בנקודה הנכונה

                // Android padding handling
                contentContainerStyle={{
                    paddingTop: Platform.OS === 'android' ? insets.top + 10 : 0,
                    paddingBottom: 120
                }}

                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}

                        // iOS Styles - Hardcoded HEX is safest
                        tintColor="#8B5CF6"
                        style={{ backgroundColor: 'transparent' }} // Fix for some iOS rendering glitches

                        // Android Styles
                        colors={['#8B5CF6']}
                        progressBackgroundColor="#1F1F1F"
                        progressViewOffset={Platform.OS === 'android' ? insets.top + 10 : 0}
                    />
                }
            >
                {/* 1. Header */}
                <ExploreHeader user={user} />

                {/* 2. Search Bar */}
                <SearchBar />

                {/* 3. Hero Card */}
                <HeroTripCard trip={upcomingTrip} isLoading={isLoading} />

                {/* 4. Thematic Categories */}
                <CategorySection
                    title="Romantic Getaways"
                    subtitle="Perfect spots to strengthen your bond"
                    data={ROMANTIC_DESTINATIONS}
                />

                <CategorySection
                    title="Affordable Luxury"
                    subtitle="Feel like a millionaire for less"
                    data={AFFORDABLE_LUXURY_DESTINATIONS}
                />

                <CategorySection
                    title="Pure Relaxation"
                    subtitle="Disconnect and recharge"
                    data={RELAXATION_DESTINATIONS}
                />

            </ScrollView>
        </View>
    );
}