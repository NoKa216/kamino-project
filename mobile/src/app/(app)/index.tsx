import React, { useState } from 'react';
import { View, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

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

export default function ExploreScreen() {
    const { user } = useAuth();

    // --- SIMULATION STATE ---
    // Set to null to view the "No Trip" state with the slideshow.
    // Set to an object (e.g., { destination: 'Paris' }) to view the upcoming trip card.
    const [upcomingTrip, setUpcomingTrip] = useState<any>(null);

    return (
        <View className="flex-1 bg-[#050505]">
            <StatusBar barStyle="light-content" />
            <SafeAreaView className="flex-1">
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }} // Extra padding to account for the bottom tab bar
                >
                    {/* 1. Header (Greeting + User Avatar) */}
                    <ExploreHeader user={user} />

                    {/* 2. Search Bar */}
                    <SearchBar />

                    {/* 3. Hero Card (Displays Upcoming Trip OR Inspiration Slideshow) */}
                    <HeroTripCard trip={upcomingTrip} />

                    {/* 4. Thematic Categories (Carousels) */}

                    {/* Category 1: Romantic */}
                    <CategorySection
                        title="Romantic Getaways"
                        subtitle="Perfect spots to strengthen your bond"
                        data={ROMANTIC_DESTINATIONS}
                    />

                    {/* Category 2: Affordable Luxury */}
                    <CategorySection
                        title="Affordable Luxury"
                        subtitle="Feel like a millionaire for less"
                        data={AFFORDABLE_LUXURY_DESTINATIONS}
                    />

                    {/* Category 3: Relaxation */}
                    <CategorySection
                        title="Pure Relaxation"
                        subtitle="Disconnect and recharge"
                        data={RELAXATION_DESTINATIONS}
                    />

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}